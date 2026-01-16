"use client";

import { Handle, Position, NodeResizer } from "@xyflow/react";
import { memo, useState, useCallback, KeyboardEvent, useRef } from "react";
import { Bot, Send, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

import { ScrollArea } from "@/components/ui/scroll-area";
import { NodeCloseButton } from "../node-close-button";
import { NodeExecutionBadge } from "../node-execution-badge";
import { AI_MODELS } from "./constants";
import { useChat } from "./hooks";
import {
  LoadingIndicator,
  ChatMessage,
  ModelSelector,
} from "./components";
import { useWorkflow } from "../../workflow-provider";
import type { AIChatNoteNodeProps } from "./types";

export const AIChatNoteNode = memo(
  ({ id, data, selected }: AIChatNoteNodeProps) => {
    const [inputText, setInputText] = useState("");
    const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS[0]);
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { getNodeStatus, executionState } = useWorkflow();
    const executionStatus = getNodeStatus(id);
    const nodeState = executionState.nodeStates[id];

    const { messages, isLoading, sendMessage } = useChat(data.messages);

    const handleSendMessage = useCallback(() => {
      if (!inputText.trim() || isLoading) return;
      sendMessage(inputText.trim(), selectedModel);
      setInputText("");
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

    const statusStyles = {
      idle: "",
      pending: "ring-2 ring-amber-400/40",
      running: "ring-2 ring-sky-400/40 animate-pulse",
      success: "ring-2 ring-emerald-400/40",
      error: "ring-2 ring-rose-400/40",
      skipped: "opacity-70",
    };

    return (
      <div
        className={cn(
          "group relative h-full w-full min-w-[360px] min-h-[320px] rounded-2xl border border-[var(--workflow-border)] shadow-[0_12px_30px_var(--workflow-shadow)] transition-all flex flex-col bg-[var(--workflow-panel)]",
          selected
            ? "border-emerald-400 ring-2 ring-emerald-400/20"
            : "hover:border-emerald-300",
          statusStyles[executionStatus]
        )}
      >
        <NodeResizer
          minWidth={360}
          minHeight={320}
          isVisible={selected}
          lineClassName="!border-emerald-300"
          handleClassName="!w-2.5 !h-2.5 !bg-emerald-500 !border-emerald-200 !rounded-full"
        />

        <NodeCloseButton nodeId={id} variant="emerald" />
        <NodeExecutionBadge 
          status={executionStatus} 
          duration={nodeState?.duration} 
        />

        {/* Handles - Input (Left) */}
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          className="!w-4 !h-4 !bg-emerald-500 !border-[3px] !border-emerald-200 hover:!scale-110 transition-transform !rounded-full"
          style={{ left: -8, top: "50%" }}
        />
        
        {/* Handles - Output (Right) */}
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="!w-4 !h-4 !bg-emerald-500 !border-[3px] !border-emerald-200 hover:!scale-110 transition-transform !rounded-full"
          style={{ right: -8, top: "50%" }}
        />

        {/* Header */}
        <header className="px-4 py-3 flex items-center justify-between bg-[var(--workflow-accent)] rounded-t-[14px]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-2xl">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                {data.label || "AI Chat"}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/80">Powered by AI</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span className="text-[10px] font-medium text-white">Pro</span>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <ScrollArea className="flex-1 px-3 py-3">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-[var(--workflow-muted)]">
                  <div className="p-3 bg-[var(--workflow-panel-strong)] rounded-full mb-3">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-[var(--workflow-ink)]">Start a conversation</p>
                  <p className="text-[10px] text-[var(--workflow-muted)] mt-1">Ask anything to get started</p>
                </div>
              ) : (
                messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
              )}
              {isLoading && <LoadingIndicator />}
            </div>
          </ScrollArea>

          {/* Model Selector */}
          <div className="px-3 pb-2">
            <ModelSelector
              selectedModel={selectedModel}
              isOpen={showModelDropdown}
              onToggle={() => setShowModelDropdown((prev) => !prev)}
              onSelect={handleModelSelect}
            />
          </div>

          {/* Input Area */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2 bg-white/80 rounded-xl border border-[var(--workflow-border)] px-3 py-2 focus-within:border-emerald-300 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-transparent text-sm text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)] outline-none nodrag"
                disabled={isLoading}
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  inputText.trim() && !isLoading
                    ? "bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/25"
                    : "bg-[var(--workflow-border)] cursor-not-allowed"
                )}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer className="px-3 pb-2 border-t border-[var(--workflow-border)] pt-2">
            <p className="text-[9px] text-[var(--workflow-muted)] text-center">
              AI responses may not always be accurate. Verify important information.
            </p>
          </footer>
        </div>
      </div>
    );
  }
);

AIChatNoteNode.displayName = "AIChatNoteNode";
