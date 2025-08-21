import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"
import { RAFFLES_COLLECTION } from "@/models/raffle"

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 Business raffles API called")

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
          error: "Forbidden",
          debug: {
            userRole: session.user.role,
            expectedRole: "business",
          },
        },
        { status: 403 },
      )
    }

    console.log("✅ User is authorized business user")

    // Connect to database using the same pattern as other working APIs
    const db = await getDb()
    console.log("✅ Connected to database")

    // Get business raffles for this user
    const businessRaffles = await db
      .collection(BUSINESS_RAFFLES_COLLECTION)
      .find({
        businessId: session.user.id,
        isActive: true,
      })
      .toArray()

    console.log("📊 Found business raffles:", businessRaffles.length)

    // Get the associated raffle details
    const raffleIds = businessRaffles.map((br) => new ObjectId(br.raffleId))
    console.log("🎯 Looking for raffle IDs:", raffleIds)

    const raffles = await db
      .collection(RAFFLES_COLLECTION)
      .find({
        _id: { $in: raffleIds },
      })
      .toArray()

    console.log("🎪 Found raffles:", raffles.length)

    // Combine business raffle data with raffle details
    const combinedRaffles = businessRaffles.map((businessRaffle) => {
      const raffle = raffles.find((r) => r._id.toString() === businessRaffle.raffleId)
      return {
        ...businessRaffle,
        raffle,
      }
    })

    console.log("✅ Returning combined raffles:", combinedRaffles.length)

    return NextResponse.json({
      raffles: combinedRaffles,
      debug: {
        businessRafflesCount: businessRaffles.length,
        rafflesCount: raffles.length,
        combinedCount: combinedRaffles.length,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching business raffles:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        debug: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
