"use client";
import { FormEvent, useState, useEffect } from "react"; import { useRouter } from "next/navigation";
import Header from "@/components/Header"; import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button"; import Input from "@/components/ui/Input"; import Spinner from "@/components/ui/Spinner";
import { useProfile } from "@/hooks/useProfile";

export default function EditProfilePage() {
  const router = useRouter(); const { profile, isLoading, updateProfile } = useProfile();
  const [name, setName] = useState(""); const [uni, setUni] = useState(""); const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false); const [err, setErr] = useState(""); const [saved, setSaved] = useState(false);
  useEffect(() => { if (profile) { setName(profile.displayName||""); setUni(profile.university||""); setBio(profile.bio||""); } }, [profile]);

  const handle = async (e: FormEvent) => { e.preventDefault(); setErr(""); setSaving(true); try { await updateProfile({ displayName: name, university: uni, bio }); setSaved(true); setTimeout(() => setSaved(false), 2000); } catch(e) { setErr(e instanceof Error ? e.message : "Failed"); } finally { setSaving(false); } };

  return (
    <ProtectedRoute><Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-10">
        {isLoading ? <Spinner className="mt-16" /> : (
          <div className="up">
            <div className="flex items-center justify-between mb-6">
              <div><h1 className="text-[24px] font-extrabold tracking-tight">Edit Profile</h1><p className="text-[14px]" style={{ color: "var(--fg3)" }}>How other students see you</p></div>
              {saved && <span className="text-[12px] font-bold px-3 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.08)", color: "var(--green)" }}>Saved ✓</span>}
            </div>
            <form onSubmit={handle} className="bg-white rounded-[var(--r)] p-6 border border-[var(--border)] flex flex-col gap-4" style={{ boxShadow: "var(--shadow-sm)" }}>
              <Input id="name" label="Display name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={50} />
              <Input id="uni" label="University" value={uni} onChange={(e) => setUni(e.target.value)} placeholder="e.g. MIT, Stanford" maxLength={100} />
              <div>
                <label className="text-[13px] font-semibold block mb-1.5" style={{ color: "var(--fg2)" }}>Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell others about yourself..." rows={3} maxLength={500}
                  className="w-full px-4 py-2.5 text-[14px] rounded-[var(--r-sm)] border-2 outline-none resize-y placeholder:text-[var(--fg4)] transition-all"
                  style={{ background: "var(--white)", borderColor: "var(--border)", color: "var(--fg)" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(79,110,247,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
                <p className="text-[11px] mt-1" style={{ color: "var(--fg4)" }}>{bio.length}/500</p>
              </div>
              {err && <p className="text-[12px] font-medium" style={{ color: "var(--red)" }}>{err}</p>}
              <div className="flex gap-2 justify-end"><Button variant="secondary" onClick={() => router.push("/dashboard")}>Cancel</Button><Button isLoading={saving}>Save</Button></div>
            </form>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
