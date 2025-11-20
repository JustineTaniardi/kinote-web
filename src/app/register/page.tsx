"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/hooks/useAuth";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();

  // ✅ Check if user is already logged in and redirect
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // User is already logged in, redirect to /todo
      router.push("/todo");
    }
  }, [router]);

  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setValidationError("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidationError("Invalid email format");
      return;
    }

    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    if (result) {
      setSuccess(
        "Registration successful! Redirecting to login..."
      );
      // Redirect to login page
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } else {
      // Error is already set in the error state from useAuth hook
      // This ensures the error message is displayed
      setValidationError(null);
    }
  };

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen w-full bg-[#0f1a31] flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/img/logo/logo.png"
            alt="KINOTE"
            width={120}
            height={36}
            priority
            className="h-auto w-[120px] mb-8"
          />
          <h1 className="text-2xl font-bold text-white text-center">
            Start Your Journey!
          </h1>
          <p className="mt-3 text-sm text-white/70 text-center max-w-xs">
            Organize your tasks and activities in a more planned way.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Full Name
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 px-4 py-3 focus-within:border-white/50 focus-within:ring-2 focus-within:ring-white/30 transition">
              <UserIcon className="h-5 w-5 text-white/60 shrink-0" />
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/50 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 px-4 py-3 focus-within:border-white/50 focus-within:ring-2 focus-within:ring-white/30 transition">
              <EnvelopeIcon className="h-5 w-5 text-white/60 shrink-0" />
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/50 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 px-4 py-3 focus-within:border-white/50 focus-within:ring-2 focus-within:ring-white/30 transition">
              <LockClosedIcon className="h-5 w-5 text-white/60 shrink-0" />
              <input
                type={showPw ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/50 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="text-white/60 hover:text-white transition disabled:opacity-50"
                disabled={isLoading}
              >
                {showPw ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Confirm Password
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-white/20 bg-white/10 px-4 py-3 focus-within:border-white/50 focus-within:ring-2 focus-within:ring-white/30 transition">
              <LockClosedIcon className="h-5 w-5 text-white/60 shrink-0" />
              <input
                type={showConfirmPw ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/50 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw((s) => !s)}
                className="text-white/60 hover:text-white transition disabled:opacity-50"
                disabled={isLoading}
              >
                {showConfirmPw ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {(validationError || error) && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-4 text-sm text-red-100">
              {validationError || error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="rounded-lg bg-green-500/20 border border-green-500/50 p-4 text-sm text-green-100">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-white text-[#0f1a31] font-semibold rounded-lg hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                <span>Creating Account...</span>
              </>
            ) : (
              "Register"
            )}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm text-white/70">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-white hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>

        {/* Back Button - Top Left */}
        <div className="absolute top-6 left-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition font-medium text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>
        </div>
      </div>

      {/* Desktop View */}
      <section className="hidden md:block relative h-screen overflow-hidden">
        {/* Bg */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/img/auth-page/background.png')" }}
        />

        {/* Wrap */}
        <div className="relative z-10 flex h-full w-full items-center justify-center px-4 md:px-6">
          {/* Board */}
          <div className="relative grid w-full max-w-[1150px] h-[640px] grid-cols-1 overflow-hidden rounded-2xl bg-white/90 shadow-[0_24px_100px_rgba(2,6,23,0.15)] backdrop-blur md:grid-cols-2">
            {/* Left */}
            <div className="relative bg-white overflow-hidden">
              {/* Logo */}
              <Image
                src="/img/logo/logo_dark.png"
                alt="KINOTE"
                width={150}
                height={45}
                priority
                className="absolute top-8 left-8 h-auto w-[140px] md:w-[150px]"
              />

              {/* BgLogo */}
              <div className="absolute inset-0 pointer-events-none">
                <Image
                  src="/img/auth-page/logo_back.png"
                  alt="Kinote back"
                  width={700}
                  height={700}
                  className="absolute -bottom-2.5 -left-2.5 object-contain scale-105 select-none"
                  priority
                />
              </div>

              {/* Home */}
              <div className="absolute bottom-8 left-8">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-md border border-transparent bg-[#0f1a31] px-4 py-2 text-sm font-medium text-white hover:bg-transparent hover:border-[#0f1a31] hover:text-[#0f1a31] transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back
                </Link>
              </div>
            </div>

            {/* Right */}
            <div className="relative flex flex-col items-end justify-center bg-[#0f1a31] px-8 py-10 md:px-10 md:py-12 text-white">
              {/* Text */}
              <div className="max-w-[300px] text-right">
                <h2 className="text-[24px] font-semibold leading-snug">
                  Start Your Journey!
                </h2>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  Organize your tasks and activities in a more planned way.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <form
                onSubmit={handleSubmit}
                className="pointer-events-auto w-[88%] md:w-[460px] rounded-xl bg-white p-6 md:p-7 shadow-[0_20px_80px_rgba(2,6,23,0.12)] space-y-4"
              >
                <h1 className="text-center text-[24px] font-extrabold text-[#0f1a31]">
                  Register
                </h1>

                {/* Name */}
                <label className="block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <div className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200 transition">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Insert your Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full bg-transparent outline-none text-sm placeholder:text-slate-400 disabled:opacity-50"
                  />
                </div>

                {/* Email */}
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200 transition">
                  <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Insert your Email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full bg-transparent outline-none text-sm placeholder:text-slate-400 disabled:opacity-50"
                  />
                </div>

                {/* Password */}
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200 transition">
                  <LockClosedIcon className="h-5 w-5 text-slate-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    name="password"
                    placeholder="Insert your Password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full bg-transparent outline-none text-sm placeholder:text-slate-400 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="text-slate-500 hover:text-slate-700 transition disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {showPw ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Confirm Password */}
                <label className="block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-200 transition">
                  <LockClosedIcon className="h-5 w-5 text-slate-400" />
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full bg-transparent outline-none text-sm placeholder:text-slate-400 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((s) => !s)}
                    className="text-slate-500 hover:text-slate-700 transition disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {showConfirmPw ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {/* Error Message */}
                {(validationError || error) && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                    {validationError || error}
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                    {success}
                  </div>
                )}

                {/* Login Redirect */}
                <p className="text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#0f1a31] hover:underline"
                  >
                    Sign In
                  </Link>
                </p>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-[#0f1a31] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#101c36] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
