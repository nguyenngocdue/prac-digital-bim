import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint to retrieve webhook data for a specific node
 */

// This should match the store in the main webhook route
// In production, use a shared database or cache
const webhookStore = new Map<string, any[]>();

export async function GET(
  request: NextRequest,
  { params }: { params: { nodeId: string } }
) {
  try {
    const { nodeId } = params;
    const data = webhookStore.get(nodeId) || [];

    return NextResponse.json({
      success: true,
      nodeId,
      webhooks: data,
      count: data.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to retrieve webhook data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
