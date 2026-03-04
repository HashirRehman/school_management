module.exports = class School {
    constructor({utils, cache, config, cortex, managers, validators, mongomodels} = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.School = mongomodels.school || null;
        this.User = mongomodels.user || null;
        this.Classroom = mongomodels.classroom || null;
        this.Student = mongomodels.student || null;

        this.httpExposed = ['createSchool', 'getSchools', 'getSchool', 'updateSchool', 'deleteSchool'];
    }

    /**
     * Create a new school (superadmin only)
     */
    async createSchool({name, address, contactEmail, contactPhone, __token}) {
        // Validate authorization
        if (!__token || __token.role !== 'superadmin') {
            return {errors: ['Only superadmin can create schools']};
        }

        // Validate input
        const validation = await this.validators.school?.createSchool({name, address, contactEmail, contactPhone});
        if (validation) {
            return {errors: validation};
        }

        // Check if school with same name already exists
        const existingSchool = await this.School.findOne({name: name.trim()});
        if (existingSchool) {
            return {errors: ['School with this name already exists']};
        }

        // Create school
        const school = new this.School({
            name: name.trim(),
            address: address?.trim(),
            contactEmail: contactEmail?.toLowerCase().trim(),
            contactPhone: contactPhone?.trim(),
            createdBy: __token.userId
        });

        await school.save();

        return {
            school: {
                _id: school._id,
                name: school.name,
                address: school.address,
                contactEmail: school.contactEmail,
                contactPhone: school.contactPhone,
                createdBy: school.createdBy,
                createdAt: school.createdAt,
                updatedAt: school.updatedAt
            }
        };
    }

    /**
     * Get list of all schools (superadmin only)
     */
    async getSchools({__token, page, limit}) {
        // Validate authorization
        if (!__token || __token.role !== 'superadmin') {
            return {errors: ['Only superadmin can view all schools']};
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const schools = await this.School.find()
            .populate('createdBy', 'name email')
            .skip(skip)
            .limit(limitNum)
            .lean()
            .sort({createdAt: -1});

        const total = await this.School.countDocuments();

        return {
            schools,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
    }

    /**
     * Get single school by ID (superadmin only)
     */
    async getSchool({schoolId, __token}) {
        // Validate authorization
        if (!__token || __token.role !== 'superadmin') {
            return {errors: ['Only superadmin can view school details']};
        }

        const school = await this.School.findById(schoolId)
            .populate('createdBy', 'name email')
            .lean();

        if (!school) {
            return {errors: ['School not found']};
        }

        return {school};
    }

    /**
     * Update school (superadmin only)
     */
    async updateSchool({schoolId, name, address, contactEmail, contactPhone, __token}) {
        // Validate authorization
        if (!__token || __token.role !== 'superadmin') {
            return {errors: ['Only superadmin can update schools']};
        }

        // Validate input
        const validation = await this.validators.school?.updateSchool({name, address, contactEmail, contactPhone});
        if (validation) {
            return {errors: validation};
        }

        const school = await this.School.findById(schoolId);
        if (!school) {
            return {errors: ['School not found']};
        }

        // Update fields
        if (name) school.name = name.trim();
        if (address !== undefined) school.address = address?.trim();
        if (contactEmail !== undefined) school.contactEmail = contactEmail?.toLowerCase().trim();
        if (contactPhone !== undefined) school.contactPhone = contactPhone?.trim();

        await school.save();

        return {
            school: {
                _id: school._id,
                name: school.name,
                address: school.address,
                contactEmail: school.contactEmail,
                contactPhone: school.contactPhone,
                createdBy: school.createdBy,
                createdAt: school.createdAt,
                updatedAt: school.updatedAt
            }
        };
    }

    /**
     * Delete school (superadmin only)
     * Cascading delete: Removes all associated classrooms and students
     */
    async deleteSchool({schoolId, __token}) {
        // Validate authorization
        if (!__token || __token.role !== 'superadmin') {
            return {errors: ['Only superadmin can delete schools']};
        }

        const school = await this.School.findById(schoolId);
        if (!school) {
            return {errors: ['School not found']};
        }

        // Check if school has users
        const userCount = await this.User.countDocuments({school: schoolId});
        if (userCount > 0) {
            return {errors: ['Cannot delete school with associated users. Please reassign or delete users first.']};
        }

        // Cascading delete: Remove all classrooms and students associated with this school
        let deletedCounts = { classrooms: 0, students: 0 };

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

        // Delete the school
        await this.School.findByIdAndDelete(schoolId);

        return {
            message: 'School deleted successfully',
            deleted: deletedCounts
        };
    }
}
