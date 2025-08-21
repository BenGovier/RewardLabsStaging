export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { SALES_COLLECTION } from "@/models/sale"
import { USERS_COLLECTION } from "@/models/user"

// GET sales summary for admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const db = await getDb()

    // Build match criteria for date range
    const matchCriteria: any = {}
    if (from || to) {
      matchCriteria.dateOfSale = {}
      if (from) matchCriteria.dateOfSale.$gte = new Date(from)
      if (to) matchCriteria.dateOfSale.$lte = new Date(to)
    }

    // Aggregate sales summary by rep
    const summary = await db
      .collection(SALES_COLLECTION)
      .aggregate([
        {
          $match: matchCriteria,
        },
        {
          $group: {
            _id: "$repId",
            totalSales: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
            totalCommission: { $sum: { $ifNull: ["$commissionEarned", 0] } },
            averageSale: { $avg: "$amount" },
          },
        },
        {
          $lookup: {
            from: USERS_COLLECTION,
            localField: "_id",
            foreignField: "_id",
            as: "rep",
          },
        },
        {
          $unwind: "$rep",
        },
        {
          $project: {
            repId: "$_id",
            repName: { $concat: ["$rep.firstName", " ", "$rep.lastName"] },
            totalSales: 1,
            totalAmount: { $round: ["$totalAmount", 2] },
            totalCommission: { $round: ["$totalCommission", 2] },
            averageSale: { $round: ["$averageSale", 2] },
          },
        },
        {
          $sort: { totalAmount: -1 },
        },
      ])
      .toArray()

    return NextResponse.json({ summary })
  } catch (error) {
    console.error("Error fetching sales summary:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
