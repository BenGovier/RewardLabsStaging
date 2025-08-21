import { NextResponse } from "next/server"

// Simple endpoint to check if webhooks are being called
// This will help us understand if Stripe is reaching our webhook endpoint

let webhookCallLog: Array<{
  timestamp: string
  type: string
  id: string
  processed: boolean
}> = []

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        recentWebhookCalls: webhookCallLog.slice(-10), // Last 10 calls
        totalCalls: webhookCallLog.length,
        lastCall: webhookCallLog[webhookCallLog.length - 1] || null,
        message: "This endpoint tracks webhook calls. If empty, Stripe is not calling our webhook.",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get webhook logs" }, { status: 500 })
  }
}

// Function to log webhook calls (to be called from webhook handler)
export function logWebhookCall(type: string, id: string, processed = true) {
  webhookCallLog.push({
    timestamp: new Date().toISOString(),
    type,
    id,
    processed,
  })

  // Keep only last 50 entries to prevent memory issues
  if (webhookCallLog.length > 50) {
    webhookCallLog = webhookCallLog.slice(-50)
  }
}
