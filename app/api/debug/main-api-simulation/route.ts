import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { ENTRIES_COLLECTION } from "@/models/entry"

export async function GET(req: NextRequest) {
  try {
    console.log("=== MAIN API SIMULATION DEBUG ===")

    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "business") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    // Get the same parameters that the main API would receive
    const url = new URL(req.url)
    const raffleId = url.searchParams.get("raffleId") || "6845e0a739a37b73cd888cbd" // Use the actual raffleId from the entries
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const skip = (page - 1) * limit
    const sortBy = url.searchParams.get("sortBy") || "createdAt"
    const sortOrder = url.searchParams.get("sortOrder") || "desc"
    const search = url.searchParams.get("search") || ""

    console.log("Parameters:", {
      raffleId,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
      search,
      businessId: session.user.id,
    })

    // Build the exact same query as the main API
    const query: any = {
      businessId: session.user.id,
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

    console.log("Final query:", JSON.stringify(query))

    // Build sort object
    const sort: any = {}
    sort[sortBy] = sortOrder === "asc" ? 1 : -1

    // Test different scenarios
    const results = []

    // 1. Test with the exact query
    const entriesWithQuery = await db
      .collection(ENTRIES_COLLECTION)
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray()
    const totalWithQuery = await db.collection(ENTRIES_COLLECTION).countDocuments(query)

    results.push({
      scenario: "Exact main API query",
      query,
      sort,
      skip,
      limit,
      entriesFound: entriesWithQuery.length,
      totalCount: totalWithQuery,
      entries: entriesWithQuery,
    })

    // 2. Test without raffleId filter
    const queryWithoutRaffle = { businessId: session.user.id }
    const entriesWithoutRaffle = await db
      .collection(ENTRIES_COLLECTION)
      .find(queryWithoutRaffle)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray()
    const totalWithoutRaffle = await db.collection(ENTRIES_COLLECTION).countDocuments(queryWithoutRaffle)

    results.push({
      scenario: "Without raffleId filter",
      query: queryWithoutRaffle,
      sort,
      skip,
      limit,
      entriesFound: entriesWithoutRaffle.length,
      totalCount: totalWithoutRaffle,
      entries: entriesWithoutRaffle,
    })

    // 3. Test with no pagination
    const entriesNoPagination = await db.collection(ENTRIES_COLLECTION).find(query).sort(sort).toArray()

    results.push({
      scenario: "No pagination",
      query,
      sort,
      entriesFound: entriesNoPagination.length,
      entries: entriesNoPagination,
    })

    return NextResponse.json({
      sessionInfo: {
        userId: session.user.id,
        userRole: session.user.role,
      },
      parameters: {
        raffleId,
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
        search,
      },
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in main API simulation:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
