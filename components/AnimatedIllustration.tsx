'use client';

import React from 'react';

const AnimatedIllustration: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-10 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10">
        {/* Central Crypto Icon */}
        <div className="relative">
          <div className="w-40 h-40 glass-card rounded-full flex items-center justify-center shadow-2xl animate-pulse border-2 border-white/30">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-inner">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1.81.45 1.61 1.67 1.61 1.16 0 1.6-.64 1.6-1.46 0-.84-.68-1.22-1.88-1.36-1.76-.21-3.46-.92-3.46-3.1 0-1.64 1.16-2.82 2.97-3.22V4h2.67v1.95c1.65.37 2.67 1.5 2.73 3.1h-1.96c-.05-.8-.4-1.57-1.47-1.57-1.05 0-1.54.54-1.54 1.34 0 .78.56 1.14 1.81 1.28 1.77.2 3.53 1.02 3.53 3.21 0 1.78-1.28 2.88-3.16 3.28z"/>
              </svg>
            </div>
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-purple-400 animate-ping opacity-20"></div>
        </div>

        {/* Floating Crypto Elements */}
        <div
          className="absolute top-10 -left-24 animate-bounce glass-card p-3 rounded-2xl border border-white/30"
          style={{ animationDuration: '3s' }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl">₿</span>
          </div>
        </div>

        <div
          className="absolute top-20 -right-20 animate-bounce glass-card p-3 rounded-2xl border border-white/30"
          style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">Ξ</span>
          </div>
        </div>

        <div
          className="absolute bottom-20 -left-20 animate-bounce glass-card p-3 rounded-2xl border border-white/30"
          style={{ animationDuration: '4s', animationDelay: '1s' }}
        >
          <div className="w-11 h-11 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">$</span>
          </div>
        </div>

        <div
          className="absolute bottom-10 -right-24 animate-bounce glass-card p-2 rounded-2xl border border-white/30"
          style={{ animationDuration: '3.2s', animationDelay: '1.5s' }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg">₮</span>
          </div>
        </div>

        {/* Floating Lock Icons for Security */}
        <div
          className="absolute top-32 left-0 animate-pulse glass-card p-2 rounded-full border border-white/30"
          style={{ animationDuration: '2s' }}
        >
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <div
          className="absolute bottom-32 right-0 animate-pulse glass-card p-2 rounded-full border border-white/30"
          style={{ animationDuration: '2s', animationDelay: '1s' }}
        >
          <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse"></div>
        </div>

        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedIllustration;
