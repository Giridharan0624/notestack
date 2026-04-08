"use client";
import { useEffect, useState } from "react"; import { useRouter } from "next/navigation";
import Header from "@/components/Header"; import ProtectedRoute from "@/components/ProtectedRoute";
import PublicNoteCard from "@/components/PublicNoteCard"; import Button from "@/components/ui/Button"; import Spinner from "@/components/ui/Spinner";
import ShareModal from "@/components/ShareModal";
import { profileApi, feedApi } from "@/lib/api"; import { UserProfile, UserStats, Note } from "@/lib/types";
import { useAuth } from "@/context/AuthContext"; import { useSocial } from "@/hooks/useSocial";
import { useNotes } from "@/hooks/useNotes";

const GS = ["var(--g1)","var(--g2)","var(--g3)","var(--g4)","var(--g5)","var(--g6)","var(--g7)","var(--g8)"];
function pick(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h+s.charCodeAt(i))|0; return GS[Math.abs(h)%GS.length]; }

export default function MyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile|null>(null);
  const [stats, setStats] = useState<UserStats|null>(null);
  const [publicNotes, setPublicNotes] = useState<Note[]>([]);
  const { notes: allNotes } = useNotes();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"public"|"all">("all");
  const [shareNoteId, setShareNoteId] = useState<string|null>(null);

  useEffect(() => {
    profileApi.getOwn().then(async (p) => {
      setProfile(p);
      const [s, n] = await Promise.all([profileApi.getStats(p.userId), feedApi.userNotes(p.userId)]);
      setStats(s); setPublicNotes(n.notes);
    }).finally(() => setLoading(false));
  }, []);

  const pinnedNotes = allNotes.filter(n => n.pinned);
  const displayNotes = tab === "all" ? allNotes : publicNotes;

  return (
    <ProtectedRoute><Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {loading || !profile ? <Spinner className="mt-16" /> : (
          <div className="up">
            {/* Banner */}
            <div className="h-36 rounded-t-[var(--r)] relative" style={{ background: pick(profile.userId) }} />
            <div className="bg-white rounded-b-[var(--r)] border border-t-0 border-[var(--border)] px-6 pb-6 relative mb-6" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="h-24 w-24 rounded-full flex items-center justify-center text-[32px] font-extrabold text-white border-4 border-white absolute -top-12 overflow-hidden" style={{ background: pick(profile.userId) }}>
                {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : (profile.displayName||"S")[0].toUpperCase()}
              </div>
              <div className="pt-16 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-[24px] font-extrabold tracking-tight">{profile.displayName || "Student"}</h1>
                    {profile.username && <span className="text-[13px] font-medium" style={{ color: "var(--fg3)" }}>@{profile.username}</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    {profile.university && <span className="text-[13px]" style={{ color: "var(--fg3)" }}>{profile.university}</span>}
                    {profile.major && <span className="text-[13px]" style={{ color: "var(--fg4)" }}>· {profile.major}</span>}
                    {profile.yearOfStudy && <span className="text-[13px]" style={{ color: "var(--fg4)" }}>· {profile.yearOfStudy}</span>}
                  </div>
                  {profile.bio && <p className="text-[13px] mt-2 leading-relaxed max-w-lg" style={{ color: "var(--fg2)" }}>{profile.bio}</p>}

                  {Object.keys(profile.socialLinks || {}).length > 0 && (
                    <div className="flex gap-3 mt-2">
                      {profile.socialLinks.github && <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-[12px] font-semibold" style={{ color: "var(--blue)" }}>GitHub ↗</a>}
                      {profile.socialLinks.linkedin && <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-[12px] font-semibold" style={{ color: "var(--blue)" }}>LinkedIn ↗</a>}
                      {profile.socialLinks.instagram && <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-[12px] font-semibold" style={{ color: "var(--blue)" }}>Instagram ↗</a>}
                    </div>
                  )}

                  <div className="flex gap-4 mt-3 text-[13px]">
                    <span><strong>{profile.followerCount}</strong> <span style={{ color: "var(--fg4)" }}>followers</span></span>
                    <span><strong>{profile.followingCount}</strong> <span style={{ color: "var(--fg4)" }}>following</span></span>
                    <span style={{ color: "var(--fg4)" }}>Joined {new Date(profile.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                  </div>
                </div>

                <Button variant="secondary" onClick={() => router.push("/profile/edit")}>Edit Profile</Button>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white rounded-[var(--r-sm)] border border-[var(--border)] p-4 text-center">
                  <p className="text-[22px] font-extrabold">{stats.totalNotes}</p>
                  <p className="text-[12px]" style={{ color: "var(--fg4)" }}>Notes</p>
                </div>
                <div className="bg-white rounded-[var(--r-sm)] border border-[var(--border)] p-4 text-center">
                  <p className="text-[22px] font-extrabold">{stats.publicNotes}</p>
                  <p className="text-[12px]" style={{ color: "var(--fg4)" }}>Public</p>
                </div>
                <div className="bg-white rounded-[var(--r-sm)] border border-[var(--border)] p-4 text-center">
                  <p className="text-[22px] font-extrabold">{stats.totalLikes}</p>
                  <p className="text-[12px]" style={{ color: "var(--fg4)" }}>Likes</p>
                </div>
              </div>
            )}

            {/* Popular tags */}
            {stats && stats.popularTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="text-[12px] font-semibold self-center mr-1" style={{ color: "var(--fg4)" }}>Popular:</span>
                {stats.popularTags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            )}

            {/* Pinned */}
            {pinnedNotes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[14px] font-bold mb-3">📌 Pinned</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pinnedNotes.map((n, i) => <PublicNoteCard key={n.noteId} note={n} index={i} onShare={() => setShareNoteId(n.noteId)} />)}
                </div>
              </div>
            )}

            {/* Tab switch */}
            <div className="flex items-center gap-1 mb-4">
              {(["all", "public"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="text-[13px] font-semibold px-3 py-1.5 rounded-[var(--r-sm)] cursor-pointer transition-all capitalize"
                  style={{ background: tab === t ? "var(--hover)" : "transparent", color: tab === t ? "var(--fg)" : "var(--fg3)" }}>
                  {t === "all" ? `All Notes · ${allNotes.length}` : `Public · ${publicNotes.length}`}
                </button>
              ))}
            </div>

            {/* Notes grid */}
            {displayNotes.length === 0 ? (
              <p className="text-[13px] py-10 text-center" style={{ color: "var(--fg4)" }}>No notes yet</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayNotes.map((n, i) => <PublicNoteCard key={n.noteId} note={n} index={i} onShare={() => setShareNoteId(n.noteId)} />)}
              </div>
            )}
          </div>
        )}
        {shareNoteId && <ShareModal isOpen={!!shareNoteId} onClose={() => setShareNoteId(null)} noteId={shareNoteId} />}
      </main>
    </ProtectedRoute>
  );
}
