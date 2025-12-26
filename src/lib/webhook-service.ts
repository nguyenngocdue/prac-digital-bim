/**
 * Webhook Service - Manages webhook execution in workflows
 */

export interface WebhookData {
  timestamp: string;
  method: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body: any;
  url: string;
}

export interface WebhookResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: any;
}

/**
 * Execute webhook logic in the workflow
 */
export async function executeWebhookNode(
  nodeId: string,
  config: any
): Promise<WebhookResponse> {
  try {
    // Get the latest webhook data for this node
    const webhookData = await fetchWebhookData(nodeId);

    if (!webhookData || webhookData.length === 0) {
      return {
        statusCode: 200,
        body: {
          message: "Waiting for webhook...",
          status: "idle",
        },
      };
    }

    // Get the most recent webhook call
    const latestCall = webhookData[webhookData.length - 1];

    if (!latestCall) {
      return {
        statusCode: 200,
        body: {
          message: "No webhook data available",
          status: "idle",
        },
      };
    }

    // Process the webhook data based on configuration
    const processedData = {
      headers: latestCall.headers,
      query: latestCall.query,
      body: latestCall.body,
      method: latestCall.method,
      timestamp: latestCall.timestamp,
      url: latestCall.url,
    };

    // Return processed webhook data for downstream nodes
    return {
      statusCode: config.responseCode || 200,
      body: processedData,
    };
  } catch (error) {
    console.error("Error executing webhook node:", error);
    return {
      statusCode: 500,
      body: {
        error: "Failed to execute webhook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Fetch webhook data from the API
 */
async function fetchWebhookData(nodeId: string): Promise<WebhookData[]> {
  try {
    const response = await fetch(`/api/webhook/${nodeId}/data`);
    if (response.ok) {
      const data = await response.json();
      return data.webhooks || [];
    }
    return [];
  } catch (error) {
    console.error("Error fetching webhook data:", error);
    return [];
  }
}

/**
 * Configure webhook settings via API
 */
export async function configureWebhook(
  nodeId: string,
  config: {
    method: string[];
    authType: "none" | "basic" | "header";
    authValue?: string;
  }
): Promise<boolean> {
  try {
    const response = await fetch(`/api/webhook/${nodeId}`, {
      method: "OPTIONS",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-config": "true",
      },
      body: JSON.stringify(config),
    });
    return response.ok;
  } catch (error) {
    console.error("Error configuring webhook:", error);
    return false;
  }
}

/**
 * Clear webhook data for a node
 */
export async function clearWebhookData(nodeId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/webhook/${nodeId}/clear`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error clearing webhook data:", error);
    return false;
  }
}

/**
 * Get webhook statistics
 */
export async function getWebhookStats(nodeId: string): Promise<{
  totalCalls: number;
  lastCall?: string;
  methods: Record<string, number>;
}> {
  try {
    const data = await fetchWebhookData(nodeId);
    const methods: Record<string, number> = {};

    data.forEach((call) => {
      methods[call.method] = (methods[call.method] || 0) + 1;
    });

    return {
      totalCalls: data.length,
      lastCall: data.length > 0 ? data[data.length - 1]?.timestamp : undefined,
      methods,
    };
  } catch (error) {
    console.error("Error getting webhook stats:", error);
    return {
      totalCalls: 0,
      methods: {},
    };
  }
}

/**
 * Validate webhook configuration
 */
export function validateWebhookConfig(config: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.path || config.path.trim() === "") {
    errors.push("Webhook path is required");
  }

  if (!config.method || config.method.length === 0) {
    errors.push("At least one HTTP method must be selected");
  }

  if (config.authType === "basic" && !config.authValue) {
    errors.push("Basic auth credentials are required");
  }

  if (config.authType === "header" && !config.authValue) {
    errors.push("Auth token is required");
  }

  if (
    config.responseMode === "custom" &&
    config.responseData &&
    config.responseData.trim() !== ""
  ) {
    try {
      JSON.parse(config.responseData);
    } catch {
      errors.push("Custom response must be valid JSON");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
