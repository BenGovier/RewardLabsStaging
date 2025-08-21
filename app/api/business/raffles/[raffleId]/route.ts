import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"
import { RAFFLES_COLLECTION } from "@/models/raffle"

export async function GET(req: NextRequest, { params }: { params: { raffleId: string } }) {
  try {
    console.log("🔍 Business raffle detail API called for raffleId:", params.raffleId)

    // Check authentication
    const session = await getServerSession(authOptions)
    console.log("📋 Session data:", {
      hasSession: !!session,
      userId: session?.user?.id,
      role: session?.user?.role,
      email: session?.user?.email,
    })

    if (!session?.user) {
      console.log("❌ No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is business (lowercase)
    if (session.user.role !== "business") {
      console.log("❌ User role is not business:", session.user.role)
      return NextResponse.json(
        {
          error: "Forbidden - Role Check Failed",
          debug: {
            userRole: session.user.role,
            expectedRole: "business",
            userId: session.user.id,
            raffleId: params.raffleId,
          },
        },
        { status: 403 },
      )
    }

    console.log("✅ User is authorized business user")

    // Connect to database
    const db = await getDb()
    console.log("✅ Connected to database")

    // Check if this business user has access to this specific raffle
    const businessRaffle = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({
      businessId: session.user.id,
      raffleId: params.raffleId,
      isActive: true,
    })

    console.log("🎯 Business raffle found:", !!businessRaffle)

    if (!businessRaffle) {
      console.log("❌ Business user does not have access to this raffle")
      console.log("🔍 Checking what raffles this business has access to...")

      // Debug: Show what raffles this business user has access to
      const allBusinessRaffles = await db
        .collection(BUSINESS_RAFFLES_COLLECTION)
        .find({ businessId: session.user.id })
        .toArray()

      console.log(
        "📊 All business raffles for this user:",
        allBusinessRaffles.map((br) => ({
          raffleId: br.raffleId,
          isActive: br.isActive,
        })),
      )

      return NextResponse.json(
        {
          error: "Forbidden - Raffle Access Denied",
          debug: {
            message: "Business user does not have access to this raffle",
            requestedRaffleId: params.raffleId,
            businessId: session.user.id,
            availableRaffles: allBusinessRaffles.map((br) => br.raffleId),
          },
        },
        { status: 403 },
      )
    }

    // Get the raffle details
    const raffle = await db.collection(RAFFLES_COLLECTION).findOne({ _id: new ObjectId(params.raffleId) })

    console.log("🎪 Raffle details found:", !!raffle)

    if (!raffle) {
      console.log("❌ Raffle not found in raffles collection")
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 })
    }

    // Combine business raffle data with raffle details
    const result = {
      ...businessRaffle,
      raffle,
    }

    console.log("✅ Returning business raffle details")

    return NextResponse.json({
      businessRaffle: result,
      debug: {
        businessRaffleId: businessRaffle._id,
        raffleId: raffle._id,
        hasCustomizations: !!businessRaffle.businessCustomizations,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching business raffle:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        debug: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: { raffleId: string } }) {
  try {
    console.log("🔄 Business raffle update API called for raffleId:", params.raffleId)

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "business") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    console.log("📝 Update data received:", Object.keys(body))

    // Connect to database
    const db = await getDb()

    // Verify business user has access to this raffle
    const businessRaffle = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({
      businessId: session.user.id,
      raffleId: params.raffleId,
      isActive: true,
    })

    if (!businessRaffle) {
      return NextResponse.json({ error: "Forbidden - No access to this raffle" }, { status: 403 })
    }

    // Update the business raffle customizations
    const updateResult = await db.collection(BUSINESS_RAFFLES_COLLECTION).updateOne(
      {
        businessId: session.user.id,
        raffleId: params.raffleId,
      },
      {
        $set: {
          businessCustomizations: body.businessCustomizations,
          updatedAt: new Date(),
        },
      },
    )

    console.log("✅ Business raffle updated:", updateResult.modifiedCount > 0)

    return NextResponse.json({
      success: true,
      modified: updateResult.modifiedCount > 0,
    })
  } catch (error) {
    console.error("❌ Error updating business raffle:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
