const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aura_token");
}

export function setToken(token: string) {
  localStorage.setItem("aura_token", token);
}

export function clearToken() {
  localStorage.removeItem("aura_token");
}

function parseErrorDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => (typeof item === "object" && item && "msg" in item ? String(item.msg) : String(item)))
      .join(". ");
  }
  return "Request failed";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      "Cannot reach the server. Make sure the backend is running: uvicorn backend.main:app --reload --port 8000",
      0,
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(parseErrorDetail(data.detail) || data.message || "Request failed", res.status);
  }
  return data as T;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  is_verified: boolean;
  theme: string;
  notifications_enabled: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  created_at: string;
}

export interface ChatDetail extends Chat {
  messages: Message[];
}

export const api = {
  register: (email: string, password: string, name: string) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<User>("/api/auth/me"),

  updateProfile: (data: Partial<{ name: string; theme: string; notifications_enabled: boolean }>) =>
    request<User>("/api/auth/profile", { method: "PATCH", body: JSON.stringify(data) }),

  changePassword: (current_password: string, new_password: string) =>
    request<{ message: string }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, new_password: string) =>
    request<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password }),
    }),

  verifyEmail: (token: string) =>
    request<{ message: string }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  resendVerification: () =>
    request<{ message: string }>("/api/auth/resend-verification", { method: "POST" }),

  getGoogleAuthUrl: () => request<{ url: string }>("/api/auth/google"),

  listChats: () => request<Chat[]>("/api/chats"),

  createChat: (title?: string) =>
    request<Chat>("/api/chats", {
      method: "POST",
      body: JSON.stringify({ title: title || "New conversation" }),
    }),

  getChat: (id: string) => request<ChatDetail>(`/api/chats/${id}`),

  updateChat: (id: string, title: string) =>
    request<Chat>(`/api/chats/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }),

  deleteChat: (id: string) =>
    request<{ message: string }>(`/api/chats/${id}`, { method: "DELETE" }),

  sendMessageStream: async function* (
    chatId: string,
    content: string,
    signal?: AbortSignal,
  ): AsyncGenerator<Record<string, unknown>> {
    const token = getToken();
    const res = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
      signal,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(data.detail || "Failed to send message", res.status);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            yield JSON.parse(line.slice(6));
          } catch {
            /* skip malformed */
          }
        }
      }
    }
  },
};
