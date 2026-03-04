import React, { useState, useEffect, useCallback, useRef } from 'react';
import { classroomsAPI } from '../services/api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import ClassroomForm from '../components/ClassroomForm';
import { useAuth } from '../context/AuthContext';

const Classrooms = () => {
  const { isSuperadmin } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  
  // Use ref to prevent multiple simultaneous requests
  const fetchingRef = useRef(false);

  // Memoize fetchClassrooms to prevent recreation
  const fetchClassrooms = useCallback(async (page) => {
    // Prevent multiple simultaneous requests
    if (fetchingRef.current) {
      return;
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      const response = await classroomsAPI.getAll(page, pagination.limit);
      setClassrooms(response.data.data.classrooms || []);
      setPagination(prev => ({
        ...prev,
        page: page,
        ...response.data.data.pagination
      }));
    } catch (error) {
      if (error.response?.status !== 429) {
        toast.error(error.response?.data?.errors?.[0] || 'Failed to fetch classrooms');
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchClassrooms(pagination.page);
  }, [pagination.page, fetchClassrooms]);

  const handleCreate = () => {
    setEditingClassroom(null);
    setShowModal(true);
  };

  const handleEdit = (classroom) => {
    setEditingClassroom(classroom);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this classroom?')) return;
    
    try {
      await classroomsAPI.delete(id);
      toast.success('Classroom deleted successfully');
      fetchClassrooms(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to delete classroom');
    }
  };

  const handleSubmit = async (data) => {
    try {
      // Ensure capacity is a number
      const cleanData = {
        ...data,
        capacity: typeof data.capacity === 'string' ? parseInt(data.capacity) : data.capacity,
      };
      
      // Remove empty strings for optional fields
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '' || cleanData[key] === null || cleanData[key] === undefined) {
          if (key !== 'resources') { // Keep resources as empty array if needed
            delete cleanData[key];
          }
        }
      });
      
      if (editingClassroom) {
        await classroomsAPI.update(editingClassroom._id, cleanData);
        toast.success('Classroom updated successfully');
      } else {
        await classroomsAPI.create(cleanData);
        toast.success('Classroom created successfully');
      }
      setShowModal(false);
      fetchClassrooms(pagination.page);
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0] || 
                          error.response?.data?.message || 
                          error.message || 
                          'Operation failed';
      console.error('Classroom operation error:', error.response?.data || error);
      toast.error(errorMessage);
    }
  };

  return (
    <div>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classrooms</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isSuperadmin()
              ? 'View classrooms across all schools'
              : 'Manage classrooms in your school'}
          </p>
        </div>
        {!isSuperadmin() && (
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create Classroom
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          {/* Group classrooms by school for superadmin */}
          {isSuperadmin() ? (
            (() => {
              const grouped = classrooms.reduce((acc, classroom) => {
                const schoolId = classroom.school?._id || classroom.school || 'unknown';
                const schoolName = classroom.school?.name || 'Unknown School';
                if (!acc[schoolId]) {
                  acc[schoolId] = { name: schoolName, items: [] };
                }
                acc[schoolId].items.push(classroom);
                return acc;
              }, {});

              const schoolIds = Object.keys(grouped);

              return schoolIds.length === 0 ? (
                <div className="bg-white shadow sm:rounded-md p-6 text-center text-gray-500">
                  No classrooms found.
                </div>
              ) : (
                schoolIds.map((schoolId) => (
                  <div key={schoolId} className="mb-8">
                    <h2 className="px-4 text-lg font-semibold text-gray-800 mb-2">
                      🏫 {grouped[schoolId].name}
                    </h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {grouped[schoolId].items.map((classroom) => (
                          <li key={classroom._id}>
                            <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                              <div>
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {classroom.name}
                                  </p>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                      👥 Capacity: {classroom.capacity}
                                    </p>
                                    {classroom.resources && classroom.resources.length > 0 && (
                                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                        📦 Resources: {classroom.resources.join(', ')}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              );
            })()
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {classrooms.map((classroom) => (
                  <li key={classroom._id}>
                    <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {classroom.name}
                          </p>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              👥 Capacity: {classroom.capacity}
                            </p>
                            {classroom.resources && classroom.resources.length > 0 && (
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                📦 Resources: {classroom.resources.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      {!isSuperadmin() && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(classroom)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(classroom._id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

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

      {!isSuperadmin() && showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <ClassroomForm
            classroom={editingClassroom}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default Classrooms;
