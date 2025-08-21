import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const businessId = session.user.id

    // Check business user
    const businessUser = await db.collection("users").findOne({
      _id: new ObjectId(businessId),
    })

    // Check all raffles
    const allRaffles = await db.collection("raffles").find({}).toArray()

    // Check business raffles
    const businessRaffles = await db
      .collection("businessRaffles")
      .find({
        businessId: new ObjectId(businessId),
      })
      .toArray()

    // Check what the API endpoint returns
    const currentDate = new Date()
    const activeRaffles = await db
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
                    $and: [{ $eq: ["$raffleId", "$$raffleId"] }, { $eq: ["$businessId", new ObjectId(businessId)] }],
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
      ])
      .toArray()

    return NextResponse.json({
      businessId,
      businessUser: businessUser
        ? {
            id: businessUser._id,
            email: businessUser.email,
            role: businessUser.role,
          }
        : null,
      allRafflesCount: allRaffles.length,
      allRaffles: allRaffles.map((r) => ({
        id: r._id,
        title: r.title,
        startDate: r.startDate,
        endDate: r.endDate,
        isActive: r.startDate <= currentDate && r.endDate >= currentDate,
      })),
      businessRafflesCount: businessRaffles.length,
      businessRaffles,
      activeRafflesCount: activeRaffles.length,
      activeRaffles: activeRaffles.map((r) => ({
        id: r._id,
        title: r.title,
        startDate: r.startDate,
        endDate: r.endDate,
        hasCustomization: !!r.customization,
      })),
    })
  } catch (error) {
    console.error("Debug check error:", error)
    return NextResponse.json(
      {
        error: "Debug check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
