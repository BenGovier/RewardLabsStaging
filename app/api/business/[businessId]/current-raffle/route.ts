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

    // Find current active raffle for this business
    const currentDate = new Date()

    const businessRaffle = await db
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
        {
          $sort: { "raffle.startDate": -1 },
        },
        {
          $limit: 1,
        },
      ])
      .toArray()

    if (businessRaffle.length === 0) {
      return NextResponse.json(
        {
          error: "No active raffle found",
          message: "There is currently no active raffle for this business",
        },
        { status: 404 },
      )
    }

    const result = businessRaffle[0]

    // Format response for API integration
    const response = {
      raffleId: result.raffleId,
      businessId: result.businessId,
      title: result.customTitle || result.raffle.title,
      description: result.customDescription || result.raffle.description,
      startDate: result.raffle.startDate,
      endDate: result.raffle.endDate,
      images: result.customImages || result.raffle.images || [],
      mainImageIndex: result.customMainImageIndex || result.raffle.mainImageIndex || 0,
      coverImage: result.customCoverImage || result.raffle.coverImage,
      customizations: result.businessCustomizations || {},
      entryUrl: `/api/business/${businessId}/entries`,
      publicUrl: `/r/${businessId}/${result.raffleId}`,
      isActive: true,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching current raffle:", error)
    return NextResponse.json({ error: "Failed to fetch current raffle" }, { status: 500 })
  }
}
