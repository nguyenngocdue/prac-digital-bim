"use client";

import { useState, useCallback } from "react";
import { Globe, X, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useWorkflow } from "../workflow-provider";
import { ScrollArea } from "@/components/ui/scroll-area";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type Tab = "basic" | "headers" | "query" | "body";

type KeyValuePair = {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
};

type HttpPanelProps = {
  nodeId: string;
  onClose: () => void;
};

export function HttpPanel({ nodeId, onClose }: HttpPanelProps) {
  const { nodes, updateNodeData } = useWorkflow();
  const node = nodes.find((n) => n.id === nodeId);
  
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [description, setDescription] = useState<string>((node?.data?.description as string) || "");
  const [method, setMethod] = useState<HttpMethod>((node?.data?.method as HttpMethod) || "GET");
  const [url, setUrl] = useState<string>((node?.data?.url as string) || "");
  const [timeout, setTimeout] = useState<number>((node?.data?.timeout as number) || 30000);
  const [headers, setHeaders] = useState<KeyValuePair[]>(
    (node?.data?.headers as KeyValuePair[]) || [{ id: "1", key: "", value: "", enabled: true }]
  );
  const [queryParams, setQueryParams] = useState<KeyValuePair[]>(
    (node?.data?.queryParams as KeyValuePair[]) || [{ id: "1", key: "", value: "", enabled: true }]
  );
  const [body, setBody] = useState<string>((node?.data?.body as string) || "");

  // Update node data when values change
  const saveChanges = useCallback(() => {
    updateNodeData(nodeId, {
      description,
      method,
      url,
      timeout,
      headers: headers.filter((h) => h.key),
      queryParams: queryParams.filter((q) => q.key),
      body,
    });
  }, [nodeId, description, method, url, timeout, headers, queryParams, body, updateNodeData]);

  const handleMethodChange = (newMethod: HttpMethod) => {
    setMethod(newMethod);
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
  };

  const handleTimeoutChange = (newTimeout: number) => {
    setTimeout(Math.min(Math.max(newTimeout, 1000), 300000)); // 1s - 5min
  };

  const addKeyValuePair = (
    list: KeyValuePair[],
    setList: React.Dispatch<React.SetStateAction<KeyValuePair[]>>
  ) => {
    setList([
      ...list,
      { id: Date.now().toString(), key: "", value: "", enabled: true },
    ]);
  };

  const updateKeyValuePair = (
    list: KeyValuePair[],
    setList: React.Dispatch<React.SetStateAction<KeyValuePair[]>>,
    id: string,
    field: "key" | "value" | "enabled",
    value: string | boolean
  ) => {
    setList(
      list.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeKeyValuePair = (
    list: KeyValuePair[],
    setList: React.Dispatch<React.SetStateAction<KeyValuePair[]>>,
    id: string
  ) => {
    if (list.length > 1) {
      setList(list.filter((item) => item.id !== id));
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "basic", label: "Basic" },
    { id: "headers", label: "Headers" },
    { id: "query", label: "Query" },
    { id: "body", label: "Body" },
  ];

  const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

  return (
    <div className="workflow-surface-glass workflow-shadow w-80 shrink-0 rounded-2xl border workflow-border backdrop-blur flex flex-col h-full min-h-0 animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b workflow-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl workflow-warm-bg text-white shadow-[0_10px_20px_rgba(194,65,12,0.25)]">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.26em] workflow-muted">
              Node Settings
            </div>
            <span className="text-sm font-semibold workflow-ink">HTTP</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded-full p-2 workflow-muted transition workflow-surface-hover workflow-ink-hover">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="rounded-full p-2 workflow-muted transition workflow-surface-hover workflow-ink-hover"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 py-2 border-b workflow-border">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={saveChanges}
          placeholder="node description..."
          className="w-full bg-transparent text-sm workflow-muted placeholder:workflow-muted outline-none"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b workflow-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] transition ${
              activeTab === tab.id
                ? "workflow-ink border-b-2 workflow-border-accent"
                : "workflow-muted workflow-ink-hover"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 overscroll-contain">
        <div className="p-4 space-y-5">
          {activeTab === "basic" && (
            <>
              {/* Method */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] workflow-muted mb-2">
                  Method
                </label>
                <div className="relative">
                  <select
                    value={method}
                    onChange={(e) => handleMethodChange(e.target.value as HttpMethod)}
                    onBlur={saveChanges}
                    className="w-28 appearance-none rounded-full border workflow-border workflow-surface-strong px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] workflow-ink outline-none workflow-focus"
                  >
                    {methods.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] workflow-muted mb-2">
                  URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onBlur={saveChanges}
                    placeholder="https://api.example.com/endpoint"
                    className="flex-1 rounded-xl border workflow-border workflow-surface-strong px-3 py-2 text-sm workflow-ink placeholder:workflow-muted outline-none workflow-focus"
                  />
                  <button className="rounded-xl border workflow-border workflow-surface px-2 py-2 workflow-muted transition workflow-ink-hover">
                    <span className="text-xs">⊗</span>
                  </button>
                </div>
              </div>

              {/* Timeout */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] workflow-muted mb-2">
                  Timeout (ms)
                </label>
                <input
                  type="number"
                  value={timeout}
                  onChange={(e) => handleTimeoutChange(parseInt(e.target.value) || 30000)}
                  onBlur={saveChanges}
                  min={1000}
                  max={300000}
                  className="w-full rounded-xl border workflow-border workflow-surface-strong px-3 py-2 text-sm workflow-ink outline-none workflow-focus"
                />
                <p className="text-xs workflow-muted mt-1.5">
                  Request timeout in milliseconds (1s - 5min)
                </p>
              </div>
            </>
          )}

          {activeTab === "headers" && (
            <KeyValueEditor
              title="Headers"
              items={headers}
              onAdd={() => addKeyValuePair(headers, setHeaders)}
              onUpdate={(id, field, value) =>
                updateKeyValuePair(headers, setHeaders, id, field, value)
              }
              onRemove={(id) => removeKeyValuePair(headers, setHeaders, id)}
              onBlur={saveChanges}
              keyPlaceholder="Header name"
              valuePlaceholder="Header value"
            />
          )}

          {activeTab === "query" && (
            <KeyValueEditor
              title="Query Parameters"
              items={queryParams}
              onAdd={() => addKeyValuePair(queryParams, setQueryParams)}
              onUpdate={(id, field, value) =>
                updateKeyValuePair(queryParams, setQueryParams, id, field, value)
              }
              onRemove={(id) => removeKeyValuePair(queryParams, setQueryParams, id)}
              onBlur={saveChanges}
              keyPlaceholder="Parameter name"
              valuePlaceholder="Parameter value"
            />
          )}

          {activeTab === "body" && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] workflow-muted mb-2">
                Request Body (JSON)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onBlur={saveChanges}
                placeholder='{"key": "value"}'
                rows={10}
                className="w-full rounded-xl border workflow-border workflow-surface-strong px-3 py-2 text-sm workflow-ink font-mono placeholder:workflow-muted outline-none workflow-focus resize-none"
              />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Next Node Section */}
      <div className="border-t workflow-border p-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.22em] workflow-muted mb-1">Next Node</h3>
        <p className="text-xs workflow-muted mb-3">
          Add a next node to this workflow.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl workflow-warm-bg text-white shadow-[0_10px_20px_rgba(194,65,12,0.25)]">
            <Globe className="h-4 w-4" />
          </div>
          <div className="flex-1 h-px workflow-border" />
          <button className="flex items-center gap-2 rounded-full border border-dashed workflow-border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] workflow-muted transition workflow-border-accent-hover workflow-ink-hover">
            <Plus className="h-4 w-4" />
            Add Next Node
          </button>
        </div>
      </div>
    </div>
  );
}

// Key-Value Editor Component
function KeyValueEditor({
  title,
  items,
  onAdd,
  onUpdate,
  onRemove,
  onBlur,
  keyPlaceholder,
  valuePlaceholder,
}: {
  title: string;
  items: KeyValuePair[];
  onAdd: () => void;
  onUpdate: (id: string, field: "key" | "value" | "enabled", value: string | boolean) => void;
  onRemove: (id: string) => void;
  onBlur: () => void;
  keyPlaceholder: string;
  valuePlaceholder: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-[11px] font-semibold uppercase tracking-[0.2em] workflow-muted">{title}</label>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] workflow-accent transition workflow-accent-strong-hover-text"
        >
          <Plus className="h-3 w-3" />
          Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) => onUpdate(item.id, "enabled", e.target.checked)}
              className="h-4 w-4 rounded border workflow-border workflow-surface-strong workflow-accent workflow-focus"
            />
            <input
              type="text"
              value={item.key}
              onChange={(e) => onUpdate(item.id, "key", e.target.value)}
              onBlur={onBlur}
              placeholder={keyPlaceholder}
              className="flex-1 rounded-lg border workflow-border workflow-surface-strong px-2 py-1.5 text-xs workflow-ink placeholder:workflow-muted outline-none workflow-focus"
            />
            <input
              type="text"
              value={item.value}
              onChange={(e) => onUpdate(item.id, "value", e.target.value)}
              onBlur={onBlur}
              placeholder={valuePlaceholder}
              className="flex-1 rounded-lg border workflow-border workflow-surface-strong px-2 py-1.5 text-xs workflow-ink placeholder:workflow-muted outline-none workflow-focus"
            />
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 workflow-muted transition hover:text-rose-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
