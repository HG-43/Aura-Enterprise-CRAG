import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  hover = false,
}: {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6",
        hover && "transition-all duration-300 hover:border-[var(--border-strong)] hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20",
        className,
      )}
    >
      {children}
    </div>
  );
}
