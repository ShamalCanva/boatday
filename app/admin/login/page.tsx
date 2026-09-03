"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Wrong password.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-6 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Boat Day Admin</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-[15px] text-white outline-none placeholder:text-white/50 focus:border-coral"
        />
        {error && <p className="text-[13px] text-coral">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-coral px-6 py-3 text-[15px] font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Checking…" : "Log in"}
        </button>
      </form>
    </main>
  );
}
