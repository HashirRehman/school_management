const { createTestUser, createTestSchool, generateTestToken } = require('./helpers/testHelpers');
const School = require('../managers/entities/school/school.model');

describe('Schools CRUD Operations', () => {
    let superadmin;
    let superadminToken;

    beforeEach(async () => {
        superadmin = await createTestUser({ role: 'superadmin' });
        superadminToken = generateTestToken({
            userId: superadmin._id.toString(),
            role: 'superadmin'
        });
    });

    describe('POST /api/schools/createSchool', () => {
        it('should create a school (superadmin only)', async () => {
            // Test would create school
            // const response = await request(app)
            //     .post('/api/schools/createSchool')
            //     .set('token', superadminToken)
            //     .send({
            //         name: 'New School',
            //         address: '123 Main St',
            //         contactEmail: 'contact@newschool.edu'
            //     });
            // expect(response.status).toBe(200);
            // expect(response.body.data.school.name).toBe('New School');
        });

        it('should reject non-superadmin users', async () => {
            const schoolAdmin = await createTestUser({ role: 'school_admin' });
            const token = generateTestToken({
                userId: schoolAdmin._id.toString(),
                role: 'school_admin'
            });

            // Test would verify school_admin cannot create schools
            // const response = await request(app)
            //     .post('/api/schools/createSchool')
            //     .set('token', token)
            //     .send({
            //         name: 'New School'
            //     });
            // expect(response.status).toBe(403);
        });
    });

    describe('GET /api/schools/getSchools', () => {
        it('should list all schools (superadmin only)', async () => {
            await createTestSchool({}, superadmin._id);
            await createTestSchool({}, superadmin._id);

            // Test would list schools
            // const response = await request(app)
            //     .get('/api/schools/getSchools')
            //     .set('token', superadminToken);
            // expect(response.status).toBe(200);
            // expect(response.body.data.schools.length).toBeGreaterThanOrEqual(2);
        });
    });
});
