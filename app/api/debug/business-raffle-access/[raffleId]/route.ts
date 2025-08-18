import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"
import { RAFFLES_COLLECTION } from "@/models/raffle"

export async function GET(req: NextRequest, { params }: { params: { raffleId: string } }) {
  try {
    console.log("🔍 Debug: Checking business raffle access for:", params.raffleId)

    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({
        error: "No session",
        debug: { hasSession: false },
      })
    }

    // Connect to database
    const db = await getDb()

    // Check if raffle exists in main raffles collection
    const raffle = await db.collection(RAFFLES_COLLECTION).findOne({ _id: new ObjectId(params.raffleId) })

    // Check if business raffle assignment exists
    const businessRaffle = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({
      businessId: session.user.id,
      raffleId: params.raffleId,
    })

    // Get all business raffles for this user
    const allBusinessRaffles = await db
      .collection(BUSINESS_RAFFLES_COLLECTION)
      .find({ businessId: session.user.id })
      .toArray()

    // Get all raffles in the system
    const allRaffles = await db.collection(RAFFLES_COLLECTION).find({}).project({ _id: 1, title: 1 }).toArray()

    return NextResponse.json({
      session: {
        userId: session.user.id,
        role: session.user.role,
        email: session.user.email,
      },
      requestedRaffleId: params.raffleId,
      raffleExists: !!raffle,
      businessRaffleExists: !!businessRaffle,
      businessRaffleDetails: businessRaffle,
      allBusinessRafflesForUser: allBusinessRaffles.map((br) => ({
        raffleId: br.raffleId,
        isActive: br.isActive,
        createdAt: br.createdAt,
      })),
      allRafflesInSystem: allRaffles.map((r) => ({
        id: r._id.toString(),
        title: r.title,
      })),
      debug: {
        businessRaffleQuery: {
          businessId: session.user.id,
          raffleId: params.raffleId,
        },
        businessRaffleCount: allBusinessRaffles.length,
        totalRaffleCount: allRaffles.length,
      },
    })
  } catch (error) {
    console.error("❌ Debug error:", error)
    return NextResponse.json({
      error: "Debug failed",
      message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
