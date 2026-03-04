import React, { useState, useEffect } from 'react';

const ClassroomForm = ({ classroom, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    resources: '',
  });

  useEffect(() => {
    if (classroom) {
      setFormData({
        name: classroom.name || '',
        capacity: classroom.capacity || '',
        resources: classroom.resources ? classroom.resources.join(', ') : '',
      });
    }
  }, [classroom]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      capacity: parseInt(formData.capacity),
      resources: formData.resources
        ? formData.resources.split(',').map(r => r.trim()).filter(r => r)
        : [],
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {classroom ? 'Edit Classroom' : 'Create Classroom'}
      </h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
            Capacity *
          </label>
          <input
            type="number"
            name="capacity"
            id="capacity"
            required
            min="1"
            value={formData.capacity}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="resources" className="block text-sm font-medium text-gray-700">
            Resources (comma-separated)
          </label>
          <input
            type="text"
            name="resources"
            id="resources"
            value={formData.resources}
            onChange={handleChange}
            placeholder="Projector, Whiteboard, Computers"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
        <button
          type="submit"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:col-start-2 sm:text-sm"
        >
          {classroom ? 'Update' : 'Create'}
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

export default ClassroomForm;
