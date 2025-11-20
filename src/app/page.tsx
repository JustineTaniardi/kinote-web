"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import Header from "./components/Header";
import Content from "./components/Content";
import Footer from "./components/Footer";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth loading to complete
    if (isLoading) return;

    // If user is logged in, redirect to streak page
    if (user) {
      router.push("/streak");
    }
  }, [user, isLoading, router]);

  // Always render landing page (useEffect redirects if logged in)
  // This prevents hydration mismatch from conditional rendering
  return (
    <>
      <Header />
      <main className="pt-20">
        <Content />
        <Footer />
      </main>
    </>
  );
}
