'use client';

import React, { useEffect } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoId }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl mx-4 glass-card p-6 rounded-2xl shadow-2xl aspect-video"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10">
          <div className="glass-card px-4 py-2 rounded-full border border-white/20">
            <p className="text-sm font-medium text-gray-200">Video Tutorial</p>
          </div>

          <button
            onClick={onClose}
            className="glass-card p-3 rounded-full border border-white/20 hover:scale-110 hover:cursor-pointer transition-transform duration-200 group"
            aria-label="Close video"
          >
            <svg
              className="w-5 h-5 text-gray-200 group-hover:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="w-full h-full pt-12">
          <div className="w-full h-full bg-gray-900 rounded-xl overflow-hidden shadow-inner">
            <iframe
              className="w-full h-full"
              src={embedUrl}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            ></iframe>
          </div>
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="glass-card px-3 py-1 rounded-full border border-white/20">
            <p className="text-xs text-gray-300">Press ESC to close • Click outside to dismiss</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
