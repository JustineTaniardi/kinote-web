"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/hooks/useAuth";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const { verify, error } = useAuth();

  const [isVerifying, setIsVerifying] = useState(!!token);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const verificationMethod = token ? "link" : emailParam ? "code" : null;

  // Resend code state
  const [codeError, setCodeError] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (!token) {
      return;
    }

    const performVerify = async () => {
      const result = await verify({ token });
      setIsVerifying(false);
      if (result) {
        setVerifySuccess(true);
      }
    };

    performVerify();
  }, [token, verify]);

  useEffect(() => {
    if (verifySuccess) {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [verifySuccess, router]);

  // Handle resend countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCountdown > 0) {
      interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCountdown]);

  // Handle resend verification code
  const handleResendCode = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendCountdown(60);
    setCodeError("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailParam }),
      });

      if (!response.ok) {
        const data = await response.json();
        setCodeError(data.message || "Failed to resend code");
        setCanResend(true);
        setResendCountdown(0);
        return;
      }

      setCodeError("");
    } catch {
      setCodeError("Error resending code. Please try again.");
      setCanResend(true);
      setResendCountdown(0);
    }
  };

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden min-h-screen w-full bg-[#0f1a31] flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="mb-12 flex flex-col items-center">
          <Image
            src="/img/logo/logo.png"
            alt="KINOTE"
            width={120}
            height={36}
            priority
            className="h-auto w-[120px] mb-8"
          />
          <h1 className="text-2xl font-bold text-white text-center">
            Verify Email
          </h1>
          <p className="mt-3 text-sm text-white/70 text-center max-w-xs">
            Confirm your email to activate your account
          </p>
        </div>

        {/* Form */}
        <div className="w-full max-w-sm space-y-6">
          {/* CODE VERIFICATION METHOD */}
          {verificationMethod === "code" && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-white">
                  Verify Your Email
                </h2>
                <p className="mt-3 text-sm text-white/70">
                  A verification link will be sent to:
                </p>
                <p className="text-sm font-medium text-white mt-2">
                  {emailParam}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {/* Send Button */}
                <button
                  onClick={handleResendCode}
                  disabled={!canResend}
                  className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-[#0f1a31] hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {canResend
                    ? "Send Verification Email"
                    : `Send again in ${resendCountdown}s`}
                </button>

                {/* Check Email Info */}
                <p className="text-xs text-white/60 text-center">
                  Click the button above to send a verification link to your
                  email. Then open your email and click the link to activate
                  your account.
                </p>
              </div>

              {/* Error Message */}
              {codeError && (
                <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-100">
                  {codeError}
                </div>
              )}
            </div>
          )}

          {/* EMAIL LINK VERIFICATION METHOD */}
          {verificationMethod === "link" && (
            <>
              {/* Loading State */}
              {isVerifying && (
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/30 border-t-white" />
                  <h2 className="text-lg font-semibold text-white">
                    Verifying your email...
                  </h2>
                  <p className="text-sm text-white/70">Please wait</p>
                </div>
              )}

              {/* Success State */}
              {!isVerifying && verifySuccess && (
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/30">
                    <CheckCircleIcon className="h-8 w-8 text-green-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Email Verified!
                  </h2>
                  <p className="text-sm text-white/70 text-center">
                    Your email has been successfully verified
                  </p>
                  <p className="text-xs text-white/50 text-center">
                    Redirecting to dashboard...
                  </p>
                </div>
              )}

              {/* Error State */}
              {!isVerifying && error && (
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/30">
                    <ExclamationCircleIcon className="h-8 w-8 text-red-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Verification Failed
                  </h2>
                  <p className="text-sm text-red-300 text-center">{error}</p>
                  <div className="mt-4 flex gap-3 w-full">
                    <Link
                      href="/login"
                      className="flex-1 rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-[#0f1a31] text-center hover:bg-white/90 transition"
                    >
                      Back to Login
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Links */}
        <div className="absolute bottom-6 left-6 right-6">
          <Link
            href="/"
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
            <div className="relative flex flex-col items-start justify-center bg-[#0f1a31] px-8 py-10 md:px-10 md:py-12 text-white">
              {/* Logo */}
              <Image
                src="/img/auth-page/logo.png"
                alt="KINOTE"
                width={150}
                height={45}
                priority
                className="absolute top-8 left-8 h-auto w-[140px] md:w-[150px]"
              />

              {/* Text */}
              <div className="max-w-[300px]">
                <h2 className="text-[24px] font-semibold leading-snug">
                  Email Verification
                </h2>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  Verify your email to activate your account and continue your
                  productivity journey with Kinote.
                </p>
              </div>

              {/* Home */}
              <div className="absolute bottom-8 left-8">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-[#0f1a31] hover:bg-transparent hover:border-white hover:text-white transition"
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
                  Back to Login
                </Link>
              </div>
            </div>

            {/* Right */}
            <div className="relative bg-white overflow-hidden">
              {/* BgLogo */}
              <div className="absolute inset-0 pointer-events-none">
                <Image
                  src="/img/auth-page/logo_back.png"
                  alt="Kinote back"
                  width={700}
                  height={700}
                  className="absolute -bottom-2.5 -right-2.5 object-contain scale-105 select-none"
                  priority
                />
              </div>

              {/* Sosmed */}
              <div className="absolute right-6 top-6 z-10 flex items-center gap-3">
                <a
                  href="https://www.instagram.com/justinetaniardi/"
                  target="_blank"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#0f1a31] text-white hover:opacity-90 transition"
                >
                  <Image
                    src="/icons/instagram.png"
                    alt="Instagram"
                    width={20}
                    height={20}
                  />
                </a>
                <a
                  href="https://www.linkedin.com/in/justine-taniardi/"
                  target="_blank"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#0f1a31] text-white hover:opacity-90 transition"
                >
                  <Image
                    src="/icons/linkedin.png"
                    alt="LinkedIn"
                    width={20}
                    height={20}
                  />
                </a>
                <a
                  href="https://wa.me/6281258126007"
                  target="_blank"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#0f1a31] text-white hover:opacity-90 transition"
                >
                  <Image
                    src="/icons/whatsapp.png"
                    alt="WhatsApp"
                    width={20}
                    height={20}
                  />
                </a>
              </div>

              {/* Form */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="pointer-events-auto w-[88%] md:w-[460px] rounded-xl bg-white p-6 md:p-7 shadow-[0_20px_80px_rgba(2,6,23,0.12)]">
                  {/* CODE VERIFICATION METHOD */}
                  {verificationMethod === "code" && (
                    <div className="flex flex-col gap-6">
                      <div className="text-center">
                        <h2 className="text-lg font-semibold text-slate-700">
                          Verify Your Email
                        </h2>
                        <p className="mt-3 text-sm text-slate-500">
                          Verify your email address:
                        </p>
                        <p className="text-sm font-medium text-slate-700 mt-2">
                          {emailParam}
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        {/* Send Button */}
                        <button
                          onClick={handleResendCode}
                          disabled={!canResend}
                          className="w-full rounded-lg bg-[#0f1a31] py-2.5 text-sm font-semibold text-white hover:bg-[#101c36] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {canResend
                            ? "Send Verification Email"
                            : `Send again in ${resendCountdown}s`}
                        </button>

                        {/* Check Email Info */}
                        <p className="text-xs text-slate-500 text-center">
                          Click the button above to send a verification link to
                          your email. Then check your email and click the link
                          to activate your account.
                        </p>

                        {/* Back to Login */}
                        <Link
                          href="/login"
                          className="text-center text-sm text-slate-600 hover:text-slate-700 transition"
                        >
                          Back to Login
                        </Link>
                      </div>

                      {/* Error Message */}
                      {codeError && (
                        <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-100">
                          {codeError}
                        </div>
                      )}
                    </div>
                  )}

                  {/* EMAIL LINK VERIFICATION METHOD */}
                  {verificationMethod === "link" && (
                    <>
                      {/* Loading State */}
                      {isVerifying && (
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-[#0f1a31]" />
                          <h2 className="text-lg font-semibold text-slate-700">
                            Verifying your email...
                          </h2>
                          <p className="text-sm text-slate-500">
                            Please wait while we verify your email address
                          </p>
                        </div>
                      )}

                      {/* Success State */}
                      {!isVerifying && verifySuccess && (
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                            <CheckCircleIcon className="h-8 w-8 text-green-600" />
                          </div>
                          <h2 className="text-lg font-semibold text-slate-700">
                            Email Verified!
                          </h2>
                          <p className="text-sm text-slate-500 text-center">
                            Your email has been successfully verified
                          </p>
                          <p className="text-xs text-slate-400 text-center">
                            Redirecting to dashboard...
                          </p>
                        </div>
                      )}

                      {/* Error State */}
                      {!isVerifying && error && (
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                            <ExclamationCircleIcon className="h-8 w-8 text-red-600" />
                          </div>
                          <h2 className="text-lg font-semibold text-slate-700">
                            Verification Failed
                          </h2>
                          <p className="text-sm text-red-600 text-center">
                            {error}
                          </p>
                          <div className="mt-4 flex gap-3 w-full">
                            <Link
                              href="/login"
                              className="flex-1 rounded-md bg-[#0f1a31] px-4 py-2.5 text-sm font-semibold text-white text-center hover:bg-[#101c36] transition"
                            >
                              Back to Login
                            </Link>
                            <Link
                              href="/register"
                              className="flex-1 rounded-md border border-[#0f1a31] px-4 py-2.5 text-sm font-semibold text-[#0f1a31] text-center hover:bg-[#0f1a31] hover:text-white transition"
                            >
                              Back to Register
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Invalid Token State */}
                      {!isVerifying && !verifySuccess && !error && !token && (
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                            <ExclamationCircleIcon className="h-8 w-8 text-yellow-600" />
                          </div>
                          <h2 className="text-lg font-semibold text-slate-700">
                            Invalid Verification Link
                          </h2>
                          <p className="text-sm text-slate-500 text-center">
                            The verification link is missing or expired
                          </p>
                          <div className="mt-4 flex gap-3 w-full">
                            <Link
                              href="/login"
                              className="flex-1 rounded-md bg-[#0f1a31] px-4 py-2.5 text-sm font-semibold text-white text-center hover:bg-[#101c36] transition"
                            >
                              Back to Login
                            </Link>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
