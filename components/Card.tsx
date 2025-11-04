/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Card.tsx
import React from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface CardProps {
  employee: any;
  onRemoveEmployee: (id: string) => void;
}

const Card: React.FC<CardProps> = ({ employee, onRemoveEmployee }) => {
  const getStatusBadge = () => {
    if (employee.isEncrypting) {
      const progressPercentage = employee.encryptionStep ? (employee.encryptionStep / 5) * 100 : 0;
      const message = employee.encryptionMessage || 'Encrypting...';

      return (
        <div className="flex flex-col gap-1">
          <span className="status-badge status-warning flex items-center gap-1">
            <span className="loading-spinner w-3 h-3"></span>
            {message}
          </span>
          {employee.encryptionStep && (
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          )}
        </div>
      );
    }
    if (employee.encryptionError) {
      return (
        <span className="status-badge status-error flex items-center gap-1">
          <FaTimesCircle className="w-3 h-3" />
          Error
        </span>
      );
    }
    if (employee.isEncrypted) {
      return (
        <span className="status-badge status-success flex items-center gap-1">
          <FaCheckCircle className="w-3 h-3" />
          Encrypted
        </span>
      );
    }
    return null;
  };

  return (
    <tr className="table-row transition-colors duration-200">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
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
          <div>
            <p className="address-display font-medium text-gray-400">
              {employee.address.slice(0, 6)}****{employee.address.slice(-4)}
            </p>
            <p className="text-xs text-gray-200 mt-1">Click to copy</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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
            <span className="font-semibold text-gray-400">{employee.salary}</span>
            <span className="text-sm text-gray-200">ETH</span>
          </div>
          {getStatusBadge()}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onRemoveEmployee(employee.id)}
          className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 flex items-center gap-2 group"
        >
          <svg
            className="w-4 h-4 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span className="font-medium">Remove</span>
        </button>
      </td>
    </tr>
  );
};

export default Card;
