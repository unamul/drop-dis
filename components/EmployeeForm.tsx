/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/EmployeeForm.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { EmployeeData, encryptEmployeeData } from '../utils/contract';
import { toast } from 'sonner';

interface EmployeeFormProps {
  onAddEmployee: (employee: EmployeeData) => void;
  onUpdateEmployee: (id: string, updates: any) => void;
  onRemoveEmployee: (id: string, updates: any) => void;
  seIsEncrypting: (id: boolean) => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  onAddEmployee,
  onUpdateEmployee,
  onRemoveEmployee,
  seIsEncrypting,
}) => {
  const [address, setAddress] = useState('');
  const [salary, setSalary] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isAdding) {
      seIsEncrypting(true);
    } else {
      seIsEncrypting(false);
    }
  }, [isAdding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !salary) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsAdding(true);
    const tempId = `temp-${Date.now()}`; // Unique ID for the new employee

    // 1. Immediately add the employee to the list in an 'encrypting' state
    const newEmployee: any = {
      id: tempId,
      address,
      salary: parseFloat(salary),
      isEncrypting: true,
      isEncrypted: false,
    };
    onAddEmployee(newEmployee);

    try {
      // 2. Start the encryption process
      const encryptedData = await encryptEmployeeData(address, parseFloat(salary));

      // 3. On success, update the employee with the encrypted data
      onUpdateEmployee(tempId, {
        ...encryptedData,
        isEncrypting: false,
        isEncrypted: true,
      });
      toast.success('Employee added and encrypted successfully!', {
        style: {
          backgroundColor: 'green',
        },
      });
    } catch (error: any) {
      onRemoveEmployee(tempId, 'new');
      // 4. On failure, update the employee with an error
      onUpdateEmployee(tempId, {
        isEncrypting: false,
        encryptionError: error.message,
      });
      toast.error(error.message);
    } finally {
      setIsAdding(false);
      // Reset form
      setAddress('');
      setSalary('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-orange-300">Add Employee</h2>
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
          disabled={isAdding}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:cursor-pointer"
        >
          {isAdding ? 'Encrypting... please wait' : 'Add'}
        </button>
      </form>
    </div>
  );
};

export default EmployeeForm;
