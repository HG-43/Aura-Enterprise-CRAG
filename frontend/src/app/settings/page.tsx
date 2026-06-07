"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TopNav } from "@/components/chat/TopNav";
import { Sidebar } from "@/components/chat/Sidebar";
import { useRequireAuth, ApiError } from "@/contexts/AuthProvider";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const { user, refreshUser } = useRequireAuth();
  const { setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setNotifications(user.notifications_enabled);
    }
  }, [user]);

  const saveProfile = async () => {
    setLoading(true);
    setProfileMsg("");
    try {
      await api.updateProfile({ name, notifications_enabled: notifications });
      await refreshUser();
      setProfileMsg("Profile updated successfully");
    } catch (err) {
      setProfileMsg(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async () => {
    setLoading(true);
    setPasswordMsg("");
    try {
      await api.changePassword(currentPassword, newPassword);
      setPasswordMsg("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordMsg(err instanceof ApiError ? err.message : "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTheme = async (theme: string) => {
    setTheme(theme);
    await api.updateProfile({ theme });
    await refreshUser();
  };

  return (
    <div className="flex h-screen bg-[var(--bg-base)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav title="Settings" onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Profile</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">Manage your account information</p>
              <div className="mt-6 space-y-4">
                <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input label="Email" value={user?.email || ""} disabled />
                {!user?.is_verified && (
                  <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-400">
                    Email not verified. Check your inbox or{" "}
                    <button type="button" onClick={() => api.resendVerification()} className="underline">
                      resend verification
                    </button>
                  </div>
                )}
                {profileMsg && (
                  <p className={`text-sm ${profileMsg.includes("success") ? "text-green-400" : "text-red-400"}`}>
                    {profileMsg}
                  </p>
                )}
                <Button onClick={saveProfile} loading={loading}>
                  Save profile
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Change password</h2>
              <div className="mt-6 space-y-4">
                <Input
                  label="Current password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  label="New password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {passwordMsg && (
                  <p className={`text-sm ${passwordMsg.includes("success") ? "text-green-400" : "text-red-400"}`}>
                    {passwordMsg}
                  </p>
                )}
                <Button onClick={savePassword} loading={loading} variant="secondary">
                  Update password
                </Button>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Appearance</h2>
              <div className="mt-6 flex gap-3">
                {(["dark", "light", "system"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTheme(t)}
                    className={`rounded-xl border px-4 py-2.5 text-sm capitalize transition-all ${
                      user?.theme === t
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Notifications</h2>
              <label className="mt-6 flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Email notifications</span>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="h-4 w-4 rounded accent-[var(--accent)]"
                />
              </label>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
