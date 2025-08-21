import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    return NextResponse.json({
      hasSession: !!session,
      user: session?.user
        ? {
            id: session.user.id,
            email: session.user.email,
            role: session.user.role,
            name: session.user.name,
            firstName: session.user.firstName,
            lastName: session.user.lastName,
            businessName: session.user.businessName,
          }
        : null,
      rawSession: session,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to get session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
