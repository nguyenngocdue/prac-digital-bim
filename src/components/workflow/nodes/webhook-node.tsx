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
      className="group relative rounded-lg border border-purple-500/30 bg-zinc-900 shadow-xl shadow-purple-500/10"
      onDoubleClick={() => setIsEditMode(true)}
    >
      <NodeCloseButton nodeId={id} variant="default" />
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="h-3! w-3! border-2! border-purple-500! bg-purple-400!"
      />

      {/* Header */}
      <div className="flex items-center gap-2 border-b border-purple-500/30 bg-purple-500/10 px-3 py-2">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-purple-500/20">
          <span className="text-xs font-bold text-purple-400">🪝</span>
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-purple-300">
            {data.label}
          </div>
          <div className="text-[10px] text-zinc-400">
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
              <label className="text-[10px] font-medium text-zinc-400">
                Webhook URL
              </label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={webhookUrl}
                  readOnly
                  className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] text-zinc-300"
                />
                <button
                  onClick={handleCopyUrl}
                  className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-400 transition-colors hover:bg-zinc-700"
                  title="Copy URL"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center justify-between text-zinc-500">
                <span>Auth:</span>
                <span className="text-zinc-300 capitalize">{config.authType}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-500">
                <span>Response:</span>
                <span className="text-zinc-300">{config.responseCode}</span>
              </div>
            </div>

            {/* Edit Hint */}
            <div className="rounded bg-purple-500/10 px-2 py-1.5 text-center text-[9px] text-purple-400">
              Double-click to configure
            </div>
          </>
        ) : (
          /* Edit Mode - Full Configuration */
          <>
        {/* Webhook URL Display */}
        {showUrl && (
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-zinc-400">
              Webhook URL
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] text-zinc-300"
              />
              <button
                onClick={handleCopyUrl}
                className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-400 transition-colors hover:bg-zinc-700"
                title="Copy URL"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={() => setShowUrl(false)}
                className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-zinc-400 transition-colors hover:bg-zinc-700"
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
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-[10px] text-zinc-400 transition-colors hover:bg-zinc-700"
          >
            <Eye className="inline h-3 w-3 mr-1" />
            Show URL
          </button>
        )}

        {/* Path Configuration */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-zinc-400">
            Webhook Path
          </label>
          <input
            type="text"
            value={config.path}
            onChange={(e) => updateConfig({ path: e.target.value })}
            placeholder="webhook-path"
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 placeholder:text-zinc-600"
          />
        </div>

        {/* HTTP Methods */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-zinc-400">
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
                className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  config.method.includes(method)
                    ? "bg-purple-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Authentication */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-zinc-400">
            Authentication
          </label>
          <select
            value={config.authType}
            onChange={(e) =>
              updateConfig({
                authType: e.target.value as WebhookConfig["authType"],
              })
            }
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
          >
            <option value="none">None</option>
            <option value="basic">Basic Auth</option>
            <option value="header">Header Auth</option>
          </select>
        </div>

        {/* Auth Value */}
        {config.authType !== "none" && (
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-zinc-400">
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
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 placeholder:text-zinc-600"
            />
            {config.authType === "header" && (
              <div className="text-[9px] text-zinc-500">
                Send as: x-webhook-token header
              </div>
            )}
          </div>
        )}

        {/* Response Configuration */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-zinc-400">
            Response
          </label>
          <select
            value={config.responseMode}
            onChange={(e) =>
              updateConfig({
                responseMode: e.target.value as WebhookConfig["responseMode"],
              })
            }
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
          >
            <option value="lastNode">Last Node Output</option>
            <option value="firstNode">First Node Output</option>
            <option value="custom">Custom Response</option>
          </select>
        </div>

        {/* Response Code */}
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-zinc-400">
            Response Code
          </label>
          <input
            type="number"
            value={config.responseCode}
            onChange={(e) =>
              updateConfig({ responseCode: parseInt(e.target.value) })
            }
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
          />
        </div>

        {/* Custom Response Data */}
        {config.responseMode === "custom" && (
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-zinc-400">
              Response Body (JSON)
            </label>
            <textarea
              value={config.responseData || ""}
              onChange={(e) => updateConfig({ responseData: e.target.value })}
              placeholder='{"message": "Success"}'
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 placeholder:text-zinc-600"
              rows={3}
            />
          </div>
        )}

        {/* Test Button */}
        <button
          onClick={handleTestWebhook}
          className="flex w-full items-center justify-center gap-1 rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-500"
        >
          <RefreshCw className="h-3 w-3" />
          Test Webhook
        </button>

        {/* Test Response */}
        {testResponse && (
          <div className="rounded border border-zinc-700 bg-zinc-800 p-2">
            <div className="mb-1 text-[10px] font-medium text-zinc-400">
              Test Response:
            </div>
            <pre className="text-[9px] text-zinc-300 overflow-auto max-h-20">
              {JSON.stringify(testResponse, null, 2)}
            </pre>
          </div>
        )}

        {/* Close Edit Mode Button */}
        <button
          onClick={() => setIsEditMode(false)}
          className="w-full rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
        >
          Done
        </button>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-purple-500/30 bg-purple-500/5 px-3 py-1.5">
        <div className="text-[9px] text-zinc-500">
          Calls: <span className="text-purple-400 font-medium">0</span>
        </div>
        <button
          onClick={() => setTestResponse(null)}
          className="text-[9px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
