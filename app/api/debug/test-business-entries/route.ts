import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      session: {
        hasSession: !!session,
        userId: session?.user?.id,
        userRole: session?.user?.role,
        userEmail: session?.user?.email,
      },
      message: "Test endpoint working correctly",
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}
