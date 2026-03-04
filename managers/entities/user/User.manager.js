module.exports = class User { 
    constructor({utils, cache, config, cortex, managers, validators, mongomodels} = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators; 
        this.mongomodels = mongomodels;
        this.tokenManager = managers.token;
        this.User = mongomodels.user || null;
        this.Classroom = mongomodels.classroom || null;
        this.Student = mongomodels.student || null;

        this.httpExposed = ['createUser', 'getUsers', 'getUser', 'updateUser', 'deleteUser'];
    }

    /**
     * Create a new user (superadmin only, except for first user)
     */
    async createUser({name, email, password, role, school, __token}) {
        // Validate input
        const validation = await this.validators.user?.createUser({name, email, password, role, school});
        if (validation) {
            return {errors: validation};
        }

        // Check authorization - only superadmin can create users (except first user)
        const userCount = await this.User.countDocuments();
        if (userCount > 0) {
            if (!__token || __token.role !== 'superadmin') {
                return {errors: ['Only superadmin can create users']};
            }
        }

        // Validate role
        if (role && !['superadmin', 'school_admin'].includes(role)) {
            return {errors: ['Invalid role']};
        }

        // If school_admin, school is required
        if (role === 'school_admin' && !school) {
            return {errors: ['School is required for school_admin role']};
        }

        // Verify school exists if school_admin role
        if (role === 'school_admin' && school) {
            const School = this.mongomodels.school || null;
            if (School) {
                const schoolExists = await School.findById(school);
                if (!schoolExists) {
                    return {errors: ['School not found. Please select a valid school.']};
                }
            }
        }

        // Check if user already exists
        const existingUser = await this.User.findOne({email: email.toLowerCase()});
        if (existingUser) {
            return {errors: ['User with this email already exists']};
        }

        // Create user
        const userData = {
            name,
            email: email.toLowerCase(),
            password,
            role: role || 'school_admin'
        };

        if (userData.role === 'school_admin') {
            userData.school = school;
        }

        const user = new this.User(userData);
        await user.save();

        return {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                school: user.school
            }
        };
    }

    /**
     * Get list of users
     * Superadmin sees all, school_admin sees only their school
     */
    async getUsers({__token, page, limit}) {
        if (!__token || !__token.role) {
            return {errors: ['Unauthorized']};
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        let query = {};
        
        // School admin can only see users from their school
        if (__token.role === 'school_admin') {
            if (!__token.school) {
                return {errors: ['School not assigned']};
            }
            query.school = __token.school;
        }

        const users = await this.User.find(query)
            .select('-password')
            .populate('school', 'name')
            .skip(skip)
            .limit(limitNum)
            .lean();

        const total = await this.User.countDocuments(query);

        return {
            users,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
    }

    /**
     * Get single user by ID
     */
    async getUser({userId, __token}) {
        if (!__token || !__token.role) {
            return {errors: ['Unauthorized']};
        }

        let query = {_id: userId};

        // School admin can only access users from their school
        if (__token.role === 'school_admin') {
            if (!__token.school) {
                return {errors: ['School not assigned']};
            }
            query.school = __token.school;
        }

        const user = await this.User.findOne(query)
            .select('-password')
            .populate('school', 'name')
            .lean();

        if (!user) {
            return {errors: ['User not found']};
        }

        return {user};
    }

    /**
     * Update user
     */
    async updateUser({userId, name, email, role, school, __token}) {
        if (!__token || !__token.role) {
            return {errors: ['Unauthorized']};
        }

        // Validate input
        const validation = await this.validators.user?.updateUser({name, email, role, school});
        if (validation) {
            return {errors: validation};
        }

        // Only superadmin can update users
        if (__token.role !== 'superadmin') {
            return {errors: ['Only superadmin can update users']};
        }

        const user = await this.User.findById(userId);
        if (!user) {
            return {errors: ['User not found']};
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email.toLowerCase();
        if (role) {
            if (!['superadmin', 'school_admin'].includes(role)) {
                return {errors: ['Invalid role']};
            }
            user.role = role;
        }
        if (school !== undefined) {
            if (user.role === 'school_admin') {
                // Verify school exists before assigning
                const School = this.mongomodels.school || null;
                if (School && school) {
                    const schoolExists = await School.findById(school);
                    if (!schoolExists) {
                        return {errors: ['School not found. Please select a valid school.']};
                    }
                }
                user.school = school;
            } else {
                user.school = undefined;
            }
        }

        await user.save();

        return {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                school: user.school
            }
        };
    }

    /**
     * Delete user
     * Cascading delete: If deleting a school_admin, removes all associated classrooms and students from their school
     */
    async deleteUser({userId, __token}) {
        if (!__token || !__token.role) {
            return {errors: ['Unauthorized']};
        }

        // Only superadmin can delete users
        if (__token.role !== 'superadmin') {
            return {errors: ['Only superadmin can delete users']};
        }

        const user = await this.User.findById(userId);
        if (!user) {
            return {errors: ['User not found']};
        }

        // Prevent deleting yourself
        if (user._id.toString() === __token.userId) {
            return {errors: ['Cannot delete your own account']};
        }

        // If deleting a school_admin, cascade delete their school's classrooms and students
        let deletedCounts = { classrooms: 0, students: 0 };
        if (user.role === 'school_admin' && user.school) {
            const schoolId = user.school.toString();

            // Delete all students associated with this school
            if (this.Student) {
                const deletedStudents = await this.Student.deleteMany({school: schoolId});
                deletedCounts.students = deletedStudents.deletedCount;
                console.log(`Deleted ${deletedStudents.deletedCount} students associated with school ${schoolId}`);
            }

            // Delete all classrooms associated with this school
            if (this.Classroom) {
                const deletedClassrooms = await this.Classroom.deleteMany({school: schoolId});
                deletedCounts.classrooms = deletedClassrooms.deletedCount;
                console.log(`Deleted ${deletedClassrooms.deletedCount} classrooms associated with school ${schoolId}`);
            }
        }

        // Delete the user
        await this.User.findByIdAndDelete(userId);

        return {
            message: 'User deleted successfully',
            deleted: deletedCounts
        };
    }
}
