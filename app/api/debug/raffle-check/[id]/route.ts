import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import { RAFFLES_COLLECTION } from "@/models/raffle"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("Debug: Checking raffle ID:", id)

    // Connect to database - use getDb() directly
    const db = await getDb()

    // Check collection stats
    const totalRaffles = await db.collection(RAFFLES_COLLECTION).countDocuments()
    console.log("Total raffles in collection:", totalRaffles)

    // List all raffle IDs for debugging
    const allRaffles = await db
      .collection(RAFFLES_COLLECTION)
      .find({}, { projection: { _id: 1, title: 1 } })
      .limit(10)
      .toArray()

    console.log("Sample raffles:", allRaffles)

    // Try to find by ObjectId
    let raffleById = null
    if (ObjectId.isValid(id)) {
      raffleById = await db.collection(RAFFLES_COLLECTION).findOne({
        _id: new ObjectId(id),
      })
    }

    // Try to find by string ID
    const raffleByStringId = await db.collection(RAFFLES_COLLECTION).findOne({
      _id: id,
    })

    return NextResponse.json({
      searchId: id,
      isValidObjectId: ObjectId.isValid(id),
      totalRaffles,
      sampleRaffles: allRaffles,
      foundByObjectId: !!raffleById,
      foundByStringId: !!raffleByStringId,
      raffleData: raffleById || raffleByStringId || null,
    })
  } catch (error) {
    console.error("Debug raffle check error:", error)
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
