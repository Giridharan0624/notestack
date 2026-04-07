export default function Spinner({ className = "" }: { className?: string }) {
  return <div className={`flex items-center justify-center ${className}`}><div className="h-6 w-6 rounded-full border-[3px] border-[var(--border)] border-t-[var(--blue)]" style={{ animation: "spin 0.7s linear infinite" }} /></div>;
}
