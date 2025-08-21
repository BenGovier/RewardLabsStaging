import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
  try {
    const { businessId } = params

    // Validate businessId format
    if (!ObjectId.isValid(businessId)) {
      return NextResponse.json({ error: "Invalid business ID format" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const currentDate = new Date()

    // 1. Check all businessRaffles for this business
    const businessRaffles = await db
      .collection("businessRaffles")
      .find({ businessId: new ObjectId(businessId) })
      .toArray()

    // 2. Check all raffles in the system
    const allRaffles = await db.collection("raffles").find({}).toArray()

    // 3. Check businessRaffles with raffle data joined
    const businessRafflesWithRaffles = await db
      .collection("businessRaffles")
      .aggregate([
        {
          $match: {
            businessId: new ObjectId(businessId),
          },
        },
        {
          $lookup: {
            from: "raffles",
            localField: "raffleId",
            foreignField: "_id",
            as: "raffle",
          },
        },
        {
          $unwind: {
            path: "$raffle",
            preserveNullAndEmptyArrays: true,
          },
        },
      ])
      .toArray()

    // 4. Test the exact same query as the main API
    const currentRaffleQuery = await db
      .collection("businessRaffles")
      .aggregate([
        {
          $match: {
            businessId: new ObjectId(businessId),
            isActive: true,
          },
        },
        {
          $lookup: {
            from: "raffles",
            localField: "raffleId",
            foreignField: "_id",
            as: "raffle",
          },
        },
        {
          $unwind: "$raffle",
        },
        {
          $match: {
            "raffle.startDate": { $lte: currentDate },
            "raffle.endDate": { $gte: currentDate },
          },
        },
        {
          $sort: { "raffle.startDate": -1 },
        },
        {
          $limit: 1,
        },
      ])
      .toArray()

    // 5. Test date comparisons manually
    const dateComparisons = businessRafflesWithRaffles.map((br) => {
      if (!br.raffle) return { businessRaffleId: br._id, error: "No raffle data" }

      const startDate = new Date(br.raffle.startDate)
      const endDate = new Date(br.raffle.endDate)

      return {
        businessRaffleId: br._id,
        raffleTitle: br.raffle.title,
        isActive: br.isActive,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        currentDate: currentDate.toISOString(),
        isCurrentlyActive: startDate <= currentDate && endDate >= currentDate,
        startDateCheck: startDate <= currentDate,
        endDateCheck: endDate >= currentDate,
      }
    })

    // 6. Check for PS5 raffle specifically
    const ps5Raffle = allRaffles.find((r) => r.title.toLowerCase().includes("ps5"))
    const ps5BusinessRaffle = businessRafflesWithRaffles.find(
      (br) => br.raffle && br.raffle.title.toLowerCase().includes("ps5"),
    )

    return NextResponse.json({
      message: "Business raffle debug analysis",
      businessId,
      currentDate: currentDate.toISOString(),
      counts: {
        businessRaffles: businessRaffles.length,
        allRaffles: allRaffles.length,
        businessRafflesWithRaffles: businessRafflesWithRaffles.length,
        currentRaffleQueryResults: currentRaffleQuery.length,
      },
      businessRaffles,
      allRaffles: allRaffles.map((r) => ({
        _id: r._id,
        title: r.title,
        startDate: r.startDate,
        endDate: r.endDate,
      })),
      businessRafflesWithRaffles,
      currentRaffleQuery,
      dateComparisons,
      ps5Analysis: {
        ps5RaffleExists: !!ps5Raffle,
        ps5RaffleData: ps5Raffle,
        ps5BusinessRaffleExists: !!ps5BusinessRaffle,
        ps5BusinessRaffleData: ps5BusinessRaffle,
      },
    })
  } catch (error) {
    console.error("Error in business raffle debug:", error)
    return NextResponse.json({ error: "Debug analysis failed", details: error.message }, { status: 500 })
  }
}
