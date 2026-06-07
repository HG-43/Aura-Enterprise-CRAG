"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquarePlus,
  Search,
  Settings,
  LogOut,
  X,
  Pencil,
  Trash2,
  Menu,
  MessagesSquare,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/contexts/AuthProvider";
import { api, Chat } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeChatId?: string;
  open: boolean;
  onClose: () => void;
  /** Bump to reload chat list after sending a message etc. */
  refreshTrigger?: number;
}

export function Sidebar({ activeChatId, open, onClose, refreshTrigger = 0 }: SidebarProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const loadChats = useCallback(async () => {
    try {
      setChats(await api.listChats());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadChats();
  }, [loadChats, pathname, refreshTrigger]);

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  const goToChat = (id: string) => {
    router.push(`/chat/${id}`);
    onClose();
  };

  const handleNewChat = () => {
    router.push("/chat");
    onClose();
  };

  const handleDeleteChat = async (id: string) => {
    try {
      await api.deleteChat(id);
      setChats((prev) => prev.filter((c) => c.id !== id));
      if (activeChatId === id) router.push("/chat");
    } catch {
      /* ignore */
    }
  };

  const handleRenameChat = async (id: string, title: string) => {
    try {
      const updated = await api.updateChat(id, title);
      setChats((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch {
      /* ignore */
    }
  };

  const startRename = (chat: Chat) => {
    setRenamingId(chat.id);
    setRenameValue(chat.title);
  };

  const confirmRename = (id: string) => {
    if (renameValue.trim()) handleRenameChat(id, renameValue.trim());
    setRenamingId(null);
  };

  const content = (
    <div className="flex h-full flex-col">
      <Link
        href="/chat"
        onClick={onClose}
        className="flex items-center gap-2.5 border-b border-[var(--border)] p-4 transition-colors hover:bg-[var(--bg-hover)]"
      >
        <Logo size="sm" showText={false} />
        <div>
          <p className="text-sm font-bold text-[var(--text-primary)]">Aura</p>
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Adaptive RAG</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="ml-auto md:hidden text-[var(--text-muted)]"
        >
          <X className="h-5 w-5" />
        </button>
      </Link>

      <div className="p-3">
        <Button onClick={handleNewChat} className="w-full" size="sm">
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats…"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] py-2 pl-9 pr-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Recent
        </p>
        {filtered.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-[var(--text-muted)]">No conversations yet</p>
        ) : (
          filtered.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group relative mb-0.5 rounded-lg transition-colors",
                activeChatId === chat.id ? "bg-[var(--bg-hover)]" : "hover:bg-[var(--bg-hover)]",
              )}
            >
              {renamingId === chat.id ? (
                <div className="flex items-center gap-1 p-2">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmRename(chat.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    className="flex-1 rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => confirmRename(chat.id)}
                    className="text-xs text-[var(--accent)]"
                  >
                    ✓
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => goToChat(chat.id)}
                  className="flex w-full items-center px-3 py-2.5 text-left text-xs text-[var(--text-secondary)]"
                >
                  <span className="truncate flex-1">{chat.title}</span>
                  <div className="ml-1 hidden gap-0.5 group-hover:flex">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(chat);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), startRename(chat))}
                      className="rounded p-1 hover:bg-[var(--bg-elevated)]"
                    >
                      <Pencil className="h-3 w-3" />
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.stopPropagation(), handleDeleteChat(chat.id))
                      }
                      className="rounded p-1 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[var(--border)] p-2">
        <Link
          href="/chat"
          onClick={onClose}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
            pathname.startsWith("/chat") && "bg-[var(--bg-hover)] text-[var(--text-primary)]",
          )}
        >
          <MessagesSquare className="h-4 w-4" />
          Chats
        </Link>
        <Link
          href="/settings"
          onClick={onClose}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
            pathname === "/settings" && "bg-[var(--bg-hover)] text-[var(--text-primary)]",
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-[var(--text-secondary)] transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-full w-64 shrink-0 border-r border-[var(--border)] bg-[var(--bg-surface)] md:flex md:flex-col">
        {content}
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 h-full w-64 border-r border-[var(--border)] bg-[var(--bg-surface)] md:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  );
}
