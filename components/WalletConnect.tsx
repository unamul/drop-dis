'use client';
import React from 'react';
import { useWallet } from '@/hooks/useWallet';

export default function WalletButton() {
  const { address, connectWallet, disconnectWallet } = useWallet();

  return (
    <div className="flex items-center gap-3">
      {address ? (
        <>
          <div className="glass-card px-4 py-2 rounded-xl border border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-200 font-medium">
                {`${address.slice(0, 6)}***${address.slice(-4)}`}
              </span>
            </div>
          </div>
          <button
            onClick={disconnectWallet}
            className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={connectWallet}
          className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
        >
          <svg
            className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          <span className="font-medium">Connect Wallet</span>
        </button>
      )}
    </div>
  );
}
