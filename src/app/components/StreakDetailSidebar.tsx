"use client";

import React, { useEffect, useState } from "react";
import SidebarWrapper from "./SidebarWrapper";
import { StreakEntry, ProgressStep } from "./StreakTypes";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { showSuccess, showError } from "@/lib/toast";
import {
  XMarkIcon,
  FireIcon,
  Squares2X2Icon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { CATEGORIES, SUBCATEGORIES } from "./ActivityCategories";
import ConfirmationModal from "./ConfirmationModal";
import StreakHistoryModal from "./StreakHistoryModal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entry: StreakEntry | null;
  onDelete?: (id: number) => void;
  onEdit?: (updated: StreakEntry) => void;
}

export default function StreakDetailSidebar({
  isOpen,
  onClose,
  entry,
  onDelete,
  onEdit,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [latestHistory, setLatestHistory] = useState<any>(null);
  const [editTitle, setEditTitle] = useState(entry?.title || "");
  const [editCategory, setEditCategory] = useState(entry?.category ?? "");
  const [editSubcategory, setEditSubcategory] = useState(
    entry?.subcategory ?? ""
  );
  const [editDays, setEditDays] = useState<string[]>(entry?.days || []);
  const [editDayIds, setEditDayIds] = useState<number[]>([]);
  const [allDays, setAllDays] = useState<Array<{ id: number; name: string }>>([]);
  const [editTotalTime, setEditTotalTime] = useState(
    String(entry?.totalMinutes || "") || ""
  );
  const [editBreakTime, setEditBreakTime] = useState(entry?.breakTime || "");
  const [editBreakCount, setEditBreakCount] = useState(
    String(entry?.breakCount || "0") || "0"
  );
  const [editDescription, setEditDescription] = useState(
    entry?.description || ""
  );
  const [historyCountData, setHistoryCountData] = useState(0);

  // Fetch all days on mount
  useEffect(() => {
    const fetchDays = async () => {
      try {
        const response = await fetch("/api/days");
        if (response.ok) {
          const days = await response.json();
          setAllDays(days);
        }
      } catch (error) {
        console.error("Failed to fetch days:", error);
      }
    };
    fetchDays();
  }, []);

  // Fetch latest history entry
  useEffect(() => {
    const fetchLatestHistory = async () => {
      if (!entry?.id) return;
      
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `/api/streaks/${entry.id}/history?page=1&limit=1`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.length > 0) {
            setLatestHistory(result.data[0]);
          }
          // Set the actual history count from API response
          setHistoryCountData(result.total || 0);
        }
      } catch (error) {
        console.error("Failed to fetch latest history:", error);
      }
    };
    
    fetchLatestHistory();
  }, [entry?.id]);

  useEffect(() => {
    if (isOpen) {
      // Batch all state updates - this pattern is valid for UI transitions
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      setIsEditing(false);
      if (entry) {
        setEditTitle(entry.title);
        setEditCategory(entry.category ?? "");
        setEditSubcategory(entry.subcategory ?? "");
        setEditDays(entry.days || []);
        setEditTotalTime(String(entry.totalMinutes || ""));
        setEditBreakTime(entry.breakTime || "");
        setEditBreakCount(String(entry.breakCount || "0"));
        setEditDescription(entry.description || "");
        
        // Initialize editDayIds - try to parse from entry if available
        // If entry has dayIds as JSON (from API), parse them; otherwise convert from day names
        if (entry.dayIds && typeof entry.dayIds === 'string') {
          try {
            const parsed = JSON.parse(entry.dayIds);
            setEditDayIds(Array.isArray(parsed) ? parsed : []);
          } catch {
            setEditDayIds([]);
          }
        } else if (Array.isArray(entry.dayIds)) {
          setEditDayIds(entry.dayIds as number[]);
        } else {
          setEditDayIds([]);
        }
      }
    } else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, entry]);

  if (!mounted || !entry) return null;

  const availableSubcategories = editCategory
    ? SUBCATEGORIES[editCategory as keyof typeof SUBCATEGORIES] || []
    : [];

  // History data from API fetch - use the fetched count instead of entry.streakCount
  const historyCount = historyCountData;
  const historyDate = latestHistory?.createdAt 
    ? new Date(latestHistory.createdAt).toLocaleDateString("id-ID")
    : "Not started";
  const historyTime = latestHistory?.createdAt 
    ? new Date(latestHistory.createdAt).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "–";

  // Mock progress steps template data
  const mockProgressSteps: ProgressStep[] = entry.progressSteps || [
    {
      id: "step-1",
      title: "Environment Setup",
      description:
        "Set up React development environment with Create React App and installed necessary dependencies like React Router and Axios for API calls.",
      image:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Crect fill='%2361dafb' x='100' y='80' width='200' height='140' rx='10'/%3E%3Ctext x='200' y='155' font-size='48' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle' font-family='Arial, sans-serif' font-weight='bold'%3EReact%3C/text%3E%3C/svg%3E",
      createdAt: "2025-11-10T08:30:00Z",
    },
    {
      id: "step-2",
      title: "Component Structure",
      description:
        "Created modular component architecture with reusable components. Implemented proper component hierarchy and prop drilling patterns for data flow management.",
      image:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e0e7ff' width='400' height='300'/%3E%3Crect fill='%234f46e5' x='50' y='60' width='80' height='80' rx='8'/%3E%3Crect fill='%234f46e5' x='160' y='60' width='80' height='80' rx='8'/%3E%3Crect fill='%234f46e5' x='270' y='60' width='80' height='80' rx='8'/%3E%3Crect fill='%23818cf8' x='105' y='180' width='190' height='80' rx='8'/%3E%3C/svg%3E",
      createdAt: "2025-11-11T10:15:00Z",
    },
    {
      id: "step-3",
      title: "State Management Implementation",
      description:
        "Implemented Redux store with actions and reducers. Set up middleware for async operations and connected components with Redux hooks.",
      image:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23fef3c7' width='400' height='300'/%3E%3Ccircle cx='100' cy='100' r='40' fill='%23fbbf24'/%3E%3Ccircle cx='200' cy='150' r='40' fill='%23fbbf24'/%3E%3Ccircle cx='300' cy='100' r='40' fill='%23fbbf24'/%3E%3Cline x1='140' y1='85' x2='160' y2='135' stroke='%23f59e0b' stroke-width='3'/%3E%3Cline x1='240' y1='135' x2='260' y2='85' stroke='%23f59e0b' stroke-width='3'/%3E%3C/svg%3E",
      createdAt: "2025-11-12T14:45:00Z",
    },
  ];

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/streaks/${entry.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setShowDeleteConfirm(false);
        onDelete?.(entry.id);
        onClose();
        showSuccess("Streak deleted successfully!");
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        showError("Failed to delete streak");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showError("Error deleting streak");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    try {
      // Extract category ID from category name or get from entry
      let categoryId = entry.categoryId || 1;
      
      // Extract subcategory ID if available
      let subCategoryId = entry.subCategoryId || null;

      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/streaks/${entry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          categoryId,
          subCategoryId,
          dayIds: editDayIds,
          totalTime: parseInt(editTotalTime) || 0,
          breakTime: parseInt(String(editBreakTime).replace(/\D/g, "")) || 0,
          breakCount: parseInt(editBreakCount) || 0,
          description: editDescription,
        }),
      });

      if (response.ok) {
        // Convert day IDs back to day names for display
        const dayNames = allDays
          .filter((d) => editDayIds.includes(d.id))
          .map((d) => d.name);

        const updated: StreakEntry = {
          ...entry,
          title: editTitle,
          category: editCategory,
          subcategory: editSubcategory,
          days: dayNames,
          dayIds: editDayIds as any,
          totalMinutes: parseInt(editTotalTime) || 0,
          breakTime: editBreakTime,
          breakCount: parseInt(editBreakCount) || 0,
          description: editDescription,
        };
        onEdit?.(updated);
        setIsEditing(false);
        
        // Show success message briefly then reload to get fresh DB data
        showSuccess("Activity updated successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        showError("Failed to save streak");
      }
    } catch (error) {
      console.error("Save error:", error);
      showError("Error saving streak");
    }
  };

  const handleCancel = () => {
    setEditTitle(entry.title);
    setEditCategory(entry.category ?? "");
    setEditSubcategory(entry.subcategory ?? "");
    setEditDays(entry.days || []);
    
    // Reset dayIds
    if (entry.dayIds && typeof entry.dayIds === 'string') {
      try {
        const parsed = JSON.parse(entry.dayIds);
        setEditDayIds(Array.isArray(parsed) ? parsed : []);
      } catch {
        setEditDayIds([]);
      }
    } else if (Array.isArray(entry.dayIds)) {
      setEditDayIds(entry.dayIds as number[]);
    } else {
      setEditDayIds([]);
    }
    
    setEditTotalTime(String(entry.totalMinutes || ""));
    setEditBreakTime(entry.breakTime || "");
    setEditBreakCount(String(entry.breakCount || "0"));
    setEditDescription(entry.description || "");
    setIsEditing(false);
  };

  return (
    <SidebarWrapper isOpen={isOpen} onClose={onClose} width="420px">
      {/* Header Section with Title */}
      <div className="px-6 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 text-2xl font-bold text-gray-900 bg-transparent border-none outline-none"
                  placeholder="Activity Name"
                />
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 truncate">
                    {entry.title}
                  </h2>
                  <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1 rounded-full shrink-0 border border-orange-200">
                    <FireIcon className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-orange-600">{historyCountData}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 shrink-0"
            aria-label="Close sidebar"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 py-6 flex-1 space-y-5 overflow-y-auto">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          {isEditing ? (
            <select
              value={editCategory}
              onChange={(e) => {
                setEditCategory(e.target.value);
                setEditSubcategory("");
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 bg-white">
              <Squares2X2Icon className="w-5 h-5 text-gray-600 shrink-0" />
              <p className="text-sm font-medium text-gray-900">
                {entry.category || "Academic"}
              </p>
            </div>
          )}
        </div>

        {/* Sub Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subcategory
          </label>
          {isEditing ? (
            <select
              value={editSubcategory}
              onChange={(e) => setEditSubcategory(e.target.value)}
              disabled={!editCategory}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
            >
              <option value="">Select Subcategory</option>
              {availableSubcategories.map((subcat) => (
                <option key={subcat} value={subcat}>
                  {subcat}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 bg-white">
              <Squares2X2Icon className="w-5 h-5 text-gray-600 shrink-0" />
              <p className="text-sm font-medium text-gray-900">
                {entry.subcategory || "Programming"}
              </p>
            </div>
          )}
        </div>

        {/* Day */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Days
          </label>
          {isEditing ? (
            <div className="space-y-2">
              {/* Show day options as checkboxes for multiple selection */}
              <div className="flex flex-col gap-2">
                {allDays.map((day) => (
                  <label key={day.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editDayIds.includes(day.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditDayIds([...editDayIds, day.id]);
                        } else {
                          setEditDayIds(editDayIds.filter((id) => id !== day.id));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{day.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 bg-white">
              <CalendarDaysIcon className="w-5 h-5 text-gray-600 shrink-0" />
              <p className="text-sm font-medium text-gray-900">
                {entry.days?.length ? entry.days.join(", ") : "Not set"}
              </p>
            </div>
          )}
        </div>

        {/* Total Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Time (minutes)
          </label>
          {isEditing ? (
            <input
              type="number"
              min="0"
              value={editTotalTime}
              onChange={(e) => setEditTotalTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          ) : (
            <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 bg-white">
              <ClockIcon className="w-5 h-5 text-gray-600 shrink-0" />
              <p className="text-sm font-medium text-gray-900">
                {entry.totalMinutes || 0} minutes
              </p>
            </div>
          )}
        </div>

        {/* Break Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Break Time (minutes)
          </label>
          {isEditing ? (
            <input
              type="number"
              min="0"
              value={String(editBreakTime).replace(/\D/g, "")}
              onChange={(e) => setEditBreakTime(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10"
            />
          ) : (
            <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 bg-white">
              <ClockIcon className="w-5 h-5 text-gray-600 shrink-0" />
              <p className="text-sm font-medium text-gray-900">
                {entry.breakTime || "0 minutes"}
              </p>
            </div>
          )}
        </div>

        {/* Break Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Break Count (Repetitions)
          </label>
          {isEditing ? (
            <input
              type="number"
              min="0"
              value={editBreakCount}
              onChange={(e) => setEditBreakCount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          ) : (
            <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2.5 bg-white">
              <ClockIcon className="w-5 h-5 text-gray-600 shrink-0" />
              <p className="text-sm font-medium text-gray-900">
                {entry?.breakCount || "0"} repetitions
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          {isEditing ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Add description..."
            />
          ) : (
            <div className="border border-gray-300 rounded-lg px-4 py-2.5 bg-white">
              <p className="text-sm text-gray-900">
                {entry.description || "No description added"}
              </p>
            </div>
          )}
        </div>

        {/* History Section - Clickable Button */}
        <div className="mt-6 pt-4">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="w-full bg-gray-50 rounded-2xl p-4 flex items-start gap-3 hover:bg-gray-100 transition border border-gray-200 cursor-pointer"
          >
            <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-lg shrink-0 mt-0.5 border border-orange-200">
              <FireIcon className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">History</p>
                <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-full border border-gray-300">
                  {historyCount}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Tanggal :</span> {historyDate}
                </p>
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Waktu :</span> {historyTime}
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                <Check className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {}}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-200 transition cursor-not-allowed"
              >
                Start
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Button */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white sticky bottom-0">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg border border-red-200/50 hover:bg-red-100 transition-colors font-medium text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>



      {/* Step Detail Modal */}
      {selectedStep !== null &&
        mockProgressSteps &&
        mockProgressSteps[selectedStep] && (
          <>
            <div
              className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm"
              onClick={() => setSelectedStep(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Step Header */}
                <div className="px-8 py-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Step {selectedStep + 1}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">View & Edit</p>
                  </div>
                  <button
                    onClick={() => setSelectedStep(null)}
                    className="text-gray-400 hover:text-gray-600 transition p-2 shrink-0 hover:bg-gray-100 rounded-lg"
                    aria-label="Close modal"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Step Content */}
                <div className="px-8 py-8">
                  {/* Step Image with Upload */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-900 mb-4">
                      Step Photo
                    </label>
                    <div className="relative group">
                      <div className="w-full h-72 bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                        {mockProgressSteps[selectedStep].image ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={mockProgressSteps[selectedStep].image}
                              alt="Step"
                              className="w-full h-full object-cover"
                            />
                          </>
                        ) : (
                          <div className="text-center">
                            <svg
                              className="w-16 h-16 text-gray-400 mx-auto mb-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <p className="text-sm text-gray-500">
                              No image uploaded
                            </p>
                          </div>
                        )}
                      </div>
                      {/* Upload Button Overlay */}
                      <label className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition rounded-2xl cursor-pointer">
                        <div className="text-center opacity-0 group-hover:opacity-100 transition">
                          <svg
                            className="w-10 h-10 text-white mx-auto mb-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <p className="text-sm font-medium text-white">
                            Change Photo
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && selectedStep !== null) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const updatedSteps = [...mockProgressSteps];
                                updatedSteps[selectedStep] = {
                                  ...updatedSteps[selectedStep],
                                  image: event.target?.result as string,
                                };
                                onEdit?.({
                                  ...entry,
                                  progressSteps: updatedSteps,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Step Title */}
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Step Title
                    </label>
                    <input
                      type="text"
                      defaultValue={mockProgressSteps[selectedStep].title}
                      onChange={(e) => {
                        if (selectedStep !== null) {
                          const updatedSteps = [...mockProgressSteps];
                          updatedSteps[selectedStep] = {
                            ...updatedSteps[selectedStep],
                            title: e.target.value,
                          };
                          onEdit?.({
                            ...entry,
                            progressSteps: updatedSteps,
                          });
                        }
                      }}
                      placeholder="e.g., First Implementation"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>

                  {/* Step Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Description
                    </label>
                    <textarea
                      defaultValue={mockProgressSteps[selectedStep].description}
                      onChange={(e) => {
                        if (selectedStep !== null) {
                          const updatedSteps = [...mockProgressSteps];
                          updatedSteps[selectedStep] = {
                            ...updatedSteps[selectedStep],
                            description: e.target.value,
                          };
                          onEdit?.({
                            ...entry,
                            progressSteps: updatedSteps,
                          });
                        }
                      }}
                      placeholder="Describe this step, what you did, and what you learned..."
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Step Footer */}
                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 rounded-b-3xl sticky bottom-0 flex gap-3">
                  <button
                    onClick={() => setSelectedStep(null)}
                    className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
                  >
                    Save & Close
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Streak"
        message={`Are you sure you want to delete "${entry.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* History Modal */}
      {entry && (
        <StreakHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          streakId={entry.id || 0}
          streakTitle={entry.title}
        />
      )}
    </SidebarWrapper>
  );
}
