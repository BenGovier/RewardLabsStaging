import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"

export const dynamic = "force-dynamic"

// Simple debug endpoint - no authentication required (temporary)
export async function GET(request: NextRequest) {
  try {
    console.log("Simple debug endpoint accessed")

    const db = await getDb()
    const usersCollection = db.collection(USERS_COLLECTION)

    // Get basic counts
    const totalUsers = await usersCollection.countDocuments()
    const adminUsers = await usersCollection.countDocuments({ role: "admin" })

    // Check if ben@raffily.co.uk exists
    const benUser = await usersCollection.findOne(
      { email: "ben@raffily.co.uk" },
      { projection: { _id: 1, email: 1, role: 1, firstName: 1, lastName: 1, isActive: 1, dateCreated: 1 } },
    )

    // Get all users (basic info only)
    const allUsers = await usersCollection
      .find({}, { projection: { _id: 1, email: 1, role: 1, firstName: 1, lastName: 1, isActive: 1, dateCreated: 1 } })
      .toArray()

    console.log("Database check results:")
    console.log("Total users:", totalUsers)
    console.log("Admin users:", adminUsers)
    console.log("Ben user found:", !!benUser)

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        collection: USERS_COLLECTION,
      },
      counts: {
        totalUsers,
        adminUsers,
      },
      benUser: benUser,
      allUsers: allUsers,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Simple debug error:", error)
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
