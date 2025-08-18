import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const businessId = session.user.id

    // Get all active raffles
    const currentDate = new Date()
    const activeRaffles = await db
      .collection("raffles")
      .find({
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
      })
      .toArray()

    // Get existing business raffle records for this business
    const existingBusinessRaffles = await db
      .collection("businessRaffles")
      .find({
        businessId: new ObjectId(businessId),
      })
      .toArray()

    const existingRaffleIds = existingBusinessRaffles.map((br) => br.raffleId.toString())

    // Create business raffle records for missing raffles
    const missingRaffles = activeRaffles.filter((raffle) => !existingRaffleIds.includes(raffle._id.toString()))

    const businessRafflesToCreate = missingRaffles.map((raffle) => ({
      businessId: new ObjectId(businessId),
      raffleId: new ObjectId(raffle._id),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    let insertResult = null
    if (businessRafflesToCreate.length > 0) {
      insertResult = await db.collection("businessRaffles").insertMany(businessRafflesToCreate)
    }

    return NextResponse.json({
      success: true,
      message: `Assigned ${businessRafflesToCreate.length} missing raffles to business`,
      businessId,
      activeRafflesFound: activeRaffles.length,
      existingBusinessRaffles: existingBusinessRaffles.length,
      newBusinessRafflesCreated: businessRafflesToCreate.length,
      createdRaffles: missingRaffles.map((r) => ({
        id: r._id,
        title: r.title,
        startDate: r.startDate,
        endDate: r.endDate,
      })),
      insertedIds: insertResult?.insertedIds || [],
    })
  } catch (error) {
    console.error("Assign missing raffles error:", error)
    return NextResponse.json(
      {
        error: "Failed to assign missing raffles",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
