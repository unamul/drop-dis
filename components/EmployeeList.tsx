// src/components/EmployeeList.tsx
import React from 'react';
import { EmployeeData } from '../utils/contract';
import Card from './Card';

interface EmployeeListProps {
  employees: EmployeeData[];
  onRemoveEmployee: (id: string) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, onRemoveEmployee }) => {
  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);

  return (
    <div className="glass-card p-8 rounded-2xl border border-white/20 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Employee Registry
        </h2>
        <p className="text-sm text-gray-200">Manage encrypted employee salary data</p>
      </div>

      {employees.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <svg
              className="w-16 h-16 text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <p className="text-gray-200 font-medium">No employees added yet</p>
          <p className="text-sm text-gray-200 mt-1">Add your first employee to get started</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto overflow-y-auto max-h-96 rounded-xl border border-gray-200/20">
            <table className="min-w-full">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
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
                      Wallet Address
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
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
                      Salary (ETH)
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Actions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/20">
                {[...employees]?.reverse()?.map((employee) => (
                  <Card key={employee.id} employee={employee} onRemoveEmployee={onRemoveEmployee} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
            <div className="flex items-center justify-between">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400">Total Salary Amount</p>
                  <p className="text-xs text-gray-200">
                    {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {totalSalary} ETH
                </p>
                <p className="text-xs text-gray-200">
                  ${(totalSalary * 2000).toLocaleString()} USD
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeList;
