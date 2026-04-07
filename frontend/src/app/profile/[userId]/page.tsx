"use client";
import { useEffect, useState } from "react"; import { useParams } from "next/navigation";
import Header from "@/components/Header"; import PublicNoteCard from "@/components/PublicNoteCard"; import Spinner from "@/components/ui/Spinner";
import { profileApi, feedApi } from "@/lib/api"; import { UserProfile, Note } from "@/lib/types";

const GS = ["var(--g1)","var(--g2)","var(--g3)","var(--g4)","var(--g5)","var(--g6)","var(--g7)","var(--g8)"];
function pick(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h+s.charCodeAt(i))|0; return GS[Math.abs(h)%GS.length]; }

export default function ProfilePage() {
  const { userId } = useParams() as { userId: string };
  const [profile, setProfile] = useState<UserProfile|null>(null); const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { Promise.all([profileApi.get(userId), feedApi.userNotes(userId)]).then(([p,n]) => { setProfile(p); setNotes(n.notes); }).finally(() => setLoading(false)); }, [userId]);

  return (
    <><Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {loading ? <Spinner className="mt-16" /> : profile ? (
          <div className="up">
            {/* Profile banner */}
            <div className="h-32 rounded-t-[var(--r)] relative" style={{ background: pick(profile.userId) }} />
            <div className="bg-white rounded-b-[var(--r)] border border-t-0 border-[var(--border)] px-6 pb-6 pt-0 mb-8 relative" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="h-20 w-20 rounded-full flex items-center justify-center text-[28px] font-extrabold text-white border-4 border-white absolute -top-10" style={{ background: pick(profile.userId) }}>
                {(profile.displayName||"S")[0].toUpperCase()}
              </div>
              <div className="pt-14">
                <h1 className="text-[22px] font-extrabold tracking-tight">{profile.displayName || "Student"}</h1>
                {profile.university && <p className="text-[14px] mt-0.5" style={{ color: "var(--fg3)" }}>{profile.university}</p>}
                {profile.bio && <p className="text-[14px] mt-2 leading-relaxed" style={{ color: "var(--fg2)" }}>{profile.bio}</p>}
                <p className="text-[13px] mt-2 font-semibold" style={{ color: "var(--fg4)" }}>{notes.length} public note{notes.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            {!notes.length ? <p className="text-[14px] py-12 text-center" style={{ color: "var(--fg4)" }}>No public notes yet</p> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{notes.map((n,i) => <PublicNoteCard key={n.noteId} note={n} index={i} />)}</div>
            )}
          </div>
        ) : null}
      </main>
    </>
  );
}
