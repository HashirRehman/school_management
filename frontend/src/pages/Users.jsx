import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usersAPI, schoolsAPI, authAPI } from '../services/api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import UserForm from '../components/UserForm';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { isSuperadmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [superadminVerified, setSuperadminVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [superadminEmail, setSuperadminEmail] = useState('');
  const [superadminPassword, setSuperadminPassword] = useState('');
  const originalTokenRef = useRef(null);
  
  // Use refs to prevent multiple simultaneous requests
  const fetchingUsersRef = useRef(false);
  const schoolsFetchedRef = useRef(false);

  // Fetch schools only once on mount
  useEffect(() => {
    if (!schoolsFetchedRef.current) {
      schoolsFetchedRef.current = true;
      fetchSchools();
    }
  }, []);

  // Memoize fetchSchools to prevent recreation
  const fetchSchools = useCallback(async () => {
    try {
      const response = await schoolsAPI.getAll(1, 100);
      setSchools(response.data.data.schools || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  }, []);

  // Memoize fetchUsers to prevent recreation
  const fetchUsers = useCallback(async (page) => {
    // Prevent multiple simultaneous requests
    if (fetchingUsersRef.current) {
      return;
    }
    
    try {
      fetchingUsersRef.current = true;
      setLoading(true);
      const response = await usersAPI.getAll(page, pagination.limit);
      setUsers(response.data.data.users || []);
      setPagination(prev => ({
        ...prev,
        page: page,
        ...response.data.data.pagination
      }));
    } catch (error) {
      if (error.response?.status !== 429) {
        toast.error(error.response?.data?.errors?.[0] || 'Failed to fetch users');
      }
    } finally {
      setLoading(false);
      fetchingUsersRef.current = false;
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchUsers(pagination.page);
  }, [pagination.page, fetchUsers]);

  const handleCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await usersAPI.delete(id);
      toast.success('User deleted successfully');
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to delete user');
    }
  };

  const handleSubmit = async (data) => {
    try {
      // Clean data - remove empty strings
      const cleanData = { ...data };
      
      // Remove empty strings for optional fields
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '' || cleanData[key] === null || cleanData[key] === undefined) {
          delete cleanData[key];
        }
      });
      
      // Ensure school is set for school_admin
      if (cleanData.role === 'school_admin' && !cleanData.school) {
        toast.error('Please select a school for school administrator');
        return;
      }
      
      if (editingUser) {
        await usersAPI.update(editingUser._id, cleanData);
        toast.success('User updated successfully');
      } else {
        await usersAPI.create(cleanData);
        toast.success('User created successfully');
      }
      setShowModal(false);
      fetchUsers(pagination.page);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0] || 
                          error.response?.data?.message || 
                          error.message || 
                          'Operation failed';
      console.error('User operation error:', error.response?.data || error);
      toast.error(errorMessage);
    }
  };

  const handleSuperadminVerification = async (e) => {
    e.preventDefault();
    setVerifying(true);

    try {
      const response = await authAPI.login(superadminEmail, superadminPassword);

      if (response.data.data.user.role === 'superadmin') {
        const superadminToken = response.data.data.shortToken;
        // Store original token and temporarily replace it
        originalTokenRef.current = localStorage.getItem('token');
        localStorage.setItem('token', superadminToken);

        setSuperadminVerified(true);
        toast.success('Superadmin credentials verified');
        fetchUsers(pagination.page);
      } else {
        toast.error('The provided credentials do not belong to a superadmin account');
      }
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Invalid superadmin credentials');
    } finally {
      setVerifying(false);
    }
  };

  // Restore original token when leaving the page
  useEffect(() => {
    return () => {
      if (originalTokenRef.current && superadminVerified) {
        localStorage.setItem('token', originalTokenRef.current);
      }
    };
  }, [superadminVerified]);

  const getSchoolName = (schoolId) => {
    if (!schoolId) return 'N/A';
    const school = schools.find(s => s._id === schoolId);
    return school ? school.name : 'Unknown';
  };

  // If user is not superadmin and not verified, show authorization form
  if (!isSuperadmin() && !superadminVerified) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authorization Required
            </h2>
            <p className="text-gray-600">
              Only superadmin is authorized to access this page.
            </p>
          </div>

          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              If you have superadmin credentials, please enter them below to access the Users page.
            </p>
          </div>

          <form onSubmit={handleSuperadminVerification} className="space-y-4">
            <div>
              <label
                htmlFor="superadminEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Superadmin Email
              </label>
              <input
                type="email"
                id="superadminEmail"
                value={superadminEmail}
                onChange={(e) => setSuperadminEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@schoolmanagement.com"
              />
            </div>

            <div>
              <label
                htmlFor="superadminPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Superadmin Password
              </label>
              <input
                type="password"
                id="superadminPassword"
                value={superadminPassword}
                onChange={(e) => setSuperadminPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? 'Verifying...' : 'Verify & Access'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="mt-1 text-sm text-gray-500">Manage users</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Create User
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user._id}>
                  <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'superadmin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            ✉️ {user.email}
                          </p>
                          {user.school && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              🏫 {getSchoolName(user.school?._id || user.school)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {pagination.pages > 1 && (
            <div className="mt-4 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <UserForm
            user={editingUser}
            schools={schools}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default Users;
