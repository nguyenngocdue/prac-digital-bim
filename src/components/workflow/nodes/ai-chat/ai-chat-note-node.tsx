"use client";

import { Handle, Position, NodeResizer } from "@xyflow/react";
import { memo, useState, useCallback, KeyboardEvent, useRef } from "react";
import { Bot, Send, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import { ScrollArea } from "@/components/ui/scroll-area";
import { NodeCloseButton } from "../node-close-button";
import { AI_MODELS, HANDLE_STYLE } from "./constants";
import { useChat } from "./hooks";
import {
  LoadingIndicator,
  ChatMessage,
  EmptyState,
  ModelSelector,
} from "./components";
import type { AIChatNoteNodeProps } from "./types";

export const AIChatNoteNode = memo(
  ({ id, data, selected }: AIChatNoteNodeProps) => {
    const [inputText, setInputText] = useState("");
    const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS[0]);
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { messages, isLoading, sendMessage } = useChat(data.messages);

    const handleSendMessage = useCallback(() => {
      if (!inputText.trim() || isLoading) return;
      sendMessage(inputText.trim(), selectedModel);
      setInputText("");
      // Refocus input after sending
      setTimeout(() => inputRef.current?.focus(), 0);
    }, [inputText, isLoading, sendMessage, selectedModel]);

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          handleSendMessage();
        }
      },
      [handleSendMessage]
    );

    const handleModelSelect = useCallback((model: string) => {
      setSelectedModel(model);
      setShowModelDropdown(false);
    }, []);

    return (
      <div
        className={cn(
          "group relative h-full w-full min-w-[340px] min-h-[280px] rounded-lg border shadow-lg transition-all overflow-hidden flex flex-col",
          selected
            ? "border-emerald-500 shadow-emerald-500/30"
            : "border-emerald-600/50 hover:border-emerald-500"
        )}
      >
        <NodeResizer
          minWidth={340}
          minHeight={280}
          isVisible={selected}
          lineClassName="!border-emerald-500"
          handleClassName="!w-2 !h-2 !bg-emerald-500 !border-emerald-600"
        />

        <NodeCloseButton nodeId={id} variant="emerald" />

        {/* Handles */}
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className={HANDLE_STYLE}
          style={{ left: -6 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className={HANDLE_STYLE}
          style={{ right: -6 }}
        />

        {/* Header */}
        <header className="px-4 py-2.5 flex items-center justify-between bg-emerald-500">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">
              {data.label || "AI Chat"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-xs">Verified</span>
          </div>
        </header>

        {/* Chat Area */}
        <div className="bg-zinc-900 flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <ScrollArea className="flex-1 px-3 py-3">
            <div className="space-y-2">
              {messages.length === 0 ? (
                <EmptyState />
              ) : (
                messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
              )}
              {isLoading && <LoadingIndicator />}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 bg-zinc-800 rounded-lg border border-zinc-700 px-2 py-1.5">
              <ModelSelector
                selectedModel={selectedModel}
                isOpen={showModelDropdown}
                onToggle={() => setShowModelDropdown((prev) => !prev)}
                onSelect={handleModelSelect}
              />

              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question"
                className="flex-1 bg-transparent text-xs text-zinc-300 placeholder:text-zinc-600 outline-none nodrag"
                disabled={isLoading}
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="p-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer className="px-3 pb-2">
            <p className="text-[10px] text-zinc-600 text-center">
              We log queries and responses during AI node usage to improve
              system performance
            </p>
          </footer>
        </div>
      </div>
    );
  }
);

AIChatNoteNode.displayName = "AIChatNoteNode";
