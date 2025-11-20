"use client";

import { useApi, UseApiResponse } from "./useApi";
import { useCallback } from "react";

/**
 * Task types
 */
export interface StatusObject {
  id: number;
  name: string;
}

export interface DifficultyObject {
  id: number;
  name: string;
}

export interface DayObject {
  id: number;
  name: string;
}

export interface TaskDay {
  id: number;
  taskId: number;
  dayId: number;
  day?: DayObject;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  userId: number;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  deadline: string;
  createdAt: string;
  updatedAt: string;
  difficultyId: number;
  statusId: number;
  difficulty?: DifficultyObject;
  status?: StatusObject | string;
  days?: TaskDay[];
}

/**
 * Hook for fetching all tasks
 */
export function useTasks(): UseApiResponse<Task[]> {
  return useApi<Task[]>("/api/tasks");
}

/**
 * Hook for fetching a single task
 */
export function useTask(taskId: number | null): UseApiResponse<Task> {
  const url = taskId ? `/api/tasks/${taskId}` : null;
  return useApi<Task>(url);
}

/**
 * Hook for fetching task days
 */
export function useTaskDays(taskId: number | null): UseApiResponse<TaskDay[]> {
  const url = taskId ? `/api/tasks/${taskId}/days` : null;
  return useApi<TaskDay[]>(url);
}

/**
 * Hook for task mutations (create/update/delete)
 */
export function useTaskMutation() {
  const createTask = useCallback(async (data: Partial<Task>) => {
    const token = localStorage.getItem("authToken");
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    return response.json();
  }, []);

  const updateTask = useCallback(
    async (taskId: number, data: Partial<Task>) => {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }

      return response.json();
    },
    []
  );

  const deleteTask = useCallback(async (taskId: number) => {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`);
    }

    return response.json();
  }, []);

  return { createTask, updateTask, deleteTask };
}

/**
 * Hook for task day mutations
 */
export function useTaskDayMutation() {
  const createTaskDay = useCallback(
    async (taskId: number, data: Partial<TaskDay>) => {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/tasks/${taskId}/days`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create task day: ${response.statusText}`);
      }

      return response.json();
    },
    []
  );

  const updateTaskDay = useCallback(
    async (taskId: number, dayId: number, data: Partial<TaskDay>) => {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/tasks/${taskId}/days/${dayId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to update task day: ${response.statusText}`);
      }

      return response.json();
    },
    []
  );

  return { createTaskDay, updateTaskDay };
}
