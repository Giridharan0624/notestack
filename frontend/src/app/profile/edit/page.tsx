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
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setUniversity(profile.university || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      await updateProfile({ displayName, university, bio });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
        {isLoading ? (
          <Spinner className="mt-16" />
        ) : (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2
                  className="text-3xl font-semibold tracking-tight"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                >
                  Edit Profile
                </h2>
                <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
                  This is how other students will see you
                </p>
              </div>
              {success && (
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full animate-fade-in"
                  style={{ background: "var(--success-light)", color: "var(--success)" }}
                >
                  Saved
                </span>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6 sm:p-8"
              style={{
                background: "var(--bg-card)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <Input
                id="displayName"
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                maxLength={50}
              />

              <Input
                id="university"
                label="University / College"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. MIT, Stanford, UCLA"
                maxLength={100}
              />

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="bio"
                  className="text-sm font-medium tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell other students about yourself..."
                  rows={4}
                  maxLength={500}
                  className="w-full px-3.5 py-3 text-sm leading-relaxed resize-y transition-all"
                  style={{
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-body)",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-light)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {bio.length}/500
                </span>
              </div>

              {error && (
                <div
                  className="text-sm px-3 py-2 rounded-[var(--radius-sm)]"
                  style={{ background: "var(--danger-light)", color: "var(--danger)" }}
                >
                  {error}
                </div>
              )}

              <div className="flex gap-2.5 justify-end pt-2">
                <Button type="button" variant="secondary" onClick={() => router.push("/dashboard")}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  Save Profile
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
