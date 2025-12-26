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
    <div className="w-80 border-l border-zinc-800 bg-[#0f1419] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-rose-500">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-200">HTTP</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800">
            <MoreHorizontal className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 py-2 border-b border-zinc-800">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={saveChanges}
          placeholder="node description..."
          className="w-full bg-transparent text-sm text-zinc-500 placeholder:text-zinc-600 outline-none"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-zinc-200 border-b-2 border-blue-500"
                : "text-zinc-500 hover:text-zinc-300"
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
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Method
                </label>
                <div className="relative">
                  <select
                    value={method}
                    onChange={(e) => handleMethodChange(e.target.value as HttpMethod)}
                    onBlur={saveChanges}
                    className="w-24 appearance-none bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500"
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
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onBlur={saveChanges}
                    placeholder="https://api.example.com/endpoint"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-blue-500"
                  />
                  <button className="p-2 text-zinc-500 hover:text-zinc-300 border border-zinc-700 rounded hover:bg-zinc-800">
                    <span className="text-xs">⊗</span>
                  </button>
                </div>
              </div>

              {/* Timeout */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Timeout (ms)
                </label>
                <input
                  type="number"
                  value={timeout}
                  onChange={(e) => handleTimeoutChange(parseInt(e.target.value) || 30000)}
                  onBlur={saveChanges}
                  min={1000}
                  max={300000}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500"
                />
                <p className="text-xs text-zinc-600 mt-1.5">
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
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Request Body (JSON)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onBlur={saveChanges}
                placeholder='{"key": "value"}'
                rows={10}
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 font-mono placeholder:text-zinc-600 outline-none focus:border-blue-500 resize-none"
              />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Next Node Section */}
      <div className="border-t border-zinc-800 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-1">Next Node</h3>
        <p className="text-xs text-zinc-600 mb-3">
          Add a next node to this workflow.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-rose-500">
            <Globe className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 h-px bg-zinc-700" />
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 border border-dashed border-zinc-700 rounded hover:border-zinc-600 hover:text-zinc-300 transition-colors">
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
        <label className="text-sm font-medium text-zinc-300">{title}</label>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
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
              className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            />
            <input
              type="text"
              value={item.key}
              onChange={(e) => onUpdate(item.id, "key", e.target.value)}
              onBlur={onBlur}
              placeholder={keyPlaceholder}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={item.value}
              onChange={(e) => onUpdate(item.id, "value", e.target.value)}
              onBlur={onBlur}
              placeholder={valuePlaceholder}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-blue-500"
            />
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
