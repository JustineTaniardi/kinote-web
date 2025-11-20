"use client";

import React, { useEffect, useState, useRef } from "react";
import { showError } from "@/lib/toast";

interface StreakTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  focusMinutes: number;
  breakMinutes: number;
  initialBreakRepetitions: number;
  streakId?: number; // ✅ Optional streak ID for end session API call
  onComplete?: (
    focusSeconds: number,
    breakRepetitionsUsed: number,
    breakSessions?: BreakSession[]
  ) => void;
}

interface BreakSession {
  startTime: number; // timestamp when break started
  endTime?: number; // timestamp when break ended (or skipped)
  duration: number; // actual break duration in seconds
  focusTimeBeforeBreak: number; // focus time accumulated before this break
  type: "completed" | "skipped"; // whether break was completed or skipped
}

type Mode = "focus" | "break";

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export default function StreakTimerModal({
  isOpen,
  onClose,
  title,
  focusMinutes,
  breakMinutes,
  initialBreakRepetitions,
  streakId,
  onComplete,
}: StreakTimerModalProps) {
  // Initialize position with viewport constraints
  const initializePosition = () => {
    if (typeof window === "undefined") return null;

    const MODAL_WIDTH = 268;
    const MODAL_HEIGHT = 500;
    const PADDING = 10;

    let initialX = window.innerWidth / 2 - 134;
    let initialY = window.innerHeight / 2 - 110;

    // Constrain initial position to viewport
    if (initialX < PADDING) initialX = PADDING;
    if (initialX + MODAL_WIDTH > window.innerWidth - PADDING) {
      initialX = window.innerWidth - MODAL_WIDTH - PADDING;
    }
    if (initialY < PADDING) initialY = PADDING;
    if (initialY + MODAL_HEIGHT > window.innerHeight - PADDING) {
      initialY = window.innerHeight - MODAL_HEIGHT - PADDING;
    }

    return { x: initialX, y: initialY };
  };

  // Load persisted state from localStorage
  const loadPersistedState = () => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem("streakTimerState");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load timer state:", e);
    }
    return null;
  };

  // ✅ ALWAYS use fresh initial values - don't load persisted state on mount
  // Timer should start fresh each time the modal opens with the fixed user input values
  const [mode, setMode] = useState<Mode>("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(focusMinutes * 60);
  const [savedFocusSeconds, setSavedFocusSeconds] = useState(focusMinutes * 60);
  const [breakSeconds, setBreakSeconds] = useState(breakMinutes * 60);
  const [remainingBreakReps, setRemainingBreakReps] = useState(
    initialBreakRepetitions
  );
  const [usedBreakReps, setUsedBreakReps] = useState(0);
  const [breakSessions, setBreakSessions] = useState<BreakSession[]>([]);
  const [totalAccumulatedFocus, setTotalAccumulatedFocus] = useState(0);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    initializePosition()
  );
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showEndSessionModal, setShowEndSessionModal] = useState(false); // ✅ Popup modal state
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Lock initial break values so they can't change even if props change
  // Use refs to store the initial values when modal first opens
  const lockedBreakMinutesRef = useRef<number>(breakMinutes);
  const lockedInitialBreakRepsRef = useRef<number>(initialBreakRepetitions);

  // Persist state to localStorage during the session
  useEffect(() => {
    if (isOpen && position) {
      const stateToSave = {
        mode,
        isRunning,
        focusSeconds,
        savedFocusSeconds,
        breakSeconds,
        remainingBreakReps,
        usedBreakReps,
        breakSessions,
        totalAccumulatedFocus,
        position,
      };
      localStorage.setItem("streakTimerState", JSON.stringify(stateToSave));
    }
  }, [
    isOpen,
    mode,
    isRunning,
    focusSeconds,
    savedFocusSeconds,
    breakSeconds,
    remainingBreakReps,
    usedBreakReps,
    breakSessions,
    totalAccumulatedFocus,
    position,
  ]);

  // ✅ Lock in the break values when modal first opens to prevent external changes
  // This ensures break time and break repetitions don't change even if props update
  useEffect(() => {
    if (isOpen) {
      lockedBreakMinutesRef.current = breakMinutes;
      lockedInitialBreakRepsRef.current = initialBreakRepetitions;
    }
  }, [isOpen, breakMinutes, initialBreakRepetitions]);

  // Header drag handler
  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const MODAL_WIDTH = 268;
      const MODAL_HEIGHT = 500; // Approximate height
      const PADDING = 10; // Padding from viewport edges

      // Calculate new position
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;

      // Constrain to viewport boundaries
      // Left boundary
      if (newX < PADDING) {
        newX = PADDING;
      }
      // Right boundary
      if (newX + MODAL_WIDTH > window.innerWidth - PADDING) {
        newX = window.innerWidth - MODAL_WIDTH - PADDING;
      }
      // Top boundary
      if (newY < PADDING) {
        newY = PADDING;
      }
      // Bottom boundary
      if (newY + MODAL_HEIGHT > window.innerHeight - PADDING) {
        newY = window.innerHeight - MODAL_HEIGHT - PADDING;
      }

      setPosition({
        x: newX,
        y: newY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Timer logic
  useEffect(() => {
    if (!isRunning || !isOpen) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (mode === "focus") {
        setFocusSeconds((s: number) => {
          if (s <= 1) {
            // Focus time finished - complete
            setIsRunning(false);
            // Calculate total focus time accumulated
            const totalFocus = totalAccumulatedFocus + (focusMinutes * 60 - 1);
            if (onComplete) {
              onComplete(totalFocus, usedBreakReps, breakSessions);
              // ✅ Clear timer state when focus time completes
              setTimeout(() => localStorage.removeItem("streakTimerState"), 100);
            }
            return 0;
          }
          return s - 1;
        });
      } else if (mode === "break") {
        setBreakSeconds((s: number) => {
          if (s <= 1) {
            // Break time finished - return to focus with saved time
            setMode("focus");
            // Don't auto-start, let user manually continue if they want
            setIsRunning(false);
            // Add this completed break session to history
            const newBreakSession: BreakSession = {
              startTime: Date.now(),
              endTime: Date.now(),
              duration: lockedBreakMinutesRef.current * 60, // ✅ Use locked value
              focusTimeBeforeBreak: savedFocusSeconds,
              type: "completed",
            };
            setBreakSessions([...breakSessions, newBreakSession]);
            setFocusSeconds(savedFocusSeconds);
            return 0;
          }
          return s - 1;
        });
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    isRunning,
    mode,
    isOpen,
    focusMinutes,
    breakMinutes,
    usedBreakReps,
    onComplete,
    savedFocusSeconds,
    totalAccumulatedFocus,
    breakSessions,
  ]);

  if (!isOpen || !position) return null;

  const currentSeconds = mode === "focus" ? focusSeconds : breakSeconds;
  const isFocusMode = mode === "focus";
  const isBreakAvailable = remainingBreakReps > 0;

  const handleStartPause = () => {
    setIsRunning(!isRunning); // Toggle start/pause in focus mode
  };

  const handleBreak = () => {
    if (remainingBreakReps > 0 && mode === "focus") {
      // BREAK button clicked - save accumulated focus time, switch to break
      // Update total accumulated focus time before taking break
      setTotalAccumulatedFocus(
        totalAccumulatedFocus + (focusMinutes * 60 - focusSeconds)
      );
      setSavedFocusSeconds(focusSeconds);
      
      // Calculate new breakCount after taking a break - use locked value
      const newBreakCount = lockedInitialBreakRepsRef.current - (usedBreakReps + 1);
      
      // ✅ Sync updated breakCount to database
      if (streakId) {
        const token = localStorage.getItem("authToken");
        if (token) {
          fetch(`/api/streaks/${streakId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              breakCount: newBreakCount,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("breakCount updated on break:", data);
            })
            .catch((err) => {
              console.error("Failed to update breakCount on break:", err);
            });
        }
      }
      
      setRemainingBreakReps((prev: number) => prev - 1);
      setUsedBreakReps((prev: number) => prev + 1);
      setMode("break");
      setBreakSeconds(lockedBreakMinutesRef.current * 60); // ✅ Use locked value
      // Immediately start break timer
      setIsRunning(true);
    }
  };

  const handleSkipBreak = () => {
    // SKIP BREAK button clicked - record skipped break session and return to focus mode
    const skippedBreakSession: BreakSession = {
      startTime: Date.now(),
      duration: 0,
      focusTimeBeforeBreak: savedFocusSeconds,
      type: "skipped",
    };
    setBreakSessions([...breakSessions, skippedBreakSession]);
    setMode("focus");
    setFocusSeconds(savedFocusSeconds);
    setIsRunning(true); // Auto-continue focus timer after skipping break
  };

  const handleContinueBreak = () => {
    // Continue break timer from pause
    setIsRunning(true);
  };

  const handleBackToFocus = () => {
    // Return to focus mode during break - record break session with elapsed time
    const elapsedBreakTime = lockedBreakMinutesRef.current * 60 - breakSeconds; // ✅ Use locked value
    const completedBreakSession: BreakSession = {
      startTime: Date.now(),
      duration: elapsedBreakTime,
      focusTimeBeforeBreak: savedFocusSeconds,
      type: "completed",
    };
    setBreakSessions([...breakSessions, completedBreakSession]);
    setMode("focus");
    setFocusSeconds(savedFocusSeconds);
    setIsRunning(true); // Auto-continue focus timer
  };

  const getMainButtonLabel = (): string => {
    if (mode === "focus") {
      return isRunning ? "Pause" : "Start";
    }
    return "Skip Break";
  };

  const handleClose = () => {
    // ✅ Same as End Session - show popup instead of just closing
    setShowEndSessionModal(true);
  };

  // ✅ End session early - save accumulated focus time and complete
  const handleEndSession = async () => {
    try {
      setIsRunning(false);

      // ✅ Call API to end streak session if streakId exists
      if (streakId) {
        const token = localStorage.getItem("authToken");
        if (token) {
          await fetch(`/api/streaks/${streakId}/end-session`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ confirm: "END" }),
          });
        }
      }

      // Calculate total focus time accumulated
      const totalFocus =
        totalAccumulatedFocus +
        (mode === "focus" ? focusMinutes * 60 - focusSeconds : 0);
      if (onComplete) {
        onComplete(totalFocus, usedBreakReps, breakSessions);
      }
      
      // ✅ Clear timer state from localStorage when session ends
      localStorage.removeItem("streakTimerState");
      
      handleClose();
      setShowEndSessionModal(false);
    } catch (error) {
      console.error("Error ending session:", error);
      showError("Failed to end session. Please try again.");
    }
  };

  // ✅ Confirm handler for popup
  const confirmEndSession = () => {
    setShowEndSessionModal(false);
    handleEndSession();
  };

  // ✅ Cancel handler for popup
  const cancelEndSession = () => {
    setShowEndSessionModal(false);
    setIsRunning(true); // Resume timer
  };

  // Minimized view
  if (isMinimized) {
    return (
      <>
        {/* Backdrop - Very light, non-blocking */}
        <div className="fixed inset-0 bg-black/5 z-40" />

        {/* Minimized Button - Bottom Right Corner (Desktop) */}
        <button
          onClick={() => setIsMinimized(false)}
          className="hidden md:flex fixed bottom-6 right-6 z-50 w-24 h-24 rounded-full bg-[#161d36] text-white shadow-lg hover:bg-[#1a2140] active:scale-95 transition-all items-center justify-center flex-col"
          title="Click to expand"
        >
          <div className="text-xs font-bold text-center leading-tight">
            <div className="text-2xl">{formatTime(currentSeconds)}</div>
          </div>
        </button>

        {/* Mobile Minimized - Collapsed Banner */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#161d36] px-4 py-3 flex items-center justify-between">
          <div className="text-white font-bold text-sm">{title}</div>
          <div className="text-white text-base font-mono font-bold">
            {formatTime(currentSeconds)}
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="text-white hover:text-gray-300 transition-colors"
            title="Expand"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop - Very light, non-blocking */}
      <div className="fixed inset-0 bg-black/5 z-40" />

      {/* DESKTOP VIEW - Draggable Floating Timer Card (hidden on mobile) */}
      <div
        ref={containerRef}
        className="hidden md:block fixed z-50 pointer-events-auto"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "268px",
        }}
      >
        <div className="bg-[#f0f2f9] border-2 border-[#5e6270] rounded-sm shadow-md overflow-hidden">
          {/* Header - Draggable */}
          <div
            onMouseDown={handleHeaderMouseDown}
            className="px-4 py-3 flex items-center justify-between cursor-move bg-[#f0f2f9] border-b border-[#e0e0e0]"
            style={{ userSelect: "none" }}
          >
            <div className="text-sm font-medium text-[#161d36] truncate flex-1">
              {title}
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="ml-2 text-[#161d36] hover:text-gray-600 shrink-0 p-0.5 transition-colors"
              aria-label="Minimize timer"
              title="Minimize"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-3">
            {/* Mode indicator */}
            <div className="text-xs font-medium text-[#161d36] mb-2">
              Mode :{" "}
              <span className="font-semibold">
                {isFocusMode ? "Fokus" : "Istirahat"}
              </span>
            </div>

            {/* Timer Display */}
            <div className="bg-[#f2f3f6] rounded-sm shadow-sm p-2 mb-3">
              <div className="bg-[#161d36] rounded-sm py-3 text-center">
                <div className="text-2xl font-medium text-white font-mono tracking-wider">
                  {formatTime(currentSeconds)}
                </div>
              </div>
            </div>

            {/* Duration Type Label */}
            <div className="text-xs font-medium text-[#161d36] mb-1">
              {isFocusMode ? "Fokus" : "istirahat"}
            </div>

            {/* Duration Value */}
            <div className="text-sm font-medium text-[#161d36] mb-4">
              {isFocusMode ? focusMinutes : breakMinutes} Menit
            </div>

            {/* Break Remaining Counter */}
            <div
              className={`mb-4 px-3 py-2 rounded-sm text-center text-xs font-medium ${
                isBreakAvailable
                  ? "bg-[#f2f3f6] text-[#161d36]"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              Break Remaining:{" "}
              <span className="font-semibold">{remainingBreakReps}</span> times
            </div>

            {/* Start/Pause Button */}
            {mode === "focus" && (
              <>
                <button
                  onClick={handleStartPause}
                  className="w-full text-sm font-medium py-2 rounded-sm transition-colors bg-[#161d36] text-white hover:bg-[#1a2140]"
                >
                  {getMainButtonLabel()}
                </button>

                {/* Break Button - Only show when timer running and breaks available */}
                {isRunning && isBreakAvailable && (
                  <button
                    onClick={handleBreak}
                    className="w-full text-sm font-medium py-2 rounded-sm transition-colors bg-white border-2 border-[#161d36] text-[#161d36] hover:bg-gray-50 mt-2"
                  >
                    Break ({remainingBreakReps}x)
                  </button>
                )}

                {/* ✅ End Session Button */}
                <button
                  onClick={() => setShowEndSessionModal(true)}
                  className="w-full text-sm font-medium py-2 rounded-sm transition-colors bg-red-50 border border-red-300 text-red-600 hover:bg-red-100 mt-2"
                >
                  End Session
                </button>
              </>
            )}

            {/* Skip Break Button - Show in break mode */}
            {mode === "break" && (
              <>
                {isRunning ? (
                  // Break is running - show pause button
                  <button
                    onClick={() => setIsRunning(false)}
                    className="w-full text-sm font-medium py-2 rounded-sm transition-colors bg-[#161d36] text-white hover:bg-[#1a2140]"
                  >
                    Pause Break
                  </button>
                ) : (
                  // Break is paused - show continue and back to focus options
                  <>
                    <button
                      onClick={handleContinueBreak}
                      className="w-full text-sm font-medium py-2 rounded-sm transition-colors bg-[#161d36] text-white hover:bg-[#1a2140]"
                    >
                      Continue Break
                    </button>
                    <button
                      onClick={handleBackToFocus}
                      className="w-full text-sm font-medium py-2 rounded-sm transition-colors bg-white border-2 border-[#161d36] text-[#161d36] hover:bg-gray-50 mt-2"
                    >
                      Back to Focus
                    </button>
                  </>
                )}
                {/* ✅ End Session Button in Break Mode */}
                <button
                  onClick={() => setShowEndSessionModal(true)}
                  className="w-full text-sm font-medium py-2 rounded-sm transition-colors bg-red-50 border border-red-300 text-red-600 hover:bg-red-100 mt-2"
                >
                  End Session
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE VIEW - Full Screen Modal (visible on mobile only) */}
      <div className="md:hidden fixed inset-0 z-50 pointer-events-auto flex flex-col bg-white">
        {/* Mobile Header - Minimize & Close Button */}
        <div className="shrink-0 px-4 py-3 flex items-center justify-between bg-[#f0f2f9] border-b border-[#e0e0e0]">
          {/* ✅ Minimize Button for Mobile */}
          <button
            onClick={() => setIsMinimized(true)}
            className="text-[#161d36] hover:text-gray-600 shrink-0 p-1.5 transition-colors"
            aria-label="Minimize timer"
            title="Minimize"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>

          {/* Title */}
          <h2 className="text-lg font-bold text-[#161d36] flex-1 text-center">
            {title}
          </h2>
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="text-[#161d36] hover:text-gray-600 shrink-0 p-1.5 transition-colors"
            aria-label="Close timer"
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
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
          {/* Mode Indicator */}
          <div className="text-center mb-4">
            <div className="text-sm font-medium text-[#161d36] mb-1">Mode</div>
            <div className="text-2xl font-bold text-[#161d36]">
              {isFocusMode ? "Fokus" : "Istirahat"}
            </div>
          </div>

          {/* Timer Display - Large */}
          <div className="bg-[#f2f3f6] rounded-lg shadow-sm p-4 mb-8 flex-1 flex flex-col justify-center">
            <div className="bg-[#161d36] rounded-lg py-8 text-center">
              <div className="text-6xl font-bold text-white font-mono tracking-wider">
                {formatTime(currentSeconds)}
              </div>
            </div>
          </div>

          {/* Duration Info Card */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-[#e0e0e0]">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-[#161d36]">
                {isFocusMode ? "Focus Duration" : "Break Duration"}
              </span>
              <span className="text-xl font-bold text-[#161d36]">
                {isFocusMode ? focusMinutes : breakMinutes} Menit
              </span>
            </div>
          </div>

          {/* Break Remaining Counter */}
          <div
            className={`mb-6 px-4 py-4 rounded-lg text-center font-bold ${
              isBreakAvailable
                ? "bg-[#f2f3f6] text-[#161d36]"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            <div className="text-xs font-medium mb-1 opacity-75">
              Sisa Break
            </div>
            <div className="text-3xl">{remainingBreakReps}x</div>
          </div>

          {/* Info Text */}
          <div className="mb-6 p-3 bg-[#f2f3f6] rounded-lg">
            <p className="text-xs text-[#161d36] text-center leading-relaxed">
              {isFocusMode
                ? "Fokus sepenuhnya dan jangan terganggu"
                : "Istirahat sejenak untuk recovery"}
            </p>
          </div>
        </div>

        {/* Action Buttons - Fixed at Bottom */}
        <div className="shrink-0 px-4 py-4 border-t border-[#e0e0e0] bg-white space-y-2">
          {/* Start/Pause Button - Focus Mode */}
          {mode === "focus" && (
            <>
              <button
                onClick={handleStartPause}
                className="w-full text-base font-bold py-4 rounded-lg transition-all bg-[#161d36] text-white active:bg-[#1a2140] active:scale-95"
              >
                {getMainButtonLabel()}
              </button>

              {/* Break Button - Only show when running and breaks available */}
              {isRunning && isBreakAvailable && (
                <button
                  onClick={handleBreak}
                  className="w-full text-base font-bold py-3 rounded-lg transition-all bg-white border-2 border-[#161d36] text-[#161d36] active:bg-gray-100 active:scale-95"
                >
                  Break ({remainingBreakReps}x)
                </button>
              )}

              {/* ✅ End Session Button - Mobile Focus Mode */}
              <button
                onClick={() => setShowEndSessionModal(true)}
                className="w-full text-base font-bold py-3 rounded-lg transition-all bg-red-50 border border-red-300 text-red-600 active:bg-red-100 active:scale-95"
              >
                End Session
              </button>
            </>
          )}

          {/* Skip Break Button - Break Mode */}
          {mode === "break" && (
            <>
              {isRunning ? (
                // Break is running - show pause button
                <button
                  onClick={() => setIsRunning(false)}
                  className="w-full text-base font-bold py-4 rounded-lg transition-all bg-[#161d36] text-white active:bg-[#1a2140] active:scale-95"
                >
                  Pause Break
                </button>
              ) : (
                // Break is paused - show continue and back to focus options
                <>
                  <button
                    onClick={handleContinueBreak}
                    className="w-full text-base font-bold py-3 rounded-lg transition-all bg-[#161d36] text-white active:bg-[#1a2140] active:scale-95"
                  >
                    Continue Break
                  </button>
                  <button
                    onClick={handleBackToFocus}
                    className="w-full text-base font-bold py-3 rounded-lg transition-all bg-white border-2 border-[#161d36] text-[#161d36] active:bg-gray-100 active:scale-95"
                  >
                    Back to Focus
                  </button>
                </>
              )}

              {/* ✅ End Session Button - Mobile Break Mode */}
              <button
                onClick={() => setShowEndSessionModal(true)}
                className="w-full text-base font-bold py-3 rounded-lg transition-all bg-red-50 border border-red-300 text-red-600 active:bg-red-100 active:scale-95 mt-2"
              >
                End Session
              </button>
            </>
          )}
        </div>
      </div>

      {/* ✅ CUSTOM END SESSION CONFIRMATION MODAL POPUP */}
      {showEndSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
          {/* Backdrop overlay - semi-transparent */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={cancelEndSession}
          />

          {/* Modal Card - Centered */}
          <div className="relative z-10 bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
            {/* Modal Title */}
            <h3 className="text-xl font-bold text-[#161d36] mb-2 text-center">
              End Session?
            </h3>

            {/* Modal Message */}
            <p className="text-center text-gray-600 text-sm mb-6">
              Your session progress will be saved. Are you sure you want to end?
            </p>

            {/* Buttons Container */}
            <div className="flex gap-3">
              {/* Continue Button */}
              <button
                onClick={cancelEndSession}
                className="flex-1 px-4 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
              >
                Continue
              </button>

              {/* End Session Button */}
              <button
                onClick={confirmEndSession}
                className="flex-1 px-4 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors active:scale-95"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
