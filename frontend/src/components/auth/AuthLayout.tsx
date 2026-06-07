"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ambient-bg relative flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex justify-center">
            <Logo size="lg" />
          </Link>
          <h1 className="mt-8 text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{subtitle}</p>
        </div>
        <div className="glass rounded-2xl p-8 shadow-xl">{children}</div>
      </motion.div>
    </div>
  );
}
