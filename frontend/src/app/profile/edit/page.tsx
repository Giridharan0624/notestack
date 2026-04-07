"use client";
import { FormEvent, useState, useEffect, useRef } from "react"; import { useRouter } from "next/navigation";
import Header from "@/components/Header"; import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button"; import Input from "@/components/ui/Input"; import Spinner from "@/components/ui/Spinner";
import { useProfile } from "@/hooks/useProfile"; import { profileApi, uploadApi } from "@/lib/api";

const YEARS = ["", "Freshman", "Sophomore", "Junior", "Senior", "Graduate"];

export default function EditProfilePage() {
  const router = useRouter(); const { profile, isLoading, updateProfile } = useProfile();
  const [username, setUsername] = useState(""); const [name, setName] = useState(""); const [uni, setUni] = useState(""); const [bio, setBio] = useState("");
  const [year, setYear] = useState(""); const [major, setMajor] = useState("");
  const [linkedin, setLinkedin] = useState(""); const [github, setGithub] = useState(""); const [instagram, setInstagram] = useState("");
  const [saving, setSaving] = useState(false); const [err, setErr] = useState(""); const [saved, setSaved] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string|null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username||""); setName(profile.displayName||""); setUni(profile.university||""); setBio(profile.bio||"");
      setYear(profile.yearOfStudy||""); setMajor(profile.major||"");
      setLinkedin(profile.socialLinks?.linkedin||""); setGithub(profile.socialLinks?.github||""); setInstagram(profile.socialLinks?.instagram||"");
      if (profile.avatarUrl) setAvatarPreview(profile.avatarUrl);
    }
  }, [profile]);

  const handleAvatarUpload = async (file: File) => {
    setUploadingAvatar(true);
    try {
      const { uploadUrl, avatarKey } = await profileApi.getAvatarUploadUrl(file.name, file.type);
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      await profileApi.setAvatar(avatarKey);
      setAvatarPreview(URL.createObjectURL(file));
    } catch (e) { setErr(e instanceof Error ? e.message : "Avatar upload failed"); }
    finally { setUploadingAvatar(false); }
  };

  const handle = async (e: FormEvent) => {
    e.preventDefault(); setErr(""); setSaving(true);
    try {
      const links: Record<string, string> = {};
      if (linkedin) links.linkedin = linkedin; if (github) links.github = github; if (instagram) links.instagram = instagram;
      await updateProfile({ username, displayName: name, university: uni, bio, yearOfStudy: year, major, socialLinks: links });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <ProtectedRoute><Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-10">
        {isLoading ? <Spinner className="mt-16" /> : (
          <div className="up">
            <div className="flex items-center justify-between mb-6">
              <div><h1 className="text-[24px] font-extrabold tracking-tight">Edit Profile</h1><p className="text-[14px]" style={{ color: "var(--fg3)" }}>How other students see you</p></div>
              {saved && <span className="text-[12px] font-bold px-3 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.08)", color: "var(--green)" }}>Saved ✓</span>}
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full overflow-hidden flex items-center justify-center text-[24px] font-extrabold text-white cursor-pointer relative"
                style={{ background: "var(--g1)" }} onClick={() => avatarRef.current?.click()}>
                {avatarPreview ? <img src={avatarPreview} alt="" className="w-full h-full object-cover" /> : (name||"S")[0].toUpperCase()}
                {uploadingAvatar && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Spinner /></div>}
              </div>
              <div>
                <Button variant="secondary" size="sm" onClick={() => avatarRef.current?.click()} disabled={uploadingAvatar}>
                  {uploadingAvatar ? "Uploading..." : "Change photo"}
                </Button>
                <p className="text-[11px] mt-1" style={{ color: "var(--fg4)" }}>PNG, JPEG, WebP · max 2MB</p>
              </div>
              <input ref={avatarRef} type="file" className="hidden" accept="image/png,image/jpeg,image/webp"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); e.target.value = ""; }} />
            </div>

            <form onSubmit={handle} className="bg-white rounded-[var(--r)] p-6 border border-[var(--border)] flex flex-col gap-3.5" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div>
                <Input id="username" label="Username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} placeholder="your_username" maxLength={20} />
                <p className="text-[11px] mt-0.5" style={{ color: "var(--fg4)" }}>3-20 chars, lowercase, numbers, underscores{username && ` · notestack.com/u/${username}`}</p>
              </div>
              <Input id="name" label="Display name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={50} />

              <div className="grid grid-cols-2 gap-3">
                <Input id="uni" label="University" value={uni} onChange={(e) => setUni(e.target.value)} placeholder="e.g. MIT" maxLength={100} />
                <Input id="major" label="Major" value={major} onChange={(e) => setMajor(e.target.value)} placeholder="e.g. Computer Science" maxLength={100} />
              </div>

              <div>
                <label className="text-[13px] font-semibold block mb-1.5" style={{ color: "var(--fg2)" }}>Year of study</label>
                <select value={year} onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2.5 text-[14px] rounded-[var(--r-sm)] border-2 outline-none cursor-pointer"
                  style={{ background: "var(--white)", borderColor: "var(--border)", color: "var(--fg)" }}>
                  <option value="">Select year</option>
                  {YEARS.filter(Boolean).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[13px] font-semibold block mb-1.5" style={{ color: "var(--fg2)" }}>Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell others about yourself..." rows={3} maxLength={500}
                  className="w-full px-4 py-2.5 text-[14px] rounded-[var(--r-sm)] border-2 outline-none resize-y placeholder:text-[var(--fg4)]"
                  style={{ background: "var(--white)", borderColor: "var(--border)", color: "var(--fg)" }} />
                <p className="text-[11px] mt-0.5" style={{ color: "var(--fg4)" }}>{bio.length}/500</p>
              </div>

              <div className="pt-1">
                <label className="text-[13px] font-semibold block mb-2" style={{ color: "var(--fg2)" }}>Social links</label>
                <div className="flex flex-col gap-2">
                  <Input id="github" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/username" />
                  <Input id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" />
                  <Input id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/username" />
                </div>
              </div>

              {err && <p className="text-[12px] font-medium" style={{ color: "var(--red)" }}>{err}</p>}
              <div className="flex gap-2 justify-end pt-1"><Button variant="secondary" onClick={() => router.push("/dashboard")}>Cancel</Button><Button isLoading={saving}>Save</Button></div>
            </form>

            {/* Danger zone */}
            <div className="mt-6 bg-white rounded-[var(--r)] p-6 border border-[var(--border)]" style={{ boxShadow: "var(--shadow-sm)" }}>
              <h3 className="text-[14px] font-bold mb-1" style={{ color: "var(--red)" }}>Danger zone</h3>
              <p className="text-[13px] mb-3" style={{ color: "var(--fg3)" }}>Permanently delete your account and all data</p>
              <Button variant="danger" size="sm" onClick={async () => {
                if (!confirm("Are you sure? This cannot be undone.")) return;
                try {
                  const { default: apiReq } = await import("@/lib/api").then(m => ({ default: m }));
                  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, { method: "DELETE", headers: { Authorization: `Bearer ${(await import("@/lib/auth")).getIdToken()}` } });
                  (await import("@/lib/auth")).signOut();
                  router.replace("/login");
                } catch {}
              }}>Delete my account</Button>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
