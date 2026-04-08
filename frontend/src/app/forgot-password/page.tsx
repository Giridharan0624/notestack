"use client";
import { useState, FormEvent } from "react"; import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button"; import Input from "@/components/ui/Input";
import { forgotPassword, confirmNewPassword } from "@/lib/auth";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [code, setCode] = useState(""); const [newPw, setNewPw] = useState("");
  const [step, setStep] = useState<"email"|"code">("email");
  const [loading, setLoading] = useState(false); const [err, setErr] = useState(""); const [done, setDone] = useState(false);

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await forgotPassword(email); setStep("code"); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try { await confirmNewPassword(email, code, newPw); setDone(true); setTimeout(() => router.push("/login"), 2000); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex-1 flex min-h-screen">
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-end p-10" style={{ background: "var(--g3)" }}>
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="absolute bottom-[-50px] left-[-80px] w-[300px] h-[300px] rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-[12px] flex items-center justify-center text-[16px] font-extrabold" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>N</div>
            <span className="text-[20px] font-extrabold text-white tracking-tight">NoteStack</span>
          </div>
          <h2 className="text-[32px] font-extrabold text-white leading-tight mb-4 tracking-tight">Don&apos;t worry,<br />we got you.</h2>
          <p className="text-[15px] text-white/70 leading-relaxed max-w-sm">Reset your password and get back to sharing notes with your classmates.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-[10px] flex items-center justify-center text-[14px] font-extrabold text-white" style={{ background: "var(--g3)" }}>N</div>
            <span className="text-[18px] font-extrabold tracking-tight">NoteStack</span>
          </div>

          {done ? (
            <div className="up text-center">
              <div className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(16,185,129,0.08)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--green)" }}><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h2 className="text-[20px] font-bold mb-1">Password reset!</h2>
              <p className="text-[14px]" style={{ color: "var(--fg3)" }}>Redirecting to login...</p>
            </div>
          ) : step === "email" ? (
            <div className="up">
              <h2 className="text-[22px] font-bold mb-1">Reset password</h2>
              <p className="text-[14px] mb-6" style={{ color: "var(--fg3)" }}>We&apos;ll send a code to your email</p>
              <form onSubmit={handleSendCode} className="flex flex-col gap-3.5">
                <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu" required />
                {err && <p className="text-[12px]" style={{ color: "var(--red)" }}>{err}</p>}
                <Button isLoading={loading} className="w-full">Send code</Button>
                <p className="text-[13px] text-center" style={{ color: "var(--fg3)" }}>
                  <Link href="/login" className="font-semibold" style={{ color: "var(--blue)" }}>Back to sign in</Link>
                </p>
              </form>
            </div>
          ) : (
            <div className="up">
              <h2 className="text-[22px] font-bold mb-1">Enter code</h2>
              <p className="text-[14px] mb-6" style={{ color: "var(--fg3)" }}>Code sent to <strong>{email}</strong></p>
              <form onSubmit={handleReset} className="flex flex-col gap-3.5">
                <Input id="code" label="Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" required />
                <Input id="newpw" label="New password" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min 8 characters" minLength={8} required />
                {err && <p className="text-[12px]" style={{ color: "var(--red)" }}>{err}</p>}
                <Button isLoading={loading} className="w-full">Reset password</Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
