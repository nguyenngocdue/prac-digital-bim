import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint to clear webhook data for a specific node
 */

// This should match the store in the main webhook route
// In production, use a shared database or cache
const webhookStore = new Map<string, any[]>();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { nodeId: string } }
) {
  try {
    const { nodeId } = params;
    webhookStore.delete(nodeId);

    return NextResponse.json({
      success: true,
      message: "Webhook data cleared",
      nodeId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to clear webhook data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
