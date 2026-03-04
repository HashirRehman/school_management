# School Management System REST API

A production-grade REST API for managing schools, classrooms, and students with Role-Based Access Control (RBAC), built on the Axion template architecture.

## Features

- **Role-Based Access Control (RBAC)**: Superadmin and School Administrator roles
- **Multi-School Support**: Isolated data access per school
- **Comprehensive CRUD Operations**: Full management of Schools, Classrooms, and Students
- **Student Transfer**: Transfer students between classrooms within the same school
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Input Validation**: Comprehensive validation using Joi/Pine validator
- **Rate Limiting**: Protection against brute force attacks
- **Security Middleware**: Helmet, CORS, input sanitization
- **API Documentation**: Swagger/OpenAPI documentation
- **Comprehensive Testing**: Jest test suite with 70%+ coverage target
- **Docker Support**: Ready for containerized deployment

## Architecture

This project follows the Axion template architecture:

- **Managers Pattern**: Business logic organized in Manager classes
- **API Routing**: `/api/:moduleName/:fnName` pattern
- **Middleware System**: `__` prefix convention for middleware
- **Validation**: Schema-based validation with Pine validator
- **Mongoose ODM**: MongoDB integration with Mongoose

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: qantra-pineapple (Pine)
- **Rate Limiting**: express-rate-limit
- **Security**: helmet, CORS
- **Documentation**: swagger-jsdoc, swagger-ui-express
- **Testing**: Jest, Supertest, mongodb-memory-server

## Prerequisites

- Node.js 18+
- MongoDB 7+
- Redis 7+
- npm or yarn

## Installation

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/HashirRehman/school_management.git
   cd school_management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your configuration values, especially:
   - `MONGO_URI`: MongoDB connection string
   - `REDIS_URI`: Redis connection string
   - `LONG_TOKEN_SECRET`: JWT secret for long tokens (min 32 chars)
   - `SHORT_TOKEN_SECRET`: JWT secret for short tokens (min 32 chars)
   - `NACL_SECRET`: Encryption secret (min 32 chars)

4. **Start MongoDB and Redis**
   ```bash
   # MongoDB (if running locally)
   mongod

   # Redis (if running locally)
   redis-server
   ```

5. **Seed initial superadmin user**
   ```bash
   node scripts/seed.js
   ```
   Or set environment variables:
   ```bash
   SEED_SUPERADMIN_EMAIL=admin@example.com \
   SEED_SUPERADMIN_PASSWORD=SecurePassword123! \
   node scripts/seed.js
   ```

6. **Start the server**
   ```bash
   node app.js
   ```

   The API will be available at `http://localhost:5111`

### Docker Setup

1. **Build and start services**
   ```bash
   docker-compose up -d
   ```

2. **Seed initial superadmin**
   ```bash
   docker-compose exec app node scripts/seed.js
   ```

3. **View logs**
   ```bash
   docker-compose logs -f app
   ```

4. **Stop services**
   ```bash
   docker-compose down
   ```

## API Documentation

Once the server is running, access the Swagger documentation at:

```
http://localhost:5111/docs
```

The documentation includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Example requests and responses
- Error codes

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user (first user becomes superadmin)
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh short token

### Schools (Superadmin Only)

- `POST /api/schools/createSchool` - Create school
- `GET /api/schools/getSchools` - List all schools (with pagination)
- `GET /api/schools/getSchool` - Get school by ID
- `PUT /api/schools/updateSchool` - Update school
- `DELETE /api/schools/deleteSchool` - Delete school

### Classrooms (School Admin, Scoped)

- `POST /api/classrooms/createClassroom` - Create classroom
- `GET /api/classrooms/getClassrooms` - List classrooms (with pagination)
- `GET /api/classrooms/getClassroom` - Get classroom by ID
- `PUT /api/classrooms/updateClassroom` - Update classroom
- `DELETE /api/classrooms/deleteClassroom` - Delete classroom

### Students (School Admin, Scoped)

- `POST /api/students/createStudent` - Create student
- `GET /api/students/getStudents` - List students (with pagination and filtering)
  - Query params: `?page=`, `?limit=`, `?classroom=`
- `GET /api/students/getStudent` - Get student by ID
- `PUT /api/students/updateStudent` - Update student
- `DELETE /api/students/deleteStudent` - Delete student
- `POST /api/students/transferStudent` - Transfer student to another classroom

### Users (Superadmin Only)

- `POST /api/user/createUser` - Create user
- `GET /api/user/getUsers` - List users (with pagination)
- `GET /api/user/getUser` - Get user by ID
- `PUT /api/user/updateUser` - Update user
- `DELETE /api/user/deleteUser` - Delete user

## Authentication

All protected endpoints require a JWT token in the request header:

```
token: <your-jwt-token>
```

### Getting a Token

1. **Register** (first user only):
   ```bash
   POST /api/auth/register
   {
     "name": "Admin User",
     "email": "admin@example.com",
     "password": "SecurePassword123!"
   }
   ```

2. **Login**:
   ```bash
   POST /api/auth/login
   {
     "email": "admin@example.com",
     "password": "SecurePassword123!"
   }
   ```

   Response includes `shortToken` - use this for API requests.

## Role-Based Access Control

### Superadmin
- Full access to all resources
- Can create/manage schools
- Can create/manage users
- Can assign school administrators

### School Administrator
- Limited to their assigned school
- Can manage classrooms in their school
- Can manage students in their school
- Cannot access other schools' data

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The test suite includes:
- Authentication flows
- RBAC enforcement
- CRUD operations
- Input validation
- Unauthorized access prevention

Target: 70%+ code coverage

## Environment Variables

See `.env.example` for all available environment variables. Key variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `REDIS_URI` | Redis connection string | Yes |
| `LONG_TOKEN_SECRET` | JWT secret for long tokens | Yes |
| `SHORT_TOKEN_SECRET` | JWT secret for short tokens | Yes |
| `NACL_SECRET` | Encryption secret | Yes |
| `USER_PORT` | API server port | No (default: 5111) |
| `ENV` | Environment (development/production) | No |

## Deployment

### Render / Railway

1. **Set environment variables** in your hosting platform
2. **Set build command**: `npm install`
3. **Set start command**: `node app.js`
4. **Ensure MongoDB and Redis** are available (use hosted services)

### Docker Production

1. **Build image**:
   ```bash
   docker build -t school-management-api .
   ```

2. **Run container**:
   ```bash
   docker run -d \
     -p 5111:5111 \
     -e MONGO_URI=mongodb://your-mongo-uri \
     -e REDIS_URI=redis://your-redis-uri \
     -e LONG_TOKEN_SECRET=your-secret \
     -e SHORT_TOKEN_SECRET=your-secret \
     -e NACL_SECRET=your-secret \
     school-management-api
   ```

## Project Structure

```
axion-main/
├── managers/
│   ├── entities/          # Entity managers (Auth, User, School, Classroom, Student)
│   ├── http/             # HTTP server manager
│   ├── token/            # Token management
│   └── ...
├── mws/                  # Middleware
├── loaders/              # Module loaders
├── libs/                 # Utility libraries
├── docs/                 # Swagger documentation
├── tests/                # Test suites
├── scripts/              # Utility scripts (seed, etc.)
├── config/               # Configuration files
├── cache/                # Cache implementation
├── connect/              # Database connections
└── public/               # Static files
```

## Security Considerations

- All passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens signed with secrets from environment
- Input validation on all endpoints
- MongoDB injection prevention via Mongoose
- Helmet for security headers
- Rate limiting to prevent brute force
- CORS configured appropriately
- Error messages don't leak internal details
- School scoping prevents cross-school data access
- Role-based access enforced at middleware level

## Error Handling

The API uses a centralized error handler that:
- Maps errors to proper HTTP status codes
- Prevents internal error leakage in production
- Provides consistent error response format

Error response format:
```json
{
  "ok": false,
  "code": 400,
  "message": "Error description",
  "errors": ["Detailed error message"]
}
```

## Pagination

List endpoints support pagination:

```
GET /api/schools/getSchools?page=1&limit=10
```

Response includes pagination metadata:
```json
{
  "ok": true,
  "data": {
    "schools": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

## Contributing

1. Follow the existing architecture and patterns
2. Write tests for new features
3. Update documentation
4. Ensure code passes linting

## License

ISC

## Support

For issues and questions, please refer to the API documentation at `/docs` or contact the development team.
