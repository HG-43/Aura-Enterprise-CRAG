"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const { setUserFromToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setUserFromToken(token);
    }
  }, [searchParams, setUserFromToken]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
        <p className="mt-4 text-sm text-[var(--text-muted)]">Signing you in…</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
