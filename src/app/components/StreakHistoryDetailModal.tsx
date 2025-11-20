"use client";

import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { showError, showSuccess } from "@/lib/toast";

interface HistoryItem {
  id: number;
  streakId: number;
  userId: number;
  title: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  focusDuration: number;
  totalBreakTime: number;
  photoUrl?: string;
  verifiedAI: boolean;
  aiNote?: string;
  breakSessions?: string; // JSON string
  createdAt: string;
}

interface StreakHistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: HistoryItem | null;
  streakId: number;
}

export default function StreakHistoryDetailModal({
  isOpen,
  onClose,
  item,
  streakId,
}: StreakHistoryDetailModalProps) {
  const [description, setDescription] = useState(item?.description || "");
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (item) {
      setDescription(item.description);
    }
  }, [item]);

  const handleSaveDescription = async () => {
    if (!item) return;

    setIsSaving(true);
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        showError("Authentication token not found");
        return;
      }

      // API call to update history description
      const response = await fetch(
        `/api/streaks/${streakId}/history/${item.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            description: description,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update description");
      }

      showSuccess("Description updated successfully");
    } catch (error) {
      console.error("Error updating description:", error);
      showError("Failed to update description");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!isOpen || !item) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Session Details
              </h2>
              <p className="text-sm text-gray-600 mt-1">{item.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-6 py-4">
            <div className="space-y-4">
              {/* Session Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(item.startTime)}
                  </p>
                </div>

                {/* Time */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase">
                    Time
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatTime(item.startTime)}
                  </p>
                </div>

                {/* Focus Duration */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase">
                    Focus Duration
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDuration(item.focusDuration)}
                  </p>
                </div>

                {/* Break Time */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase">
                    Break Time
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDuration(item.totalBreakTime)}
                  </p>
                </div>

                {/* Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </p>
                  <div className="mt-1">
                    {item.verifiedAI ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Duration */}
                {item.duration && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Total Duration
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {item.duration} min
                    </p>
                  </div>
                )}
              </div>

              {/* Description - Editable */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add notes about this session..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* AI Note */}
              {item.aiNote && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-xs font-semibold text-blue-900 uppercase">
                    AI Analysis
                  </p>
                  <p className="text-sm text-blue-800 mt-2">{item.aiNote}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDescription}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Description"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
