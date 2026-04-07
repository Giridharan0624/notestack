"use client";
import { FormEvent, useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";

interface Props { title: string; subtitle?: string; submitLabel: string; onSubmit: (e: string, p: string) => Promise<void>; footer?: React.ReactNode; showConfirmation?: boolean; onConfirm?: (e: string, c: string) => Promise<void>; }

export default function AuthForm({ title, subtitle, submitLabel, onSubmit, footer, showConfirmation, onConfirm }: Props) {
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [code, setCode] = useState("");
  const [err, setErr] = useState(""); const [loading, setLoading] = useState(false); const [needsCode, setNeedsCode] = useState(false);

  const handle = async (e: FormEvent) => { e.preventDefault(); setErr(""); setLoading(true); try { await onSubmit(email, pw); if (showConfirmation) setNeedsCode(true); } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Error"); } finally { setLoading(false); } };
  const handleCode = async (e: FormEvent) => { e.preventDefault(); setErr(""); setLoading(true); try { await onConfirm?.(email, code); } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Failed"); } finally { setLoading(false); } };

  if (needsCode) return (
    <div className="up">
      <div className="h-12 w-12 rounded-[12px] flex items-center justify-center mb-4 mx-auto" style={{ background: "var(--g4)" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
      <h2 className="text-[20px] font-bold text-center mb-1">Check your email</h2>
      <p className="text-[14px] text-center mb-6" style={{ color: "var(--fg3)" }}>Code sent to <strong>{email}</strong></p>
      <form onSubmit={handleCode} className="flex flex-col gap-3">
        <Input id="code" label="Verification code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" autoFocus required />
        {err && <p className="text-[12px] font-medium" style={{ color: "var(--red)" }}>{err}</p>}
        <Button isLoading={loading} className="w-full">Verify</Button>
      </form>
    </div>
  );

  return (
    <div className="up">
      <h2 className="text-[22px] font-bold mb-1">{title}</h2>
      {subtitle && <p className="text-[14px] mb-6" style={{ color: "var(--fg3)" }}>{subtitle}</p>}
      <form onSubmit={handle} className="flex flex-col gap-3.5">
        <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" required />
        <Input id="password" label="Password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Min 8 characters" minLength={8} required />
        {err && <p className="text-[12px] font-medium" style={{ color: "var(--red)" }}>{err}</p>}
        <Button isLoading={loading} className="w-full mt-1">{submitLabel}</Button>
        {footer && <div className="mt-2">{footer}</div>}
      </form>
    </div>
  );
}
