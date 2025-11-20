"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import AddToDo from "./AddToDo";
import ToDoDetailSidebar from "./ToDoDetailSidebar";
import { useTasks, useTaskMutation } from "@/lib/hooks/useTasks";
import { showSuccess, showError } from "@/lib/toast";
import type { Task } from "@/lib/hooks/useTasks";

// Interface for ToDo item
interface ToDoItem {
  id: number;
  status: string;
  title: string;
  category: string;
  priority: string;
  deadline: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  subcategory?: string;
  days?: string[];
  totalTime?: string;
  repeatCount?: string;
  breakTime?: string;
}

interface ToDoFormData {
  title: string;
  category: string;
  priority: string;
  date: string;
  time: string;
  description: string;
  status?: string;
}

// CSS for animations
const strikeStyles = `
  .row-transition {
    transition: all 0.35s cubic-bezier(.2,.8,.2,1);
  }
  .row-completed {
    position: relative;
  }
  .row-completed::after {
    content: '';
    position: absolute;
    left: 8px;
    right: 8px;
    top: 50%;
    height: 2px;
    background-color: rgba(0,0,0,0.18);
    transform: translateY(-50%);
    pointer-events: none;
  }
`;

const ToDoContent: React.FC = () => {
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Inject CSS for animations
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = strikeStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // State variables
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    id: number;
    field: "status" | "category" | "priority";
  } | null>(null);
  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isAllExpanded, setIsAllExpanded] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ToDoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setSortOpen(false);
      }
    };

    if (sortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sortOpen]);

  // Fetch tasks from API
  const { data: tasks, refetch } = useTasks();
  const { deleteTask, updateTask } = useTaskMutation();

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-cell")) {
        setEditingCell(null);
      }
    };

    if (editingCell) {
      setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingCell]);

  // Sort function - MUST be defined before useMemo that uses it
  const getSortedTodos = (items: ToDoItem[]) => {
    if (!currentSort) return items;

    const sorted = [...items];
    switch (currentSort) {
      case "name-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "difficulty-easy-hard":
        const difficultyOrder = { low: 0, medium: 1, high: 2 };
        return sorted.sort(
          (a, b) =>
            (difficultyOrder[a.priority.toLowerCase() as keyof typeof difficultyOrder] || 0) -
            (difficultyOrder[b.priority.toLowerCase() as keyof typeof difficultyOrder] || 0)
        );
      case "deadline-nearest":
        return sorted.sort((a, b) => {
          const dateA = a.deadline ? new Date(a.deadline) : new Date(9999, 0, 0);
          const dateB = b.deadline ? new Date(b.deadline) : new Date(9999, 0, 0);
          return dateA.getTime() - dateB.getTime();
        });
      case "deadline-farthest":
        return sorted.sort((a, b) => {
          const dateA = a.deadline ? new Date(a.deadline) : new Date(0);
          const dateB = b.deadline ? new Date(b.deadline) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
      default:
        return sorted;
    }
  };

  // Memoize converted todos from API data
  const convertedTodos = useMemo(() => {
    if (tasks && tasks.length > 0) {
      return tasks.map((task: Task) => {
        // Extract status name from nested object
        const statusName = typeof task.status === 'object' && task.status !== null && 'name' in task.status
          ? (task.status as any).name
          : task.status || "Not Started";
        
        return {
          id: task.id,
          status: statusName,
          title: task.title,
          category: (task as any).category || "",
          priority: task.priority || "medium",
          deadline: task.deadline
            ? new Date(task.deadline).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "",
          description: task.description || "",
          subcategory: (task as any).subcategory || "",
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        };
      });
    }
    return null;
  }, [tasks]);

  // Use API todos if available, otherwise use empty state
  const baseTodos =
    convertedTodos && convertedTodos.length > 0 ? convertedTodos : todos;

  // Apply sorting to display todos
  const displayTodos = useMemo(
    () => getSortedTodos(baseTodos),
    [baseTodos, currentSort]
  );

  // Handler for checkbox
  const handleSelectItem = (id: number) => {
    const isCurrentlySelected = selectedItems.includes(id);

    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

    if (!isCurrentlySelected) {
      setTodos((prev) => {
        const selectedItem = prev.find((item) => item.id === id);
        if (!selectedItem) return prev;
        const remaining = prev.filter((item) => item.id !== id);
        const completedItem = {
          ...selectedItem,
          status: "Completed",
          updatedAt: new Date().toISOString(),
        };
        return [...remaining, completedItem];
      });
    } else {
      setTodos((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "Not Started", updatedAt: undefined }
            : item
        )
      );
    }
  };

  // Helper function for priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case "high":
      case "tinggi":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-blue-100 text-blue-700";
      case "low":
      case "rendah":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Handler for submit form
  const handleSubmitToDo = async (data: ToDoFormData) => {
    try {
      // Fetch difficulty and status to get correct IDs
      const difficultyResponse = await fetch("/api/difficulty", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const statusResponse = await fetch("/api/status", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!difficultyResponse.ok || !statusResponse.ok) {
        showError("Failed to fetch difficulty or status data");
        return;
      }

      const difficulties = await difficultyResponse.json();
      const statuses = await statusResponse.json();

      // Map priority to difficulty ID based on actual data
      const priorityMap: Record<string, string> = {
        "Low": "Easy",
        "Medium": "Medium",
        "High": "Hard",
      };
      const difficultyName = priorityMap[data.priority];
      const difficulty = difficulties.find((d: any) => d.name === difficultyName);
      const difficultyId = difficulty?.id || 2;

      // Find "pending" status
      const status = statuses.find((s: any) => s.name === "pending");
      const statusId = status?.id || 1;

      // Combine date and time for deadline
      const deadline = new Date(`${data.date}T${data.time}`);

      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          deadline: deadline.toISOString(),
          priority: data.priority.toLowerCase(),
          difficultyId,
          statusId,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        const newToDo: ToDoItem = {
          id: newTask.id,
          status: "Not Started",
          title: newTask.title,
          category: data.category,
          priority: data.priority,
          deadline: data.date,
          description: newTask.description || "",
          createdAt: newTask.createdAt,
          updatedAt: newTask.updatedAt,
        };
        setTodos([...todos, newToDo]);
        refetch();
        showSuccess("ToDo created successfully!");
        console.log("ToDo created successfully:", newToDo);
      } else {
        const errorData = await response.json().catch(() => ({ message: "Unknown error occurred" }));
        const errorMessage = errorData.message || "Failed to create todo";
        console.error("Failed to create todo:", errorMessage);
        showError("Failed to create todo: " + errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error creating todo:", errorMessage);
      showError("Error creating todo: " + errorMessage);
    }
  };

  // Handler to update cell value
  const handleUpdateCell = (
    id: number,
    field: "status" | "category" | "priority",
    value: string
  ) => {
    setTodos((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    setEditingCell(null);
  };

  // Options for dropdown
  const priorityOptions = ["Low", "Medium", "High"];
  const categoryOptions = [
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

  const openActivityModal = (item: ToDoItem) => {
    setSelectedActivity(item);
    setIsModalOpen(true);
  };

  const closeActivityModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  const handleDeleteActivity = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setSelectedItems((prev) => prev.filter((sid) => sid !== id));
    showSuccess("Task deleted successfully");
    // Refresh the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleEditActivity = (updated: unknown) => {
    const updatedData = updated as ToDoItem;
    const convertedItem: ToDoItem = {
      ...selectedActivity!,
      title: updatedData.title,
      category: updatedData.category,
      priority: updatedData.priority,
      deadline: updatedData.deadline,
      description: updatedData.description,
      status: updatedData.status,
      updatedAt: updatedData.updatedAt,
    };
    setTodos((prev) =>
      prev.map((t) =>
        t.id === convertedItem.id ? { ...t, ...convertedItem } : t
      )
    );
    refetch();
    setSelectedActivity(convertedItem);
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      {/* Header section */}
      <div className="shrink-0 bg-white border-b border-gray-200 p-6">
        <div className="w-full bg-[#F4F6F9] rounded-lg px-6 py-3 shadow-sm mb-6 flex items-center">
          <svg
            className="w-4 h-4 text-gray-400 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search for anything.."
            className="w-full bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400"
          />
        </div>

        <div className="flex gap-3">
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-[#161D36] border border-[#161D36] rounded-lg text-sm text-white hover:bg-[#1a2140] transition"
            >
              <span className="text-lg">⚙️</span>
              Filter / Sort
              <ChevronDownIcon
                className={`w-4 h-4 transition-transform ${
                  sortOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {sortOpen && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[220px]">
                <button
                  onClick={() => {
                    setCurrentSort("name-asc");
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition text-sm ${
                    currentSort === "name-asc" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                  }`}
                >
                  Sort by Name (A → Z)
                </button>
                <button
                  onClick={() => {
                    setCurrentSort("difficulty-easy-hard");
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition text-sm ${
                    currentSort === "difficulty-easy-hard" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                  }`}
                >
                  Sort by Difficulty (Easy → Hard)
                </button>
                <button
                  onClick={() => {
                    setCurrentSort("deadline-nearest");
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition text-sm ${
                    currentSort === "deadline-nearest" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                  }`}
                >
                  Sort by Deadline (Nearest → Farthest)
                </button>
                <button
                  onClick={() => {
                    setCurrentSort("deadline-farthest");
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition text-sm ${
                    currentSort === "deadline-farthest" ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                  }`}
                >
                  Sort by Deadline (Farthest → Nearest)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto bg-white p-6">
        {displayTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 mb-4 text-5xl">📋</div>
              <h3 className="text-gray-600 font-semibold mb-2">No tasks yet</h3>
              <p className="text-gray-500 text-sm mb-6">
                Create your first task to get started
              </p>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="px-6 py-2 bg-[#161D36] text-white rounded-lg text-sm font-medium hover:bg-[#1a2140] transition"
              >
                Add Activity
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#F8FAFB] rounded-xl p-0">
            <div className="mb-6">
              <button
                onClick={() => setIsAllExpanded(!isAllExpanded)}
                className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700"
              >
                <span
                  className={`transition-transform ${
                    isAllExpanded ? "rotate-90" : ""
                  }`}
                >
                  ▶
                </span>
                All
                <span className="ml-1 px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                  {displayTodos.length}
                </span>
              </button>

              {isAllExpanded && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                  <div className="hidden md:grid grid-cols-[40px_1fr_120px_120px_120px_180px_1fr] gap-4 px-4 py-4 bg-[#161D36] border-b-2 border-[#161D36] text-xs font-bold text-white uppercase tracking-wide sticky top-0 z-10">
                    <div className="flex items-center" />
                    <div className="flex items-center">Status</div>
                    <div className="flex items-center">Title</div>
                    <div className="flex items-center">Date</div>
                    <div className="flex items-center">Category</div>
                    <div className="flex items-center">Priority</div>
                    <div className="flex items-center">Description</div>
                  </div>

                  <div className="hidden md:block">
                    {displayTodos.map((item) => (
                      <motion.div
                        layout
                        transition={{ layout: { duration: 0.28 } }}
                        key={item.id}
                        onClick={() => openActivityModal(item)}
                        className={`row-transition grid grid-cols-[40px_1fr_120px_120px_120px_180px_1fr] gap-4 px-4 py-4 border-b border-gray-100 hover:bg-gray-50 text-sm ${
                          selectedItems.includes(item.id)
                            ? "bg-gray-200 row-completed text-gray-700"
                            : "bg-white text-gray-700"
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 cursor-pointer accent-black"
                          />
                        </div>

                        <div className="relative text-gray-700">
                          <span className="inline-block px-3 py-1.5 rounded bg-gray-100">
                            {item.status}
                          </span>
                        </div>

                        <div className="text-gray-700">
                          {item.title}
                        </div>
                        <div className="text-gray-700">
                          {item.deadline}
                        </div>

                        <div className="relative dropdown-cell">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!selectedItems.includes(item.id))
                                setEditingCell({
                                  id: item.id,
                                  field: "category",
                                });
                            }}
                            className="cursor-pointer hover:bg-gray-200 bg-gray-100 px-3 py-1.5 rounded transition inline-block"
                          >
                            {item.category}
                          </div>
                        </div>

                        <div className="relative dropdown-cell">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!selectedItems.includes(item.id))
                                setEditingCell({
                                  id: item.id,
                                  field: "priority",
                                });
                            }}
                            className="cursor-pointer inline-block"
                          >
                            <span
                              className={`inline-block px-3 py-1 rounded-md text-xs font-medium ${getPriorityColor(
                                item.priority
                              )} hover:opacity-80 transition`}
                            >
                              {item.priority}
                            </span>
                          </div>
                        </div>

                        <div className="truncate text-gray-600">
                          {item.description}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="md:hidden space-y-3 p-4">
                    {displayTodos.map((item) => (
                      <motion.div
                        layout
                        transition={{ layout: { duration: 0.28 } }}
                        key={item.id}
                        onClick={() => openActivityModal(item)}
                        className={`row-transition p-4 rounded-lg border-2 ${
                          selectedItems.includes(item.id)
                            ? "bg-gray-200 border-gray-300 row-completed"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 cursor-pointer accent-[#161D36] mt-0.5 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3
                              className={`font-semibold text-sm ${
                                selectedItems.includes(item.id)
                                  ? "text-gray-700"
                                  : "text-gray-900"
                              }`}
                            >
                              {item.title}
                            </h3>
                            <span
                              className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded ${
                                selectedItems.includes(item.id)
                                  ? "bg-gray-300 text-gray-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`space-y-2 text-sm ${
                            selectedItems.includes(item.id)
                              ? "text-gray-700"
                              : "text-gray-600"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Date:</span>
                            <span>{item.deadline}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="font-medium">Category:</span>
                            <div className="cursor-pointer px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {item.category}
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="font-medium">Priority:</span>
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                                item.priority
                              )}`}
                            >
                              {item.priority}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p
                            className={`text-xs leading-relaxed ${
                              selectedItems.includes(item.id)
                                ? "text-gray-700"
                                : "text-gray-500"
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div className="shrink-0 bg-white border-t border-gray-200 p-6">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="w-full bg-white rounded-lg border border-gray-200 px-6 py-4 flex items-center gap-3 text-sm text-gray-600 hover:bg-gray-50 transition shadow-sm cursor-pointer"
        >
          <span className="text-xl font-light text-gray-400">+</span>
          <span className="font-normal">Add Activity</span>
        </button>
      </div>

      {/* Add ToDo Sidebar */}
      <AddToDo
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSubmit={handleSubmitToDo}
        onSuccess={refetch}
      />

      {/* ToDo Detail Sidebar */}
      <ToDoDetailSidebar
        isOpen={isModalOpen}
        onClose={closeActivityModal}
        item={selectedActivity}
        onDelete={(id: number) => {
          handleDeleteActivity(id);
          closeActivityModal();
        }}
        onEdit={(updated) => {
          handleEditActivity(updated as unknown);
        }}
      />
    </div>
  );
};

export default ToDoContent;
