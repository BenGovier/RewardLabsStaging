import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
  try {
    const { businessId } = params
    const { db } = await connectToDatabase()

    // Validate business ID format
    if (!ObjectId.isValid(businessId)) {
      return NextResponse.json({ error: "Invalid business ID format" }, { status: 400 })
    }

    const currentDate = new Date()

    // Step 1: Get raw businessRaffles for this business
    const rawBusinessRaffles = await db.collection("businessRaffles").find({ businessId }).toArray()

    // Step 2: Aggregation pipeline step by step
    const pipeline = [
      {
        $match: {
          businessId: businessId,
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
    ]

    // Execute each stage separately for debugging
    const stage1Results = await db.collection("businessRaffles").aggregate([pipeline[0]]).toArray()

    const stage2Results = await db.collection("businessRaffles").aggregate([pipeline[0], pipeline[1]]).toArray()

    const stage3Results = await db
      .collection("businessRaffles")
      .aggregate([pipeline[0], pipeline[1], pipeline[2]])
      .toArray()

    const stage4Results = await db.collection("businessRaffles").aggregate(pipeline).toArray()

    // Test different ObjectId conversions
    const testWithObjectIdConversion = await db
      .collection("businessRaffles")
      .aggregate([
        {
          $match: {
            businessId: businessId,
            isActive: true,
          },
        },
        {
          $addFields: {
            raffleObjectId: { $toObjectId: "$raffleId" },
          },
        },
        {
          $lookup: {
            from: "raffles",
            localField: "raffleObjectId",
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
      ])
      .toArray()

    // Get all raffles for date comparison
    const allRaffles = await db.collection("raffles").find({}).toArray()

    // Date analysis
    const dateAnalysis = allRaffles.map((raffle) => ({
      raffleId: raffle._id,
      title: raffle.title,
      startDate: raffle.startDate,
      endDate: raffle.endDate,
      currentDate,
      isStartDateValid: raffle.startDate <= currentDate,
      isEndDateValid: raffle.endDate >= currentDate,
      isCurrentlyActive: raffle.startDate <= currentDate && raffle.endDate >= currentDate,
    }))

    return NextResponse.json({
      message: "Current raffle aggregation debug analysis",
      businessId,
      currentDate,
      analysis: {
        rawBusinessRaffles: {
          count: rawBusinessRaffles.length,
          data: rawBusinessRaffles,
        },
        stage1_match: {
          count: stage1Results.length,
          data: stage1Results,
        },
        stage2_lookup: {
          count: stage2Results.length,
          data: stage2Results,
        },
        stage3_unwind: {
          count: stage3Results.length,
          data: stage3Results,
        },
        stage4_dateFilter: {
          count: stage4Results.length,
          data: stage4Results,
        },
        testWithObjectIdConversion: {
          count: testWithObjectIdConversion.length,
          data: testWithObjectIdConversion,
        },
        dateAnalysis,
      },
      pipeline,
    })
  } catch (error) {
    console.error("Aggregation debug error:", error)
    return NextResponse.json({ error: "Failed to debug aggregation", details: error.message }, { status: 500 })
  }
}
