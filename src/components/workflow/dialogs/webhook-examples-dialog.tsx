"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { webhookExamples } from "@/data/webhook-examples";
import { Webhook, ChevronRight, Copy } from "lucide-react";

interface WebhookExamplesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadExample?: (example: any) => void;
}

export function WebhookExamplesDialog({
  open,
  onOpenChange,
  onLoadExample,
}: WebhookExamplesDialogProps) {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  const examples = Object.entries(webhookExamples);

  const handleLoadExample = (key: string) => {
    const example = webhookExamples[key as keyof typeof webhookExamples];
    onLoadExample?.(example);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#fffaf2] border border-[#e2d2bf]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-teal-700">
            <Webhook className="h-5 w-5" />
            Webhook Examples
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Load pre-built webhook workflows to get started quickly
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {examples.map(([key, example]) => (
            <div
              key={key}
              className="group relative rounded-2xl border border-[#e2d2bf] bg-white/80 p-4 transition-all hover:border-teal-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 mb-1">
                    {example.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3">
                    {example.description}
                  </p>

                  {/* Node count */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{example.nodes.length} nodes</span>
                    <span>{example.edges.length} connections</span>
                  </div>

                  {/* Node types */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.from(
                      new Set(example.nodes.map((n) => n.type))
                    ).map((type) => (
                      <span
                        key={type}
                        className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] rounded-full bg-[#f2e6d3] text-slate-600"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleLoadExample(key)}
                  className="flex items-center gap-1 rounded-full bg-teal-600 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-teal-500"
                >
                  Load
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {/* Preview code snippet if selected */}
              {selectedExample === key && (
                <div className="mt-4 rounded-xl border border-[#e2d2bf] bg-white/90 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Webhook Configuration
                    </span>
                    <button
                      onClick={() => {
                        const webhookNode = example.nodes.find(
                          (n) => n.type === "webhook"
                        );
                        if (webhookNode?.data?.config) {
                          navigator.clipboard.writeText(
                            JSON.stringify(webhookNode.data.config, null, 2)
                          );
                        }
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  <pre className="text-[10px] text-slate-600 overflow-x-auto">
                    {JSON.stringify(
                      example.nodes.find((n) => n.type === "webhook")?.data
                        ?.config || {},
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}

              {/* Toggle details button */}
              <button
                onClick={() =>
                  setSelectedExample(selectedExample === key ? null : key)
                }
                className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 hover:text-teal-600"
              >
                {selectedExample === key ? "Hide" : "Show"} details
              </button>
            </div>
          ))}
        </div>

        {/* Quick start guide */}
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
          <h4 className="text-sm font-semibold text-teal-800 mb-2">
            Quick Start
          </h4>
          <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
            <li>Choose an example that matches your use case</li>
            <li>Click "Load" to add it to your canvas</li>
            <li>Customize the webhook path and authentication</li>
            <li>Click "Run" to activate the webhook</li>
            <li>Send test requests to your webhook URL</li>
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
}
