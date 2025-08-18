import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { ENTRIES_COLLECTION } from "@/models/entry"

export async function GET(req: NextRequest) {
  try {
    const db = await getDb()

    // Get all entries to see what's in the database
    const allEntries = await db.collection(ENTRIES_COLLECTION).find({}).limit(20).toArray()

    // Get unique business IDs from entries
    const businessIds = [...new Set(allEntries.map((entry) => entry.businessId))]

    // Get unique raffle IDs from entries
    const raffleIds = [...new Set(allEntries.map((entry) => entry.raffleId))]

    // Count entries by business ID
    const entriesByBusiness = {}
    for (const businessId of businessIds) {
      const count = await db.collection(ENTRIES_COLLECTION).countDocuments({ businessId })
      entriesByBusiness[businessId] = count
    }

    // Count entries by raffle ID
    const entriesByRaffle = {}
    for (const raffleId of raffleIds) {
      const count = await db.collection(ENTRIES_COLLECTION).countDocuments({ raffleId })
      entriesByRaffle[raffleId] = count
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      totalEntries: allEntries.length,
      sampleEntries: allEntries.slice(0, 5).map((entry) => ({
        _id: entry._id,
        businessId: entry.businessId,
        businessIdType: typeof entry.businessId,
        raffleId: entry.raffleId,
        raffleIdType: typeof entry.raffleId,
        email: entry.email,
        createdAt: entry.createdAt,
      })),
      uniqueBusinessIds: businessIds,
      uniqueRaffleIds: raffleIds,
      entriesByBusiness,
      entriesByRaffle,
    })
  } catch (error) {
    console.error("Error investigating entries:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
