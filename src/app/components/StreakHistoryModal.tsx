"use client";

import React, { useEffect, useState } from "react";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { showError } from "@/lib/toast";
import StreakHistoryDetailModal from "./StreakHistoryDetailModal";

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

interface StreakHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakId: number;
  streakTitle: string;
}

const ITEMS_PER_PAGE = 10;

export default function StreakHistoryModal({
  isOpen,
  onClose,
  streakId,
  streakTitle,
}: StreakHistoryModalProps) {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch history data
  useEffect(() => {
    if (!isOpen || !streakId) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          showError("Authentication token not found");
          return;
        }

        const response = await fetch(
          `/api/streaks/${streakId}/history?page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch history");
        }

        const result = await response.json();
        setHistoryData(result.data);
        setTotalCount(result.total);
      } catch (error) {
        console.error("Error fetching history:", error);
        showError("Failed to load history. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [isOpen, streakId, currentPage]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Session History
              </h2>
              <p className="text-sm text-gray-600 mt-1">{streakTitle}</p>
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-600">Loading history...</div>
              </div>
            ) : historyData.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-600">No history records found</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Time
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Focus Duration
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Break Time
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((item, index) => (
                      <tr
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(item);
                          setShowDetailModal(true);
                        }}
                        className={`border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="py-3 px-4 text-gray-900">
                          {formatDate(item.startTime)}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {formatTime(item.startTime)}
                        </td>
                        <td className="py-3 px-4 text-gray-900 max-w-xs truncate">
                          {item.title}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {formatDuration(item.focusDuration)}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {formatDuration(item.totalBreakTime)}
                        </td>
                        <td className="py-3 px-4">
                          {item.verifiedAI ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer with Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {historyData.length > 0 ? (
                <>
                  Showing{" "}
                  <span className="font-semibold">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>
                  -
                  <span className="font-semibold">
                    {" "}
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      totalCount
                    )}
                  </span>{" "}
                  of <span className="font-semibold">{totalCount}</span> records
                </>
              ) : (
                "No records"
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || isLoading}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, and pages around current page
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, arr) => (
                    <React.Fragment key={page}>
                      {index > 0 && arr[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-600">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        disabled={isLoading}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white font-semibold"
                            : "border border-gray-300 bg-white hover:bg-gray-100 text-gray-900"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || isLoading}
                className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <StreakHistoryDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        streakId={streakId}
      />
    </>
  );
}
