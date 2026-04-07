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
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="h-9 w-9 rounded-[10px] flex items-center justify-center text-[14px] font-extrabold text-white" style={{ background: "var(--g1)" }}>N</div>
          <span className="text-[18px] font-extrabold tracking-tight">NoteStack</span>
        </div>

        {done ? (
          <div className="up text-center">
            <div className="text-3xl mb-3">✅</div>
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
  );
}
