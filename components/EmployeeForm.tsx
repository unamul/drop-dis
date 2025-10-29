'use client';

import React, { useState } from 'react';
import { EmployeeData } from '../utils/contract';

interface EmployeeFormProps {
  onAddEmployee: (employee: EmployeeData) => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onAddEmployee }) => {
  const [address, setAddress] = useState('');
  const [salary, setSalary] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !salary) {
      alert('Please fill in all fields');
      return;
    }

    onAddEmployee({
      address,
      salary: parseFloat(salary),
    });

    // Reset form
    setAddress('');
    setSalary('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-amber-300">Add Employee</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
            Employee Address
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="0x..."
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="salary">
            Salary Amount (ETH)
          </label>
          <input
            id="salary"
            type="number"
            step="0.01"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="0.00"
          />
        </div>
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-600 hover:cursor-pointer text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default EmployeeForm;
