import { useCallback, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  password: string;
}

interface VerifyEmailPayload {
  token: string;
}

interface AuthResponse {
  id: number;
  name: string;
  email: string;
  token?: string;
  message?: string;
  verified?: boolean;
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<AuthResponse | null>;
  register: (payload: RegisterPayload) => Promise<AuthResponse | null>;
  logout: () => void;
  getCurrentUser: () => Promise<User | null>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<boolean>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<boolean>;
  verify: (payload: VerifyEmailPayload) => Promise<boolean>;
  refetch: () => Promise<void>;
}

// ============================================================================
// useAuth Hook
// ============================================================================

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const initializedRef = useRef(false);

  // Cleanup: Mark as unmounted when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Helper: Safely update state only if component is mounted
  const safeSetState = useCallback(
    <T>(setter: (value: T) => void, value: T) => {
      if (isMountedRef.current) {
        setter(value);
      }
    },
    []
  );

  // Initialize: Load user from localStorage ONLY ONCE on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const userData = JSON.parse(stored) as User;
        safeSetState(setUser, userData);
      }
    } catch (err) {
      console.error("Failed to load user from storage:", err);
    } finally {
      safeSetState(setIsLoading, false);
    }
  }, [safeSetState]);

  // ========================================================================
  // login - Authenticate with email/password
  // ========================================================================
  const login = useCallback(
    async (payload: LoginPayload): Promise<AuthResponse | null> => {
      safeSetState(setIsLoading, true);
      safeSetState(setError, null);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          safeSetState(setError, data.message || "Login failed");
          return null;
        }

        // Store token in localStorage
        localStorage.setItem("authToken", data.token);
        const userData = {
          id: data.id,
          name: data.name,
          email: data.email,
        };
        localStorage.setItem("user", JSON.stringify(userData));

        // Also set cookie for middleware to read
        document.cookie = `authToken=${data.token}; path=/; max-age=86400`;

        safeSetState(setUser, userData);
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        safeSetState(setError, message);
        return null;
      } finally {
        safeSetState(setIsLoading, false);
      }
    },
    [safeSetState]
  );

  // ========================================================================
  // register - Create new user account
  // ========================================================================
  const register = useCallback(
    async (payload: RegisterPayload): Promise<AuthResponse | null> => {
      safeSetState(setIsLoading, true);
      safeSetState(setError, null);

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          safeSetState(setError, data.message || "Registration failed");
          return null;
        }

        // ✅ Registration successful - return the response
        // User should log in manually after registration
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          token: data.token,
          message: data.message,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        safeSetState(setError, message);
        return null;
      } finally {
        safeSetState(setIsLoading, false);
      }
    },
    [safeSetState]
  );

  // ========================================================================
  // logout - Clear auth state and redirect to login
  // ========================================================================
  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // Clear cookie
    document.cookie = "authToken=; path=/; max-age=0";
    // Call logout API endpoint
    fetch("/api/auth/logout", { method: "POST" }).catch((err) => {
      console.error("Logout API error:", err);
    });
    safeSetState(setUser, null);
    // Redirect to landing page
    router.push("/");
  }, [router, safeSetState]);

  // ========================================================================
  // getCurrentUser - Fetch current authenticated user from API
  // ========================================================================
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          safeSetState(setUser, null);
        }
        return null;
      }

      const userData = await response.json();
      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      };

      localStorage.setItem("user", JSON.stringify(user));
      safeSetState(setUser, user);
      return user;
    } catch (err) {
      console.error("Failed to get current user:", err);
      return null;
    }
  }, [safeSetState]);

  // ========================================================================
  // forgotPassword - Request password reset token
  // ========================================================================
  const forgotPassword = useCallback(
    async (payload: ForgotPasswordPayload): Promise<boolean> => {
      safeSetState(setIsLoading, true);
      safeSetState(setError, null);

      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          safeSetState(
            setError,
            data.message || "Failed to send password reset email"
          );
          return false;
        }

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        safeSetState(setError, message);
        return false;
      } finally {
        safeSetState(setIsLoading, false);
      }
    },
    [safeSetState]
  );

  // ========================================================================
  // resetPassword - Reset password with token
  // ========================================================================
  const resetPassword = useCallback(
    async (payload: ResetPasswordPayload): Promise<boolean> => {
      safeSetState(setIsLoading, true);
      safeSetState(setError, null);

      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          safeSetState(setError, data.message || "Failed to reset password");
          return false;
        }

        // Auto login after password reset
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          const userData = {
            id: data.id,
            name: data.name,
            email: data.email,
          };
          localStorage.setItem("user", JSON.stringify(userData));
          document.cookie = `authToken=${data.token}; path=/; max-age=86400`;
          safeSetState(setUser, userData);
        }

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        safeSetState(setError, message);
        return false;
      } finally {
        safeSetState(setIsLoading, false);
      }
    },
    [safeSetState]
  );

  // ========================================================================
  // verify - Verify email with token
  // ========================================================================
  const verify = useCallback(
    async (payload: VerifyEmailPayload): Promise<boolean> => {
      safeSetState(setIsLoading, true);
      safeSetState(setError, null);

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          safeSetState(setError, data.message || "Failed to verify email");
          return false;
        }

        // Auto login after email verification if token provided
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          const userData = {
            id: data.id,
            name: data.name,
            email: data.email,
          };
          localStorage.setItem("user", JSON.stringify(userData));
          document.cookie = `authToken=${data.token}; path=/; max-age=86400`;
          safeSetState(setUser, userData);
        }

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        safeSetState(setError, message);
        return false;
      } finally {
        safeSetState(setIsLoading, false);
      }
    },
    [safeSetState]
  );

  // ========================================================================
  // refetch - Refetch current user data
  // ========================================================================
  const refetch = useCallback(async () => {
    await getCurrentUser();
  }, [getCurrentUser]);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    getCurrentUser,
    forgotPassword,
    resetPassword,
    verify,
    refetch,
  };
}
