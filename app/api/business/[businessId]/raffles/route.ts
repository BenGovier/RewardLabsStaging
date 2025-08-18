import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the business ID matches the session user
    if (session.user.id !== params.businessId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { db } = await connectToDatabase()
    const businessId = params.businessId

    // Get current date for filtering active raffles
    const currentDate = new Date()

    // Get all active raffles with business customizations
    const raffles = await db
      .collection("raffles")
      .aggregate([
        {
          $match: {
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
          },
        },
        {
          $lookup: {
            from: "businessRaffles",
            let: { raffleId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$raffleId", "$$raffleId"] },
                      { $eq: ["$businessId", new ObjectId(businessId)] },
                      { $eq: ["$isActive", true] },
                    ],
                  },
                },
              },
            ],
            as: "businessCustomization",
          },
        },
        {
          $addFields: {
            customization: { $arrayElemAt: ["$businessCustomization", 0] },
          },
        },
        // Only include raffles that have a business customization OR create default ones
        {
          $addFields: {
            title: {
              $ifNull: ["$customization.customTitle", "$title"],
            },
            description: {
              $ifNull: ["$customization.customDescription", "$description"],
            },
            images: {
              $ifNull: ["$customization.customImages", "$prizeImages"],
            },
            coverImage: {
              $ifNull: ["$customization.customCoverImage", "$coverImage"],
            },
            customizations: {
              $ifNull: ["$customization.businessCustomizations", {}],
            },
            entryUrl: {
              $literal: `/api/business/${businessId}/entries`,
            },
            publicUrl: {
              $concat: ["/r/", businessId, "/", { $toString: "$_id" }],
            },
          },
        },
        {
          $project: {
            raffleId: { $toString: "$_id" },
            title: 1,
            description: 1,
            startDate: 1,
            endDate: 1,
            images: 1,
            coverImage: 1,
            customizations: 1,
            entryUrl: 1,
            publicUrl: 1,
            _id: 0,
          },
        },
      ])
      .toArray()

    // If no raffles found, check if we need to create business raffle records
    if (raffles.length === 0) {
      // Get all active raffles without business filter
      const allActiveRaffles = await db
        .collection("raffles")
        .find({
          startDate: { $lte: currentDate },
          endDate: { $gte: currentDate },
        })
        .toArray()

      if (allActiveRaffles.length > 0) {
        // Create business raffle records for all active raffles
        const businessRafflesToCreate = allActiveRaffles.map((raffle) => ({
          businessId: new ObjectId(businessId),
          raffleId: new ObjectId(raffle._id),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))

        await db.collection("businessRaffles").insertMany(businessRafflesToCreate)

        // Return the raffles with default customizations
        const defaultRaffles = allActiveRaffles.map((raffle) => ({
          raffleId: raffle._id.toString(),
          title: raffle.title,
          description: raffle.description,
          startDate: raffle.startDate,
          endDate: raffle.endDate,
          images: raffle.prizeImages || [],
          coverImage: raffle.coverImage || "",
          customizations: {},
          entryUrl: `/api/business/${businessId}/entries`,
          publicUrl: `/r/${businessId}/${raffle._id}`,
        }))

        return NextResponse.json({
          success: true,
          raffles: defaultRaffles,
          message: `Auto-assigned ${allActiveRaffles.length} active raffles to business`,
        })
      }
    }

    return NextResponse.json({
      success: true,
      raffles,
    })
  } catch (error) {
    console.error("Error fetching business raffles:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch raffles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
