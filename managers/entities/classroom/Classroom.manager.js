module.exports = class Classroom {
    constructor({utils, cache, config, cortex, managers, validators, mongomodels} = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.Classroom = mongomodels.classroom || null;
        this.School = mongomodels.school || null;

        this.httpExposed = ['createClassroom', 'getClassrooms', 'getClassroom', 'updateClassroom', 'deleteClassroom'];
    }

    /**
     * Create a new classroom (school_admin only, scoped to their school)
     */
    async createClassroom({name, capacity, resources, __token}) {
        // Validate authorization
        if (!__token || __token.role !== 'school_admin') {
            return {errors: ['Only school administrators can create classrooms']};
        }

        if (!__token.school) {
            return {errors: ['School not assigned']};
        }

        // Validate input
        const validation = await this.validators.classroom?.createClassroom({name, capacity, resources});
        if (validation) {
            return {errors: validation};
        }

        // Verify school exists
        const school = await this.School.findById(__token.school);
        if (!school) {
            return {errors: [`School not found. Your account is assigned to a school (ID: ${__token.school}) that no longer exists. Please contact the superadmin to update your school assignment.`]};
        }

        // Check if classroom with same name already exists in this school
        const existingClassroom = await this.Classroom.findOne({
            name: name.trim(),
            school: __token.school
        });
        if (existingClassroom) {
            return {errors: ['Classroom with this name already exists in your school']};
        }

        // Create classroom
        const classroom = new this.Classroom({
            name: name.trim(),
            capacity: parseInt(capacity),
            resources: Array.isArray(resources) ? resources.map(r => r.trim()).filter(r => r) : [],
            school: __token.school
        });

        await classroom.save();

        return {
            classroom: {
                _id: classroom._id,
                name: classroom.name,
                capacity: classroom.capacity,
                resources: classroom.resources,
                school: classroom.school,
                createdAt: classroom.createdAt,
                updatedAt: classroom.updatedAt
            }
        };
    }

    /**
     * Get list of classrooms
     * - school_admin: scoped to their school
     * - superadmin: can view all classrooms across all schools
     */
    async getClassrooms({__token, page, limit}) {
        // Validate authorization
        if (!__token || !['school_admin', 'superadmin'].includes(__token.role)) {
            return {errors: ['Only authorized administrators can view classrooms']};
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Build query:
        // - For school_admin: only their school
        // - For superadmin: all schools
        const query = (__token.role === 'school_admin')
            ? { school: __token.school }
            : {};

        const classrooms = await this.Classroom.find(query)
            .populate('school', 'name')
            .skip(skip)
            .limit(limitNum)
            .lean()
            .sort({createdAt: -1});

        const total = await this.Classroom.countDocuments(query);

        return {
            classrooms,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
    }

    /**
     * Get single classroom by ID (school_admin only, scoped to their school)
     */
    async getClassroom({classroomId, __token}) {
        // Validate authorization
        if (!__token || __token.role !== 'school_admin') {
            return {errors: ['Only school administrators can view classroom details']};
        }

        if (!__token.school) {
            return {errors: ['School not assigned']};
        }

        const classroom = await this.Classroom.findOne({
            _id: classroomId,
            school: __token.school
        })
            .populate('school', 'name')
            .lean();

        if (!classroom) {
            return {errors: ['Classroom not found']};
        }

        return {classroom};
    }

    /**
     * Update classroom (school_admin only, scoped to their school)
     */
    async updateClassroom({classroomId, name, capacity, resources, __token}) {
        // Validate authorization
        if (!__token || __token.role !== 'school_admin') {
            return {errors: ['Only school administrators can update classrooms']};
        }

        if (!__token.school) {
            return {errors: ['School not assigned']};
        }

        // Validate input
        const validation = await this.validators.classroom?.updateClassroom({name, capacity, resources});
        if (validation) {
            return {errors: validation};
        }

        const classroom = await this.Classroom.findOne({
            _id: classroomId,
            school: __token.school
        });

        if (!classroom) {
            return {errors: ['Classroom not found']};
        }

        // Update fields
        if (name) classroom.name = name.trim();
        if (capacity !== undefined) classroom.capacity = parseInt(capacity);
        if (resources !== undefined) {
            classroom.resources = Array.isArray(resources) 
                ? resources.map(r => r.trim()).filter(r => r) 
                : [];
        }

        await classroom.save();

        return {
            classroom: {
                _id: classroom._id,
                name: classroom.name,
                capacity: classroom.capacity,
                resources: classroom.resources,
                school: classroom.school,
                createdAt: classroom.createdAt,
                updatedAt: classroom.updatedAt
            }
        };
    }

    /**
     * Delete classroom (school_admin only, scoped to their school)
     */
    async deleteClassroom({classroomId, __token}) {
        // Validate authorization
        if (!__token || __token.role !== 'school_admin') {
            return {errors: ['Only school administrators can delete classrooms']};
        }

        if (!__token.school) {
            return {errors: ['School not assigned']};
        }

        const classroom = await this.Classroom.findOne({
            _id: classroomId,
            school: __token.school
        });

        if (!classroom) {
            return {errors: ['Classroom not found']};
        }

        // Check if classroom has students
        const Student = this.mongomodels.student || null;
        if (Student) {
            const studentCount = await Student.countDocuments({classroom: classroomId});
            if (studentCount > 0) {
                return {errors: ['Cannot delete classroom with enrolled students']};
            }
        }

        await this.Classroom.findByIdAndDelete(classroomId);

        return {message: 'Classroom deleted successfully'};
    }
}
