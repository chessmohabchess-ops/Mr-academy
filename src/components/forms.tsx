"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = { error?: string; success?: string };

async function sendJson(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ? JSON.stringify(data.error) : "Request failed");
  return data;
}

export function RegisterForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>({});
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setState({});
        const form = new FormData(event.currentTarget);
        try {
          await sendJson("/api/auth/register", Object.fromEntries(form.entries()));
          setState({ success: "تم إنشاء الحساب بنجاح" });
          router.refresh();
        } catch (error) {
          setState({ error: error instanceof Error ? error.message : "فشل إنشاء الحساب" });
        } finally {
          setLoading(false);
        }
      }}
    >
      <input name="fullName" placeholder="الاسم الثلاثي" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3" required />
      <input name="studentPhone" placeholder="رقم هاتف الطالب" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3" required />
      <input name="parentPhone" placeholder="رقم هاتف ولي الأمر" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3" required />
      <input name="motherPhone" placeholder="رقم هاتف الأم" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3" required />
      <input name="email" type="email" placeholder="البريد الإلكتروني (اختياري)" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3" />
      <input name="password" type="password" placeholder="كلمة المرور" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3" required />
      <button disabled={loading} className="rounded-2xl bg-cyan-400 px-4 py-3 font-bold text-slate-950">{loading ? "جارٍ الإنشاء..." : "إنشاء حساب"}</button>
      {state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-300">{state.success}</p> : null}
    </form>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>({});
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setState({});
        const form = new FormData(event.currentTarget);
        try {
          const result = await sendJson("/api/auth/login", Object.fromEntries(form.entries()));
          router.push(result.role === "admin" ? "/admin" : "/dashboard");
          router.refresh();
        } catch (error) {
          setState({ error: error instanceof Error ? error.message : "فشل تسجيل الدخول" });
        } finally {
          setLoading(false);
        }
      }}
    >
      <input name="studentPhone" placeholder="رقم هاتف الطالب" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3" required />
      <input name="password" type="password" placeholder="كلمة المرور" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3" required />
      <button disabled={loading} className="rounded-2xl bg-white px-4 py-3 font-bold text-slate-950">{loading ? "جارٍ الدخول..." : "تسجيل الدخول"}</button>
      {state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
    </form>
  );
}
