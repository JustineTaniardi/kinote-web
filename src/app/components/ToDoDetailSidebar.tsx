"use client";

import React, { useEffect, useState } from "react";
import SidebarWrapper from "./SidebarWrapper";
import ConfirmationModal from "./ConfirmationModal";
import { Trash2, Edit2, Check, X } from "lucide-react";
import {
  XMarkIcon,
  Squares2X2Icon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useTaskMutation } from "@/lib/hooks/useTasks";
import { showSuccess, showError } from "@/lib/toast";

interface ToDoItem {
  id: number;
  status: string;
  title: string;
  category?: string;
  priority?: string;
  deadline?: string;
  time?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: ToDoItem | null;
  onDelete?: (id: number) => void;
  onEdit?: (updated: ToDoItem) => void;
}

export default function ToDoDetailSidebar({
  isOpen,
  onClose,
  item,
  onDelete,
  onEdit,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTitle, setEditTitle] = useState(item?.title || "");
  const [editCategory, setEditCategory] = useState(item?.category || "");
  const [editPriority, setEditPriority] = useState(item?.priority || "");
  const [editDate, setEditDate] = useState(item?.deadline || "");
  const [editTime, setEditTime] = useState(item?.time || "");
  const [editDescription, setEditDescription] = useState(
    item?.description || ""
  );

  const { deleteTask } = useTaskMutation();

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
      setIsEditing(false);
      if (item) {
        setEditTitle(item.title);
        setEditCategory(item.category || "");
        setEditPriority(item.priority || "");
        setEditDate(item.deadline || "");
        setEditTime(item.time || "");
        setEditDescription(item.description || "");
      }
    } else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, item]);

  if (!mounted || !item) return null;

  const priorityOptions = ["Low", "Medium", "High"];
  const categories = [
    "Work",
    "Learning",
    "Personal",
    "Health",
    "Household",
    "Project",
    "Entertainment",
    "Sports",
    "Creativity",
    "Finance",
  ];

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTask(item.id);
      setShowDeleteConfirm(false);
      onClose();
      onDelete?.(item.id);
    } catch (error) {
      console.error("Delete error:", error);
      showError("Failed to delete task");
      setIsDeleting(false);
    }
  };

  const handleSave = () => {
    const updated: ToDoItem = {
      ...item,
      title: editTitle,
      category: editCategory,
      priority: editPriority,
      deadline: editDate,
      time: editTime,
      description: editDescription,
      updatedAt: new Date().toISOString(),
    };
    onEdit?.(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(item.title);
    setEditCategory(item.category || "");
    setEditPriority(item.priority || "");
    setEditDate(item.deadline || "");
    setEditTime(item.time || "");
    setEditDescription(item.description || "");
    setIsEditing(false);
  };

  return (
    <SidebarWrapper isOpen={isOpen} onClose={onClose} width="420px">
      {/* Header Section with Title */}
      <div className="px-6 py-6 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-2xl font-bold text-gray-900 bg-transparent border-none outline-none"
                placeholder="To-Do Title"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900 truncate">
                {item.title}
              </h2>
            )}
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
      <div className="px-6 py-6 flex-1 space-y-4 overflow-y-auto">
        {/* Category */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
          <Squares2X2Icon className="w-5 h-5 text-gray-600 shrink-0" />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <>
                <p className="text-xs text-gray-500">Category</p>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-gray-900 font-semibold mt-1"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500">Category</p>
                <p className="text-sm font-semibold text-gray-900">
                  {item.category || "-"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Priority */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
          <Squares2X2Icon className="w-5 h-5 text-gray-600 shrink-0" />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <>
                <p className="text-xs text-gray-500">Priority</p>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-gray-900 font-semibold mt-1"
                >
                  <option value="">Select Priority</option>
                  {priorityOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500">Priority</p>
                <p className="text-sm font-semibold text-gray-900">
                  {item.priority || "-"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
          <CalendarDaysIcon className="w-5 h-5 text-gray-600 shrink-0" />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <>
                <p className="text-xs text-gray-500">Date</p>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-gray-900 font-semibold mt-1"
                />
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {item.deadline || "-"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Time */}
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
          <ClockIcon className="w-5 h-5 text-gray-600 shrink-0" />
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <>
                <p className="text-xs text-gray-500">Time</p>
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-gray-900 font-semibold mt-1"
                />
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-semibold text-gray-900">
                  {item.time || "-"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Status Section */}
        {item.status && (
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-gray-900 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-sm font-semibold text-gray-900">
                {item.status}
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mt-6 pt-4">
          <p className="text-sm font-semibold text-gray-900 mb-3">
            Description
          </p>
          {isEditing ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-900 outline-none border border-gray-200 focus:border-gray-400 resize-none"
              rows={4}
              placeholder="Add description..."
            />
          ) : (
            <div className="bg-gray-50 rounded-2xl p-6 min-h-24 border border-dashed border-gray-300 flex items-center">
              <p className="text-sm text-gray-600">
                {item.description || "No description added"}
              </p>
            </div>
          )}
        </div>

        {/* History Section */}
        {item.createdAt && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 space-y-1">
              <div>
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </div>
              {item.updatedAt && (
                <div>
                  Updated: {new Date(item.updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        )}
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Todo"
        message={`Are you sure you want to delete "${item.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </SidebarWrapper>
  );
}
