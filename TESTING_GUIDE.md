# Testing Guide - School Management System API

## Quick Start Testing

### Step 1: Login and Get Token

```bash
# Login as superadmin
curl -X POST http://localhost:5111/api/auth/login \
  -H "Content-Type: application/json" \
  -H "User-Agent: curl/7.0" \
  -d '{"email":"admin@schoolmanagement.com","password":"Admin123!"}'
```

**Save the `shortToken` from the response!**

### Step 2: Test Superadmin Endpoints

#### Create a School
```bash
# Replace YOUR_TOKEN with the shortToken from login
curl -X POST http://localhost:5111/api/schools/createSchool \
  -H "Content-Type: application/json" \
  -H "token: YOUR_TOKEN" \
  -d '{
    "name": "Springfield High School",
    "address": "123 Main St, Springfield",
    "contactEmail": "contact@springfield.edu",
    "contactPhone": "+1234567890"
  }'
```

**Save the school `_id` from the response!**

#### List All Schools
```bash
curl -X GET "http://localhost:5111/api/schools/getSchools?page=1&limit=10" \
  -H "token: YOUR_TOKEN"
```

#### Create a School Administrator
```bash
# Replace SCHOOL_ID with the _id from school creation
curl -X POST http://localhost:5111/api/user/createUser \
  -H "Content-Type: application/json" \
  -H "token: YOUR_TOKEN" \
  -d '{
    "name": "John Smith",
    "email": "john.smith@springfield.edu",
    "password": "SecurePass123!",
    "role": "school_admin",
    "school": "SCHOOL_ID"
  }'
```

**Save the user `_id` and credentials!**

### Step 3: Login as School Admin

```bash
curl -X POST http://localhost:5111/api/auth/login \
  -H "Content-Type: application/json" \
  -H "User-Agent: curl/7.0" \
  -d '{
    "email": "john.smith@springfield.edu",
    "password": "SecurePass123!"
  }'
```

**Save the new `shortToken`!**

### Step 4: Test School Admin Endpoints

#### Create a Classroom
```bash
# Use the school admin token
curl -X POST http://localhost:5111/api/classrooms/createClassroom \
  -H "Content-Type: application/json" \
  -H "token: SCHOOL_ADMIN_TOKEN" \
  -d '{
    "name": "Mathematics 101",
    "capacity": 30,
    "resources": ["Projector", "Whiteboard", "Calculators"]
  }'
```

**Save the classroom `_id`!**

#### List Classrooms
```bash
curl -X GET "http://localhost:5111/api/classrooms/getClassrooms?page=1&limit=10" \
  -H "token: SCHOOL_ADMIN_TOKEN"
```

#### Create a Student
```bash
# Replace CLASSROOM_ID with the classroom _id
curl -X POST http://localhost:5111/api/students/createStudent \
  -H "Content-Type: application/json" \
  -H "token: SCHOOL_ADMIN_TOKEN" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@springfield.edu",
    "dateOfBirth": "2010-05-15",
    "classroom": "CLASSROOM_ID"
  }'
```

**Save the student `_id`!**

#### List Students
```bash
# List all students
curl -X GET "http://localhost:5111/api/students/getStudents?page=1&limit=10" \
  -H "token: SCHOOL_ADMIN_TOKEN"

# Filter by classroom
curl -X GET "http://localhost:5111/api/students/getStudents?page=1&limit=10&classroom=CLASSROOM_ID" \
  -H "token: SCHOOL_ADMIN_TOKEN"
```

#### Transfer Student to Another Classroom
```bash
# First, create another classroom
curl -X POST http://localhost:5111/api/classrooms/createClassroom \
  -H "Content-Type: application/json" \
  -H "token: SCHOOL_ADMIN_TOKEN" \
  -d '{
    "name": "Science 201",
    "capacity": 25,
    "resources": ["Lab Equipment", "Microscopes"]
  }'

# Then transfer the student (replace STUDENT_ID and NEW_CLASSROOM_ID)
curl -X POST http://localhost:5111/api/students/transferStudent \
  -H "Content-Type: application/json" \
  -H "token: SCHOOL_ADMIN_TOKEN" \
  -d '{
    "studentId": "STUDENT_ID",
    "newClassroomId": "NEW_CLASSROOM_ID"
  }'
```

## Complete Testing Workflow

### Test 1: Authentication
- [ ] Login as superadmin
- [ ] Verify token is received
- [ ] Test invalid credentials (should fail)
- [ ] Test missing token (should fail)

### Test 2: School Management (Superadmin)
- [ ] Create a school
- [ ] List all schools
- [ ] Get school by ID
- [ ] Update school
- [ ] Try to create school as non-superadmin (should fail)

### Test 3: User Management (Superadmin)
- [ ] Create school admin user
- [ ] List all users
- [ ] Get user by ID
- [ ] Update user
- [ ] Delete user

### Test 4: Classroom Management (School Admin)
- [ ] Create classroom
- [ ] List classrooms (with pagination)
- [ ] Get classroom by ID
- [ ] Update classroom
- [ ] Delete classroom
- [ ] Try to access other school's classrooms (should fail)

### Test 5: Student Management (School Admin)
- [ ] Create student
- [ ] List students (with pagination)
- [ ] List students filtered by classroom
- [ ] Get student by ID
- [ ] Update student
- [ ] Transfer student to another classroom
- [ ] Try to transfer to different school (should fail)
- [ ] Delete student

### Test 6: Authorization & Security
- [ ] Try to access superadmin endpoint as school admin (should fail)
- [ ] Try to access without token (should fail)
- [ ] Try to access with invalid token (should fail)
- [ ] Verify school admin can only see their school's data

## Using Swagger UI (Easiest Method)

1. Open: `http://localhost:5111/docs`
2. Click on `POST /api/auth/login`
3. Click "Try it out"
4. Enter credentials and click "Execute"
5. Copy the `shortToken` from response
6. Click the "Authorize" button (top right)
7. Paste your token
8. Now test all other endpoints - they'll automatically include your token!

## Testing Tips

1. **Always save tokens** from login responses
2. **Save IDs** (school_id, classroom_id, student_id) for subsequent requests
3. **Check response codes**: 200 = success, 400 = validation error, 401 = unauthorized, 403 = forbidden
4. **Use pagination**: Add `?page=1&limit=10` to list endpoints
5. **Test error cases**: Try invalid data, missing fields, unauthorized access

## Expected Response Format

**Success:**
```json
{
  "ok": true,
  "data": { ... },
  "errors": [],
  "message": ""
}
```

**Error:**
```json
{
  "ok": false,
  "data": {},
  "errors": ["Error message"],
  "message": "Error description"
}
```
