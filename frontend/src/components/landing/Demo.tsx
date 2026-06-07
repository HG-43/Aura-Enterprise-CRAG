"use client";

import { motion } from "framer-motion";
import { Search, FileText, Globe, Sparkles } from "lucide-react";

const pipelineSteps = [
  { icon: Search, label: "Retrieve", desc: "Vector search" },
  { icon: FileText, label: "Grade", desc: "Relevance check" },
  { icon: Globe, label: "Web", desc: "Live fallback" },
  { icon: Sparkles, label: "Generate", desc: "AI response" },
];

export function Demo() {
  return (
    <section id="demo" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            See the <span className="gradient-text">CRAG pipeline</span> in action
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--text-secondary)]">
            Watch how Aura retrieves, grades, searches, and generates — with full transparency at every step.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mt-16"
        >
          <div className="mb-8 flex justify-center gap-2 sm:gap-4">
            {pipelineSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2 sm:gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)] sm:h-14 sm:w-14">
                    <step.icon className="h-5 w-5 text-[var(--accent)] sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-xs font-medium text-[var(--text-primary)]">{step.label}</span>
                  <span className="hidden text-xs text-[var(--text-muted)] sm:block">{step.desc}</span>
                </div>
                {i < pipelineSteps.length - 1 && (
                  <div className="mb-6 h-px w-8 bg-gradient-to-r from-[var(--accent)] to-transparent sm:w-16" />
                )}
              </div>
            ))}
          </div>

          <div className="glass mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-2xl">
            <div className="border-b border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <span className="text-xs text-[var(--text-muted)]">Live Demo — CRAG Pipeline</span>
              </div>
            </div>
            <div className="grid gap-0 md:grid-cols-2">
              <div className="border-b border-[var(--border)] p-6 md:border-b-0 md:border-r">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  User Query
                </p>
                <p className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4 text-sm">
                  What is the name of our core cluster and what OS does it run?
                </p>
                <div className="mt-6 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    Pipeline Status
                  </p>
                  {["Searching knowledge base…", "Grading relevance: YES", "Generating response…"].map(
                    (status, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                        {status}
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="p-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Aura Response
                </p>
                <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                  The enterprise core deployment cluster is named <strong>Apollo-X</strong>. It runs on{" "}
                  <strong>Ubuntu 24.04 LTS</strong>.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs text-[var(--accent)]">
                    📄 Internal KB
                  </span>
                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs text-[var(--accent)]">
                    ✓ Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
