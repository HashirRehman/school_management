# Frontend Setup Guide

## Quick Start

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## Login Credentials

- **Email**: `admin@schoolmanagement.com`
- **Password**: `Admin123!`

## Features

### Superadmin Features
- ✅ Dashboard with statistics
- ✅ Manage Schools (CRUD)
- ✅ Manage Users (CRUD)
- ✅ Assign school administrators

### School Administrator Features
- ✅ Dashboard with school statistics
- ✅ Manage Classrooms (CRUD)
- ✅ Manage Students (CRUD)
- ✅ Transfer students between classrooms
- ✅ Filter students by classroom

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── services/        # API integration
│   ├── context/         # React Context (Auth)
│   └── App.jsx          # Main app
```

## API Integration

The frontend automatically:
- Includes JWT tokens in requests
- Handles 401 errors (redirects to login)
- Shows error messages via toast notifications
- Manages authentication state

## Development

- **Dev server**: `npm run dev` (runs on port 3000)
- **Build**: `npm run build`
- **Preview**: `npm run preview`

## Environment Variables

Create `.env` file:
```
VITE_API_URL=http://localhost:5111
```

The frontend is ready to use! Just install dependencies and start the dev server.
