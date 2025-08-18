import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { USER_COLLECTION, USERS_COLLECTION } from "@/models/user"

export async function GET(req: NextRequest) {
  try {
    const db = await getDb()

    const debugInfo = {
      constants: {
        USER_COLLECTION,
        USERS_COLLECTION,
      },
      collections: {},
      queries: {},
    }

    // Check what collections exist
    const collections = await db.listCollections().toArray()
    debugInfo.collections.available = collections.map((c) => c.name)

    // Try to find the business user with different collection names
    const businessId = "6845b9e8d059910abe67c24a"

    // Try with USER_COLLECTION constant
    try {
      const result1 = await db.collection(USER_COLLECTION).findOne({ _id: businessId })
      debugInfo.queries.USER_COLLECTION = {
        collection: USER_COLLECTION,
        found: !!result1,
        result: result1 ? { _id: result1._id, email: result1.email, role: result1.role } : null,
      }
    } catch (error) {
      debugInfo.queries.USER_COLLECTION = {
        collection: USER_COLLECTION,
        error: String(error),
      }
    }

    // Try with USERS_COLLECTION constant
    try {
      const result2 = await db.collection(USERS_COLLECTION).findOne({ _id: businessId })
      debugInfo.queries.USERS_COLLECTION = {
        collection: USERS_COLLECTION,
        found: !!result2,
        result: result2 ? { _id: result2._id, email: result2.email, role: result2.role } : null,
      }
    } catch (error) {
      debugInfo.queries.USERS_COLLECTION = {
        collection: USERS_COLLECTION,
        error: String(error),
      }
    }

    // Try with hardcoded "users"
    try {
      const result3 = await db.collection("users").findOne({ _id: businessId })
      debugInfo.queries.hardcoded_users = {
        collection: "users",
        found: !!result3,
        result: result3 ? { _id: result3._id, email: result3.email, role: result3.role } : null,
      }
    } catch (error) {
      debugInfo.queries.hardcoded_users = {
        collection: "users",
        error: String(error),
      }
    }

    // Check what's actually in the users collection
    try {
      const allUsers = await db.collection("users").find({}).limit(3).toArray()
      debugInfo.queries.sample_users = {
        count: allUsers.length,
        samples: allUsers.map((u) => ({ _id: u._id, email: u.email, role: u.role })),
      }
    } catch (error) {
      debugInfo.queries.sample_users = { error: String(error) }
    }

    return NextResponse.json({
      success: true,
      debug: debugInfo,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
    })
  }
}
