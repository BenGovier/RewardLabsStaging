import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { businessId: string } }) {
  try {
    const { businessId } = params
    const db = await getDb()

    console.log("=== USER ID RESOLUTION DEBUG ===")
    console.log("Input businessId:", businessId)
    console.log("businessId type:", typeof businessId)
    console.log("businessId length:", businessId.length)

    // Test 1: Direct string lookup
    const userByString = await db.collection("users").findOne({ _id: businessId })
    console.log("User found by string _id:", !!userByString)

    // Test 2: ObjectId lookup (if valid ObjectId format)
    let userByObjectId = null
    let isValidObjectId = false
    try {
      if (ObjectId.isValid(businessId)) {
        isValidObjectId = true
        userByObjectId = await db.collection("users").findOne({ _id: new ObjectId(businessId) })
        console.log("User found by ObjectId _id:", !!userByObjectId)
      }
    } catch (objIdError) {
      console.log("ObjectId conversion failed:", objIdError)
    }

    // Test 3: Email lookup (fallback)
    const userByEmail = await db.collection("users").findOne({ email: businessId })
    console.log("User found by email:", !!userByEmail)

    // Test 4: Find all business users and check their _id types
    const allBusinessUsers = await db.collection("users").find({ role: "business" }).toArray()
    console.log("All business users count:", allBusinessUsers.length)

    const userIdAnalysis = allBusinessUsers.map((user) => ({
      _id: user._id,
      idType: typeof user._id,
      isObjectId: user._id instanceof ObjectId,
      stringValue: user._id.toString(),
      email: user.email,
      businessName: user.businessName,
    }))

    console.log("User ID analysis:", userIdAnalysis)

    // Test 5: Check if any user matches our businessId
    const matchingUser = allBusinessUsers.find(
      (user) => user._id === businessId || user._id.toString() === businessId || user.email === businessId,
    )

    return NextResponse.json({
      success: true,
      debug: {
        input: {
          businessId,
          type: typeof businessId,
          length: businessId.length,
          isValidObjectId,
        },
        lookupResults: {
          foundByString: !!userByString,
          foundByObjectId: !!userByObjectId,
          foundByEmail: !!userByEmail,
          foundMatching: !!matchingUser,
        },
        userData: {
          byString: userByString ? { _id: userByString._id, email: userByString.email } : null,
          byObjectId: userByObjectId ? { _id: userByObjectId._id, email: userByObjectId.email } : null,
          byEmail: userByEmail ? { _id: userByEmail._id, email: userByEmail.email } : null,
          matching: matchingUser ? { _id: matchingUser._id, email: matchingUser.email } : null,
        },
        allBusinessUsers: userIdAnalysis,
      },
    })
  } catch (error) {
    console.error("Debug resolve user ID error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      debug: { businessId: params.businessId },
    })
  }
}
