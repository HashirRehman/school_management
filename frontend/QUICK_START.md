# Quick Start - React Frontend

## Prerequisites

✅ Backend API must be running on `http://localhost:5111`

## Start the Frontend

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:3000
   ```

## Login

- **Email**: `admin@schoolmanagement.com`
- **Password**: `Admin123!`

## Features Available

### As Superadmin:
- ✅ View Dashboard
- ✅ Manage Schools (Create, Edit, Delete, List)
- ✅ Manage Users (Create, Edit, Delete, List)
- ✅ Assign school administrators

### As School Administrator:
- ✅ View Dashboard
- ✅ Manage Classrooms (Create, Edit, Delete, List)
- ✅ Manage Students (Create, Edit, Delete, List, Filter by Classroom)
- ✅ Transfer Students between Classrooms

## Troubleshooting

### "Network Error" or "Failed to fetch"
- Ensure backend is running: `node app.js` in the root directory
- Check backend is on port 5111

### "401 Unauthorized"
- Token expired - logout and login again
- Check if token is stored in localStorage

### "Module not found"
- Run `npm install` in the frontend directory

## Next Steps

1. Login as superadmin
2. Create a school
3. Create a school admin user and assign to the school
4. Logout and login as school admin
5. Create classrooms and students
6. Test student transfer functionality
