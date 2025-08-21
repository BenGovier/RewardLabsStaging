import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { ENTRIES_COLLECTION } from "@/models/entry"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest) {
  try {
    console.log("=== BUSINESS ENTRIES DEBUG START ===")
    console.log("Timestamp:", new Date().toISOString())

    // Get session info
    const session = await getServerSession(authOptions)

    // Basic session info
    const sessionInfo = {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userEmail: session?.user?.email,
    }

    console.log("Session info:", sessionInfo)

    // If no session, return early
    if (!session?.user) {
      return NextResponse.json({
        error: "No session found",
        sessionInfo,
      })
    }

    // Connect to database
    console.log("Connecting to database...")
    const db = await getDb()
    console.log("✅ Database connected")

    // Get query parameters
    const url = new URL(req.url)
    const raffleId = url.searchParams.get("raffleId")

    // Try different query variations to see what works
    const queries = [
      // Query 1: Using session.user.id directly
      {
        name: "Direct session ID",
        query: { businessId: session.user.id },
      },
      // Query 2: Using string conversion
      {
        name: "String ID",
        query: { businessId: String(session.user.id) },
      },
      // Query 3: Using ObjectId conversion
      {
        name: "ObjectId conversion",
        query: { businessId: new ObjectId(session.user.id).toString() },
      },
      // Query 4: No businessId filter
      {
        name: "No businessId filter",
        query: {},
      },
    ]

    // Add raffleId to queries if provided
    if (raffleId) {
      queries.forEach((q) => {
        if (q.name !== "No businessId filter") {
          q.query.raffleId = raffleId
        }
      })
    }

    // Execute all queries
    const results = []
    for (const queryInfo of queries) {
      console.log(`Executing query: ${queryInfo.name}`, queryInfo.query)
      try {
        const entries = await db.collection(ENTRIES_COLLECTION).find(queryInfo.query).limit(5).toArray()
        results.push({
          queryName: queryInfo.name,
          query: queryInfo.query,
          entriesFound: entries.length,
          entries: entries.map((entry) => ({
            _id: entry._id,
            firstName: entry.firstName,
            lastName: entry.lastName,
            email: entry.email,
            businessId: entry.businessId,
            raffleId: entry.raffleId,
          })),
        })
      } catch (error) {
        results.push({
          queryName: queryInfo.name,
          query: queryInfo.query,
          error: error.message,
        })
      }
    }

    // Return all results
    return NextResponse.json({
      sessionInfo,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in business-entries-debug:", error)
    return NextResponse.json(
      {
        error: "Error in debug endpoint",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
