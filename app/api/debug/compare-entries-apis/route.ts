import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: NextRequest) {
  try {
    console.log("=== COMPARE ENTRIES APIS DEBUG START ===")

    // Get session info
    const session = await getServerSession(authOptions)

    // Basic session info
    const sessionInfo = {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userEmail: session?.user?.email,
    }

    console.log("Session info:", sessionInfo)

    // If no session, return early
    if (!session?.user) {
      return NextResponse.json({
        error: "No session found",
        sessionInfo,
      })
    }

    // Return basic info without trying to query the database
    return NextResponse.json({
      message: "Debug info",
      sessionInfo,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in compare-entries-apis:", error)
    return NextResponse.json(
      {
        error: "Error in debug endpoint",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
