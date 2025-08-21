import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"

export const dynamic = "force-dynamic"

// Debug endpoint to check users in database
export async function GET(request: NextRequest) {
  try {
    // Get the debug key from URL parameters
    const debugKey = request.nextUrl.searchParams.get("key")
    const expectedKey = process.env.SETUP_KEY

    console.log("Debug request received")
    console.log("Provided key exists:", !!debugKey)
    console.log("Expected key exists:", !!expectedKey)
    console.log("Keys match:", debugKey === expectedKey)

    // Basic security check
    if (!debugKey || !expectedKey || debugKey !== expectedKey) {
      console.log("Authorization failed")
      return NextResponse.json(
        {
          error: "Unauthorized",
          debug: {
            keyProvided: !!debugKey,
            keyExpected: !!expectedKey,
            keysMatch: debugKey === expectedKey,
          },
        },
        { status: 401 },
      )
    }

    console.log("Authorization successful, checking database...")

    const db = await getDb()
    const usersCollection = db.collection(USERS_COLLECTION)

    // Get all users (excluding password hashes for security)
    const users = await usersCollection.find({}).project({ passwordHash: 0, password: 0 }).toArray()

    // Get admin users specifically
    const adminUsers = await usersCollection.find({ role: "admin" }).project({ passwordHash: 0, password: 0 }).toArray()

    // Check if the specific admin email exists
    const benAdmin = await usersCollection.findOne(
      { email: "ben@raffily.co.uk" },
      { projection: { passwordHash: 0, password: 0 } },
    )

    // Also check with any email variations
    const allBenUsers = await usersCollection
      .find({ email: { $regex: "ben.*raffily", $options: "i" } }, { projection: { passwordHash: 0, password: 0 } })
      .toArray()

    console.log("Database check complete")
    console.log("Total users found:", users.length)
    console.log("Admin users found:", adminUsers.length)

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      adminUsersCount: adminUsers.length,
      users: users,
      adminUsers: adminUsers,
      benAdmin: benAdmin,
      allBenUsers: allBenUsers,
      collectionName: USERS_COLLECTION,
      databaseConnected: true,
    })
  } catch (error) {
    console.error("Error checking users:", error)
    return NextResponse.json(
      {
        error: "Database error",
        details: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
