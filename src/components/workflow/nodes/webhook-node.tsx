"use client";

import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw, Trash2, Eye, EyeOff } from "lucide-react";
import { Handle, Position } from "@xyflow/react";
import { NodeCloseButton } from "./node-close-button";

/**
 * Webhook Node Component - Similar to n8n's webhook node
 * Allows receiving HTTP requests and processing them in the workflow
 */

interface WebhookNodeProps {
  id: string;
  data: {
    label: string;
    config?: WebhookConfig;
    onConfigChange?: (config: WebhookConfig) => void;
  };
}

export interface WebhookConfig {
  path: string;
  method: string[];
  authType: "none" | "basic" | "header";
  authValue?: string;
  responseMode: "lastNode" | "firstNode" | "custom";
  responseCode: number;
  responseData?: string;
}

export function WebhookNode({ id, data }: WebhookNodeProps) {
  const [config, setConfig] = useState<WebhookConfig>(
    data.config || {
      path: id,
      method: ["GET", "POST"],
      authType: "none",
      responseMode: "lastNode",
      responseCode: 200,
    }
  );

  const [copied, setCopied] = useState(false);
  const [showUrl, setShowUrl] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Generate webhook URL
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000";
    setWebhookUrl(`${baseUrl}/api/webhook/${config.path}`);
  }, [config.path]);

  useEffect(() => {
    // Notify parent of config changes
    data.onConfigChange?.(config);
  }, [config, data]);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestWebhook = async () => {
    try {
      const response = await fetch(webhookUrl, {
        method: config.method[0],
        headers: {
          "Content-Type": "application/json",
          ...(config.authType === "header" && config.authValue
            ? { "x-webhook-token": config.authValue }
            : {}),
          ...(config.authType === "basic" && config.authValue
            ? { Authorization: `Basic ${btoa(config.authValue)}` }
            : {}),
        },
        body:
          config.method[0] !== "GET"
            ? JSON.stringify({ test: true, timestamp: Date.now() })
            : undefined,
      });

      const data = await response.json();
      setTestResponse(data);
    } catch (error) {
      setTestResponse({ error: "Failed to test webhook" });
    }
  };

  const updateConfig = (updates: Partial<WebhookConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div 
      className="group relative rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)] shadow-[0_12px_30px_var(--workflow-shadow)]"
      onDoubleClick={() => setIsEditMode(true)}
    >
      <NodeCloseButton nodeId={id} variant="default" />
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="h-3! w-3! border-2! border-teal-200! bg-teal-500!"
      />

      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-2 rounded-t-2xl">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-500/10 border border-teal-200">
          <span className="text-xs font-bold text-teal-700">🪝</span>
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--workflow-ink)]">
            {data.label}
          </div>
          <div className="text-[10px] text-[var(--workflow-muted)]">
            {config.method.join(", ")} Webhook
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3 p-3">
        {!isEditMode ? (
          /* Compact View Mode */
          <>
            {/* Webhook URL Display */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
                Webhook URL
              </label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="flex-1 rounded-xl border border-[var(--workflow-border)] bg-white/80 px-2 py-1 text-[10px] text-[var(--workflow-ink)]"
                />
                <button
                  onClick={handleCopyUrl}
                  className="rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-1 text-[var(--workflow-muted)] transition-colors hover:text-[var(--workflow-ink)]"
                  title="Copy URL"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center justify-between text-[var(--workflow-muted)]">
                <span>Auth:</span>
                <span className="text-[var(--workflow-ink)] capitalize">{config.authType}</span>
              </div>
              <div className="flex items-center justify-between text-[var(--workflow-muted)]">
                <span>Response:</span>
                <span className="text-[var(--workflow-ink)]">{config.responseCode}</span>
              </div>
            </div>

            {/* Edit Hint */}
            <div className="rounded-full border border-teal-200 bg-teal-500/10 px-2 py-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.2em] text-teal-700">
              Double-click to configure
            </div>
          </>
        ) : (
          /* Edit Mode - Full Configuration */
          <>
        {/* Webhook URL Display */}
        {showUrl && (
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
              Webhook URL
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 rounded-xl border border-[var(--workflow-border)] bg-white/80 px-2 py-1 text-[10px] text-[var(--workflow-ink)]"
              />
              <button
                onClick={handleCopyUrl}
                className="rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-1 text-[var(--workflow-muted)] transition-colors hover:text-[var(--workflow-ink)]"
                title="Copy URL"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={() => setShowUrl(false)}
                className="rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-1 text-[var(--workflow-muted)] transition-colors hover:text-[var(--workflow-ink)]"
                title="Hide URL"
              >
                <EyeOff className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {!showUrl && (
          <button
            onClick={() => setShowUrl(true)}
            className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--workflow-muted)] transition-colors hover:text-[var(--workflow-ink)]"
          >
            <Eye className="inline h-3 w-3 mr-1" />
            Show URL
          </button>
        )}

        {/* Path Configuration */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
            Webhook Path
          </label>
          <input
            type="text"
            value={config.path}
            onChange={(e) => updateConfig({ path: e.target.value })}
            placeholder="webhook-path"
            className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-1 text-xs text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)]"
          />
        </div>

        {/* HTTP Methods */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
            HTTP Methods
          </label>
          <div className="flex flex-wrap gap-1">
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((method) => (
              <button
                key={method}
                onClick={() => {
                  const methods = config.method.includes(method)
                    ? config.method.filter((m) => m !== method)
                    : [...config.method, method];
                  updateConfig({ method: methods.length > 0 ? methods : [method] });
                }}
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  config.method.includes(method)
                    ? "bg-[var(--workflow-accent)] text-white"
                    : "border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] text-[var(--workflow-muted)] hover:text-[var(--workflow-ink)]"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Authentication */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
            Authentication
          </label>
          <select
            value={config.authType}
            onChange={(e) =>
              updateConfig({
                authType: e.target.value as WebhookConfig["authType"],
              })
            }
            className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-1 text-xs text-[var(--workflow-ink)]"
          >
            <option value="none">None</option>
            <option value="basic">Basic Auth</option>
            <option value="header">Header Auth</option>
          </select>
        </div>

        {/* Auth Value */}
        {config.authType !== "none" && (
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
              {config.authType === "basic"
                ? "Credentials (username:password)"
                : "Token"}
            </label>
            <input
              type={config.authType === "basic" ? "text" : "password"}
              value={config.authValue || ""}
              onChange={(e) => updateConfig({ authValue: e.target.value })}
              placeholder={
                config.authType === "basic"
                  ? "username:password"
                  : "your-token-here"
              }
              className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-1 text-xs text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)]"
            />
            {config.authType === "header" && (
              <div className="text-[9px] text-[var(--workflow-muted)]">
                Send as: x-webhook-token header
              </div>
            )}
          </div>
        )}

        {/* Response Configuration */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
            Response
          </label>
          <select
            value={config.responseMode}
            onChange={(e) =>
              updateConfig({
                responseMode: e.target.value as WebhookConfig["responseMode"],
              })
            }
            className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-1 text-xs text-[var(--workflow-ink)]"
          >
            <option value="lastNode">Last Node Output</option>
            <option value="firstNode">First Node Output</option>
            <option value="custom">Custom Response</option>
          </select>
        </div>

        {/* Response Code */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
            Response Code
          </label>
          <input
            type="number"
            value={config.responseCode}
            onChange={(e) =>
              updateConfig({ responseCode: parseInt(e.target.value) })
            }
            className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-1 text-xs text-[var(--workflow-ink)]"
          />
        </div>

        {/* Custom Response Data */}
        {config.responseMode === "custom" && (
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">
              Response Body (JSON)
            </label>
            <textarea
              value={config.responseData || ""}
              onChange={(e) => updateConfig({ responseData: e.target.value })}
              placeholder='{"message": "Success"}'
              className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-1 text-xs text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)]"
              rows={3}
            />
          </div>
        )}

        {/* Test Button */}
        <button
          onClick={handleTestWebhook}
          className="flex w-full items-center justify-center gap-1 rounded-full bg-[var(--workflow-accent)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[var(--workflow-accent-strong)]"
        >
          <RefreshCw className="h-3 w-3" />
          Test Webhook
        </button>

        {/* Test Response */}
        {testResponse && (
          <div className="rounded-xl border border-[var(--workflow-border)] bg-white/80 p-2">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--workflow-muted)]">
              Test Response:
            </div>
            <pre className="text-[9px] text-[var(--workflow-ink)] overflow-auto max-h-20">
              {JSON.stringify(testResponse, null, 2)}
            </pre>
          </div>
        )}

        {/* Close Edit Mode Button */}
        <button
          onClick={() => setIsEditMode(false)}
          className="w-full rounded-full border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--workflow-muted)] transition-colors hover:text-[var(--workflow-ink)]"
        >
          Done
        </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-1.5 rounded-b-2xl">
        <div className="text-[9px] text-[var(--workflow-muted)]">
          Calls: <span className="text-teal-700 font-semibold uppercase tracking-[0.16em]">0</span>
        </div>
        <button
          onClick={() => setTestResponse(null)}
          className="text-[9px] text-[var(--workflow-muted)] hover:text-[var(--workflow-ink)] transition-colors"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
