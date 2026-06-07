"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Copy, Check, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  streaming?: boolean;
  onRegenerate?: () => void;
}

export function MessageBubble({ role, content, sources, streaming, onRegenerate }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = role === "user";

  return (
    <div className={cn("group flex gap-3 py-4", isUser ? "flex-row-reverse" : "")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg",
          isUser ? "bg-indigo-500/20" : "",
        )}
      >
        {isUser ? (
          <span className="text-sm">👤</span>
        ) : (
          <Logo size="sm" showText={false} className="scale-[0.85]" />
        )}
      </div>
      <div className={cn("max-w-[85%] sm:max-w-[75%]", isUser ? "text-right" : "")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-left",
            isUser
              ? "bg-indigo-500/10 border border-indigo-500/20"
              : "bg-[var(--bg-elevated)] border border-[var(--border)]",
          )}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed text-[var(--text-primary)]">{content}</p>
          ) : (
            <div className="prose-chat text-[var(--text-primary)]">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {content || (streaming ? "▍" : "")}
              </ReactMarkdown>
              {streaming && content && (
                <span className="inline-block h-4 w-0.5 animate-pulse bg-[var(--accent)] ml-0.5" />
              )}
            </div>
          )}
        </div>

        {!isUser && content && !streaming && (
          <div className="mt-2 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon" onClick={handleCopy} className="h-7 w-7">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            {onRegenerate && (
              <Button variant="ghost" size="icon" onClick={onRegenerate} className="h-7 w-7">
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}

        {sources && sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sources.map((source, i) => (
              <span
                key={i}
                className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs text-[var(--accent)]"
                title={source}
              >
                {source.length > 60 ? source.slice(0, 60) + "…" : source}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
