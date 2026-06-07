"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";

const testimonials = [
  {
    quote: "Aura's corrective RAG caught irrelevant retrievals that our old system missed. Answer quality improved dramatically.",
    author: "Sarah Chen",
    role: "Head of AI, Nexus Labs",
    avatar: "SC",
  },
  {
    quote: "The source citations and pipeline visibility give our team confidence in every response. It's production-ready.",
    author: "Marcus Webb",
    role: "CTO, DataForge",
    avatar: "MW",
  },
  {
    quote: "We deployed Aura in a week. The web search fallback alone saved us from countless hallucinated answers.",
    author: "Elena Rodriguez",
    role: "Product Lead, InsightCo",
    avatar: "ER",
  },
];

export function Testimonials() {
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
            Trusted by forward-thinking teams
          </h2>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="flex h-full flex-col">
                <p className="flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-[var(--border)] pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-bg text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{t.author}</p>
                    <p className="text-xs text-[var(--text-muted)]">{t.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
