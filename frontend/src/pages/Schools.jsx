import React, { useState, useEffect, useCallback, useRef } from 'react';
import { schoolsAPI, authAPI } from '../services/api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import SchoolForm from '../components/SchoolForm';
import { useAuth } from '../context/AuthContext';

const Schools = () => {
  const { isSuperadmin } = useAuth();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [superadminVerified, setSuperadminVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [superadminEmail, setSuperadminEmail] = useState('');
  const [superadminPassword, setSuperadminPassword] = useState('');
  const [superadminToken, setSuperadminToken] = useState(null);
  const originalTokenRef = useRef(null);
  
  // Use ref to prevent multiple simultaneous requests
  const fetchingRef = useRef(false);

  // Memoize fetchSchools to prevent recreation
  const fetchSchools = useCallback(async (page) => {
    // Prevent multiple simultaneous requests
    if (fetchingRef.current) {
      return;
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      const response = await schoolsAPI.getAll(page, pagination.limit);
      setSchools(response.data.data.schools || []);
      setPagination(prev => ({
        ...prev,
        page: page,
        ...response.data.data.pagination
      }));
    } catch (error) {
      if (error.response?.status !== 429) {
        toast.error(error.response?.data?.errors?.[0] || 'Failed to fetch schools');
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchSchools(pagination.page);
  }, [pagination.page, fetchSchools]);

  const handleCreate = () => {
    setEditingSchool(null);
    setShowModal(true);
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this school?')) return;
    
    try {
      await schoolsAPI.delete(id);
      toast.success('School deleted successfully');
      fetchSchools(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to delete school');
    }
  };

  const handleSubmit = async (data) => {
    try {
      // Remove empty strings for optional fields
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      );
      
      if (editingSchool) {
        await schoolsAPI.update(editingSchool._id, cleanData);
        toast.success('School updated successfully');
      } else {
        await schoolsAPI.create(cleanData);
        toast.success('School created successfully');
      }
      setShowModal(false);
      fetchSchools(pagination.page);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0] || 
                          error.response?.data?.message || 
                          error.message || 
                          'Operation failed';
      console.error('School operation error:', error.response?.data || error);
      toast.error(errorMessage);
    }
  };

  const handleSuperadminVerification = async (e) => {
    e.preventDefault();
    setVerifying(true);
    
    try {
      const response = await authAPI.login(superadminEmail, superadminPassword);
      
      // Check if the logged-in user is a superadmin
      if (response.data.data.user.role === 'superadmin') {
        // Store the superadmin token temporarily
        const superadminTokenValue = response.data.data.shortToken;
        setSuperadminToken(superadminTokenValue);
        
        // Store original token to restore later
        originalTokenRef.current = localStorage.getItem('token');
        
        // Temporarily replace token in localStorage for API calls
        localStorage.setItem('token', superadminTokenValue);
        
        setSuperadminVerified(true);
        toast.success('Superadmin credentials verified');
        // Fetch schools after verification
        fetchSchools(pagination.page);
      } else {
        toast.error('The provided credentials do not belong to a superadmin account');
      }
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Invalid superadmin credentials');
    } finally {
      setVerifying(false);
    }
  };

  // Restore original token when component unmounts or user navigates away
  useEffect(() => {
    return () => {
      if (originalTokenRef.current && superadminVerified) {
        localStorage.setItem('token', originalTokenRef.current);
      }
    };
  }, [superadminVerified]);

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
              If you have superadmin credentials, please enter them below to access the Schools page.
            </p>
          </div>

          <form onSubmit={handleSuperadminVerification} className="space-y-4">
            <div>
              <label htmlFor="superadminEmail" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="superadminPassword" className="block text-sm font-medium text-gray-700 mb-1">
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
          <h1 className="text-2xl font-bold text-gray-900">Schools</h1>
          <p className="mt-1 text-sm text-gray-500">Manage schools</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Create School
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {schools.map((school) => (
                <li key={school._id}>
                  <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {school.name}
                        </p>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            📍 {school.address || 'No address'}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            ✉️ {school.contactEmail || 'No email'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(school)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(school._id)}
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
          <SchoolForm
            school={editingSchool}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default Schools;
