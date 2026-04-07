"use client";
import { useEffect, useState } from "react"; import { useParams } from "next/navigation";
import Header from "@/components/Header"; import PublicNoteCard from "@/components/PublicNoteCard"; import Button from "@/components/ui/Button"; import Spinner from "@/components/ui/Spinner";
import { profileApi, feedApi, socialApi } from "@/lib/api"; import { UserProfile, UserStats, Note } from "@/lib/types";
import { useAuth } from "@/context/AuthContext"; import { useSocial } from "@/hooks/useSocial";

const GS = ["var(--g1)","var(--g2)","var(--g3)","var(--g4)","var(--g5)","var(--g6)","var(--g7)","var(--g8)"];
function pick(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h+s.charCodeAt(i))|0; return GS[Math.abs(h)%GS.length]; }

export default function ProfilePage() {
  const { userId } = useParams() as { userId: string };
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile|null>(null);
  const [stats, setStats] = useState<UserStats|null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const { status, loadStatus, toggleFollow, toggleLike, toggleBookmark } = useSocial();

  useEffect(() => {
    Promise.all([profileApi.get(userId), profileApi.getStats(userId), feedApi.userNotes(userId)])
      .then(([p, s, n]) => { setProfile(p); setStats(s); setNotes(n.notes); })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (isAuthenticated && notes.length) {
      loadStatus(notes.map(n => n.noteId), [userId]);
    }
  }, [isAuthenticated, notes, userId, loadStatus]);

  const pinnedNotes = notes.filter(n => n.pinned);
  const regularNotes = notes.filter(n => !n.pinned);

  return (
    <><Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {loading ? <Spinner className="mt-16" /> : profile ? (
          <div className="up">
            {/* Banner + profile card */}
            <div className="h-32 rounded-t-[var(--r)] relative" style={{ background: pick(profile.userId) }} />
            <div className="bg-white rounded-b-[var(--r)] border border-t-0 border-[var(--border)] px-6 pb-6 relative mb-6" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="h-20 w-20 rounded-full flex items-center justify-center text-[28px] font-extrabold text-white border-4 border-white absolute -top-10 overflow-hidden" style={{ background: pick(profile.userId) }}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  (profile.displayName||"S")[0].toUpperCase()
                )}
              </div>
              <div className="pt-14 flex items-start justify-between">
                <div>
                  <h1 className="text-[22px] font-extrabold tracking-tight">{profile.displayName || "Student"}</h1>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    {profile.university && <span className="text-[13px]" style={{ color: "var(--fg3)" }}>{profile.university}</span>}
                    {profile.major && <span className="text-[13px]" style={{ color: "var(--fg4)" }}>· {profile.major}</span>}
                    {profile.yearOfStudy && <span className="text-[13px]" style={{ color: "var(--fg4)" }}>· {profile.yearOfStudy}</span>}
                  </div>
                  {profile.bio && <p className="text-[13px] mt-2 leading-relaxed max-w-lg" style={{ color: "var(--fg2)" }}>{profile.bio}</p>}

                  {/* Social links */}
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

                {isAuthenticated && (
                  <Button
                    variant={status.follows[userId] ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => toggleFollow(userId)}
                  >
                    {status.follows[userId] ? "Following" : "Follow"}
                  </Button>
                )}
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

            {/* Pinned notes */}
            {pinnedNotes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-[14px] font-bold mb-3 flex items-center gap-1.5">📌 Pinned</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pinnedNotes.map((n, i) => (
                    <PublicNoteCard key={n.noteId} note={n} index={i}
                      liked={status.likes[n.noteId]} bookmarked={status.bookmarks[n.noteId]}
                      onLike={() => toggleLike(n.noteId)} onBookmark={() => toggleBookmark(n.noteId)} />
                  ))}
                </div>
              </div>
            )}

            {/* All public notes */}
            <h3 className="text-[14px] font-bold mb-3">Public Notes</h3>
            {regularNotes.length === 0 && pinnedNotes.length === 0 ? (
              <p className="text-[13px] py-10 text-center" style={{ color: "var(--fg4)" }}>No public notes yet</p>
            ) : regularNotes.length === 0 ? null : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {regularNotes.map((n, i) => (
                  <PublicNoteCard key={n.noteId} note={n} index={i}
                    liked={status.likes[n.noteId]} bookmarked={status.bookmarks[n.noteId]}
                    onLike={() => toggleLike(n.noteId)} onBookmark={() => toggleBookmark(n.noteId)} />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </main>
    </>
  );
}
