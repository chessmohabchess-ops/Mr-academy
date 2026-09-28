import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-950 text-slate-50">{children}</div>;
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/10 backdrop-blur", className)}>{children}</div>;
}

export function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {description ? <p className="text-sm text-slate-300">{description}</p> : null}
    </div>
  );
}

export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warn" | "danger" }) {
  const toneClass = {
    default: "bg-white/10 text-slate-200",
    success: "bg-emerald-500/15 text-emerald-300",
    warn: "bg-amber-500/15 text-amber-300",
    danger: "bg-rose-500/15 text-rose-300",
  }[tone];
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", toneClass)}>{children}</span>;
}

export function AppButton({ href, children, className }: { href?: string; children: ReactNode; className?: string }) {
  const styles = cn("inline-flex items-center justify-center rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-300", className);
  return href ? <Link href={href} className={styles}>{children}</Link> : <button className={styles} type="button">{children}</button>;
}
