# School Management System - React Frontend

Modern React frontend for the School Management System API.

## Features

- 🔐 Authentication with JWT tokens
- 🏫 School management (Superadmin)
- 👥 User management (Superadmin)
- 📚 Classroom management (School Admin)
- 🎓 Student management with transfer functionality (School Admin)
- 📊 Dashboard with statistics
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design
- ✅ Form validation
- 🔔 Toast notifications

## Tech Stack

- **React 18** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Toastify** - Notifications

## Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   ```
   VITE_API_URL=http://localhost:5111
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## Usage

### Login

1. Open `http://localhost:3000`
2. Login with:
   - Email: `admin@schoolmanagement.com`
   - Password: `Admin123!`

### Features by Role

#### Superadmin
- View dashboard with all statistics
- Manage schools (Create, Read, Update, Delete)
- Manage users (Create, Read, Update, Delete)
- Assign school administrators to schools

#### School Administrator
- View dashboard with school-specific statistics
- Manage classrooms in their school
- Manage students in their school
- Transfer students between classrooms

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable components
│   │   ├── Layout.jsx
│   │   ├── Modal.jsx
│   │   ├── SchoolForm.jsx
│   │   ├── ClassroomForm.jsx
│   │   ├── StudentForm.jsx
│   │   ├── UserForm.jsx
│   │   └── TransferModal.jsx
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Schools.jsx
│   │   ├── Classrooms.jsx
│   │   ├── Students.jsx
│   │   └── Users.jsx
│   ├── services/        # API services
│   │   └── api.js
│   ├── context/         # React Context
│   │   └── AuthContext.jsx
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## API Integration

The frontend communicates with the backend API at `http://localhost:5111`. All API calls are handled through the `services/api.js` file.

### Authentication

Tokens are automatically included in request headers via Axios interceptors. Tokens are stored in localStorage.

### Error Handling

- 401 errors automatically redirect to login
- Validation errors are displayed via toast notifications
- Network errors are handled gracefully

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:5111)

## Production Build

```bash
npm run build
```

The `dist` folder will contain the production-ready files.

## Notes

- The frontend uses the API endpoint pattern: `/api/:moduleName/:fnName`
- All protected routes require authentication
- Role-based UI elements are conditionally rendered
- Pagination is implemented for list views
- Forms include client-side validation
