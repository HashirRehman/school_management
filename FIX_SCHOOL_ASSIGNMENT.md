# Fix: School Not Found Error

## Problem
You're getting a "School not found" error when trying to create a classroom. This happens when:
- Your user account is assigned to a school that was deleted
- Your user account was created with an invalid school ID

## Solution

### Option 1: Update User via Superadmin Portal (Recommended)

1. **Log out** from the school admin account
2. **Log in as superadmin**:
   - Email: `admin@schoolmanagement.com`
   - Password: `Admin123!`
3. Go to **Users** page
4. Find the school admin user (the one having the issue)
5. Click **Edit**
6. Select a **valid school** from the dropdown
7. Click **Save**
8. **Log out** and **log back in** as the school admin

### Option 2: Check Available Schools

To see which schools exist, log in as superadmin and check the **Schools** page. The available schools are:
- harvard (ID: `69a2029fe8ac7504d474a5ff`)
- OXFORD (ID: `69a1a0d962517814ee502ff8`)
- cambridge (ID: `69a0b8e6b9d5451763133f7c`)

### Option 3: Create a New School Admin User

If you can't find the user or prefer to create a new one:

1. Log in as superadmin
2. Go to **Users** page
3. Click **Create User**
4. Fill in the details:
   - Name
   - Email
   - Password
   - Role: `school_admin`
   - **School**: Select a valid school from the dropdown
5. Click **Save**
6. Log in with the new credentials

## Prevention

The system now includes validation to prevent this issue:
- ✅ School existence is verified when creating/updating users
- ✅ School existence is verified during login
- ✅ Better error messages when school is not found

## Technical Details

The error occurs because:
- Your token contains school ID: `69a0a87a7d387e75e9fd7d3d`
- This school doesn't exist in the database
- The system now validates school existence before allowing operations

After updating the user's school assignment, the token will be regenerated on next login with the correct school ID.
