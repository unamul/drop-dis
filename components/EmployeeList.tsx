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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-amber-300">Employee List</h2>
      {employees.length === 0 ? (
        <p className="text-gray-500">No employees added yet</p>
      ) : (
        <>
          <div className="overflow-x-auto overflow-y-auto h-60">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary (ETH)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...employees]?.reverse()?.map((employee) => (
                  <Card key={employee.id} employee={employee} onRemoveEmployee={onRemoveEmployee} />
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="font-semibold text-blue-500 text-sm">
              Total Salary Amount: {totalSalary} ETH
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default EmployeeList;
