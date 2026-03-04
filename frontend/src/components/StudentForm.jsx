import React, { useState, useEffect } from 'react';

const StudentForm = ({ student, classrooms, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    classroom: '',
  });
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        dateOfBirth: student.dateOfBirth 
          ? new Date(student.dateOfBirth).toISOString().split('T')[0]
          : '',
        classroom: student.classroom?._id || 
                   (typeof student.classroom === 'object' ? student.classroom._id : student.classroom) || 
                   '',
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'dateOfBirth') {
      // Frontend validation: not in future, at least 15 years ago
      if (!value) {
        setDateError('enter a valid date');
      } else {
        const dob = new Date(value);
        const today = new Date();
        const dobDate = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const fifteenYearsAgo = new Date(
          todayDate.getFullYear() - 15,
          todayDate.getMonth(),
          todayDate.getDate()
        );

        if (isNaN(dob.getTime()) || dobDate > todayDate || dobDate > fifteenYearsAgo) {
          setDateError('enter a valid date');
        } else {
          setDateError('');
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dateError) {
      return;
    }
    // Convert classroom to classroomId for API
    const submitData = {
      ...formData,
      classroomId: formData.classroom,
    };
    delete submitData.classroom;
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {student ? 'Edit Student' : 'Create Student'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
            Date of Birth *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            id="dateOfBirth"
            required
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={`mt-1 block w-full border ${
              dateError ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
          {dateError && (
            <p className="mt-1 text-sm text-red-600">
              {dateError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="classroom" className="block text-sm font-medium text-gray-700">
            Classroom *
          </label>
          <select
            name="classroom"
            id="classroom"
            required
            value={formData.classroom}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a classroom</option>
            {classrooms.map((classroom) => (
              <option key={classroom._id} value={classroom._id}>
                {classroom.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
        <button
          type="submit"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:col-start-2 sm:text-sm"
        >
          {student ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:col-start-1 sm:text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
