import type { NodeExecutor, NodeExecutionContext } from "../types";

// ============================================================================
// HTTP Node Executor
// ============================================================================

export const httpExecutor: NodeExecutor = async (
  context: NodeExecutionContext
) => {
  const { node, inputs } = context;
  const method = (node.data?.method as string) || "GET";
  const url = (node.data?.url as string) || "";
  const timeout = (node.data?.timeout as number) || 30000;
  const headers = (node.data?.headers as Array<{ key: string; value: string; enabled: boolean }>) || [];
  const queryParams = (node.data?.queryParams as Array<{ key: string; value: string; enabled: boolean }>) || [];
  const body = (node.data?.body as string) || "";

  console.log(`[HTTPNode ${node.id}] Executing ${method} ${url}`);
  console.log(`[HTTPNode ${node.id}] Inputs from previous nodes:`, inputs);

  if (!url) {
    throw new Error("URL is required");
  }

  // Build URL with query params
  const urlObj = new URL(url);
  queryParams
    .filter((p) => p.enabled && p.key)
    .forEach((p) => {
      urlObj.searchParams.append(p.key, p.value);
    });

  // Build headers
  const headersObj: Record<string, string> = {};
  headers
    .filter((h) => h.enabled && h.key)
    .forEach((h) => {
      headersObj[h.key] = h.value;
    });

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: headersObj,
      signal: controller.signal,
    };

    // Add body for non-GET requests
    if (method !== "GET" && body) {
      fetchOptions.body = body;
      if (!headersObj["Content-Type"]) {
        headersObj["Content-Type"] = "application/json";
      }
    }

    const response = await fetch(urlObj.toString(), fetchOptions);
    
    clearTimeout(timeoutId);

    // Try to parse as JSON, fall back to text
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data,
      url: urlObj.toString(),
      method,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
    throw new Error("Unknown error occurred");
  }
};
