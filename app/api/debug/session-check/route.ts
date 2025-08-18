import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

export async function GET() {
  try {
    const session = await getServerSession()

    return NextResponse.json({
      hasSession: !!session,
      sessionData: session
        ? {
            user: {
              id: session.user?.id,
              email: session.user?.email,
              role: session.user?.role,
              name: session.user?.name,
              firstName: session.user?.firstName,
              lastName: session.user?.lastName,
            },
          }
        : null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json(
      {
        error: "Failed to check session",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
