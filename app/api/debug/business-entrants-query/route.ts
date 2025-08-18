import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { ENTRIES_COLLECTION } from "@/models/entry"

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    // Get the business user's ID and details
    const businessUserId = session.user.id
    const businessUserRole = session.user.role

    // Try different query variations to see what matches
    const queries = [{ businessId: businessUserId }, { businessId: businessUserId.toString() }]

    const results = {}

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i]
      const entries = await db.collection(ENTRIES_COLLECTION).find(query).limit(5).toArray()
      results[`query${i + 1}`] = {
        query,
        found: entries.length,
        sampleEntries: entries.map((entry) => ({
          _id: entry._id,
          businessId: entry.businessId,
          raffleId: entry.raffleId,
          email: entry.email,
        })),
      }
    }

    // Also check all entries to see if any have similar business IDs
    const allEntries = await db.collection(ENTRIES_COLLECTION).find({}).limit(10).toArray()
    const potentialMatches = allEntries.filter(
      (entry) =>
        entry.businessId === businessUserId ||
        entry.businessId === businessUserId.toString() ||
        entry.businessId.toString() === businessUserId ||
        entry.businessId.toString() === businessUserId.toString(),
    )

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      sessionInfo: {
        businessUserId,
        businessUserIdType: typeof businessUserId,
        businessUserRole,
      },
      queryResults: results,
      potentialMatches: potentialMatches.map((entry) => ({
        _id: entry._id,
        businessId: entry.businessId,
        businessIdType: typeof entry.businessId,
        raffleId: entry.raffleId,
        email: entry.email,
      })),
      allEntriesSample: allEntries.slice(0, 3).map((entry) => ({
        _id: entry._id,
        businessId: entry.businessId,
        businessIdType: typeof entry.businessId,
        raffleId: entry.raffleId,
        email: entry.email,
      })),
    })
  } catch (error) {
    console.error("Error debugging business entrants query:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
