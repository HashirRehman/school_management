# Frontend Testing Guide - School Management System

## 🚀 Quick Start

### Step 1: Ensure Both Services Are Running

**Backend:**
```bash
# In root directory
node app.js
```
Should be running on: http://localhost:5111

**Frontend:**
```bash
# In frontend directory
cd frontend
npm run dev
```
Should be running on: http://localhost:3002 (or next available port)

---

## 📝 Step-by-Step Testing Guide

### Phase 1: Initial Setup & Superadmin Access

#### 1.1 Access the Frontend
- Open your browser and go to: **http://localhost:3002/**
- You should see the Login page

#### 1.2 Login as Superadmin
- **Email:** `admin@schoolmanagement.com`
- **Password:** `Admin123!`
- Click **Login**

**Expected Result:**
- ✅ You should be redirected to the Dashboard
- ✅ Navigation should show: Dashboard, Schools, Users, Classrooms, Students
- ✅ You should see your name and role (superadmin) in the top right

---

### Phase 2: Create a School

#### 2.1 Navigate to Schools
- Click on **"Schools"** in the navigation bar
- You should see an empty list or existing schools

#### 2.2 Create a New School
- Click the **"Create School"** button (top right)
- Fill in the form:
  - **Name:** "Greenwood High School"
  - **Address:** "123 Education Street, City, State 12345"
  - **Contact Email:** "info@greenwood.edu"
  - **Contact Phone:** "555-0123"
- Click **"Create"**

**Expected Result:**
- ✅ Success toast notification appears
- ✅ School appears in the list
- ✅ Modal closes automatically

#### 2.3 Verify School Creation
- The school should appear in the table
- You can click on a school to view details
- You can edit or delete schools

---

### Phase 3: Create a School Administrator

#### 3.1 Navigate to Users
- Click on **"Users"** in the navigation bar
- You should see the list of users (at least the superadmin)

#### 3.2 Create a School Administrator
- Click the **"Create User"** button
- Fill in the form:
  - **Name:** "Jane Smith"
  - **Email:** "jane.smith@greenwood.edu"
  - **Password:** "Admin123!"
  - **Role:** Select **"School Administrator"**
  - **School:** Select "Greenwood High School" (the school you just created)
- Click **"Create"**

**Expected Result:**
- ✅ Success toast notification
- ✅ User appears in the list with role "school_admin"
- ✅ User is assigned to the selected school

---

### Phase 4: Test School Administrator Features

#### 4.1 Logout and Login as School Admin
- Click **"Logout"** in the top right
- You should be redirected to the login page
- Login with:
  - **Email:** `jane.smith@greenwood.edu`
  - **Password:** `Admin123!`
- Click **Login**

**Expected Result:**
- ✅ Login successful
- ✅ Redirected to Dashboard
- ✅ Navigation should show: Dashboard, Classrooms, Students
- ✅ **"Schools" and "Users" should NOT be visible** (this is correct!)
- ✅ Your name and role (school_admin) shown in top right

---

### Phase 5: Manage Classrooms

#### 5.1 Navigate to Classrooms
- Click **"Classrooms"** in the navigation
- You should see an empty list (or existing classrooms for your school)

#### 5.2 Create a Classroom
- Click **"Create Classroom"** button
- Fill in the form:
  - **Name:** "Grade 10 - Section A"
  - **Capacity:** 30
  - **Resources:** 
    - Type "Projector" and press Enter
    - Type "Whiteboard" and press Enter
    - Type "Computer Lab" and press Enter
- Click **"Create"**

**Expected Result:**
- ✅ Success notification
- ✅ Classroom appears in the list
- ✅ Classroom shows capacity and resources

#### 5.3 Create Another Classroom
- Create a second classroom: "Grade 10 - Section B" with capacity 25
- This will be used for student transfer testing

#### 5.4 Test Classroom Operations
- **View:** Click on a classroom to see details
- **Edit:** Click "Edit" button, modify capacity or resources, click "Update"
- **Delete:** Click "Delete" (only works if classroom has no students)

---

### Phase 6: Manage Students

#### 6.1 Navigate to Students
- Click **"Students"** in the navigation
- You should see an empty list

#### 6.2 Create a Student
- Click **"Create Student"** button
- Fill in the form:
  - **First Name:** "John"
  - **Last Name:** "Doe"
  - **Email:** "john.doe@student.com"
  - **Date of Birth:** Select a date (e.g., 2010-05-15)
  - **Classroom:** Select "Grade 10 - Section A"
- Click **"Create"**

**Expected Result:**
- ✅ Success notification
- ✅ Student appears in the list
- ✅ Student shows name, email, classroom, and enrollment date

#### 6.3 Create More Students
- Create 2-3 more students in different classrooms
- This helps test filtering and transfer features

#### 6.4 Test Student Filtering
- Use the **"Filter by Classroom"** dropdown
- Select a classroom
- **Expected:** Only students from that classroom should be displayed
- Select "All Classrooms" to see all students

#### 6.5 Test Student Operations
- **View:** Click on a student to see details
- **Edit:** Click "Edit", modify information, click "Update"
- **Delete:** Click "Delete" to remove a student

---

### Phase 7: Test Student Transfer

#### 7.1 Transfer a Student
- Find a student in "Grade 10 - Section A"
- Click the **"Transfer"** button
- In the modal:
  - You should see the current classroom
  - Select "Grade 10 - Section B" from the dropdown
  - Click **"Transfer"**

**Expected Result:**
- ✅ Success notification
- ✅ Student is now in the new classroom
- ✅ Student list updates to show new classroom

#### 7.2 Verify Transfer
- Filter by "Grade 10 - Section B"
- The transferred student should appear in this list
- Filter by "Grade 10 - Section A"
- The student should no longer appear in this list

---

### Phase 8: Test Authorization & Security

#### 8.1 Verify School Admin Restrictions
As a school admin, you should NOT be able to:
- ❌ See "Schools" link in navigation
- ❌ See "Users" link in navigation
- ❌ Access `/schools` URL directly (should show error)
- ❌ Access `/users` URL directly (should show error)

#### 8.2 Test School Scoping (Optional - requires 2 schools)
If you want to test that school admins can only see their school's data:
1. Logout and login as superadmin
2. Create a second school
3. Create a second school admin for the new school
4. Create classrooms/students for the second school
5. Logout and login as the first school admin
6. Verify you can only see data from your assigned school

---

## ✅ Testing Checklist

### Superadmin Features
- [ ] Login as superadmin
- [ ] Create a school
- [ ] View schools list
- [ ] Edit a school
- [ ] Create a school administrator
- [ ] View users list
- [ ] Edit a user
- [ ] Delete a user (if needed)

### School Administrator Features
- [ ] Login as school admin
- [ ] Verify Schools/Users pages are hidden
- [ ] Create a classroom
- [ ] View classrooms list
- [ ] Edit a classroom
- [ ] Delete a classroom (empty)
- [ ] Create a student
- [ ] View students list
- [ ] Filter students by classroom
- [ ] Edit a student
- [ ] Transfer a student
- [ ] Delete a student

### Security & Authorization
- [ ] School admin cannot access Schools page
- [ ] School admin cannot access Users page
- [ ] School admin can only see their school's data
- [ ] Cannot create students without selecting a classroom
- [ ] Cannot transfer students to classrooms from other schools

---

## 🐛 Troubleshooting

### Issue: Cannot login
- **Check:** Backend is running on port 5111
- **Check:** Credentials are correct (admin@schoolmanagement.com / Admin123!)
- **Check:** Browser console for errors

### Issue: Cannot create student
- **Check:** At least one classroom exists
- **Check:** Classroom is selected in the form
- **Check:** All required fields are filled
- **Check:** Email is unique

### Issue: Cannot see classrooms/students
- **Check:** You're logged in as school admin (not superadmin)
- **Check:** Your user account has a school assigned
- **Check:** You've created classrooms/students for your school

### Issue: Transfer fails
- **Check:** Both classrooms belong to the same school
- **Check:** Student exists and belongs to your school
- **Check:** New classroom has available capacity

### Issue: API errors
- **Check:** Backend is running (`node app.js`)
- **Check:** MongoDB is running
- **Check:** Browser console for detailed error messages
- **Check:** Network tab in browser DevTools

---

## 📊 Expected Dashboard Stats

When logged in as school admin, the Dashboard should show:
- Total Classrooms (for your school)
- Total Students (for your school)
- Recent Activity (if implemented)

---

**Happy Testing! 🎉**

If you encounter any issues, check the browser console (F12) for error messages and share them for debugging.
