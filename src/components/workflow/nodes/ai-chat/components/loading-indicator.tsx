"use client";

export const LoadingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-400">
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
