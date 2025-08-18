import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { ENTRIES_COLLECTION } from "@/models/entry"

export async function GET(req: NextRequest) {
  try {
    console.log("=== SIMPLE BUSINESS ENTRIES DEBUG ===")

    // Step 1: Check session
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "business") {
      return NextResponse.json({ error: "Authentication failed" }, { status: 403 })
    }

    console.log("✅ Session OK:", session.user.id)

    // Step 2: Connect to database
    const db = await getDb()
    console.log("✅ Database connected")

    // Step 3: Simple query
    const query = { businessId: session.user.id }
    console.log("Query:", JSON.stringify(query))

    // Step 4: Count entries
    const count = await db.collection(ENTRIES_COLLECTION).countDocuments(query)
    console.log("✅ Count:", count)

    // Step 5: Get entries
    const entries = await db.collection(ENTRIES_COLLECTION).find(query).limit(5).toArray()
    console.log("✅ Entries found:", entries.length)

    if (entries.length > 0) {
      console.log("Sample entry:", JSON.stringify(entries[0]))
    }

    return NextResponse.json({
      success: true,
      businessId: session.user.id,
      totalCount: count,
      entriesReturned: entries.length,
      entries: entries.map((entry) => ({
        _id: entry._id,
        email: entry.email,
        firstName: entry.firstName,
        lastName: entry.lastName,
        createdAt: entry.createdAt,
      })),
    })
  } catch (error) {
    console.error("❌ Error:", error)
    return NextResponse.json(
      {
        error: "Internal error",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
