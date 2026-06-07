"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { api, ApiError } from "@/lib/api";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }
    api
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "Verification failed");
      });
  }, [token]);

  return (
    <div className="text-center">
      {status === "loading" && <div className="skeleton mx-auto h-12 w-12 rounded-full" />}
      {status === "success" && (
        <>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-2xl text-green-400">
            ✓
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{message}</p>
          <Link href="/chat" className="mt-6 inline-block text-sm text-[var(--accent)] hover:underline">
            Go to dashboard →
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-2xl text-red-400">
            ✕
          </div>
          <p className="text-sm text-red-400">{message}</p>
          <Link href="/login" className="mt-6 inline-block text-sm text-[var(--accent)] hover:underline">
            Back to sign in
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout title="Email verification" subtitle="Verifying your email address">
      <Suspense fallback={<div className="skeleton h-24 rounded-xl" />}>
        <VerifyEmailForm />
      </Suspense>
    </AuthLayout>
  );
}
