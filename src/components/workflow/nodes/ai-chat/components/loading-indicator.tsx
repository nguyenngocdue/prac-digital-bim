"use client";

export const LoadingIndicator = () => (
  <div className="flex justify-start">
    <div className="rounded-xl border border-[var(--workflow-border)] bg-white/90 px-3 py-2 text-xs text-[var(--workflow-muted)]">
      <div className="flex gap-1">
        {[0, 0.1, 0.2].map((delay) => (
          <span
            key={delay}
            className="animate-bounce"
            style={{ animationDelay: `${delay}s` }}
          >
            ●
          </span>
        ))}
      </div>
    </div>
  </div>
);
