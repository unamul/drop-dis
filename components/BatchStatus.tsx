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
      <div className="glass-card p-8 rounded-2xl border border-white/20 shadow-2xl">
        <div className="text-center py-8">
          <svg
            className="w-16 h-16 text-gray-200 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-200 font-medium">No batch submitted yet</p>
          <p className="text-sm text-gray-200 mt-1">
            Submit a salary distribution batch to track status
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-white/20 shadow-2xl">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <span className="loading-spinner w-6 h-6"></span>
            <p className="text-gray-200 font-medium">Loading batch status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="glass-card p-8 rounded-2xl border border-white/20 shadow-2xl">
        <div className="text-center py-8">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-600 font-medium">Failed to load batch status</p>
          <p className="text-sm text-red-400 mt-1">Please check your connection and try again</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 rounded-2xl border border-white/20 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Batch Status
        </h2>
        <p className="text-sm text-gray-200">Track salary distribution batch processing</p>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-400">Batch ID</p>
            <p className="text-xs text-gray-200">#{batchId}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200/30">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${status.addressDecrypted ? 'bg-green-500' : 'bg-red-500'}`}
            ></div>
            <span className="text-sm font-medium text-gray-400">Addresses Decrypted</span>
          </div>
          <span
            className={`status-badge ${status.addressDecrypted ? 'status-success' : 'status-error'}`}
          >
            {status.addressDecrypted ? 'Complete' : 'Pending'}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200/30">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${status.amountDecrypted ? 'bg-green-500' : 'bg-red-500'}`}
            ></div>
            <span className="text-sm font-medium text-gray-400">Amounts Decrypted</span>
          </div>
          <span
            className={`status-badge ${status.amountDecrypted ? 'status-success' : 'status-error'}`}
          >
            {status.amountDecrypted ? 'Complete' : 'Pending'}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200/30">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${status.isProcessed ? 'bg-green-500' : 'bg-yellow-500'}`}
            ></div>
            <span className="text-sm font-medium text-gray-400">Batch Processed</span>
          </div>
          <span
            className={`status-badge ${status.isProcessed ? 'status-success' : 'status-warning'}`}
          >
            {status.isProcessed ? 'Complete' : 'Processing'}
          </span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-purple-600"
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
            <span className="text-sm font-medium text-gray-400">Total Amount</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-purple-600">{status.totalAmount} ETH</p>
            <p className="text-xs text-gray-200">${(status.totalAmount * 2000).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {status.addressDecrypted && status.amountDecrypted && employees.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Decrypted Employee Data
          </h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200/20">
            <table className="min-w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Employee Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Salary Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/20">
                {employees.map((employee, index) => (
                  <tr key={index} className="table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
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
                        </div>
                        <span className="address-display text-sm">{employee.employeeAddress}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-400">{employee.salaryAmount}</span>
                        <span className="text-sm text-gray-200">ETH</span>
                      </div>
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
