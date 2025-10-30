'use client';
import React from 'react';
import { useWallet } from '@/hooks/useWallet';

export default function WalletButton() {
  const { address, connectWallet, disconnectWallet } = useWallet();

  return (
    <div className="flex flex-row items-center gap-4 p-4  ">
      {address ? (
        <>
          <p className="text-orange-600">
            Connected: {`${address?.slice(0, 5)}***${address?.slice(-4)}`}
          </p>
          <button
            onClick={disconnectWallet}
            className="hover:cursor-pointer bg-orange-600 text-white px-4 py-2 rounded-xl"
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={connectWallet}
          className="hover:cursor-pointer bg-orange-600 text-white px-4 py-2 rounded-xl"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
