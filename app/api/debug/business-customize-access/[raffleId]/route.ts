import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"

export async function GET(req: NextRequest, { params }: { params: { raffleId: string } }) {
  try {
    console.log("=== Debug Business Customize Access ===")

    const session = await getServerSession()
    const raffleId = params.raffleId

    const debugInfo = {
      timestamp: new Date().toISOString(),
      raffleId,
      session: session
        ? {
            userId: session.user?.id,
            userEmail: session.user?.email,
            userRole: session.user?.role,
            sessionExists: true,
          }
        : {
            sessionExists: false,
          },
    }

    if (!session?.user) {
      return NextResponse.json({
        ...debugInfo,
        error: "No session found",
        canAccess: false,
      })
    }

    if (session.user.role !== "business") {
      return NextResponse.json({
        ...debugInfo,
        error: "User is not business role",
        canAccess: false,
      })
    }

    // Check business raffle access
    const { db } = await connectToDatabase()
    const businessRaffle = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({
      businessId: session.user.id,
      raffleId: raffleId,
      isActive: true,
    })

    return NextResponse.json({
      ...debugInfo,
      businessRaffle: businessRaffle
        ? {
            id: businessRaffle._id,
            businessId: businessRaffle.businessId,
            raffleId: businessRaffle.raffleId,
            isActive: businessRaffle.isActive,
            hasCustomizations: !!businessRaffle.businessCustomizations,
          }
        : null,
      canAccess: !!businessRaffle,
      error: businessRaffle ? null : "Business raffle not found or not accessible",
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      {
        error: "Debug endpoint error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
