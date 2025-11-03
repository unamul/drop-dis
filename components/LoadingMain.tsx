import React from 'react';

interface LoadingMainProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  type?: 'encryption' | 'submission' | 'processing';
}

const LoadingMain: React.FC<LoadingMainProps> = ({
  isVisible,
  message = "Processing...",
  progress = 0,
  type = 'encryption'
}) => {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'encryption':
        return (
          <div className="relative">
            <div className="w-20 h-20 relative">
              {/* Outer ring */}
              <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>

              {/* Middle ring with reverse animation */}
              <div className="absolute inset-2 border-2 border-purple-500/20 rounded-full"></div>
              <div className="absolute inset-2 border-2 border-transparent border-b-purple-500 border-l-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>

              {/* Core */}
              <div className="absolute inset-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            {/* Glowing effect */}
            <div className="absolute inset-0 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          </div>
        );

      case 'submission':
        return (
          <div className="relative">
            <div className="w-20 h-20 relative">
              {/* Hexagon shape for blockchain */}
              <svg className="w-full h-full animate-pulse" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#9333ea" />
                  </linearGradient>
                </defs>
                <polygon
                  points="50,5 90,25 90,75 50,95 10,75 10,25"
                  fill="url(#hexGradient)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                />
              </svg>

              {/* Inner icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-xl animate-pulse"></div>
          </div>
        );

      case 'processing':
        return (
          <div className="relative">
            <div className="w-20 h-20 relative">
              {/* Rotating squares */}
              <div className="absolute inset-0 border-2 border-blue-500/20 rounded-lg"></div>
              <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-lg animate-spin"></div>

              <div className="absolute inset-2 border-2 border-purple-500/20 rounded-lg"></div>
              <div className="absolute inset-2 border-2 border-transparent border-b-purple-500 rounded-lg animate-spin" style={{ animationDirection: 'reverse' }}></div>

              <div className="absolute inset-4 border-2 border-pink-500/20 rounded-lg"></div>
              <div className="absolute inset-4 border-2 border-transparent border-l-pink-500 rounded-lg animate-spin"></div>

              {/* Core */}
              <div className="absolute inset-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999]">
      {/* Particle background */}
  

      {/* Main loading card */}
      <div className="relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl min-w-[400px] max-w-md">
          {/* Glow effect behind card */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl -z-10"></div>

          <div className="flex flex-col items-center space-y-6">
            {/* Icon */}
            {getIcon()}

            {/* Message */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-white">
                {message}
              </h3>
              <p className="text-sm text-white/80">
                {type === 'encryption' && 'Securing data with advanced FHE encryption...'}
                {type === 'submission' && 'Submitting transaction to the blockchain...'}
                {type === 'processing' && 'Processing your request...'}
              </p>
            </div>

            {/* Progress bar */}
            {progress > 0 && (
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs text-white/60">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Status indicators */}
            <div className="flex flex-wrap justify-center gap-4 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Validating</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                <span>Encrypting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                <span>Securing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMain;