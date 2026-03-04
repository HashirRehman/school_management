const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'School Management System API',
            version: '1.0.0',
            description: 'Production-grade REST API for managing schools, classrooms, and students with RBAC',
            contact: {
                name: 'API Support',
            },
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:5111',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token obtained from login endpoint. Include in header as: token: <your-token>',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        name: { type: 'string', example: 'John Doe' },
                        email: { type: 'string', example: 'john@example.com' },
                        role: { type: 'string', enum: ['superadmin', 'school_admin'], example: 'school_admin' },
                        school: { type: 'string', example: '507f1f77bcf86cd799439012' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                School: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
                        name: { type: 'string', example: 'Springfield High School' },
                        address: { type: 'string', example: '123 Main St, Springfield' },
                        contactEmail: { type: 'string', example: 'contact@springfield.edu' },
                        contactPhone: { type: 'string', example: '+1234567890' },
                        createdBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Classroom: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439013' },
                        name: { type: 'string', example: 'Mathematics 101' },
                        capacity: { type: 'number', example: 30 },
                        resources: { type: 'array', items: { type: 'string' }, example: ['Projector', 'Whiteboard'] },
                        school: { type: 'string', example: '507f1f77bcf86cd799439012' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Student: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439014' },
                        firstName: { type: 'string', example: 'Jane' },
                        lastName: { type: 'string', example: 'Smith' },
                        email: { type: 'string', example: 'jane.smith@example.com' },
                        dateOfBirth: { type: 'string', format: 'date', example: '2010-05-15' },
                        classroom: { type: 'string', example: '507f1f77bcf86cd799439013' },
                        school: { type: 'string', example: '507f1f77bcf86cd799439012' },
                        enrollmentDate: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean', example: false },
                        code: { type: 'number', example: 400 },
                        message: { type: 'string', example: 'Validation error' },
                        errors: { type: 'array', items: { type: 'string' }, example: ['Email is required'] },
                    },
                },
                Success: {
                    type: 'object',
                    properties: {
                        ok: { type: 'boolean', example: true },
                        data: { type: 'object' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./managers/**/*.manager.js'], // Path to the API files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
