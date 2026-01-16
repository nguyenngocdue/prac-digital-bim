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
    <div className="w-80 shrink-0 rounded-2xl border border-[var(--workflow-border)] bg-[var(--workflow-panel)]/85 shadow-[0_18px_40px_var(--workflow-shadow)] backdrop-blur flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--workflow-border)] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--workflow-warm)] text-white shadow-[0_10px_20px_rgba(194,65,12,0.25)]">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.26em] text-[var(--workflow-muted)]">
              Node Settings
            </div>
            <span className="text-sm font-semibold text-[var(--workflow-ink)]">HTTP</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="rounded-full p-2 text-[var(--workflow-muted)] transition hover:bg-[var(--workflow-panel-strong)] hover:text-[var(--workflow-ink)]">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[var(--workflow-muted)] transition hover:bg-[var(--workflow-panel-strong)] hover:text-[var(--workflow-ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 py-2 border-b border-[var(--workflow-border)]">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={saveChanges}
          placeholder="node description..."
          className="w-full bg-transparent text-sm text-[var(--workflow-muted)] placeholder:text-[var(--workflow-muted)] outline-none"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--workflow-border)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] transition ${
              activeTab === tab.id
                ? "text-[var(--workflow-ink)] border-b-2 border-[var(--workflow-accent)]"
                : "text-[var(--workflow-muted)] hover:text-[var(--workflow-ink)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {activeTab === "basic" && (
            <>
              {/* Method */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)] mb-2">
                  Method
                </label>
                <div className="relative">
                  <select
                    value={method}
                    onChange={(e) => handleMethodChange(e.target.value as HttpMethod)}
                    onBlur={saveChanges}
                    className="w-28 appearance-none rounded-full border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--workflow-ink)] outline-none focus:border-[var(--workflow-accent)]"
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
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)] mb-2">
                  URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onBlur={saveChanges}
                    placeholder="https://api.example.com/endpoint"
                    className="flex-1 rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-2 text-sm text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)] outline-none focus:border-[var(--workflow-accent)]"
                  />
                  <button className="rounded-xl border border-[var(--workflow-border)] p-2 text-[var(--workflow-muted)] transition hover:bg-[var(--workflow-panel)] hover:text-[var(--workflow-ink)]">
                    <span className="text-xs">⊗</span>
                  </button>
                </div>
              </div>

              {/* Timeout */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)] mb-2">
                  Timeout (ms)
                </label>
                <input
                  type="number"
                  value={timeout}
                  onChange={(e) => handleTimeoutChange(parseInt(e.target.value) || 30000)}
                  onBlur={saveChanges}
                  min={1000}
                  max={300000}
                  className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-2 text-sm text-[var(--workflow-ink)] outline-none focus:border-[var(--workflow-accent)]"
                />
                <p className="text-xs text-[var(--workflow-muted)] mt-1.5">
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
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)] mb-2">
                Request Body (JSON)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onBlur={saveChanges}
                placeholder='{"key": "value"}'
                rows={10}
                className="w-full rounded-xl border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-3 py-2 text-sm text-[var(--workflow-ink)] font-mono placeholder:text-[var(--workflow-muted)] outline-none focus:border-[var(--workflow-accent)] resize-none"
              />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Next Node Section */}
      <div className="border-t border-[var(--workflow-border)] p-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--workflow-muted)] mb-1">Next Node</h3>
        <p className="text-xs text-[var(--workflow-muted)] mb-3">
          Add a next node to this workflow.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--workflow-warm)] text-white shadow-[0_10px_20px_rgba(194,65,12,0.25)]">
            <Globe className="h-4 w-4" />
          </div>
          <div className="flex-1 h-px bg-[var(--workflow-border)]" />
          <button className="flex items-center gap-2 rounded-full border border-dashed border-[var(--workflow-border)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)] transition hover:border-[var(--workflow-accent)] hover:text-[var(--workflow-ink)]">
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
        <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-muted)]">{title}</label>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--workflow-accent)] transition hover:text-[var(--workflow-accent-strong)]"
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
              className="h-4 w-4 rounded border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] text-[var(--workflow-accent)] focus:ring-[var(--workflow-accent)] focus:ring-offset-0"
            />
            <input
              type="text"
              value={item.key}
              onChange={(e) => onUpdate(item.id, "key", e.target.value)}
              onBlur={onBlur}
              placeholder={keyPlaceholder}
              className="flex-1 rounded-lg border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-1.5 text-xs text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)] outline-none focus:border-[var(--workflow-accent)]"
            />
            <input
              type="text"
              value={item.value}
              onChange={(e) => onUpdate(item.id, "value", e.target.value)}
              onBlur={onBlur}
              placeholder={valuePlaceholder}
              className="flex-1 rounded-lg border border-[var(--workflow-border)] bg-[var(--workflow-panel-strong)] px-2 py-1.5 text-xs text-[var(--workflow-ink)] placeholder:text-[var(--workflow-muted)] outline-none focus:border-[var(--workflow-accent)]"
            />
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 text-[var(--workflow-muted)] transition hover:text-rose-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
