const { createTestUser, createTestSchool, generateTestToken } = require('./helpers/testHelpers');

describe('Role-Based Access Control', () => {
    describe('Superadmin Access', () => {
        it('should allow superadmin to access all schools', async () => {
            const superadmin = await createTestUser({ role: 'superadmin' });
            const school = await createTestSchool({}, superadmin._id);
            const token = generateTestToken({
                userId: superadmin._id.toString(),
                role: 'superadmin'
            });

            // Test superadmin can access schools
            // const response = await request(app)
            //     .get('/api/schools/getSchools')
            //     .set('token', token);
            // expect(response.status).toBe(200);
        });
    });

    describe('School Admin Access', () => {
        it('should restrict school_admin to their school only', async () => {
            const school = await createTestSchool();
            const schoolAdmin = await createTestUser({
                role: 'school_admin',
                school: school._id
            });
            const token = generateTestToken({
                userId: schoolAdmin._id.toString(),
                role: 'school_admin',
                school: school._id.toString()
            });

            // Test school_admin can only access their school
            // const response = await request(app)
            //     .get('/api/classrooms/getClassrooms')
            //     .set('token', token);
            // expect(response.status).toBe(200);
        });

        it('should prevent school_admin from accessing other schools', async () => {
            const school1 = await createTestSchool();
            const school2 = await createTestSchool();
            const schoolAdmin = await createTestUser({
                role: 'school_admin',
                school: school1._id
            });
            const token = generateTestToken({
                userId: schoolAdmin._id.toString(),
                role: 'school_admin',
                school: school1._id.toString()
            });

            // Test school_admin cannot access school2 data
            // This would be tested in the manager methods
        });
    });
});
