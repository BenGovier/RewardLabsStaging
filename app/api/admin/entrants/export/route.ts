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

    // Build same filter pipeline as main entrants API
    const matchStage: any = {}

    const businessId = searchParams.get("businessId")
    if (businessId) {
      matchStage.businessId = new ObjectId(businessId)
    }

    const raffleId = searchParams.get("raffleId")
    if (raffleId) {
      matchStage.raffleId = new ObjectId(raffleId)
    }

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

    const search = searchParams.get("search")
    if (search) {
      matchStage.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

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
                  $or: [
                    { $eq: ["$_id", "$$raffleId"] },
                    { $eq: ["$_id", { $toObjectId: { $toString: "$$raffleId" } }] },
                    { $eq: [{ $toString: "$_id" }, { $toString: "$$raffleId" }] },
                  ],
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
                    { $eq: ["$_id", { $toObjectId: { $toString: "$$businessId" } }] },
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

    // Generate CSV
    const csvHeaders = [
      "First Name",
      "Last Name",
      "Email",
      "Business Name",
      "Business Email",
      "Raffle Title",
      "Entry Date",
      "Raffle Start Date",
      "Raffle End Date",
      "Custom Answers",
    ]

    const csvRows = entrants.map((entrant) => [
      entrant.firstName || "",
      entrant.lastName || "",
      entrant.email || "",
      entrant.business?.businessName || "",
      entrant.business?.email || "",
      entrant.raffle?.title || "",
      entrant.submittedAt ? new Date(entrant.submittedAt).toISOString() : "",
      entrant.raffle?.startDate ? new Date(entrant.raffle.startDate).toISOString() : "",
      entrant.raffle?.endDate ? new Date(entrant.raffle.endDate).toISOString() : "",
      entrant.answers ? JSON.stringify(entrant.answers) : "",
    ])

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="entrants-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting entrants:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
