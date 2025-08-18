import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: NextRequest, { params }: { params: { raffleId: string } }) {
  try {
    const raffleId = params.raffleId

    // Get session with authOptions
    const session = await getServerSession(authOptions)

    const sessionCheck = {
      hasSession: !!session,
      user: session?.user
        ? {
            email: session.user.email,
            name: session.user.name,
            id: session.user.id,
            role: session.user.role,
          }
        : null,
      roleCheck: {
        isBusiness: session?.user?.role === "business",
        roleType: typeof session?.user?.role,
        actualRole: session?.user?.role,
      },
    }

    const requestInfo = {
      method: req.method,
      url: req.url,
      headers: {
        authorization: req.headers.get("authorization") ? "Present" : "Missing",
        cookie: req.headers.get("cookie") ? "Present" : "Missing",
      },
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      raffleId,
      sessionCheck,
      requestInfo,
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json(
      {
        error: "Failed to check session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
