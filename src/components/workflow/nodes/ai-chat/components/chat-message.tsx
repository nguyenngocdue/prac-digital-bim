"use client";

import { cn } from "@/lib/utils";
import type { Message } from "../types";

type ChatMessageProps = {
  message: Message;
};

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-2 text-xs",
          isUser
            ? "bg-emerald-500 text-white shadow-[0_10px_20px_rgba(16,185,129,0.25)]"
            : "bg-white/90 text-[var(--workflow-ink)] border border-[var(--workflow-border)]"
        )}
      >
        {message.content}
      </div>
    </div>
  );
};
