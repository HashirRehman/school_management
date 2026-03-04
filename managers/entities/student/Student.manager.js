module.exports = class Student {
    constructor({utils, cache, config, cortex, managers, validators, mongomodels} = {}) {
        this.config = config;
        this.cortex = cortex;
        this.validators = validators;
        this.mongomodels = mongomodels;
        this.Student = mongomodels.student || null;
        this.Classroom = mongomodels.classroom || null;
        this.School = mongomodels.school || null;

        this.httpExposed = ['createStudent', 'getStudents', 'getStudent', 'updateStudent', 'deleteStudent', 'transferStudent'];
    }

    /**
     * Create a new student (school_admin only, scoped to their school)
     */
    async createStudent({firstName, lastName, email, dateOfBirth, classroom, classroomId, __token}) {
        // Validate authorization
        if (!__token || __token.role !== 'school_admin') {
            return {errors: ['Only school administrators can create students']};
        }

        if (!__token.school) {
            return {errors: ['School not assigned']};
        }

        // Use classroomId if provided, otherwise use classroom (for backward compatibility)
        const classroomIdToUse = classroomId || classroom;

        if (!classroomIdToUse) {
            return {errors: ['Classroom is required']};
        }

        // Validate dateOfBirth format and age (must not be in future, and at least 15 years ago)
        if (!dateOfBirth) {
            return {errors: ['Date of birth is required']};
        }
        const dob = new Date(dateOfBirth);
        if (isNaN(dob.getTime())) {
            return {errors: ['enter a valid date']};
        }

        const today = new Date();
        // Normalize times for comparison
        const dobDate = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // Cannot be in the future
        if (dobDate > todayDate) {
            return {errors: ['enter a valid date']};
        }

        // Must be at least 15 years ago
        const fifteenYearsAgo = new Date(
            todayDate.getFullYear() - 15,
            todayDate.getMonth(),
            todayDate.getDate()
        );
        if (dobDate > fifteenYearsAgo) {
            return {errors: ['enter a valid date']};
        }

        // Validate other fields (excluding dateOfBirth which we validate manually)
        // Pine uses model paths; classroomId model maps to "classroom" path
        const validation = await this.validators.student?.createStudent({
            firstName,
            lastName,
            email,
            // Skip dateOfBirth - validated manually above
            classroom: classroomIdToUse, // classroomId model maps to "classroom" path
        });
        if (validation) {
            return {errors: validation};
        }

        // Verify classroom exists and belongs to the school
        const classroomDoc = await this.Classroom.findOne({
            _id: classroomIdToUse,
            school: __token.school
        });
        if (!classroomDoc) {
            return {errors: ['Classroom not found or does not belong to your school']};
        }

        // Check if student with same email already exists in this school
        const existingStudent = await this.Student.findOne({
            email: email.toLowerCase(),
            school: __token.school
        });
        if (existingStudent) {
            return {errors: ['Student with this email already exists in your school']};
        }

        // Create student
        const student = new this.Student({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            dateOfBirth: dob,
            classroom: classroomIdToUse,
            school: __token.school
        });

        await student.save();

        // Populate classroom and school before returning
        await student.populate('classroom', 'name');
        await student.populate('school', 'name');

        return {
            student: {
                _id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                dateOfBirth: student.dateOfBirth,
                classroom: student.classroom,
                school: student.school,
                enrollmentDate: student.enrollmentDate,
                createdAt: student.createdAt,
                updatedAt: student.updatedAt
            }
        };
    }

    /**
     * Get list of students
     * - school_admin: scoped to their school
     * - superadmin: can view all students across all schools
     */
    async getStudents({__token, page, limit, classroom}) {
        // Validate authorization
        if (!__token || !['school_admin', 'superadmin'].includes(__token.role)) {
            return {errors: ['Only authorized administrators can view students']};
        }

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Build base query:
        // - For school_admin: only their school
        // - For superadmin: all schools
        let query = (__token.role === 'school_admin')
            ? { school: __token.school }
            : {};

        // Filter by classroom if provided
        if (classroom) {
            if (__token.role === 'school_admin') {
                // Verify classroom belongs to the admin's school
                const classroomDoc = await this.Classroom.findOne({
                    _id: classroom,
                    school: __token.school
                });
                if (!classroomDoc) {
                    return {errors: ['Classroom not found or does not belong to your school']};
                }
            }
            query.classroom = classroom;
        }

        const students = await this.Student.find(query)
            .populate('classroom', 'name')
            .populate('school', 'name')
            .skip(skip)
            .limit(limitNum)
            .lean()
            .sort({createdAt: -1});

        const total = await this.Student.countDocuments(query);

        return {
            students,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
    }

    /**
     * Get single student by ID (school_admin only, scoped to their school)
     */
    async getStudent({studentId, __token}) {
        // Validate authorization
        if (!__token || __token.role !== 'school_admin') {
            return {errors: ['Only school administrators can view student details']};
        }

        if (!__token.school) {
            return {errors: ['School not assigned']};
        }

        const student = await this.Student.findOne({
            _id: studentId,
            school: __token.school
        })
            .populate('classroom', 'name capacity')
            .populate('school', 'name')
            .lean();

        if (!student) {
            return {errors: ['Student not found']};
        }

        return {student};
    }

    /**
     * Update student (school_admin only, scoped to their school)
     */
    async updateStudent({studentId, firstName, lastName, email, dateOfBirth, __token}) {
        // Validate authorization
        if (!__token || __token.role !== 'school_admin') {
            return {errors: ['Only school administrators can update students']};
        }

        if (!__token.school) {
            return {errors: ['School not assigned']};
        }

        // Normalize dateOfBirth (if provided) to Date instance
        const dob = dateOfBirth ? new Date(dateOfBirth) : undefined;

        // Validate input
        const validation = await this.validators.student?.updateStudent({
            firstName,
            lastName,
            email,
            dateOfBirth: dob,
        });
        if (validation) {
            return {errors: validation};
        }

        const student = await this.Student.findOne({
            _id: studentId,
            school: __token.school
        });

        if (!student) {
            return {errors: ['Student not found']};
        }

        // Update fields
        if (firstName) student.firstName = firstName.trim();
        if (lastName) student.lastName = lastName.trim();
        if (email) {
            const newEmail = email.toLowerCase().trim();
            // Check if email is being changed and if new email already exists
            if (newEmail !== student.email) {
                const existingStudent = await this.Student.findOne({
                    email: newEmail,
                    school: __token.school,
                    _id: {$ne: studentId}
                });
                if (existingStudent) {
                    return {errors: ['Student with this email already exists in your school']};
                }
            }
            student.email = newEmail;
        }
        if (dob) student.dateOfBirth = dob;

        await student.save();

        // Populate classroom and school before returning
        await student.populate('classroom', 'name');
        await student.populate('school', 'name');

        return {
            student: {
                _id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                dateOfBirth: student.dateOfBirth,
                classroom: student.classroom,
                school: student.school,
                enrollmentDate: student.enrollmentDate,
                createdAt: student.createdAt,
                updatedAt: student.updatedAt
            }
        };
    }

    /**
     * Delete student (school_admin only, scoped to their school)
     */
    async deleteStudent({studentId, __token}) {
        // Validate authorization
        if (!__token || __token.role !== 'school_admin') {
            return {errors: ['Only school administrators can delete students']};
        }

        if (!__token.school) {
            return {errors: ['School not assigned']};
        }

        const student = await this.Student.findOne({
            _id: studentId,
            school: __token.school
        });

        if (!student) {
            return {errors: ['Student not found']};
        }

        await this.Student.findByIdAndDelete(studentId);

        return {message: 'Student deleted successfully'};
    }

    /**
     * Transfer student to another classroom (same school only)
     */
    async transferStudent({studentId, newClassroomId, __token}) {
        // Validate authorization
        if (!__token || __token.role !== 'school_admin') {
            return {errors: ['Only school administrators can transfer students']};
        }

        if (!__token.school) {
            return {errors: ['School not assigned']};
        }

        // Validate input (Pine model \"classroomId\" maps to \"classroom\" path)
        const validation = await this.validators.student?.transferStudent({
            classroom: newClassroomId,
        });
        if (validation) {
            return {errors: validation};
        }

        // Find student
        const student = await this.Student.findOne({
            _id: studentId,
            school: __token.school
        });

        if (!student) {
            return {errors: ['Student not found']};
        }

        // Verify new classroom exists and belongs to the same school
        const newClassroom = await this.Classroom.findOne({
            _id: newClassroomId,
            school: __token.school
        });

        if (!newClassroom) {
            return {errors: ['New classroom not found or does not belong to your school']};
        }

        // Prevent transferring to the same classroom
        if (student.classroom.toString() === newClassroomId.toString()) {
            return {errors: ['Student is already in this classroom']};
        }

        // Update student's classroom
        student.classroom = newClassroomId;
        await student.save();

        // Populate classroom and school before returning
        await student.populate('classroom', 'name');
        await student.populate('school', 'name');

        return {
            student: {
                _id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                classroom: student.classroom,
                school: student.school,
                updatedAt: student.updatedAt
            },
            message: 'Student transferred successfully'
        };
    }
}
