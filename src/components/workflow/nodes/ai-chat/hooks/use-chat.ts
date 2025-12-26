"use client";

import { useState, useCallback } from "react";
import type { Message } from "../types";

const createMessage = (role: Message["role"], content: string): Message => ({
  id: `${Date.now()}-${role}`,
  role,
  content,
  timestamp: new Date(),
});

export const useChat = (initialMessages: Message[] = []) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string, model: string) => {
      const userMessage = createMessage("user", content);
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            history: messages,
            model,
          }),
        });

        const data = await response.json();
        const assistantMessage = createMessage(
          "assistant",
          data.response || "Sorry, I couldn't respond at this time."
        );

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage = createMessage(
          "assistant",
          "An error occurred while connecting to AI."
        );
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isLoading, sendMessage, clearMessages };
};
