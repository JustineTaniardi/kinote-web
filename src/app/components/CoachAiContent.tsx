"use client";

import React, { useState, useEffect } from "react";
import { StreakEntry } from "./StreakTypes";
import { useAuth } from "@/lib/hooks/useAuth";

export default function CoachAiContent() {
  const { user } = useAuth();
  const [streaks, setStreaks] = useState<StreakEntry[]>([]);
  const [purposes, setPurposes] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streaksLoading, setStreaksLoading] = useState(true);
  const [purposesLoading, setPurposesLoading] = useState(true);

  // Fetch streaks
  useEffect(() => {
    const fetchStreaks = async () => {
      if (!user) return;
      try {
        setStreaksLoading(true);
        const token = localStorage.getItem("authToken");

        const response = await fetch("/api/ai/career/streaks", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          const formattedStreaks = (data || []).map((streak: any) => ({
            id: streak.id,
            title: streak.title,
            category:
              typeof streak.category === "object"
                ? streak.category?.name || "Unknown"
                : streak.category || "Unknown",
            subcategory: "",
            totalMinutes: streak.totalTime || 0,
            breakTime: `${streak.breakTime || 0} mins`,
            description: streak.description || "",
            lastUpdated: streak.updatedAt,
            status: streak.verified ? "Verified" : "Pending",
            days: [],
          }));

          setStreaks(formattedStreaks);
        }
      } catch (error) {
        console.error("Error fetching streaks:", error);
      } finally {
        setStreaksLoading(false);
      }
    };

    fetchStreaks();
  }, [user]);

  // Fetch purposes
  useEffect(() => {
    const fetchPurposes = async () => {
      if (!user) return;
      try {
        setPurposesLoading(true);
        const token = localStorage.getItem("authToken");

        const response = await fetch("/api/ai/career/purposes", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          let purposesArray: string[] = [];

          if (Array.isArray(data)) {
            purposesArray = data
              .map((item: any) => {
                if (typeof item === "string") return item.trim();

                if (typeof item === "object" && item !== null) {
                  const name =
                    item.name ||
                    item.title ||
                    item.purpose ||
                    item.description;

                  return name ? String(name).trim() : null;
                }
                return null;
              })
              .filter((p): p is string => !!p && p.length > 0);
          }

          setPurposes(purposesArray);
        }
      } catch (error) {
        console.error("Error fetching purposes:", error);
        setPurposes([]);
      } finally {
        setPurposesLoading(false);
      }
    };

    fetchPurposes();
  }, [user]);

  // Toggle streak selection
  const toggleActivitySelection = (id: number) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Start AI Analysis
  const handleStartAI = async () => {
    if (selectedActivities.length === 0 || !selectedGoal) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/ai/career/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          streakIds: selectedActivities,
          purpose: selectedGoal,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Handle the API response which contains analysis object
        if (data.analysis) {
          // Format the analysis object as JSON string for display
          setAiResponse(JSON.stringify(data.analysis, null, 2));
        } else if (typeof data === "string") {
          setAiResponse(data);
        } else {
          setAiResponse(JSON.stringify(data, null, 2));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setAiResponse(
          errorData.message || "Failed to generate AI analysis. Please try again."
        );
      }
    } catch (error) {
      console.error("Error calling AI:", error);
      setAiResponse("Error occurred while generating analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const canStartAI = selectedActivities.length > 0 && selectedGoal;

  // Loading Screen
  if (streaksLoading || purposesLoading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#0f1a31] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Coach...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Coach AI</h1>
        <p className="text-sm text-gray-600">
          Select your streaks and goals to get personalized insights
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto bg-white p-6">
        {/* Streaks */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Streaks
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({selectedActivities.length} selected)
            </span>
          </h2>

          {streaks.length === 0 ? (
            <p className="text-gray-500">No streaks found. Create one first!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {streaks.map((streak) => {
                const isSelected = selectedActivities.includes(streak.id);

                return (
                  <button
                    key={streak.id}
                    onClick={() => toggleActivitySelection(streak.id)}
                    className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-[#161D36] bg-[#161D36]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="absolute top-4 right-4">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-white border-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-[#161D36]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="pr-8">
                      <h3
                        className={`font-semibold mb-1 ${
                          isSelected ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {streak.title}
                      </h3>
                      <p
                        className={`text-sm mb-3 ${
                          isSelected ? "text-gray-200" : "text-gray-600"
                        }`}
                      >
                        {streak.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                          {String(streak.category)}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                          {streak.totalMinutes} min
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Purposes */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Purpose
          </h2>

          {purposes.length === 0 ? (
            <p className="text-gray-500">No purposes available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {purposes.map((purpose, index) => {
                const p = String(purpose).trim();
                const isSelected = selectedGoal.trim() === p;

                return (
                  <button
                    key={`purpose-${index}-${p}`}
                    onClick={() => setSelectedGoal(p)}
                    className={`relative p-6 rounded-xl border-2 transition-all text-center ${
                      isSelected
                        ? "border-[#161D36] bg-[#161D36]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <h3
                      className={`font-semibold text-lg ${
                        isSelected ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {p}
                    </h3>

                    <div
                      className={`mt-4 w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-all ${
                        isSelected
                          ? "bg-white border-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-[#161D36]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Result */}
        {aiResponse && (
          <div className="mt-12">
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🤖 Analisis Coaching Karir AI
              </h2>

              {(() => {
                try {
                  const parsed = JSON.parse(String(aiResponse));
                  return (
                    <div className="space-y-6">
                      {/* Personality Tendencies */}
                      {parsed.personality_tendencies && (
                        <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            👤 Kecenderungan Kepribadian Anda
                          </h3>
                          <p className="text-gray-700">{parsed.personality_tendencies}</p>
                        </div>
                      )}

                      {/* Strengths */}
                      {parsed.strengths && Array.isArray(parsed.strengths) && (
                        <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            💪 Kekuatan Anda
                          </h3>
                          <ul className="list-disc list-inside space-y-1">
                            {parsed.strengths.map((strength: string, idx: number) => (
                              <li key={idx} className="text-gray-700">
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Weaknesses */}
                      {parsed.weaknesses && Array.isArray(parsed.weaknesses) && (
                        <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            🎯 Area untuk Ditingkatkan
                          </h3>
                          <ul className="list-disc list-inside space-y-1">
                            {parsed.weaknesses.map((weakness: string, idx: number) => (
                              <li key={idx} className="text-gray-700">
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommended Options (Dynamic based on purpose) */}
                      {(() => {
                        // Try different field names based on purpose
                        const recommendationFields = [
                          `recommended_${selectedGoal?.toLowerCase()}`,
                          `recommended_${selectedGoal?.toLowerCase().replace(" ", "_")}`,
                          "recommended_careers",
                          "recommended_competitions",
                          "recommended_courses",
                          "recommended_opportunities"
                        ];
                        
                        // Find which field exists in parsed data
                        const foundField = recommendationFields.find(
                          field => parsed[field as keyof typeof parsed] && 
                          Array.isArray(parsed[field as keyof typeof parsed])
                        );
                        
                        const recommendations = foundField 
                          ? parsed[foundField as keyof typeof parsed] as any[]
                          : null;
                        
                        if (!recommendations) return null;

                        const purposeEmojis: { [key: string]: string } = {
                          "Lomba": "🏆",
                          "Pekerjaan": "💼",
                          "Kursus": "🎓"
                        };

                        const purposeTitles: { [key: string]: string } = {
                          "Lomba": "Kompetisi Indonesia",
                          "Pekerjaan": "Peluang Pekerjaan Indonesia",
                          "Kursus": "Kursus & Program Indonesia"
                        };

                        const emoji = purposeEmojis[selectedGoal] || "🎯";
                        const title = purposeTitles[selectedGoal] || "Recommended Opportunities";

                        return (
                          <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              {emoji} {title}
                            </h3>
                            <ul className="list-disc list-inside space-y-2">
                              {recommendations.map(
                                (item: any, idx: number) => {
                                  // Handle both string and object formats
                                  const isObject = typeof item === "object" && item !== null;
                                  const itemTitle = isObject ? item.title || item.name : item;
                                  const itemUrl = isObject ? item.url || item.link : null;
                                  
                                  return (
                                    <li key={idx} className="text-gray-700">
                                      {itemUrl ? (
                                        <a
                                          href={itemUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 underline"
                                        >
                                          {itemTitle}
                                        </a>
                                      ) : (
                                        itemTitle
                                      )}
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                          </div>
                        );
                      })()}

                      {/* Roadmap */}
                      {parsed.roadmap && Array.isArray(parsed.roadmap) && (
                        <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            🗺️ Peta Jalan Tindakan Anda
                          </h3>
                          <ol className="list-decimal list-inside space-y-2">
                            {parsed.roadmap.map((step: string, idx: number) => (
                              <li key={idx} className="text-gray-700">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Recommended Learning */}
                      {parsed.recommended_learning &&
                        Array.isArray(parsed.recommended_learning) && (
                          <div className="bg-white rounded-lg p-4 border-l-4 border-indigo-500">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              📚 Sumber Belajar yang Direkomendasikan
                            </h3>
                            <ul className="list-disc list-inside space-y-2">
                              {parsed.recommended_learning.map(
                                (resource: any, idx: number) => {
                                  // Handle both string and object formats
                                  const isObject = typeof resource === "object" && resource !== null;
                                  const title = isObject ? resource.title || resource.name : resource;
                                  const url = isObject ? resource.url || resource.link : null;
                                  
                                  return (
                                    <li key={idx} className="text-gray-700">
                                      {url ? (
                                        <a
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 underline"
                                        >
                                          {title}
                                        </a>
                                      ) : (
                                        title
                                      )}
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  );
                } catch {
                  // If JSON parsing fails, show raw response
                  return (
                    <div className="bg-white rounded-lg p-4">
                      <pre className="text-sm text-gray-700 overflow-auto max-h-96 whitespace-pre-wrap break-words">
                        {String(aiResponse)}
                      </pre>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="shrink-0 bg-white border-t border-gray-200 p-6">
        <div className="flex gap-3">
          {(selectedActivities.length > 0 ||
            selectedGoal ||
            aiResponse) && (
            <button
              onClick={() => {
                setSelectedActivities([]);
                setSelectedGoal("");
                setAiResponse(null);
              }}
              className="px-6 py-4 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition shadow-sm"
            >
              Clear All
            </button>
          )}

          <button
            onClick={handleStartAI}
            disabled={!canStartAI || isLoading}
            className={`flex-1 px-6 py-4 rounded-lg font-medium transition flex items-center justify-center gap-3 shadow-sm ${
              canStartAI && !isLoading
                ? "bg-[#161D36] text-white hover:bg-[#2a3050]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <span className="text-xl font-light">+</span>
                <span className="font-normal">Start AI</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
