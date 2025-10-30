'use client';

import React from 'react';

const AnimatedIllustration: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[600px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 opacity-50"></div>

      <div className="relative z-10">
        <div className="relative animate-pulse">
          <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-white text-4xl font-bold">$</span>
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-amber-300 animate-ping"></div>
        </div>

        <div
          className="absolute top-10 -left-20 animate-bounce"
          style={{ animationDuration: '3s' }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg shadow-lg flex items-center justify-center transform rotate-12">
            <span className="text-white text-xl font-bold">💰</span>
          </div>
        </div>
        <div
          className="absolute top-20 -right-16 animate-bounce"
          style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg shadow-lg flex items-center justify-center transform -rotate-12">
            <span className="text-white text-lg font-bold">💵</span>
          </div>
        </div>
        <div
          className="absolute bottom-20 -left-16 animate-bounce"
          style={{ animationDuration: '4s', animationDelay: '1s' }}
        >
          <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg shadow-lg flex items-center justify-center transform rotate-45">
            <span className="text-white text-lg font-bold">💰</span>
          </div>
        </div>
        <div
          className="absolute bottom-10 -right-20 animate-bounce"
          style={{ animationDuration: '3.2s', animationDelay: '1.5s' }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg shadow-lg flex items-center justify-center transform -rotate-45">
            <span className="text-white text-base font-bold">💵</span>
          </div>
        </div>
      </div>

      {/* Background Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
    </div>
  );
};

export default AnimatedIllustration;
