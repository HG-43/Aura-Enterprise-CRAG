"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { PipelineProgress } from "@/components/chat/PipelineProgress";
import { TopNav } from "@/components/chat/TopNav";
import { Sidebar } from "@/components/chat/Sidebar";
import { useRequireAuth } from "@/contexts/AuthProvider";
import { api, Message } from "@/lib/api";

export default function ChatDetailPage() {
  const params = useParams();
  const chatId = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatTitle, setChatTitle] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");
  const [pipelineStep, setPipelineStep] = useState<string | undefined>();
  const [pipelineMsg, setPipelineMsg] = useState<string | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatRefresh, setChatRefresh] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!user || !chatId) return;
    api
      .getChat(chatId)
      .then((chatDetail) => {
        setMessages(chatDetail.messages);
        setChatTitle(chatDetail.title);
      })
      .catch(() => router.push("/chat"))
      .finally(() => setLoading(false));
  }, [user, chatId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamContent]);

  const sendMessage = async (content: string) => {
    const userMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);
    setStreamContent("");

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
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: fullContent,
          sources,
          created_at: new Date().toISOString(),
        },
      ]);
      setStreamContent("");
      setChatRefresh((n) => n + 1);
      if (chatTitle === "New conversation") {
        setChatTitle(content.slice(0, 60) + (content.length > 60 ? "…" : ""));
      }
    } catch {
      /* aborted or error */
    } finally {
      setStreaming(false);
      setPipelineStep(undefined);
      abortRef.current = null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--bg-base)]">
      <Sidebar
        activeChatId={chatId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        refreshTrigger={chatRefresh}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav title={chatTitle} onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} role={msg.role} content={msg.content} sources={msg.sources} />
            ))}
            {streaming && (
              <>
                {(pipelineStep || !streamContent) && (
                  <PipelineProgress activeStep={pipelineStep} message={pipelineMsg} />
                )}
                {streamContent && <MessageBubble role="assistant" content={streamContent} streaming />}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>
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
