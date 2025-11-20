"use client";

import React, { useEffect, useState } from "react";
import { useStreakMutation } from "@/lib/hooks/useStreaks";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface AddActivityProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Category {
  id: number;
  name: string;
}

interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
}

interface Day {
  id: number;
  name: string;
}

export default function AddActivity({
  isOpen,
  onClose,
  onSuccess,
}: AddActivityProps) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { createStreak } = useStreakMutation();

  // Form fields
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [totalTime, setTotalTime] = useState("");
  const [breakTime, setBreakTime] = useState("");
  const [breakCount, setBreakCount] = useState("");
  const [description, setDescription] = useState("");

  // Data from API
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch categories, subcategories, and days on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        
        // Fetch categories
        const catResponse = await fetch("/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (catResponse.ok) {
          setCategories(await catResponse.json());
        }

        // Fetch subcategories
        const subCatResponse = await fetch("/api/subcategories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (subCatResponse.ok) {
          setSubCategories(await subCatResponse.json());
        }

        // Fetch days
        const dayResponse = await fetch("/api/days", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (dayResponse.ok) {
          const daysData = await dayResponse.json();
          // Sort days by name order: Monday, Tuesday, etc.
          const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
          const sortedDays = daysData.sort((a: Day, b: Day) => {
            return dayOrder.indexOf(a.name) - dayOrder.indexOf(b.name);
          });
          setDays(sortedDays);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setDataLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  // Get subcategories for selected category
  const availableSubcategories = categoryId
    ? subCategories.filter((sub) => sub.categoryId === parseInt(categoryId))
    : [];

  // Reset subcategory when category changes
  useEffect(() => {
    setSubCategoryId("");
  }, [categoryId]);

  // Handle mount/unmount
  useEffect(() => {
    if (isOpen) setMounted(true);
    else {
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const clearAll = () => {
    setTitle("");
    setCategoryId("");
    setSubCategoryId("");
    setSelectedDays([]);
    setTotalTime("");
    setBreakTime("");
    setBreakCount("");
    setDescription("");
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      setError("Activity name is required");
      return;
    }

    if (!categoryId) {
      setError("Please select a category");
      return;
    }

    if (selectedDays.length === 0) {
      setError("Please select at least one day");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        title: title.trim(),
        categoryId: parseInt(categoryId),
        subCategoryId: subCategoryId ? parseInt(subCategoryId) : null,
        dayIds: selectedDays,
        totalTime: parseInt(totalTime) || 0,
        breakTime: parseInt(breakTime) || 0,
        breakCount: parseInt(breakCount) || 0,
        description: description || undefined,
      };

      await createStreak(payload);
      setSuccessMessage(`Activity "${title}" created successfully! 🎉`);

      setTimeout(() => {
        clearAll();
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create activity";
      setError(errorMessage);
      console.error("Error creating activity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? "bg-black/40" : "bg-black/0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`absolute right-0 top-0 h-screen w-96 bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Activity Name"
                disabled={isLoading}
                className="w-full text-lg font-semibold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <div className="mt-2 text-sm text-gray-500">Create a new activity</div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="shrink-0 text-gray-600 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          {successMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          {dataLoading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (
            <>
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={isLoading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <select
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  disabled={!categoryId || isLoading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                >
                  <option value="">Select Subcategory</option>
                  {availableSubcategories.map((subcat) => (
                    <option key={subcat.id} value={subcat.id}>
                      {subcat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Days
                </label>
                <div className="space-y-2">
                  {days.map((day) => (
                    <label key={day.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDays.includes(day.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDays([...selectedDays, day.id]);
                          } else {
                            setSelectedDays(selectedDays.filter((id) => id !== day.id));
                          }
                        }}
                        disabled={isLoading}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700">{day.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Total Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Time (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={totalTime}
                  onChange={(e) => setTotalTime(e.target.value)}
                  disabled={isLoading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="0"
                />
              </div>

              {/* Break Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Break Time (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={breakTime}
                  onChange={(e) => setBreakTime(e.target.value)}
                  disabled={isLoading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="0"
                />
              </div>

              {/* Break Count (Repeat) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Break Count (Repeat)
                </label>
                <input
                  type="number"
                  min="0"
                  value={breakCount}
                  onChange={(e) => setBreakCount(e.target.value)}
                  disabled={isLoading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="0"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 resize-none"
                  placeholder="Add a description"
                  rows={4}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white px-6 py-4">
          <button
            onClick={() => {
              clearAll();
              onClose();
            }}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || dataLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Saving...
              </>
            ) : (
              "Save Activity"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
