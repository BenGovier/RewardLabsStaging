import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { ENTRIES_COLLECTION } from "@/models/entry"

export async function GET(req: NextRequest) {
  try {
    console.log("=== BUSINESS ENTRIES API START ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Request URL:", req.url)

    // Check authentication with authOptions
    const session = await getServerSession(authOptions)
    console.log("Session check:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      userEmail: session?.user?.email,
    })

    if (!session?.user) {
      console.log("❌ No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "business") {
      console.log("❌ User role is not business:", session.user.role)
      return NextResponse.json({ error: "Forbidden - Business access required" }, { status: 403 })
    }

    console.log("✅ Authentication successful")

    // Get query parameters
    const url = new URL(req.url)
    const raffleId = url.searchParams.get("raffleId")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const skip = (page - 1) * limit
    const sortBy = url.searchParams.get("sortBy") || "createdAt"
    const sortOrder = url.searchParams.get("sortOrder") || "desc"
    const search = url.searchParams.get("search") || ""

    console.log("Query parameters:", {
      raffleId,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
      search,
      businessId: session.user.id,
    })

    // Connect to database
    console.log("Connecting to database...")
    const db = await getDb()
    console.log("✅ Database connected")

    // Update the query construction to handle ObjectId properly
    // Build query
    const query: any = {
      businessId: String(session.user.id), // Convert to string to ensure consistent comparison
    }

    if (raffleId) {
      query.raffleId = raffleId
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    console.log("MongoDB query:", JSON.stringify(query))

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1
    console.log("Sort object:", sort)

    // Get entries
    console.log("Fetching entries...")
    const entries = await db.collection(ENTRIES_COLLECTION).find(query).sort(sort).skip(skip).limit(limit).toArray()
    console.log(`✅ Found ${entries.length} entries`)

    // Get total count
    console.log("Getting total count...")
    const totalEntries = await db.collection(ENTRIES_COLLECTION).countDocuments(query)
    console.log(`✅ Total entries: ${totalEntries}`)

    const response = {
      entries,
      pagination: {
        page,
        limit,
        totalEntries,
        totalPages: Math.ceil(totalEntries / limit),
      },
    }

    console.log("Final response summary:", {
      entriesCount: entries.length,
      totalEntries,
      totalPages: response.pagination.totalPages,
    })

    console.log("=== BUSINESS ENTRIES API END ===")

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ ERROR in business entries API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
