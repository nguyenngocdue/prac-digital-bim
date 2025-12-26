"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
};

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Hello! How can I assist you today? If you have questions about the building model, feel free to ask.",
    sender: "ai",
    timestamp: new Date(),
  },
];

export function AIChatPanel() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [suggestions] = useState([
    "Can you help me track elements?",
    "How many windows?",
  ]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand you're asking about tracking elements. There are 9 items.\n\nCount: 9 items",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="flex h-[480px] flex-col">
      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                message.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-200"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="space-y-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => setInput(suggestion)}
                className="w-full rounded-lg border border-emerald-700/30 bg-emerald-900/20 px-3 py-2 text-left text-xs text-emerald-400 transition-colors hover:bg-emerald-900/30"
              >
                {suggestion}
              </button>
            ))}
            <div className="mt-3 rounded-lg border border-zinc-700/50 bg-zinc-800/50 p-2">
              <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                <span className="text-xs">📋</span>
                <span>Count: 9 items</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-emerald-700/30 bg-zinc-800/50 p-3">
        <div className="flex items-center gap-2">
          <select className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-[10px] text-zinc-400">
            <option>gpt-o-mini</option>
          </select>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question"
            className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded bg-emerald-600 p-1.5 text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
          >
            <Send className="h-3 w-3" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between text-[9px] text-zinc-500">
          <div className="flex items-center gap-1">
            <button className="rounded bg-emerald-600/20 px-2 py-1 text-emerald-400 hover:bg-emerald-600/30">
              Send Data ↓
            </button>
            <button className="rounded bg-blue-600/20 px-2 py-1 text-blue-400 hover:bg-blue-600/30">
              Verified
            </button>
            <button className="rounded bg-violet-600/20 px-2 py-1 text-violet-400 hover:bg-violet-600/30">
              Save SQLite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
