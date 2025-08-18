import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export async function GET() {
  try {
    console.log("=== DASHBOARD DEBUG TEST ===")
    console.log("Time:", new Date().toISOString())
    console.log("Route: /api/debug/dashboard-test")

    // Test server session
    const session = await getServerSession()
    console.log("Server session:", session ? "EXISTS" : "NULL")
    if (session) {
      console.log("Session user:", {
        email: session.user?.email,
        role: session.user?.role,
        businessName: session.user?.businessName,
      })
    }

    // Test environment
    console.log("Environment variables:")
    console.log("- NEXTAUTH_URL:", process.env.NEXTAUTH_URL ? "SET" : "NOT SET")
    console.log("- NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET")

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      session: session
        ? {
            email: session.user?.email,
            role: session.user?.role,
            businessName: session.user?.businessName,
          }
        : null,
      environment: {
        nextauthUrl: !!process.env.NEXTAUTH_URL,
        nextauthSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error("=== DASHBOARD DEBUG ERROR ===")
    console.error("Error:", error)
    console.error("Stack:", error instanceof Error ? error.stack : "No stack")

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
