const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../managers/entities/user/user.model');
const School = require('../../managers/entities/school/school.model');
const Classroom = require('../../managers/entities/classroom/classroom.model');
const Student = require('../../managers/entities/student/student.model');
const jwt = require('jsonwebtoken');

/**
 * Create a test user
 */
async function createTestUser(userData = {}) {
    const defaultData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'superadmin',
        ...userData
    };

    const user = new User(defaultData);
    await user.save();
    return user;
}

/**
 * Create a test school
 */
async function createTestSchool(schoolData = {}, createdBy) {
    const defaultData = {
        name: 'Test School',
        address: '123 Test St',
        contactEmail: 'school@example.com',
        contactPhone: '+1234567890',
        createdBy: createdBy || new mongoose.Types.ObjectId(),
        ...schoolData
    };

    const school = new School(defaultData);
    await school.save();
    return school;
}

/**
 * Create a test classroom
 */
async function createTestClassroom(classroomData = {}, schoolId) {
    const defaultData = {
        name: 'Test Classroom',
        capacity: 30,
        resources: ['Projector', 'Whiteboard'],
        school: schoolId || new mongoose.Types.ObjectId(),
        ...classroomData
    };

    const classroom = new Classroom(defaultData);
    await classroom.save();
    return classroom;
}

/**
 * Create a test student
 */
async function createTestStudent(studentData = {}, classroomId, schoolId) {
    const defaultData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        dateOfBirth: new Date('2010-01-01'),
        classroom: classroomId || new mongoose.Types.ObjectId(),
        school: schoolId || new mongoose.Types.ObjectId(),
        ...studentData
    };

    const student = new Student(defaultData);
    await student.save();
    return student;
}

/**
 * Generate a test JWT token
 */
function generateTestToken(payload = {}) {
    const defaultPayload = {
        userId: new mongoose.Types.ObjectId().toString(),
        userKey: 'test-key',
        role: 'superadmin',
        sessionId: 'test-session',
        deviceId: 'test-device',
        ...payload
    };

    // Use a test secret (in real app, use proper secret from config)
    const secret = process.env.SHORT_TOKEN_SECRET || 'test-secret';
    return jwt.sign(defaultPayload, secret, { expiresIn: '1y' });
}

/**
 * Make authenticated request
 */
function authenticatedRequest(app, method, url, token, data = {}) {
    const req = request(app)[method](url)
        .set('token', token);

    if (Object.keys(data).length > 0) {
        if (method === 'get') {
            return req.query(data);
        } else {
            return req.send(data);
        }
    }
    return req;
}

module.exports = {
    createTestUser,
    createTestSchool,
    createTestClassroom,
    createTestStudent,
    generateTestToken,
    authenticatedRequest
};
