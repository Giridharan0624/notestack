"use client";
import { useAuth } from "@/context/AuthContext"; import { useRouter } from "next/navigation"; import { useEffect } from "react";
import AuthForm from "@/components/AuthForm"; import Link from "next/link";

export default function SignupPage() {
  const { isAuthenticated, isLoading, signup, confirmSignup } = useAuth(); const router = useRouter();
  useEffect(() => { if (!isLoading && isAuthenticated) router.replace("/dashboard"); }, [isAuthenticated, isLoading, router]);
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="h-9 w-9 rounded-[10px] flex items-center justify-center text-[14px] font-extrabold text-white" style={{ background: "var(--g2)" }}>N</div>
          <span className="text-[18px] font-extrabold tracking-tight">NoteStack</span>
        </div>
        <AuthForm title="Create account" subtitle="Join thousands of students sharing notes" submitLabel="Sign up"
          onSubmit={async (e, p) => { await signup(e, p); }} showConfirmation
          onConfirm={async (e, c) => { await confirmSignup(e, c); router.push("/login"); }}
          footer={<p className="text-[13px] text-center" style={{ color: "var(--fg3)" }}>Already have an account? <Link href="/login" className="font-semibold" style={{ color: "var(--blue)" }}>Sign in</Link></p>} />
      </div>
    </div>
  );
}
