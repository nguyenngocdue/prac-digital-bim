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
          "max-w-[85%] rounded-lg px-3 py-2 text-xs",
          isUser
            ? "bg-emerald-600 text-white"
            : "bg-zinc-800 text-zinc-300 border border-zinc-700"
        )}
      >
        {message.content}
      </div>
    </div>
  );
};
