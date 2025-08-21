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

    // Create a test raffle
    const testRaffle = {
      title: "Monthly Prize Draw",
      description: "Win amazing prizes every month! Enter now for your chance to win.",
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Started 7 days ago
      endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000), // Ends in 23 days
      images: ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=400&width=600"],
      coverImage: "/placeholder.svg?height=600&width=800",
      createdBy: new ObjectId(businessId),
      createdAt: new Date(),
      isActive: true,
    }

    const raffleResult = await db.collection("raffles").insertOne(testRaffle)

    // Create business raffle customization
    const businessRaffle = {
      businessId: new ObjectId(businessId),
      raffleId: raffleResult.insertedId,
      customTitle: "Monthly Prize Draw",
      customDescription: "Win amazing prizes every month! Enter now for your chance to win.",
      customizations: {
        primaryColor: "#3b82f6",
        logo: "/placeholder.svg?height=100&width=200",
        showBranding: true,
      },
      createdAt: new Date(),
    }

    await db.collection("businessRaffles").insertOne(businessRaffle)

    return NextResponse.json({
      success: true,
      message: "Test raffle created successfully",
      raffleId: raffleResult.insertedId,
      raffle: testRaffle,
    })
  } catch (error) {
    console.error("Create test raffle error:", error)
    return NextResponse.json(
      {
        error: "Failed to create test raffle",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
