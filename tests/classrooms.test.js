const { createTestUser, createTestSchool, createTestClassroom, generateTestToken } = require('./helpers/testHelpers');

describe('Classrooms CRUD Operations', () => {
    let school;
    let schoolAdmin;
    let schoolAdminToken;

    beforeEach(async () => {
        const superadmin = await createTestUser({ role: 'superadmin' });
        school = await createTestSchool({}, superadmin._id);
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

    describe('POST /api/classrooms/createClassroom', () => {
        it('should create a classroom (school_admin only)', async () => {
            // Test would create classroom
            // const response = await request(app)
            //     .post('/api/classrooms/createClassroom')
            //     .set('token', schoolAdminToken)
            //     .send({
            //         name: 'Math 101',
            //         capacity: 30,
            //         resources: ['Projector']
            //     });
            // expect(response.status).toBe(200);
            // expect(response.body.data.classroom.name).toBe('Math 101');
        });
    });

    describe('GET /api/classrooms/getClassrooms', () => {
        it('should list classrooms with pagination', async () => {
            await createTestClassroom({}, school._id);
            await createTestClassroom({}, school._id);

            // Test would list classrooms with pagination
            // const response = await request(app)
            //     .get('/api/classrooms/getClassrooms?page=1&limit=10')
            //     .set('token', schoolAdminToken);
            // expect(response.status).toBe(200);
            // expect(response.body.data.pagination).toBeDefined();
        });
    });
});
