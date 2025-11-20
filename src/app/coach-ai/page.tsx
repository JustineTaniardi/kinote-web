"use client";

import Sidebar from "../components/Sidebar";
import CoachAiContent from "../components/CoachAiContent";

export default function CoachAiPage() {
  return (
    <div className="flex h-screen w-full bg-[#F8FAFB]">
      <Sidebar />
      <CoachAiContent />
    </div>
  );
}
