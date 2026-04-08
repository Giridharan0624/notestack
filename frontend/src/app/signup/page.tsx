"use client";
import { useAuth } from "@/context/AuthContext"; import { useRouter } from "next/navigation"; import { useEffect } from "react";
import AuthForm from "@/components/AuthForm"; import Link from "next/link";

export default function SignupPage() {
  const { isAuthenticated, isLoading, signup, confirmSignup } = useAuth(); const router = useRouter();
  useEffect(() => { if (!isLoading && isAuthenticated) router.replace("/dashboard"); }, [isAuthenticated, isLoading, router]);
  return (
    <div className="flex-1 flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] relative overflow-hidden flex-col justify-between p-10" style={{ background: "var(--g1)" }}>
        <div className="absolute top-[-120px] right-[-80px] w-[350px] h-[350px] rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-[280px] h-[280px] rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="absolute top-[35%] left-[40%] w-[180px] h-[180px] rounded-full" style={{ background: "rgba(255,255,255,0.03)" }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-[14px] font-bold" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>N</div>
            <span className="text-[18px] font-bold text-white">NoteStack</span>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-[36px] font-extrabold text-white leading-[1.15] tracking-tight mb-4">
            Share notes.<br/>Learn together.
          </h2>
          <p className="text-[15px] text-white/60 leading-relaxed max-w-xs mb-8">
            Join a growing community of students sharing study materials, forming study groups, and helping each other excel.
          </p>
          <div className="flex gap-8">
            <div><p className="text-[28px] font-extrabold text-white">1K+</p><p className="text-[12px] text-white/40 font-medium">Students</p></div>
            <div><p className="text-[28px] font-extrabold text-white">5K+</p><p className="text-[12px] text-white/40 font-medium">Notes</p></div>
            <div><p className="text-[28px] font-extrabold text-white">200+</p><p className="text-[12px] text-white/40 font-medium">Groups</p></div>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center text-[14px] font-bold text-white" style={{ background: "var(--g1)" }}>N</div>
            <span className="text-[18px] font-bold">NoteStack</span>
          </div>
          <AuthForm title="Create account" subtitle="Start sharing notes with classmates" submitLabel="Create account"
            onSubmit={async (e, p) => { await signup(e, p); }} showConfirmation
            onConfirm={async (e, c) => { await confirmSignup(e, c); router.push("/login"); }}
            footer={
              <p className="text-[13px] text-center pt-1" style={{ color: "var(--fg3)" }}>
                Already have an account? <Link href="/login" className="font-semibold" style={{ color: "var(--blue)" }}>Sign in</Link>
              </p>
            } />
        </div>
      </div>
    </div>
  );
}
