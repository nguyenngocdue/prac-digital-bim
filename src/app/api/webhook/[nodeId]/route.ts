import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook API Route - Handles incoming webhook requests
 * URL format: /api/webhook/{nodeId}
 */

// In-memory storage for webhook data (in production, use a database)
const webhookStore = new Map<string, any[]>();

// Store active webhook configurations
const webhookConfigs = new Map<
  string,
  {
    method: string[];
    authType: "none" | "basic" | "header";
    authValue?: string;
  }
>();

// Handle all HTTP methods
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  const { nodeId } = await params;
  return handleWebhook(request, nodeId, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  const { nodeId } = await params;
  return handleWebhook(request, nodeId, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  const { nodeId } = await params;
  return handleWebhook(request, nodeId, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  const { nodeId } = await params;
  return handleWebhook(request, nodeId, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  const { nodeId } = await params;
  return handleWebhook(request, nodeId, "DELETE");
}

async function handleWebhook(
  request: NextRequest,
  nodeId: string,
  method: string
) {
  try {
    // Get webhook configuration
    const config = webhookConfigs.get(nodeId);

    // Check if method is allowed
    if (config && !config.method.includes(method)) {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    // Check authentication if required
    if (config && config.authType !== "none") {
      const authHeader = request.headers.get("authorization");

      if (config.authType === "basic") {
        if (!authHeader || !authHeader.startsWith("Basic ")) {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
          );
        }
        // Validate basic auth
        const base64Credentials = authHeader.split(" ")[1];
        if (!base64Credentials) {
          return NextResponse.json(
            { error: "Invalid authorization format" },
            { status: 401 }
          );
        }
        const credentials = Buffer.from(base64Credentials, "base64").toString(
          "ascii"
        );
        if (credentials !== config.authValue) {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
          );
        }
      } else if (config.authType === "header") {
        const customAuth = request.headers.get("x-webhook-token");
        if (customAuth !== config.authValue) {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
          );
        }
      }
    }

    // Parse request data
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);

    let body = null;
    const contentType = request.headers.get("content-type");

    if (method !== "GET" && method !== "DELETE") {
      if (contentType?.includes("application/json")) {
        body = await request.json();
      } else if (contentType?.includes("application/x-www-form-urlencoded")) {
        const formData = await request.formData();
        body = Object.fromEntries(formData);
      } else if (contentType?.includes("text/")) {
        body = await request.text();
      } else {
        body = await request.text();
      }
    }

    // Collect headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Create webhook payload
    const webhookData = {
      timestamp: new Date().toISOString(),
      method,
      headers,
      query: queryParams,
      body,
      url: request.url,
    };

    // Store webhook data
    const nodeData = webhookStore.get(nodeId) || [];
    nodeData.push(webhookData);
    webhookStore.set(nodeId, nodeData);

    // Limit stored data to last 100 entries
    if (nodeData.length > 100) {
      webhookStore.set(nodeId, nodeData.slice(-100));
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Webhook received",
        receivedAt: webhookData.timestamp,
        method,
        dataReceived: {
          headers: Object.keys(headers).length,
          queryParams: Object.keys(queryParams).length,
          bodySize: body ? JSON.stringify(body).length : 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Configuration endpoint to set webhook options
export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  const { nodeId } = await params;

  // Handle configuration requests
  if (request.headers.get("x-webhook-config")) {
    try {
      const config = await request.json();
      webhookConfigs.set(nodeId, config);
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid configuration" },
        { status: 400 }
      );
    }
  }

  // Return CORS headers
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  });
}

/**
 * Utility function to get webhook data (can be used by workflow execution)
 */
export function getWebhookData(nodeId: string): any[] {
  return webhookStore.get(nodeId) || [];
}

/**
 * Clear webhook data for a node
 */
export function clearWebhookData(nodeId: string): void {
  webhookStore.delete(nodeId);
}
