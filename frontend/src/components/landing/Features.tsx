"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Globe,
  Layers,
  Shield,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: Layers,
    title: "Context-Aware Retrieval",
    description: "Semantic search across your knowledge base finds the most relevant documents for every query.",
  },
  {
    icon: Brain,
    title: "CRAG Workflow",
    description: "Corrective RAG grades document relevance and automatically triggers web search when context falls short.",
  },
  {
    icon: Shield,
    title: "Accurate Answers",
    description: "Multi-stage validation ensures responses are factual, relevant, and grounded in verified sources.",
  },
  {
    icon: BookOpen,
    title: "Source Grounding",
    description: "Every answer cites its sources — internal documents and live web results — for full transparency.",
  },
  {
    icon: Zap,
    title: "Fast Responses",
    description: "Optimized pipeline with streaming output delivers answers in seconds, not minutes.",
  },
  {
    icon: Globe,
    title: "Knowledge Management",
    description: "Upload, index, and manage your documents with a powerful vector database backend.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need for <span className="gradient-text">intelligent search</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[var(--text-secondary)]">
            Built on cutting-edge RAG architecture with corrective grading, web fallback, and source attribution.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card hover className="h-full">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                  <feature.icon className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
