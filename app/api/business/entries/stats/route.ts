import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { ENTRIES_COLLECTION } from "@/models/entry"

export async function GET(req: NextRequest) {
  try {
    // Check authentication with authOptions
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is business
    if (session.user.role !== "business") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get query parameters
    const url = new URL(req.url)
    const raffleId = url.searchParams.get("raffleId")

    // Connect to database
    const db = await getDb()

    // Build query
    const query: any = {
      businessId: session.user.id,
    }

    if (raffleId) {
      query.raffleId = raffleId
    }

    // Get entry count
    const totalEntries = await db.collection(ENTRIES_COLLECTION).countDocuments(query)

    // Get unique email count
    const uniqueEmails = await db
      .collection(ENTRIES_COLLECTION)
      .aggregate([{ $match: query }, { $group: { _id: "$email" } }, { $count: "count" }])
      .toArray()

    const uniqueEmailCount = uniqueEmails.length > 0 ? uniqueEmails[0].count : 0

    // Get entries by date (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const entriesByDate = await db
      .collection(ENTRIES_COLLECTION)
      .aggregate([
        {
          $match: {
            ...query,
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
            "_id.day": 1,
          },
        },
      ])
      .toArray()

    // Format entries by date
    const entriesByDateFormatted = entriesByDate.map((entry) => {
      const date = new Date(entry._id.year, entry._id.month - 1, entry._id.day)
      return {
        date: date.toISOString().split("T")[0],
        count: entry.count,
      }
    })

    return NextResponse.json({
      totalEntries,
      uniqueEmailCount,
      entriesByDate: entriesByDateFormatted,
    })
  } catch (error) {
    console.error("Error fetching entry statistics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
