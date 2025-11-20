/**
 * Input validation utilities for secure API request handling
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters" };
  }

  if (password.length > 128) {
    return { valid: false, error: "Password must be less than 128 characters" };
  }

  return { valid: true };
}

export function validateName(name: string): boolean {
  if (!name || name.trim().length === 0) return false;
  if (name.length > 100) return false;
  // Allow alphanumeric, spaces, hyphens, apostrophes
  return /^[a-zA-Z0-9\s\-']+$/.test(name);
}

export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, 500) // Limit length
    .replace(/[<>]/g, ""); // Remove potentially dangerous characters
}

export function validateToken(token: string): boolean {
  if (!token || typeof token !== "string") return false;
  // JWT tokens are typically in the format: xxx.yyy.zzz
  return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);
}

export function validatePaginationParams(page?: unknown, limit?: unknown): {
  page: number;
  limit: number;
} {
  const parsedPage = Math.max(1, Math.floor(Number(page) || 1));
  const parsedLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));

  return {
    page: parsedPage,
    limit: parsedLimit,
  };
}
