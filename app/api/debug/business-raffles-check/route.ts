import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { RAFFLES_COLLECTION } from "@/models/raffle"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    console.log("🔍 Checking business raffles status...")

    const db = await getDb()

    // Get all raffles
    const raffles = await db.collection(RAFFLES_COLLECTION).find({}).toArray()
    console.log(`📊 Found ${raffles.length} raffles`)

    // Get all business users
    const businessUsers = await db.collection("users").find({ role: "business" }).toArray()
    console.log(`👥 Found ${businessUsers.length} business users`)

    // Get all business raffle assignments
    const businessRaffles = await db.collection(BUSINESS_RAFFLES_COLLECTION).find({}).toArray()
    console.log(`🎯 Found ${businessRaffles.length} business raffle assignments`)

    // Get assignments for current user if they're a business user
    let currentUserAssignments = []
    if (session.user.role === "business") {
      currentUserAssignments = await db
        .collection(BUSINESS_RAFFLES_COLLECTION)
        .find({ businessId: session.user.id })
        .toArray()
      console.log(`👤 Current user has ${currentUserAssignments.length} raffle assignments`)
    }

    return NextResponse.json({
      success: true,
      data: {
        totalRaffles: raffles.length,
        totalBusinessUsers: businessUsers.length,
        totalBusinessRaffleAssignments: businessRaffles.length,
        currentUserRole: session.user.role,
        currentUserId: session.user.id,
        currentUserAssignments: currentUserAssignments.length,
        raffles: raffles.map((r) => ({
          id: r._id.toString(),
          title: r.title,
          startDate: r.startDate,
          endDate: r.endDate,
          createdAt: r.createdAt,
        })),
        businessUsers: businessUsers.map((u) => ({
          id: u._id.toString(),
          email: u.email,
          businessName: u.businessName,
        })),
        assignments: businessRaffles.map((br) => ({
          id: br._id.toString(),
          businessId: br.businessId,
          raffleId: br.raffleId,
          isActive: br.isActive,
        })),
        currentUserAssignments: currentUserAssignments,
      },
    })
  } catch (error) {
    console.error("❌ Error checking business raffles:", error)
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
