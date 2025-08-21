import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { validateEntry } from "@/models/entry"

export async function POST(request: NextRequest, { params }: { params: { businessId: string } }) {
  try {
    const { businessId } = params

    // Validate businessId format
    if (!ObjectId.isValid(businessId)) {
      return NextResponse.json({ error: "Invalid business ID format" }, { status: 400 })
    }

    const body = await request.json()
    const { db } = await connectToDatabase()

    // Find current active raffle for this business
    const currentDate = new Date()

    const businessRaffle = await db
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

    if (businessRaffle.length === 0) {
      return NextResponse.json({ error: "No active raffle found" }, { status: 404 })
    }

    const raffleId = businessRaffle[0].raffleId

    // Prepare entry data
    const entryData = {
      businessId: new ObjectId(businessId),
      raffleId: raffleId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      answers: body.answers || {},
      agreedToTerms: body.agreedToTerms,
      agreedToMarketing: body.agreedToMarketing || false,
      consentTimestamp: new Date(),
      submittedAt: new Date(),
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      createdAt: new Date(),
    }

    // Validate entry data
    const validationErrors = validateEntry(entryData)
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: validationErrors }, { status: 400 })
    }

    // Check for duplicate email in this raffle
    const existingEntry = await db.collection("entries").findOne({
      businessId: new ObjectId(businessId),
      raffleId: raffleId,
      email: entryData.email.toLowerCase(),
    })

    if (existingEntry) {
      return NextResponse.json({ error: "Email already entered in this raffle" }, { status: 409 })
    }

    // Insert entry
    const result = await db.collection("entries").insertOne(entryData)

    return NextResponse.json({
      success: true,
      entryId: result.insertedId,
      message: "Entry submitted successfully",
    })
  } catch (error) {
    console.error("Error submitting entry:", error)
    return NextResponse.json({ error: "Failed to submit entry" }, { status: 500 })
  }
}
