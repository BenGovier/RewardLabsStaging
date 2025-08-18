import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"

export async function GET(req: NextRequest, { params }: { params: { raffleId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const raffleId = params.raffleId

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fix: Use getDb() directly instead of destructuring
    const db = await getDb()

    // Check if business raffle exists
    const businessRaffle = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({
      businessId: session.user.id,
      raffleId: raffleId,
      isActive: true,
    })

    // Also check all business raffles for this user
    const allBusinessRaffles = await db
      .collection(BUSINESS_RAFFLES_COLLECTION)
      .find({
        businessId: session.user.id,
      })
      .toArray()

    return NextResponse.json({
      raffleId,
      businessId: session.user.id,
      businessRaffleExists: !!businessRaffle,
      businessRaffle: businessRaffle
        ? {
            id: businessRaffle._id,
            raffleId: businessRaffle.raffleId,
            isActive: businessRaffle.isActive,
            hasCustomizations: !!businessRaffle.businessCustomizations,
          }
        : null,
      allBusinessRaffles: allBusinessRaffles.map((br) => ({
        id: br._id,
        raffleId: br.raffleId,
        isActive: br.isActive,
        hasCustomizations: !!br.businessCustomizations,
      })),
      totalBusinessRaffles: allBusinessRaffles.length,
    })
  } catch (error) {
    console.error("Business raffle test error:", error)
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      },
      { status: 500 },
    )
  }
}
