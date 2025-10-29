// src/components/BatchStatus.tsx
import React, { useState, useEffect } from 'react';
import { getBatchStatus, getDecryptedEmployee } from '../utils/contract';

interface BatchStatusProps {
  batchId: number | null;
}

interface BatchStatusData {
  isProcessed: boolean;
  addressDecrypted: boolean;
  amountDecrypted: boolean;
  totalAmount: number;
}

interface DecryptedEmployee {
  employeeAddress: string;
  salaryAmount: number;
}

const BatchStatus: React.FC<BatchStatusProps> = ({ batchId }) => {
  const [status, setStatus] = useState<BatchStatusData | null>(null);
  const [employees, setEmployees] = useState<DecryptedEmployee[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!batchId) return;

    const fetchStatus = async () => {
      setLoading(true);
      try {
        const statusData = await getBatchStatus(batchId);
        setStatus(statusData);

        // If both addresses and amounts are decrypted, fetch employee details
        if (statusData.addressDecrypted && statusData.amountDecrypted) {
          const employeeCount = 3; // This should be stored or fetched from the contract
          const employeePromises = [];

          for (let i = 0; i < employeeCount; i++) {
            employeePromises.push(getDecryptedEmployee(batchId, i));
          }

          const employeeData = await Promise.all(employeePromises);
          setEmployees(employeeData);
        }
      } catch (error) {
        console.error('Error fetching batch status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Set up polling to check status updates
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [batchId]);

  if (!batchId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500">No batch submitted yet</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500">Loading batch status...</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-red-500">Failed to load batch status</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Batch Status</h2>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Batch ID: {batchId}</p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center">
          <span className="mr-2">Addresses Decrypted:</span>
          <span
            className={`px-2 py-1 rounded text-xs ${
              status.addressDecrypted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {status.addressDecrypted ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex items-center">
          <span className="mr-2">Amounts Decrypted:</span>
          <span
            className={`px-2 py-1 rounded text-xs ${
              status.amountDecrypted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {status.amountDecrypted ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex items-center">
          <span className="mr-2">Batch Processed:</span>
          <span
            className={`px-2 py-1 rounded text-xs ${
              status.isProcessed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {status.isProcessed ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex items-center">
          <span className="mr-2">Total Amount:</span>
          <span>{status.totalAmount} ETH</span>
        </div>
      </div>

      {status.addressDecrypted && status.amountDecrypted && employees.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Decrypted Employees</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary (ETH)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.employeeAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.salaryAmount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchStatus;
