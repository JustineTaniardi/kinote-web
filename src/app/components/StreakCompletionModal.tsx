"use client";

import React, { useState } from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface StreakCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakId: number;
  streakTitle: string;
  onVerificationComplete?: (result: any) => void;
}

export default function StreakCompletionModal({
  isOpen,
  onClose,
  streakId,
  streakTitle,
  onVerificationComplete,
}: StreakCompletionModalProps) {
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen && mounted) {
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mounted, onClose]);

  if (!mounted) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 backdrop-blur-sm ${
        isOpen ? "bg-black/20" : "bg-black/0 pointer-events-none"
      }`}
      onClick={handleClose}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Streak Session Completed
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-5">
            <div className="flex justify-center">
              <CheckCircleIcon className="w-16 h-16 text-green-500" />
            </div>
            <div className="text-center space-y-3">
              <p className="text-lg font-semibold text-gray-900">
                Great Job!
              </p>
              <p className="text-sm text-gray-600">
                Your streak session for <span className="font-semibold">{streakTitle}</span> has been successfully recorded.
              </p>
              <p className="text-xs text-gray-500">
                This modal will close automatically in 3 seconds...
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              onClick={handleClose}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
