/* eslint-disable @typescript-eslint/no-explicit-any */

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdding]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !salary) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsAdding(true);
    const tempId = `temp-${Date.now()}`;

    const newEmployee: any = {
      id: tempId,
      address,
      salary: parseFloat(salary),
      isEncrypting: true,
      isEncrypted: false,
    };
    onAddEmployee(newEmployee);

    try {
      // Start the encryption process
      const encryptedData = await encryptEmployeeData(address, parseFloat(salary));

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
    <div className="glass-card p-8 rounded-2xl border border-white/20 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Add Employee
        </h2>
        <p className="text-sm text-gray-200">
          Securely add employee salary data with FHE encryption
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="form-label flex items-center gap-2" htmlFor="address">
            <svg
              className="w-4 h-4 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Employee Wallet Address
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="glass-input w-full px-4 py-3 rounded-xl text-gray-400 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300"
            placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4Db45"
            style={{ fontFamily: 'Courier New, monospace' }}
          />
        </div>

        <div className="space-y-2">
          <label className="form-label flex items-center gap-2" htmlFor="salary">
            <svg
              className="w-4 h-4 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Salary Amount (ETH)
          </label>
          <input
            id="salary"
            type="number"
            step="0.01"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="glass-input w-full px-4 py-3 rounded-xl text-gray-400 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300"
            placeholder="0.00"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-gray-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Encrypted with FHE technology
          </div>

          <button
            type="submit"
            disabled={isAdding}
            className="btn-primary relative overflow-hidden group"
          >
            {isAdding ? (
              <span className="flex items-center gap-2">
                <span className="loading-spinner"></span>
                Encrypting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Employee
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
