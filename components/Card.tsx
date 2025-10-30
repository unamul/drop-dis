/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Card.tsx
import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Using react-icons for status icons

interface CardProps {
  employee: any;
  onRemoveEmployee: (id: string) => void;
}

const Card: React.FC<CardProps> = ({ employee, onRemoveEmployee }) => {
  const getStatusIcon = () => {
    if (employee.isEncrypting) {
      return <span className="text-red-500 text-sm pl-2">Encryping...</span>;
    }
    if (employee.encryptionError) {
      return <FaTimesCircle className="text-red-500" title={employee.encryptionError} />;
    }
    if (employee.isEncrypted) {
      return <FaCheckCircle className="text-green-500" title="Encrypted" />;
    }
    return null;
  };

  return (
    <tr className="">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <span className="flex gap-2 items-center">
          {employee.address.slice(0, 6)}****{employee.address.slice(-4)}
          {getStatusIcon()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
        {employee.salary}
        {getStatusIcon()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <button
          onClick={() => onRemoveEmployee(employee.id)}
          className="text-red-600 hover:text-red-900 hover:cursor-pointer"
        >
          Remove
        </button>
      </td>
    </tr>
  );
};

export default Card;
