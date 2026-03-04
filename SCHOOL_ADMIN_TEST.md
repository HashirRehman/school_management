# School Administrator Features Test Guide

## Default Credentials

**Superadmin:**
- Email: `admin@schoolmanagement.com`
- Password: `Admin123!`

## Testing School Administrator Features

### Step 1: Login as Superadmin
1. Open the frontend: http://localhost:3000
2. Login with superadmin credentials
3. Verify you see the Dashboard

### Step 2: Create a School
1. Navigate to **Schools** page
2. Click **Create School**
3. Fill in:
   - Name: "Test School"
   - Address: "123 Test St"
   - Contact Email: "test@school.edu"
   - Contact Phone: "123-456-7890"
4. Click **Create**
5. Verify school appears in the list

### Step 3: Create a School Administrator
1. Navigate to **Users** page
2. Click **Create User**
3. Fill in:
   - Name: "Test School Admin"
   - Email: "schooladmin@test.com"
   - Password: "Test123!"
   - Role: **School Administrator**
   - School: Select the school you just created
4. Click **Create**
5. Verify user appears in the list with role "school_admin"

### Step 4: Logout and Login as School Admin
1. Click **Logout** in the navigation
2. Login with:
   - Email: `schooladmin@test.com`
   - Password: `Test123!`
3. Verify you see the Dashboard (should show school-specific stats)

### Step 5: Test Classroom Management
1. Navigate to **Classrooms** page
2. Click **Create Classroom**
3. Fill in:
   - Name: "Grade 1 - Section A"
   - Capacity: 30
   - Resources: Add "Projector", "Whiteboard" (one per line)
4. Click **Create**
5. Verify classroom appears in the list
6. Test **Edit** - modify capacity or resources
7. Test **View** - click on a classroom to see details

### Step 6: Test Student Management
1. Navigate to **Students** page
2. Click **Create Student**
3. Fill in:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john.doe@test.com"
   - Date of Birth: Select a date (e.g., 2010-05-15)
   - Classroom: Select the classroom you created
4. Click **Create**
5. Verify student appears in the list
6. Test **Edit** - modify student information
7. Test **Filter by Classroom** - select a classroom from the dropdown
8. Test **Transfer Student**:
   - Create another classroom (e.g., "Grade 1 - Section B")
   - Click **Transfer** on a student
   - Select the new classroom
   - Click **Transfer**
   - Verify student is now in the new classroom

### Step 7: Test Authorization (Unauthorized Access)
1. As School Admin, try to access:
   - **Schools** page - Should NOT be visible in navigation
   - **Users** page - Should NOT be visible in navigation
2. If you manually navigate to these pages (via URL), you should get an error

### Step 8: Test School Scoping
1. As Superadmin, create another school
2. Create a classroom in the second school
3. Logout and login as the School Admin (assigned to first school)
4. Verify:
   - You can only see classrooms from YOUR school
   - You can only see students from YOUR school
   - You cannot access data from the other school

## Expected Behavior

### ✅ What School Admin CAN Do:
- View and manage classrooms in their assigned school
- Create, read, update, delete students in their school
- Transfer students between classrooms (within same school)
- Filter students by classroom
- View dashboard with school-specific statistics

### ❌ What School Admin CANNOT Do:
- Create or manage schools
- Create or manage users
- Access data from other schools
- Access superadmin-only features

## Troubleshooting

### Issue: Cannot create student
- **Check**: Make sure you've created at least one classroom first
- **Check**: Verify the classroom belongs to your school
- **Check**: Ensure all required fields are filled

### Issue: Cannot see classrooms/students
- **Check**: Verify you're logged in as a school admin (not superadmin)
- **Check**: Verify your user account has a school assigned
- **Check**: Make sure you've created classrooms/students for your school

### Issue: Transfer student fails
- **Check**: Both classrooms must belong to the same school
- **Check**: Student must exist and belong to your school
- **Check**: New classroom must have capacity available

## API Endpoints Tested

When testing through the frontend, these endpoints are being used:

### Classrooms (School Admin)
- `POST /api/classroom/createClassroom`
- `POST /api/classroom/getClassrooms`
- `POST /api/classroom/getClassroom`
- `POST /api/classroom/updateClassroom`
- `POST /api/classroom/deleteClassroom`

### Students (School Admin)
- `POST /api/student/createStudent`
- `POST /api/student/getStudents`
- `POST /api/student/getStudent`
- `POST /api/student/updateStudent`
- `POST /api/student/deleteStudent`
- `POST /api/student/transferStudent`

### Authorization Checks
- School admin cannot access `/api/school/*` endpoints
- School admin cannot access `/api/user/*` endpoints
- School admin can only see data from their assigned school
