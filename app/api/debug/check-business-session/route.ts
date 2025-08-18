import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    return NextResponse.json({
      success: true,
      hasSession: !!session,
      sessionData: session
        ? {
            userId: session.user?.id,
            email: session.user?.email,
            role: session.user?.role,
            firstName: session.user?.firstName,
            lastName: session.user?.lastName,
            businessName: session.user?.businessName,
            name: session.user?.name,
          }
        : null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })
  }
}
