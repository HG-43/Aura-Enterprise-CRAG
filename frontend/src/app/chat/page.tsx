"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { PipelineProgress } from "@/components/chat/PipelineProgress";
import { TopNav } from "@/components/chat/TopNav";
import { Sidebar } from "@/components/chat/Sidebar";
import { Logo } from "@/components/ui/Logo";
import { useRequireAuth } from "@/contexts/AuthProvider";
import { api, Message } from "@/lib/api";

const SUGGESTIONS = [
  "What are the key differences between RAG and fine-tuning?",
  "Summarize the main concepts from my knowledge base.",
  "What happened in AI research this week?",
  "Explain corrective RAG in simple terms.",
];

export default function ChatPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const router = useRouter();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [pipelineStep, setPipelineStep] = useState<string | undefined>();
  const [pipelineMsg, setPipelineMsg] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatRefresh, setChatRefresh] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamContent, scrollToBottom]);

  useEffect(() => {
    if (user) setChatRefresh((n) => n + 1);
  }, [user]);

  const sendMessage = async (content: string) => {
    let chatId = activeChatId;
    if (!chatId) {
      const chat = await api.createChat();
      chatId = chat.id;
      setActiveChatId(chatId);
      router.push(`/chat/${chatId}`);
    }

    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);
    setStreamContent("");
    setPipelineStep(undefined);
    setPipelineMsg(undefined);

    abortRef.current = new AbortController();

    try {
      let fullContent = "";
      let sources: string[] = [];

      for await (const event of api.sendMessageStream(chatId, content, abortRef.current.signal)) {
        if (event.type === "pipeline_step") {
          setPipelineStep(event.step as string);
          setPipelineMsg(event.message as string);
        } else if (event.type === "token") {
          fullContent += event.content as string;
          setStreamContent(fullContent);
        } else if (event.type === "done") {
          fullContent = (event.content as string) || fullContent;
          sources = (event.sources as string[]) || [];
        } else if (event.type === "error") {
          fullContent = `Error: ${event.message}`;
        }
      }

      const assistantMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: fullContent,
        sources,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamContent("");
      setChatRefresh((n) => n + 1);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setStreaming(false);
      setPipelineStep(undefined);
      setPipelineMsg(undefined);
      abortRef.current = null;
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  const chatTitle = activeChatId ? "Conversation" : undefined;

  return (
    <div className="flex h-screen bg-[var(--bg-base)]">
      <Sidebar
        activeChatId={activeChatId || undefined}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        refreshTrigger={chatRefresh}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav title={chatTitle} onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !streaming ? (
            <div className="flex h-full flex-col items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="mx-auto mb-6 flex justify-center">
                  <Logo size="lg" showText={false} />
                </div>
                <h2 className="text-2xl font-bold gradient-text">Aura</h2>
                <p className="mt-2 text-[var(--text-secondary)]">How can I help you today?</p>
              </motion.div>
              <div className="mt-10 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                {SUGGESTIONS.map((s, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => sendMessage(s)}
                    className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-left text-sm text-[var(--text-secondary)] transition-all hover:border-[var(--accent)] hover:text-[var(--text-primary)] hover:-translate-y-0.5"
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl px-4 py-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} role={msg.role} content={msg.content} sources={msg.sources} />
              ))}
              {streaming && (
                <>
                  {(pipelineStep || !streamContent) && (
                    <PipelineProgress activeStep={pipelineStep} message={pipelineMsg} />
                  )}
                  {streamContent && (
                    <MessageBubble role="assistant" content={streamContent} streaming />
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <ChatInput
          onSend={sendMessage}
          onStop={() => abortRef.current?.abort()}
          disabled={streaming}
          streaming={streaming}
        />
      </div>
    </div>
  );
}
