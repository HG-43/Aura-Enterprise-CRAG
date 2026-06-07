"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const comparisons = [
  { feature: "Corrective RAG grading", aura: true, basic: false },
  { feature: "Automatic web search fallback", aura: true, basic: false },
  { feature: "Source citations", aura: true, basic: false },
  { feature: "Streaming responses", aura: true, basic: true },
  { feature: "Knowledge base indexing", aura: true, basic: true },
  { feature: "Multi-step pipeline visibility", aura: true, basic: false },
];

export function WhyChooseUs() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why teams choose <span className="gradient-text">Aura</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--text-secondary)]">
            Go beyond basic RAG with intelligent correction, transparent sourcing, and production-grade reliability.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-16 overflow-hidden rounded-2xl border border-[var(--border)]"
        >
          <div className="grid grid-cols-3 bg-[var(--bg-elevated)] text-sm font-semibold">
            <div className="p-4 text-[var(--text-muted)]">Feature</div>
            <div className="border-l border-[var(--border)] p-4 text-center gradient-text">Aura Intelligence</div>
            <div className="border-l border-[var(--border)] p-4 text-center text-[var(--text-muted)]">Basic RAG</div>
          </div>
          {comparisons.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-3 border-t border-[var(--border)] ${i % 2 === 0 ? "bg-[var(--bg-surface)]" : ""}`}
            >
              <div className="p-4 text-sm text-[var(--text-secondary)]">{row.feature}</div>
              <div className="flex items-center justify-center border-l border-[var(--border)] p-4">
                {row.aura ? (
                  <Check className="h-5 w-5 text-green-400" />
                ) : (
                  <X className="h-5 w-5 text-[var(--text-muted)]" />
                )}
              </div>
              <div className="flex items-center justify-center border-l border-[var(--border)] p-4">
                {row.basic ? (
                  <Check className="h-5 w-5 text-green-400" />
                ) : (
                  <X className="h-5 w-5 text-[var(--text-muted)]" />
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
