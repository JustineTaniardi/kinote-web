"use client";

import React, { useEffect, useState } from "react";
import SidebarWrapper from "./SidebarWrapper";
import ConfirmationModal from "./ConfirmationModal";

interface ActivityItem {
  id: number;
  status: string;
  judul: string;
  kategori?: string;
  subcategory?: string;
  days?: string[];
  totalTime?: string;
  repeatCount?: string;
  breakTime?: string;
  deadline?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: ActivityItem | null;
  onDelete?: (id: number) => void;
  onEdit?: (updated: ActivityItem) => void;
}

export default function ActivityDetailSidebar({
  isOpen,
  onClose,
  item,
  onDelete,
  onEdit,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isOpen) {
      t = setTimeout(() => setMounted(true), 10); // small delay to avoid sync setState
    } else {
      t = setTimeout(() => setMounted(false), 260);
    }
    return () => clearTimeout(t);
  }, [isOpen]);

  if (!mounted || !item) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      onDelete && onDelete(item.id);
      setShowDeleteConfirm(false);
      onClose();
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SidebarWrapper isOpen={isOpen} onClose={onClose} width="400px">
      {/* Header with Activity Title (Read-Only) */}
      <div className="px-6 py-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Read-only Title Display in Header */}
            <div className="text-lg font-semibold text-gray-900 truncate">
              {item.judul}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {item.kategori}
              {item.subcategory && ` | ${item.subcategory}`}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl leading-none transition shrink-0"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="px-6 py-6 flex-1 space-y-5 overflow-y-auto">
        {/* Display Activity Information - Read Only */}

        {/* Category - moved to content area for consistency with form layout */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Category
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900">
            {item.kategori || "-"}
          </div>
        </div>

        {/* Sub Category */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Sub Category
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900">
            {item.subcategory || "-"}
          </div>
        </div>

        {/* Days */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Days
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900">
            {item.days && item.days.length > 0 ? item.days.join(", ") : "-"}
          </div>
        </div>

        {/* Repeat */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Repeat
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900">
            {item.repeatCount || "-"}
          </div>
        </div>

        {/* Total Time */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Total Time (minutes)
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900">
            {item.totalTime || "-"}
          </div>
        </div>

        {/* Break */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Break (minutes)
          </label>
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900">
            {item.breakTime || "-"}
          </div>
        </div>

        {/* Status Section */}
        {item.status && (
          <div className="pt-2 border-t border-gray-200 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Status
              </label>
              <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900">
                {item.status}
              </div>
            </div>
          </div>
        )}

        {/* History Section */}
        {item.createdAt && (
          <div className="pt-4 border-t border-gray-200">
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Information History
            </label>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-100 transition"
            >
              📋 View History (7 sessions)
            </button>
            <div className="text-xs text-gray-500 space-y-1 mt-3">
              <div>Last Activity: 12/11/2025 • 10:34</div>
              <div>Created: {new Date(item.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex-1 px-4 py-2.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
        >
          Delete
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          Close
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Activity"
        message={`Are you sure you want to delete "${item.judul}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* History Modal */}
      {mounted && showHistoryModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Activity History</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">#</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Date & Time</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{i}</td>
                        <td className="py-3 px-4 text-gray-600">12/11/2025 10:{30 + i}AM</td>
                        <td className="py-3 px-4 text-gray-600">45 mins</td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                            Completed
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button className="text-blue-600 hover:text-blue-700 font-medium text-xs">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </SidebarWrapper>
  );
}
