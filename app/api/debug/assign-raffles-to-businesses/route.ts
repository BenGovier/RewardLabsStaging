import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase()

    // Get all raffles
    const raffles = await db.collection("raffles").find({}).toArray()

    // Get all business users
    const businesses = await db
      .collection("users")
      .find({
        role: "business",
      })
      .toArray()

    let assignmentsCreated = 0
    let duplicatesSkipped = 0

    // Assign each raffle to each business
    for (const raffle of raffles) {
      for (const business of businesses) {
        // Check if assignment already exists
        const existingAssignment = await db.collection("businessRaffles").findOne({
          businessId: business._id.toString(),
          raffleId: raffle._id.toString(),
        })

        if (!existingAssignment) {
          // Create new assignment
          await db.collection("businessRaffles").insertOne({
            businessId: business._id.toString(),
            raffleId: raffle._id.toString(),
            isActive: true,
            createdAt: new Date(),
            businessCustomizations: {
              logo: null,
              primaryColor: "#3B82F6",
              secondaryColor: "#1E40AF",
              customQuestions: [],
              emailTemplate: "default",
            },
          })
          assignmentsCreated++
        } else {
          duplicatesSkipped++
        }
      }
    }

    return NextResponse.json({
      message: "Raffle assignments completed successfully",
      results: {
        rafflesFound: raffles.length,
        businessesFound: businesses.length,
        assignmentsCreated,
        duplicatesSkipped,
        totalPossibleAssignments: raffles.length * businesses.length,
      },
      assignments: assignmentsCreated > 0 ? "New assignments created" : "All assignments already existed",
    })
  } catch (error) {
    console.error("Assignment error:", error)
    return NextResponse.json(
      { error: "Failed to assign raffles to businesses", details: error.message },
      { status: 500 },
    )
  }
}
