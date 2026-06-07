"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center pt-16">
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 flex justify-center">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Ask smarter with{" "}
            <span className="gradient-text">corrective RAG</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--text-secondary)]">
            Retrieve from your knowledge base, grade relevance, fall back to web search when needed,
            and get answers grounded in real sources.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="secondary" size="lg">
                Learn More
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
