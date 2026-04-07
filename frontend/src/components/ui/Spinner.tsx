export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <div
          className="h-8 w-8 rounded-full border-[2.5px] border-[var(--border)]"
        />
        <div
          className="absolute inset-0 h-8 w-8 rounded-full border-[2.5px] border-transparent border-t-[var(--accent)]"
          style={{ animation: "spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite" }}
        />
      </div>
    </div>
  );
}
