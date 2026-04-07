export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="h-7 w-7 rounded-full border-[2.5px] border-[var(--border)] border-t-[var(--accent)]"
        style={{ animation: "spin 0.7s linear infinite" }}
      />
    </div>
  );
}
