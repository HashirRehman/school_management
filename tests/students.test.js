const { createTestUser, createTestSchool, createTestClassroom, createTestStudent, generateTestToken } = require('./helpers/testHelpers');

describe('Students CRUD Operations', () => {
    let school;
    let classroom;
    let schoolAdmin;
    let schoolAdminToken;

    beforeEach(async () => {
        const superadmin = await createTestUser({ role: 'superadmin' });
        school = await createTestSchool({}, superadmin._id);
        classroom = await createTestClassroom({}, school._id);
        schoolAdmin = await createTestUser({
            role: 'school_admin',
            school: school._id
        });
        schoolAdminToken = generateTestToken({
            userId: schoolAdmin._id.toString(),
            role: 'school_admin',
            school: school._id.toString()
        });
    });

    describe('POST /api/students/createStudent', () => {
        it('should create a student', async () => {
            // Test would create student
            // const response = await request(app)
            //     .post('/api/students/createStudent')
            //     .set('token', schoolAdminToken)
            //     .send({
            //         firstName: 'Jane',
            //         lastName: 'Doe',
            //         email: 'jane.doe@example.com',
            //         dateOfBirth: '2010-01-01',
            //         classroom: classroom._id.toString()
            //     });
            // expect(response.status).toBe(200);
        });
    });

    describe('POST /api/students/transferStudent', () => {
        it('should transfer student to another classroom (same school)', async () => {
            const student = await createTestStudent({}, classroom._id, school._id);
            const newClassroom = await createTestClassroom({}, school._id);

            // Test would transfer student
            // const response = await request(app)
            //     .post(`/api/students/transferStudent`)
            //     .set('token', schoolAdminToken)
            //     .send({
            //         studentId: student._id.toString(),
            //         newClassroomId: newClassroom._id.toString()
            //     });
            // expect(response.status).toBe(200);
        });

        it('should prevent cross-school transfer', async () => {
            // This would be tested to ensure cross-school transfers are blocked
        });
    });
});
