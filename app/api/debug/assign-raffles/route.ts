import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { RAFFLES_COLLECTION } from "@/models/raffle"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    // Only allow admin users to trigger this
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Admin access required" }, { status: 401 })
    }

    const db = await getDb()

    console.log("🔍 Finding all raffles and business users...")

    // Get all raffles
    const raffles = await db.collection(RAFFLES_COLLECTION).find({}).toArray()
    console.log(`📊 Found ${raffles.length} raffles`)

    // Get all business users
    const businessUsers = await db.collection("users").find({ role: "business" }).toArray()
    console.log(`👥 Found ${businessUsers.length} business users`)

    if (raffles.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No raffles found. Please create a raffle in admin first.",
      })
    }

    if (businessUsers.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No business users found.",
      })
    }

    // Create business raffle assignments
    const businessRaffles = []

    for (const raffle of raffles) {
      for (const business of businessUsers) {
        // Check if assignment already exists
        const existing = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({
          businessId: business._id.toString(),
          raffleId: raffle._id.toString(),
        })

        if (!existing) {
          businessRaffles.push({
            businessId: business._id.toString(),
            raffleId: raffle._id.toString(),
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      }
    }

    let assignmentsCreated = 0
    if (businessRaffles.length > 0) {
      await db.collection(BUSINESS_RAFFLES_COLLECTION).insertMany(businessRaffles)
      assignmentsCreated = businessRaffles.length
      console.log(`✅ Created ${assignmentsCreated} business raffle assignments`)
    }

    // Get final counts
    const totalAssignments = await db.collection(BUSINESS_RAFFLES_COLLECTION).countDocuments()

    return NextResponse.json({
      success: true,
      message: `Successfully processed raffle assignments`,
      data: {
        rafflesFound: raffles.length,
        businessUsersFound: businessUsers.length,
        newAssignmentsCreated: assignmentsCreated,
        totalAssignments: totalAssignments,
      },
    })
  } catch (error) {
    console.error("❌ Error assigning raffles:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
