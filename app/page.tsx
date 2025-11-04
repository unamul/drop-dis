/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import EmployeeForm from '../components/EmployeeForm';
import EmployeeList from '../components/EmployeeList';
import BatchStatus from '../components/BatchStatus';
import { EmployeeData, submitSalaryBatch } from '../utils/contract';
import { toast } from 'sonner';
import Link from 'next/link';
import { FaBookOpen, FaVideo } from 'react-icons/fa';
import VideoModal from '@/components/VideoModal';
import AnimatedIllustration from '@/components/AnimatedIllustration';
import WalletButton from '@/components/WalletConnect';
import LoadingMain from '@/components/LoadingMain';
import { InlineMatrixText } from '@/components/ui/InlineMatrixText';

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

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isSubmitAnimating, setIsSubmitAnimating] = useState(false);

  const videoId: any = process.env.NEXT_PUBLIC_VIDEOID;

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

    // Trigger submit animation
    setIsSubmitAnimating(true);
    setTimeout(() => setIsSubmitAnimating(false), 800);

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
      toast.success('✅ Salary batch submitted successfully!');
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
       else if (error.message?.includes(`Relayer didn't response correctly`)) {
        readableError = `Relayer didn't response correctly`;
      }

      // optional: make it cleaner
      readableError = readableError
        .replace(/execution reverted(:)?/i, '')
        .replace(/\(error=.*\)/i, '')
        .trim();

      toast.error(`❌ ${readableError}`);
    } finally {
      setSubmitting(null);
    }
  };

  // Handle cursor click animation
  const handleBodyClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
      return;
    }

    const ripple = document.createElement('div');
    ripple.style.position = 'fixed';
    ripple.style.left = `${e.clientX}px`;
    ripple.style.top = `${e.clientY}px`;
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.background = 'radial-gradient(circle, rgba(102, 126, 234, 0.8), transparent)';
    ripple.style.borderRadius = '50%';
    ripple.style.pointerEvents = 'none';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.opacity = '1';
    ripple.style.zIndex = '9999';
    ripple.style.animation = 'cursorRipple 0.6s ease-out forwards';

    document.body.appendChild(ripple);
    setTimeout(() => {
      document.body.removeChild(ripple);
    }, 600);
  };

  return (
    <div className="min-h-screen py-8 relative overflow-hidden cursor-click" onClick={handleBodyClick}>
      <div className="absolute inset-0 animate-gradient"></div>
      <div className="relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

          {/* text--- */}
          <div className="text-center mb-12 mt-16 md:mt-0">
            <div className="mb-6 ">
              <h1 className="text-5xl font-bold mb-4 logo-glow">
        
                <span className="bg-gradient-to-r from-orange-300 to-orange-600 bg-clip-text text-transparent">
                  Drop Dis
                </span>
              </h1>

               {/* <InlineMatrixText
                  text="Encrypted Salary Distribution"
                  className="text-2xl font-light text-white/90"
                /> */}
              <h2 className="text-2xl font-light text-white/90">Encrypted Salary Distribution</h2>
            </div>
            
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              Securely distribute salaries to multiple employees with advanced FHE encryption
              technology.
                    <InlineMatrixText
                  text="Powered by Zama FHEVM"
                  className="block mt-2 text-orange-300 font-medium"
                />
              
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-x-4 items-start">
            <div className="lg:col-span-5 lg:pt-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <EmployeeForm
                  onAddEmployee={handleAddEmployee}
                  onUpdateEmployee={handleUpdateEmployee}
                  onRemoveEmployee={handleRemoveEmployee}
                  seIsEncrypting={seIsEncrypting}
                />
                <EmployeeList employees={employees} onRemoveEmployee={handleRemoveEmployee} />
              </div>

              {submitting && (
                <div className="mb-6 p-4 glass-card rounded-xl">
                  <div className="flex items-center justify-center gap-3">
                    <span className="loading-spinner-enhanced w-5 h-5"></span>
                    <span className="text-purple-600 font-medium">{submitting}</span>
                  </div>
                </div>
              )}

              <div className="glass-card p-8 rounded-2xl border border-white/20 shadow-2xl mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Batch Distribution
                    </h3>
                    <p className="text-sm text-gray-200 mt-1">
                      Submit encrypted salary data for distribution
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-200">Total Amount</p>
                    <p className="text-2xl font-bold text-purple-600">{totalSalary} ETH</p>
                  </div>
                </div>

                <button
                  onClick={handleSubmitBatch}
                  disabled={
                    submitting !== null ||
                    employees.filter((emp: any) => emp.isEncrypted).length === 0 ||
                    isEncrypting
                  }
                  className={`btn-primary w-full text-lg py-4 ${
                    submitting !== null ||
                    employees.filter((emp: any) => emp.isEncrypted).length === 0 ||
                    isEncrypting
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:scale-[1.02] active:scale-[0.98]'
                  } transition-transform duration-200 ${isSubmitAnimating ? 'submit-animation' : ''}`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="loading-spinner-enhanced"></span>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Distribute Now
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-2">
              <AnimatedIllustration />
            </div>
          </div>

          {txHash && (
            <div className="glass-card p-8 rounded-2xl border border-white/20 shadow-2xl mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Transaction Confirmed
                  </h3>
                  <p className="text-sm text-gray-200">
                    Your salary distribution has been submitted
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Transaction Hash</p>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-mono text-sm text-gray-400 break-all">{txHash}</p>
                  </div>
                </div>

                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  View on Etherscan
                </a>
              </div>
            </div>
          )}

          <BatchStatus batchId={currentBatchId} />
        </div>

        <button
          onClick={() => setIsVideoModalOpen(true)}
          className="btn-primary fixed left-6 top-6 z-50 glass-card px-6 py-3 rounded-full shadow-2xl border border-white/20 hover:scale-105 active:scale-95 transition-all duration-300 group flex items-center hover:cursor-pointer"
        >
          <FaVideo size={18} className="text-purple-600 group-hover:text-purple-700" />
          <span className="ml-2 text-gray-200 font-medium group-hover:text-gray-400">
            Watch Video
          </span>
        </button>

        <Link
          href="/docs"
          className="btn-secondary fixed right-6 bottom-0 mt-4 z-50 bg-gray-600 px-6 py-3 rounded-full shadow-2xl active:scale-95 transition-all duration-300 group flex items-center gap-2"
        >
          <FaBookOpen size={18} />
          <span className="text-center">Read Docs</span>
        </Link>

        <div className="fixed top-6 right-6 z-40">
          <WalletButton />
        </div>
      </div>

      {/* video --------  */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoId={videoId}
      />

      <LoadingMain
        isVisible={isEncrypting}
        message="Encrypting employee data..."
        type="encryption"
      />

      <LoadingMain
        isVisible={submitting !== null}
        message={submitting || "Processing batch submission..."}
        type="submission"
      />
    </div>
  );
};

export default SalaryDistribution;
