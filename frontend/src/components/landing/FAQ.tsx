"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is Corrective RAG (CRAG)?",
    a: "CRAG is an advanced RAG technique that evaluates retrieved documents for relevance before generating a response. If documents don't adequately answer the question, Aura automatically triggers a web search fallback.",
  },
  {
    q: "How does source grounding work?",
    a: "Every response includes citations to the internal documents and web sources used during retrieval. You can verify exactly where each answer came from.",
  },
  {
    q: "Can I upload my own documents?",
    a: "Yes. Aura indexes your documents into a vector database for semantic search. Supported formats include PDF, TXT, and Markdown.",
  },
  {
    q: "Is my data secure?",
    a: "All data is encrypted in transit and at rest. Enterprise plans include SSO, dedicated infrastructure, and custom data retention policies.",
  },
  {
    q: "What models power Aura?",
    a: "Aura uses GPT-4o via OpenRouter for grading and generation, with HuggingFace embeddings for retrieval and Tavily for web search.",
  },
  {
    q: "Can I try Aura for free?",
    a: "Absolutely. The Free plan includes 50 queries per month with full access to source citations and the knowledge base.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
              >
                {faq.q}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="border-t border-[var(--border)] px-5 py-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
