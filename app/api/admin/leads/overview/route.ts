export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { LEADS_COLLECTION, USERS_COLLECTION } from "@/models/lead"
import { ObjectId } from "mongodb"

// GET admin overview of all leads
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const db = await getDb()

    // Get lead statistics by rep
    const repStats = await db
      .collection(LEADS_COLLECTION)
      .aggregate([
        {
          $group: {
            _id: "$repId",
            totalLeads: { $sum: 1 },
            newLeads: { $sum: { $cond: [{ $eq: ["$status", "new"] }, 1, 0] } },
            qualifiedLeads: { $sum: { $cond: [{ $eq: ["$status", "qualified"] }, 1, 0] } },
            wonDeals: { $sum: { $cond: [{ $eq: ["$status", "won"] }, 1, 0] } },
            totalValue: { $sum: { $ifNull: ["$estimatedValue", 0] } },
            avgValue: { $avg: { $ifNull: ["$estimatedValue", 0] } },
          },
        },
      ])
      .toArray()

    // Get rep names
    const repIds = repStats.map((stat) => stat._id)
    const reps = await db
      .collection(USERS_COLLECTION)
      .find({
        _id: { $in: repIds.map((id) => new ObjectId(id)) },
      })
      .toArray()

    // Combine stats with rep info
    const repPerformance = repStats.map((stat) => {
      const rep = reps.find((r) => r._id.toString() === stat._id)
      return {
        repId: stat._id,
        repName: rep ? `${rep.firstName} ${rep.lastName}` : "Unknown",
        email: rep?.email || "Unknown",
        ...stat,
      }
    })

    // Overall statistics
    const totalLeads = await db.collection(LEADS_COLLECTION).countDocuments()
    const statusBreakdown = await db
      .collection(LEADS_COLLECTION)
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    const sourceBreakdown = await db
      .collection(LEADS_COLLECTION)
      .aggregate([
        {
          $group: {
            _id: "$source",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      totalLeads,
      repPerformance,
      statusBreakdown,
      sourceBreakdown,
    })
  } catch (error) {
    console.error("Error fetching lead overview:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
