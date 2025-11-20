"use client";

import React, { useEffect, useState, useRef } from "react";
import SidebarWrapper from "./SidebarWrapper";
import { showError } from "@/lib/toast";
import {
  XMarkIcon,
  Bars3Icon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

interface AddToDoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ToDoFormData) => void;
  onSuccess?: () => void;
}

export interface ToDoFormData {
  title: string;
  category: string;
  priority: string;
  date: string;
  time: string;
  description: string;
  status?: string;
}

const AddToDo: React.FC<AddToDoProps> = ({ isOpen, onClose, onSubmit, onSuccess }) => {
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      timerRef.current = setTimeout(() => setMounted(true), 0);
      document.body.style.overflow = "hidden";
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen]);

  const handleClose = () => {
    setMounted(false);
    setTimeout(() => onClose(), 240);
  };

  const handleSubmit = () => {
    if (!title || !category || !priority || !date || !time) {
      showError("Please fill in all required fields");
      return;
    }
    const payload: ToDoFormData = {
      title,
      category,
      priority,
      date,
      time,
      description,
      status: "Not Started",
    };
    if (onSubmit) onSubmit(payload);
    if (onSuccess) onSuccess();
    // Reset form
    setTitle("");
    setCategory("");
    setPriority("");
    setDate("");
    setTime("");
    setDescription("");
    handleClose();
  };

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

  if (!mounted) return null;

  return (
    <SidebarWrapper isOpen={isOpen} onClose={handleClose} width="400px">
      {/* Header with Editable Title */}
      <div className="px-6 py-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Editable Title Input in Header */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="To-Do Title"
              className="w-full text-lg font-semibold text-gray-900 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent truncate"
            />
            <div className="text-sm text-gray-500 mt-2">
              Add a new to-do item
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-900 transition shrink-0"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="px-6 py-6 flex-1 space-y-5 overflow-y-auto">
        {/* 1. Category Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.5rem center",
              backgroundSize: "1.5em 1.5em",
              paddingRight: "2.5rem",
            }}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Priority Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.5rem center",
              backgroundSize: "1.5em 1.5em",
              paddingRight: "2.5rem",
            }}
          >
            <option value="">Select Priority</option>
            {priorityOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Date Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Select Date"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <CalendarDaysIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 4. Time Start Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time
          </label>
          <div className="relative">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Select Time"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <ClockIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 6. Description Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            placeholder="Description"
            rows={4}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
        <button
          onClick={handleClose}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition"
        >
          Save
        </button>
      </div>
    </SidebarWrapper>
  );
};

export default AddToDo;
