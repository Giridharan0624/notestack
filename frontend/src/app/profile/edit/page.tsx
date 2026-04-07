"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import { useProfile } from "@/hooks/useProfile";

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, isLoading, updateProfile } = useProfile();
  const [displayName, setDisplayName] = useState("");
  const [university, setUniversity] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (profile) { setDisplayName(profile.displayName || ""); setUniversity(profile.university || ""); setBio(profile.bio || ""); } }, [profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(""); setIsSaving(true);
    try { await updateProfile({ displayName, university, bio }); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to save"); }
    finally { setIsSaving(false); }
  };

  return (
    <ProtectedRoute>
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-8">
        {isLoading ? <Spinner className="mt-16" /> : (
          <div className="animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Edit Profile</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>how other students see you</p>
              </div>
              {saved && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded" style={{ background: "var(--green-subtle)", color: "var(--green)", fontFamily: "var(--font-mono)" }}>saved</span>}
            </div>

            <form onSubmit={handleSubmit} className="glass p-5 space-y-4" style={{ boxShadow: "var(--shadow-sm)" }}>
              <Input id="displayName" label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" maxLength={50} />
              <Input id="university" label="University" value={university} onChange={(e) => setUniversity(e.target.value)} placeholder="e.g. MIT, Stanford" maxLength={100} />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell others about yourself..." rows={3} maxLength={500}
                  className="w-full px-3.5 py-3 text-sm leading-relaxed resize-y transition-all focus:outline-none"
                  style={{ borderRadius: "var(--radius-md)", border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--text-primary)" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-subtle)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                />
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{bio.length}/500</span>
              </div>
              {error && <div className="text-xs px-3 py-2 rounded-[var(--radius-sm)]" style={{ background: "var(--red-subtle)", color: "var(--red)" }}>{error}</div>}
              <div className="flex gap-2 justify-end pt-1">
                <Button type="button" variant="secondary" onClick={() => router.push("/dashboard")}>Cancel</Button>
                <Button type="submit" isLoading={isSaving}>Save Profile</Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
