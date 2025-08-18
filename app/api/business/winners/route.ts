import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { WINNERS_COLLECTION } from "@/models/winner"
import { RAFFLES_COLLECTION } from "@/models/raffle"

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 Business Winners API - Starting request")

    // Check authentication with proper authOptions
    const session = await getServerSession(authOptions)
    console.log("📋 Session data:", {
      user: session?.user?.email,
      role: session?.user?.role,
      id: session?.user?.id,
    })

    if (!session?.user) {
      console.log("❌ No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is business
    if (session.user.role !== "business") {
      console.log("❌ User role is not business:", session.user.role)
      return NextResponse.json({ error: "Forbidden - Business access required" }, { status: 403 })
    }

    const businessId = session.user.id
    console.log("🏢 Business ID:", businessId)

    // Connect to database
    const db = await getDb()
    console.log("✅ Database connected")

    // Get all winners for this business
    console.log("🔍 Searching for winners with businessId:", businessId)
    const winners = await db.collection(WINNERS_COLLECTION).find({ businessId }).sort({ selectedAt: -1 }).toArray()

    console.log("🏆 Found winners:", winners.length)

    // Get raffle names for each winner
    const winnersWithRaffleNames = await Promise.all(
      winners.map(async (winner) => {
        const raffle = await db.collection(RAFFLES_COLLECTION).findOne({
          _id: winner.raffleId,
        })

        return {
          ...winner,
          raffleName: raffle?.title || "Unknown Raffle",
        }
      }),
    )

    console.log("✅ Winners with raffle names prepared")

    return NextResponse.json({
      winners: winnersWithRaffleNames,
      totalWinners: winnersWithRaffleNames.length,
    })
  } catch (error) {
    console.error("❌ Error fetching business winners:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
