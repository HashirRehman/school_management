import React, { useState } from 'react';

const TransferModal = ({ student, classrooms, currentClassroomId, onSubmit, onCancel }) => {
  const [newClassroomId, setNewClassroomId] = useState('');

  const availableClassrooms = classrooms.filter(
    c => c._id !== currentClassroomId
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newClassroomId) {
      onSubmit(newClassroomId);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Transfer Student
      </h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Transfer <strong>{student.firstName} {student.lastName}</strong> to a new classroom.
        </p>
        <p className="text-xs text-gray-500">
          Current classroom: {classrooms.find(c => c._id === currentClassroomId)?.name || 'Unknown'}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="newClassroom" className="block text-sm font-medium text-gray-700">
            New Classroom *
          </label>
          <select
            name="newClassroom"
            id="newClassroom"
            required
            value={newClassroomId}
            onChange={(e) => setNewClassroomId(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a classroom</option>
            {availableClassrooms.map((classroom) => (
              <option key={classroom._id} value={classroom._id}>
                {classroom.name} (Capacity: {classroom.capacity})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
        <button
          type="submit"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:col-start-2 sm:text-sm"
        >
          Transfer
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

export default TransferModal;
