import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-surface)]">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6">
        <Logo size="sm" />
        <p className="text-xs text-[var(--text-muted)]">
          © {new Date().getFullYear()} Aura Intelligence
        </p>
        <Link href="/signup" className="text-xs font-medium text-[var(--accent)] hover:underline">
          Get started →
        </Link>
      </div>
    </footer>
  );
}
