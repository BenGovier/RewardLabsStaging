import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest) {
  try {
    // FEATURE FLAG: ADMIN_ENTRANTS_VIEW (default: true)
    const ADMIN_ENTRANTS_VIEW = true
    if (!ADMIN_ENTRANTS_VIEW) {
      return NextResponse.json({ error: "Feature not available" }, { status: 403 })
    }

    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const { searchParams } = new URL(req.url)

    const type = searchParams.get("type")

    // Handle dropdown data requests
    if (type === "businesses") {
      const businesses = await db
        .collection("users")
        .find({ role: "business" })
        .project({ _id: 1, businessName: 1 })
        .toArray()

      return NextResponse.json({ businesses })
    }

    if (type === "raffles") {
      const raffles = await db.collection("raffles").find({}).project({ _id: 1, title: 1 }).toArray()

      return NextResponse.json({ raffles })
    }

    // Build filter pipeline for entrants
    const matchStage: any = {}

    // Business filter
    const businessId = searchParams.get("businessId")
    if (businessId && businessId !== "all") {
      try {
        matchStage.businessId = new ObjectId(businessId)
      } catch (e) {
        // If ObjectId conversion fails, try as string
        matchStage.businessId = businessId
      }
    }

    // Raffle filter
    const raffleId = searchParams.get("raffleId")
    if (raffleId && raffleId !== "all") {
      try {
        matchStage.raffleId = new ObjectId(raffleId)
      } catch (e) {
        // If ObjectId conversion fails, try as string
        matchStage.raffleId = raffleId
      }
    }

    // Entry date filters
    const entryDateFrom = searchParams.get("entryDateFrom")
    const entryDateTo = searchParams.get("entryDateTo")
    if (entryDateFrom || entryDateTo) {
      matchStage.submittedAt = {}
      if (entryDateFrom) {
        matchStage.submittedAt.$gte = new Date(entryDateFrom)
      }
      if (entryDateTo) {
        matchStage.submittedAt.$lte = new Date(entryDateTo + "T23:59:59.999Z")
      }
    }

    // Search term (name or email)
    const search = searchParams.get("search")
    if (search) {
      matchStage.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    // Build aggregation pipeline - simplified approach
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "raffles",
          let: { raffleId: "$raffleId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [{ $eq: ["$_id", "$$raffleId"] }, { $eq: [{ $toString: "$_id" }, { $toString: "$$raffleId" }] }],
                },
              },
            },
          ],
          as: "raffle",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { businessId: "$businessId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$_id", "$$businessId"] },
                    { $eq: [{ $toString: "$_id" }, { $toString: "$$businessId" }] },
                  ],
                },
              },
            },
          ],
          as: "business",
        },
      },
      {
        $addFields: {
          raffle: { $arrayElemAt: ["$raffle", 0] },
          business: { $arrayElemAt: ["$business", 0] },
        },
      },
      { $sort: { submittedAt: -1 } },
    ]

    // Add raffle date filters if specified
    const raffleStartFrom = searchParams.get("raffleStartFrom")
    const raffleStartTo = searchParams.get("raffleStartTo")
    const raffleEndFrom = searchParams.get("raffleEndFrom")
    const raffleEndTo = searchParams.get("raffleEndTo")

    if (raffleStartFrom || raffleStartTo || raffleEndFrom || raffleEndTo) {
      const raffleMatch: any = {}

      if (raffleStartFrom || raffleStartTo) {
        raffleMatch["raffle.startDate"] = {}
        if (raffleStartFrom) {
          raffleMatch["raffle.startDate"].$gte = new Date(raffleStartFrom)
        }
        if (raffleStartTo) {
          raffleMatch["raffle.startDate"].$lte = new Date(raffleStartTo + "T23:59:59.999Z")
        }
      }

      if (raffleEndFrom || raffleEndTo) {
        raffleMatch["raffle.endDate"] = {}
        if (raffleEndFrom) {
          raffleMatch["raffle.endDate"].$gte = new Date(raffleEndFrom)
        }
        if (raffleEndTo) {
          raffleMatch["raffle.endDate"].$lte = new Date(raffleEndTo + "T23:59:59.999Z")
        }
      }

      pipeline.push({ $match: raffleMatch })
    }

    const entrants = await db.collection("entries").aggregate(pipeline).toArray()

    // Log total count for verification
    console.log(`Admin entrants query returned ${entrants.length} records`)

    return NextResponse.json({ entrants })
  } catch (error) {
    console.error("Error fetching entrants:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
