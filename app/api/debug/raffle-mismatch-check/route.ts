import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { ENTRIES_COLLECTION } from "@/models/entry"

export async function GET() {
  try {
    console.log("=== RAFFLE MISMATCH DEBUG ===")

    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "business") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    // Get all entries for this business
    const entries = await db.collection(ENTRIES_COLLECTION).find({ businessId: session.user.id }).toArray()

    // Get unique raffleIds from entries
    const raffleIdsFromEntries = [...new Set(entries.map((entry) => entry.raffleId))]

    // Get raffles from the business raffles API
    const businessRafflesResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/business/raffles`, {
      headers: {
        Cookie: `next-auth.session-token=${session.user.id}`, // This won't work, but let's see what we get
      },
    })

    // Get raffles from admin raffles collection
    const adminRaffles = await db.collection("raffles").find({}).toArray()

    // Get business raffles
    const businessRaffles = await db.collection("businessRaffles").find({ businessId: session.user.id }).toArray()

    return NextResponse.json({
      sessionInfo: {
        userId: session.user.id,
        userRole: session.user.role,
      },
      entriesAnalysis: {
        totalEntries: entries.length,
        raffleIdsFromEntries,
        sampleEntry: entries[0] || null,
      },
      rafflesAnalysis: {
        adminRaffles: adminRaffles.map((r) => ({ _id: r._id, title: r.title })),
        businessRaffles: businessRaffles.map((br) => ({
          _id: br._id,
          raffleId: br.raffleId,
          businessId: br.businessId,
        })),
      },
      mismatchCheck: {
        entriesHaveRaffleIds: raffleIdsFromEntries,
        businessRaffleIds: businessRaffles.map((br) => br.raffleId),
      },
    })
  } catch (error) {
    console.error("Error in raffle mismatch check:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
