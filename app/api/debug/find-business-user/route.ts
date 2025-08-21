import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    console.log("=== FIND BUSINESS USER DEBUG ===")

    const db = await getDb()
    const businessUserId = "6845b9e8d059910abe67c24a"
    const businessEmail = "testbusiness@example.com"

    // Get all collection names
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    console.log("Available collections:", collectionNames)

    const results = {
      searchId: businessUserId,
      searchEmail: businessEmail,
      collections: collectionNames,
      searches: {} as any,
    }

    // Search in users collection specifically
    try {
      const usersCollection = db.collection("users")

      // Search by ID as string
      const userByStringId = await usersCollection.findOne({ _id: businessUserId })

      // Search by email
      const userByEmail = await usersCollection.findOne({ email: businessEmail })

      // Get all business role users
      const businessUsers = await usersCollection.find({ role: "business" }).toArray()

      // Get total user count
      const totalUsers = await usersCollection.countDocuments()

      results.searches.users = {
        byStringId: userByStringId,
        byEmail: userByEmail,
        businessUsers: businessUsers,
        totalUsers: totalUsers,
      }
    } catch (error) {
      results.searches.users = { error: error.message }
    }

    // Search in all other collections for this ID
    for (const collectionName of collectionNames) {
      if (collectionName === "users") continue // Already checked above

      try {
        const collection = db.collection(collectionName)
        const foundById = await collection.findOne({ _id: businessUserId })
        const foundByBusinessId = await collection.findOne({ businessId: businessUserId })

        if (foundById || foundByBusinessId) {
          results.searches[collectionName] = {
            foundById,
            foundByBusinessId,
          }
        }
      } catch (error) {
        // Skip collections that might have different schemas
        console.log(`Skipping collection ${collectionName}:`, error.message)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Business user search completed",
      results,
    })
  } catch (error) {
    console.error("Find business user error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        debug: error.message,
      },
      { status: 500 },
    )
  }
}
