"use client";

import { cn } from "@/lib/utils";

const STEPS = [
  { key: "retrieve", label: "Retrieve" },
  { key: "grade_documents", label: "Grade" },
  { key: "web_search_node", label: "Web" },
  { key: "generate_node", label: "Generate" },
];

interface PipelineProgressProps {
  activeStep?: string;
  message?: string;
}

export function PipelineProgress({ activeStep, message }: PipelineProgressProps) {
  const activeIdx = activeStep ? STEPS.findIndex((s) => s.key === activeStep) : -1;

  return (
    <div className="px-4 py-3">
      <div className="flex gap-1 mb-2">
        {STEPS.map((step, i) => (
          <div
            key={step.key}
            title={step.label}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              i < activeIdx
                ? "bg-[var(--accent)]/50"
                : i === activeIdx
                  ? "gradient-bg shadow-sm shadow-purple-500/30"
                  : "bg-[var(--border-strong)]",
            )}
          />
        ))}
      </div>
      {message ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-glass)] px-3 py-1.5 text-xs text-[var(--text-secondary)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
          {message}
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--accent)]"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
