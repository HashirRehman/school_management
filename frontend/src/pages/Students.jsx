import React, { useState, useEffect, useCallback, useRef } from 'react';
import { studentsAPI, classroomsAPI } from '../services/api';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import StudentForm from '../components/StudentForm';
import TransferModal from '../components/TransferModal';
import { useAuth } from '../context/AuthContext';

const Students = () => {
  const { isSuperadmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [transferringStudent, setTransferringStudent] = useState(null);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  
  // Use ref to prevent multiple simultaneous requests
  const fetchingRef = useRef(false);
  const classroomsFetchedRef = useRef(false);

  // Fetch classrooms only once on mount
  useEffect(() => {
    if (!classroomsFetchedRef.current) {
      classroomsFetchedRef.current = true;
      fetchClassrooms();
    }
  }, []);

  // Memoize fetchClassrooms to prevent recreation
  const fetchClassrooms = useCallback(async () => {
    try {
      const response = await classroomsAPI.getAll(1, 100);
      setClassrooms(response.data.data.classrooms || []);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    }
  }, []);

  // Memoize fetchStudents to prevent recreation
  const fetchStudents = useCallback(async (page, classroom) => {
    // Prevent multiple simultaneous requests
    if (fetchingRef.current) {
      return;
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      const response = await studentsAPI.getAll(
        page,
        pagination.limit,
        classroom || null
      );
      setStudents(response.data.data.students || []);
      setPagination(prev => ({
        ...prev,
        page: page,
        ...response.data.data.pagination
      }));
    } catch (error) {
      if (error.response?.status !== 429) {
        toast.error(error.response?.data?.errors?.[0] || 'Failed to fetch students');
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [pagination.limit]);

  // Fetch students when page or classroom filter changes
  useEffect(() => {
    fetchStudents(pagination.page, selectedClassroom);
  }, [pagination.page, selectedClassroom, fetchStudents]);

  const handleCreate = () => {
    setEditingStudent(null);
    setShowModal(true);
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleTransfer = (student) => {
    setTransferringStudent(student);
    setShowTransferModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await studentsAPI.delete(id);
      toast.success('Student deleted successfully');
      fetchStudents(pagination.page, selectedClassroom);
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Failed to delete student');
    }
  };

  const handleSubmit = async (data) => {
    try {
      // Clean data - remove empty strings and ensure proper types
      const cleanData = { ...data };
      
      // Remove empty strings for optional fields
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '' || cleanData[key] === null || cleanData[key] === undefined) {
          delete cleanData[key];
        }
      });
      
      // Ensure classroomId is set (required for creation)
      if (!editingStudent && !cleanData.classroomId) {
        toast.error('Please select a classroom');
        return;
      }
      
      let response;
      if (editingStudent) {
        response = await studentsAPI.update(editingStudent._id, cleanData);
        toast.success('Student updated successfully');
        // Update the student in the list with populated classroom
        if (response.data?.data?.student) {
          setStudents(prev => prev.map(s => 
            s._id === response.data.data.student._id 
              ? response.data.data.student 
              : s
          ));
        }
      } else {
        response = await studentsAPI.create(cleanData);
        toast.success('Student created successfully');
        // Add the new student to the list with populated classroom
        if (response.data?.data?.student) {
          setStudents(prev => [response.data.data.student, ...prev]);
        }
      }
      setShowModal(false);
      // Only refetch if we didn't update the list manually
      if (!response?.data?.data?.student) {
        fetchStudents(pagination.page, selectedClassroom);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.[0] || 
                          error.response?.data?.message || 
                          error.message || 
                          'Operation failed';
      console.error('Student operation error:', error.response?.data || error);
      toast.error(errorMessage);
    }
  };

  const handleTransferSubmit = async (newClassroomId) => {
    try {
      await studentsAPI.transfer(transferringStudent._id, newClassroomId);
      toast.success('Student transferred successfully');
      setShowTransferModal(false);
      fetchStudents(pagination.page, selectedClassroom);
    } catch (error) {
      toast.error(error.response?.data?.errors?.[0] || 'Transfer failed');
    }
  };

  const getClassroomName = (classroom) => {
    // If classroom is already populated (object with name), use it directly
    if (classroom && typeof classroom === 'object' && classroom.name) {
      return classroom.name;
    }
    // Otherwise, it's just an ID, look it up in the classrooms array
    if (classroom) {
      const classroomObj = classrooms.find(c => c._id === classroom || c._id === classroom._id);
      return classroomObj ? classroomObj.name : 'Unknown';
    }
    return 'Unknown';
  };

  return (
    <div>
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isSuperadmin()
              ? 'View students across all schools'
              : 'Manage students in your school'}
          </p>
        </div>
        {!isSuperadmin() && (
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create Student
          </button>
        )}
      </div>

      <div className="mb-4 px-4">
        <label htmlFor="classroomFilter" className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Classroom
        </label>
        <select
          id="classroomFilter"
          value={selectedClassroom}
          onChange={(e) => {
            setSelectedClassroom(e.target.value);
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
          className="block w-full max-w-xs border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Classrooms</option>
          {classrooms.map((classroom) => (
            <option key={classroom._id} value={classroom._id}>
              {classroom.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          {/* Group students by school for superadmin */}
          {isSuperadmin() ? (
            (() => {
              const grouped = students.reduce((acc, student) => {
                const schoolId = student.school?._id || student.school || 'unknown';
                const schoolName = student.school?.name || 'Unknown School';
                if (!acc[schoolId]) {
                  acc[schoolId] = { name: schoolName, items: [] };
                }
                acc[schoolId].items.push(student);
                return acc;
              }, {});

              const schoolIds = Object.keys(grouped);

              return schoolIds.length === 0 ? (
                <div className="bg-white shadow sm:rounded-md p-6 text-center text-gray-500">
                  No students found.
                </div>
              ) : (
                schoolIds.map((schoolId) => (
                  <div key={schoolId} className="mb-8">
                    <h2 className="px-4 text-lg font-semibold text-gray-800 mb-2">
                      🏫 {grouped[schoolId].name}
                    </h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {grouped[schoolId].items.map((student) => (
                          <li key={student._id}>
                            <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                              <div>
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {student.firstName} {student.lastName}
                                  </p>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                      ✉️ {student.email}
                                    </p>
                                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                      📚 {getClassroomName(student.classroom)}
                                    </p>
                                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                      🎂 {new Date(student.dateOfBirth).toLocaleDateString()}
                                    </p>
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
                {students.map((student) => (
                  <li key={student._id}>
                    <div className="px-4 py-4 sm:px-6 flex justify-between items-center">
                      <div>
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {student.firstName} {student.lastName}
                          </p>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              ✉️ {student.email}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              📚 {getClassroomName(student.classroom)}
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              🎂 {new Date(student.dateOfBirth).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      {!isSuperadmin() && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleTransfer(student)}
                            className="text-green-600 hover:text-green-900 text-sm font-medium"
                          >
                            Transfer
                          </button>
                          <button
                            onClick={() => handleDelete(student._id)}
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
          <StudentForm
            student={editingStudent}
            classrooms={classrooms}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      )}

      {!isSuperadmin() && showTransferModal && transferringStudent && (
        <Modal onClose={() => setShowTransferModal(false)}>
          <TransferModal
            student={transferringStudent}
            classrooms={classrooms}
            currentClassroomId={
              transferringStudent.classroom?._id || 
              (typeof transferringStudent.classroom === 'object' ? transferringStudent.classroom._id : transferringStudent.classroom)
            }
            onSubmit={handleTransferSubmit}
            onCancel={() => setShowTransferModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default Students;
