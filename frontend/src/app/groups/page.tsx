"use client";
import { useState, useEffect } from "react"; import { useRouter } from "next/navigation";
import Header from "@/components/Header"; import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button"; import Input from "@/components/ui/Input"; import Modal from "@/components/ui/Modal"; import Spinner from "@/components/ui/Spinner";
import { groupsApi } from "@/lib/api"; import { Group } from "@/lib/types";

const GS = ["var(--g1)","var(--g2)","var(--g3)","var(--g4)","var(--g5)","var(--g6)","var(--g7)","var(--g8)"];
function pick(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h+s.charCodeAt(i))|0; return GS[Math.abs(h)%GS.length]; }

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]); const [loading, setLoading] = useState(true); const [err, setErr] = useState("");
  const [showCreate, setShowCreate] = useState(false); const [name, setName] = useState(""); const [creating, setCreating] = useState(false);

  useEffect(() => { groupsApi.listMine().then(r => setGroups(r.groups)).catch(e => setErr(e.message)).finally(() => setLoading(false)); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const g = await groupsApi.create(name.trim());
      setGroups(p => [g, ...p]); setShowCreate(false); setName("");
      router.push(`/groups/${g.groupId}`);
    } catch (e) { setErr(e instanceof Error ? e.message : "Failed to create group"); }
    finally { setCreating(false); }
  };

  return (
    <ProtectedRoute><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 up">
          <div>
            <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight">Study Groups</h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--fg3)" }}>Collaborate with classmates</p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            New group
          </Button>
        </div>

        {err && <div className="mb-4 text-[13px] px-4 py-3 rounded-xl font-medium" style={{ background: "var(--red-bg)", color: "var(--red)" }}>{err}</div>}

        {loading ? <Spinner className="mt-16" /> : !groups.length ? (
          <div className="flex flex-col items-center py-20 up">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--g6)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <p className="text-[15px] font-semibold mb-1">No groups yet</p>
            <p className="text-[13px]" style={{ color: "var(--fg3)" }}>Create one to start sharing with classmates</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g, i) => (
              <div key={g.groupId} onClick={() => router.push(`/groups/${g.groupId}`)}
                className={`bg-white rounded-2xl overflow-hidden cursor-pointer up d${Math.min(i+1,12)}`}
                style={{ boxShadow: "var(--shadow-card)", transition: "all 0.2s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div className="h-24 relative" style={{ background: pick(g.groupId) }}>
                  <span className="absolute inset-0 flex items-center justify-center text-white/15 text-[32px] font-extrabold select-none">{g.name[0]?.toUpperCase()}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-[14px] font-semibold truncate mb-1">{g.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px]" style={{ color: "var(--fg4)" }}>{g.memberCount} member{g.memberCount !== 1 ? "s" : ""}</span>
                    <span className="text-[12px]" style={{ color: "var(--fg4)" }}>· {new Date(g.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create a study group">
          <div className="flex flex-col gap-4">
            <Input label="Group name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CS101 Study Group" maxLength={50} />
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={handleCreate} isLoading={creating}>Create group</Button>
            </div>
          </div>
        </Modal>
      </main>
    </ProtectedRoute>
  );
}
