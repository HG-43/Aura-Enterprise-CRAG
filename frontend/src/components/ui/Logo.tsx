"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = { sm: 28, md: 34, lg: 44 };

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const px = sizeMap[size];
  const gradId = useId();

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="shrink-0"
      >
        <rect width="40" height="40" rx="10" fill={`url(#${gradId})`} />
        <circle cx="20" cy="16" r="4" fill="white" fillOpacity="0.95" />
        <circle cx="11" cy="27" r="2.5" fill="white" fillOpacity="0.75" />
        <circle cx="29" cy="27" r="2.5" fill="white" fillOpacity="0.75" />
        <line x1="20" y1="20" x2="11" y2="24.5" stroke="white" strokeWidth="1.5" strokeOpacity="0.85" />
        <line x1="20" y1="20" x2="29" y2="24.5" stroke="white" strokeWidth="1.5" strokeOpacity="0.85" />
        <defs>
          <linearGradient id={gradId} x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#c084fc" />
            <stop offset="0.5" stopColor="#818cf8" />
            <stop offset="1" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
      </svg>
      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight text-[var(--text-primary)]",
            size === "sm" && "text-sm",
            size === "md" && "text-sm",
            size === "lg" && "text-lg",
          )}
        >
          Aura
        </span>
      )}
    </div>
  );
}
