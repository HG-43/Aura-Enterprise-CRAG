"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, ChevronDown, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthProvider";
import { SidebarToggle } from "@/components/chat/Sidebar";
import { cn } from "@/lib/utils";

interface TopNavProps {
  title?: string;
  onMenuClick: () => void;
}

export function TopNav({ title, onMenuClick }: TopNavProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isSettings = pathname === "/settings";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const themeIcon =
    theme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : theme === "light" ? (
      <Sun className="h-4 w-4" />
    ) : (
      <Monitor className="h-4 w-4" />
    );

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-glass)] px-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <SidebarToggle onClick={onMenuClick} />
        {isSettings ? (
          <Link
            href="/chat"
            className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to chat
          </Link>
        ) : (
          title && (
            <h1 className="max-w-[200px] truncate text-sm font-semibold text-[var(--text-primary)] sm:max-w-none">
              {title}
            </h1>
          )
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          title="Toggle theme"
        >
          {themeIcon}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[var(--bg-hover)]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full gradient-bg text-xs font-bold text-white">
              {user?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <span className="hidden text-sm text-[var(--text-secondary)] sm:block">{user?.name}</span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-[var(--text-muted)] transition-transform",
                menuOpen && "rotate-180",
              )}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] py-1 shadow-xl">
              <div className="border-b border-[var(--border)] px-4 py-2">
                <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name}</p>
                <p className="truncate text-xs text-[var(--text-muted)]">{user?.email}</p>
              </div>
              <Link
                href="/chat"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                Chats
              </Link>
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              >
                Settings
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
