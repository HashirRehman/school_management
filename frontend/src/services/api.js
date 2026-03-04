import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5111';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors with retry logic for 429
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 429 (Too Many Requests) with exponential backoff retry
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Wait before retrying (exponential backoff)
      const retryDelay = Math.min(1000 * Math.pow(2, originalRequest._retryCount || 0), 5000);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Retry the request
      return api(originalRequest);
    }

    // Handle 401 (Unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/api/auth/login', { email, password }),
  
  register: (data) => 
    api.post('/api/auth/register', data),
  
  refresh: () => 
    api.post('/api/auth/refresh'),
};

// Schools API
export const schoolsAPI = {
  create: (data) => 
    api.post('/api/school/createSchool', data),
  
  getAll: (page = 1, limit = 10) => 
    api.post('/api/school/getSchools', { page, limit }),
  
  getById: (id) => 
    api.post('/api/school/getSchool', { schoolId: id }),
  
  update: (id, data) => 
    api.post('/api/school/updateSchool', { schoolId: id, ...data }),
  
  delete: (id) => 
    api.post('/api/school/deleteSchool', { schoolId: id }),
};

// Classrooms API
export const classroomsAPI = {
  create: (data) => 
    api.post('/api/classroom/createClassroom', data),
  
  getAll: (page = 1, limit = 10) => 
    api.post('/api/classroom/getClassrooms', { page, limit }),
  
  getById: (id) => 
    api.post('/api/classroom/getClassroom', { classroomId: id }),
  
  update: (id, data) => 
    api.post('/api/classroom/updateClassroom', { classroomId: id, ...data }),
  
  delete: (id) => 
    api.post('/api/classroom/deleteClassroom', { classroomId: id }),
};

// Students API
export const studentsAPI = {
  create: (data) => 
    api.post('/api/student/createStudent', data),
  
  getAll: (page = 1, limit = 10, classroom = null) => {
    const data = { page, limit };
    if (classroom) data.classroom = classroom;
    return api.post('/api/student/getStudents', data);
  },
  
  getById: (id) => 
    api.post('/api/student/getStudent', { studentId: id }),
  
  update: (id, data) => 
    api.post('/api/student/updateStudent', { studentId: id, ...data }),
  
  delete: (id) => 
    api.post('/api/student/deleteStudent', { studentId: id }),
  
  transfer: (studentId, newClassroomId) => 
    api.post('/api/student/transferStudent', { studentId, newClassroomId: newClassroomId }),
};

// Users API
export const usersAPI = {
  create: (data) => 
    api.post('/api/user/createUser', data),
  
  getAll: (page = 1, limit = 10) => 
    api.post('/api/user/getUsers', { page, limit }),
  
  getById: (id) => 
    api.post('/api/user/getUser', { userId: id }),
  
  update: (id, data) => 
    api.post('/api/user/updateUser', { userId: id, ...data }),
  
  delete: (id) => 
    api.post('/api/user/deleteUser', { userId: id }),
};

export default api;
