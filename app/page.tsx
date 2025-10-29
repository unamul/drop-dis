/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeList from '../components/EmployeeList';
import BatchStatus from '../components/BatchStatus';
import { EmployeeData, submitSalaryBatch } from '../utils/contract';

const SalaryDistribution: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [currentBatchId, setCurrentBatchId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<null | string>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleAddEmployee = (employee: EmployeeData) => {
    setEmployees([...employees, employee]);
  };

  const handleRemoveEmployee = (index: number) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  const handleSubmitBatch = async () => {
    if (employees.length === 0) {
      alert('Please add at least one employee');
      return;
    }

    try {
      console.log({ employees });
      const result = await submitSalaryBatch(employees, setSubmitting);
      setCurrentBatchId(result.batchId);
      setTxHash(result.transactionHash);

      // Clear the employee list after successful submission
      setEmployees([]);
    } catch (error: any) {
      setSubmitting(null);
      console.error('Error submitting salary batch:', error.message);
      alert('Failed to submit salary batch. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-amber-700">Drop Dis</span> (Encrypted Salary Distribution)
          </h1>
          <p className="mt-2 text-gray-600 text-bold text-sm">
            Distribute salaries to multiple employees with encrypted data.{' '}
            <span className="text-amber-400">Powered by zama FHEVM</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <EmployeeForm onAddEmployee={handleAddEmployee} />
          <EmployeeList employees={employees} onRemoveEmployee={handleRemoveEmployee} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <button
            onClick={handleSubmitBatch}
            disabled={submitting ? true : false || employees.length === 0}
            className={`w-full py-3 px-4 rounded-md text-white font-medium ${
              submitting || employees.length === 0
                ? 'bg-amber-200 cursor-not-allowed'
                : 'bg-amber-400 hover:bg-amber-500 hover:cursor-pointer'
            }`}
          >
            {submitting ? submitting : 'Distribute Now'}
          </button>
        </div>

        {txHash && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
            <p className="text-sm text-gray-600 mb-2">Transaction Hash: {txHash}</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              View on Etherscan
            </a>
          </div>
        )}

        <BatchStatus batchId={currentBatchId} />
      </div>
    </div>
  );
};

export default SalaryDistribution;
