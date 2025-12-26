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
  EmptyState,
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
      pending: "ring-2 ring-yellow-400/50",
      running: "ring-2 ring-blue-400/50 animate-pulse",
      success: "ring-2 ring-green-400/50",
      error: "ring-2 ring-red-400/50",
      skipped: "opacity-60",
    };

    return (
      <div
        className={cn(
          "group relative h-full w-full min-w-[360px] min-h-[320px] rounded-xl border-2 shadow-xl transition-all flex flex-col bg-gradient-to-b from-zinc-900 to-zinc-950",
          selected
            ? "border-emerald-400 shadow-emerald-500/20"
            : "border-zinc-700/50 hover:border-emerald-500/50",
          statusStyles[executionStatus]
        )}
      >
        <NodeResizer
          minWidth={360}
          minHeight={320}
          isVisible={selected}
          lineClassName="!border-emerald-400"
          handleClassName="!w-2.5 !h-2.5 !bg-emerald-400 !border-emerald-600 !rounded-full"
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
          className="!w-4 !h-4 !bg-emerald-400 !border-[3px] !border-emerald-600 hover:!scale-110 transition-transform !rounded-full"
          style={{ left: -8, top: "50%" }}
        />
        
        {/* Handles - Output (Right) */}
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="!w-4 !h-4 !bg-emerald-400 !border-[3px] !border-emerald-600 hover:!scale-110 transition-transform !rounded-full"
          style={{ right: -8, top: "50%" }}
        />

        {/* Header */}
        <header className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-t-[10px]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                {data.label || "AI Chat"}
              </span>
              <span className="text-[10px] text-white/70">Powered by AI</span>
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
                <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                  <div className="p-3 bg-zinc-800/50 rounded-full mb-3">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-medium">Start a conversation</p>
                  <p className="text-[10px] text-zinc-600 mt-1">Ask anything to get started</p>
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
            <div className="flex items-center gap-2 bg-zinc-800/80 rounded-xl border border-zinc-700/50 px-3 py-2 focus-within:border-emerald-500/50 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 outline-none nodrag"
                disabled={isLoading}
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  inputText.trim() && !isLoading
                    ? "bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/25"
                    : "bg-zinc-700 cursor-not-allowed"
                )}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer className="px-3 pb-2 border-t border-zinc-800/50 pt-2">
            <p className="text-[9px] text-zinc-600 text-center">
              AI responses may not always be accurate. Verify important information.
            </p>
          </footer>
        </div>
      </div>
    );
  }
);

AIChatNoteNode.displayName = "AIChatNoteNode";
