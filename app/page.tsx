/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeList from '../components/EmployeeList';
import BatchStatus from '../components/BatchStatus';
import { EmployeeData, submitSalaryBatch } from '../utils/contract';
import { toast } from 'sonner';
import Link from 'next/link';
import { FaBookOpen } from 'react-icons/fa';

const SalaryDistribution: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [currentBatchId, setCurrentBatchId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isEncrypting, seIsEncrypting] = useState<boolean>(false);

  const [encryptedAddresses, setEncryptedAddresses] = useState<any>([]);
  const [encryptedAmounts, setEncryptedAmounts] = useState<any>([]);
  const [addressProofs, setAddressProofs] = useState<any>([]);
  const [amountProofs, setAmountProofs] = useState<any>([]);

  const handleAddEmployee = (newEmployee: EmployeeData) => {
    setEmployees((prev) => [...prev, newEmployee]);
  };

  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);

  const handleUpdateEmployee = (id: string, updates: any) => {
    if (!updates?.encryptionError) {
      console.log({ updates });
      setEncryptedAddresses([...encryptedAddresses, { id, data: updates?.encryptedAddress }]);
      setEncryptedAmounts([...encryptedAmounts, { id, data: updates.encryptedAmount }]);
      setAddressProofs([...addressProofs, { id, data: updates.addressProof }]);
      setAmountProofs([...amountProofs, { id, data: updates.amountProof }]);
    }

    setEmployees((prev) => prev.map((emp: any) => (emp.id === id ? { ...emp, ...updates } : emp)));
  };

  const handleRemoveEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((emp: any) => emp.id !== id));

    setEncryptedAddresses((prev: any) => prev.filter((pr: any) => pr.id !== id));
    setEncryptedAmounts((prev: any) => prev.filter((pr: any) => pr.id !== id));
    setAddressProofs((prev: any) => prev.filter((pr: any) => pr.id !== id));
    setAmountProofs((prev: any) => prev.filter((pr: any) => pr.id !== id));
  };

  const handleSubmitBatch = async () => {
    const readyEmployees = employees.filter((emp: any) => emp.isEncrypted);
    if (readyEmployees.length === 0) {
      toast.error('No fully encrypted employees to submit.');
      return;
    }

    const employeesData = {
      encryptedAddresses,
      encryptedAmounts,
      addressProofs,
      amountProofs,
    };

    try {
      const result: any = await submitSalaryBatch(employeesData, setSubmitting, totalSalary);
      setCurrentBatchId(result.batchId);
      setTxHash(result.transactionHash);
      toast.success('Salary batch submitted successfully!');
      setEmployees([]); // Clear the list after successful submission
    } catch (error: any) {
      console.error('Error submitting salary batch:', error.message);
      let readableError = 'Transaction failed';

      // ethers v6: error.info / error.shortMessage / error.reason
      if (error.reason) {
        readableError = error.reason;
      } else if (error.shortMessage) {
        readableError = error.shortMessage;
      } else if (error.info?.error?.message) {
        readableError = error.info.error.message;
      } else if (error.data?.message) {
        readableError = error.data.message;
      } else if (error.message?.includes('reverted')) {
        readableError = 'Transaction reverted — check contract logic or input data';
      }

      // optional: make it cleaner
      readableError = readableError
        .replace(/execution reverted(:)?/i, '')
        .replace(/\(error=.*\)/i, '')
        .trim();

      toast.error(readableError);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen bg-amber-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="text-amber-700">Drop Dis</span> (Encrypted Salary Distribution)
          </h1>
          <p className="mt-2 text-gray-600 text-bold text-sm">
            Distribute salaries to multiple employees with encrypted data.{' '}
            <span className="text-amber-800">Powered by zama FHEVM</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <EmployeeForm
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onRemoveEmployee={handleRemoveEmployee}
            seIsEncrypting={seIsEncrypting}
          />
          <EmployeeList employees={employees} onRemoveEmployee={handleRemoveEmployee} />
        </div>

        <span className="text-red-500 font-bold text-xs py-5 text-center">
          {submitting && submitting}
        </span>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <button
            onClick={handleSubmitBatch}
            disabled={
              submitting !== null ||
              employees.filter((emp: any) => emp.isEncrypted).length === 0 ||
              isEncrypting
            }
            className={`w-full py-3 px-4 rounded-md text-white font-medium ${
              submitting !== null || employees.filter((emp: any) => emp.isEncrypted).length === 0
                ? 'bg-amber-300 cursor-not-allowed'
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

      <Link
        href="https://github.com/unamul/drop-dis/blob/main/README.md"
        className="
        fixed right-6 top-6 z-50
        flex items-center gap-2
        bg-orange-500 text-white font-medium
        px-4 py-2 rounded-full shadow-lg
        hover:bg-orange-600 transition-all duration-300
        active:scale-95
      "
      >
        <FaBookOpen size={18} />
        <span>Read Docs</span>
      </Link>
    </div>
  );
};

export default SalaryDistribution;
