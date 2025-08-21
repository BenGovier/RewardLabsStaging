import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST() {
  try {
    console.log("=== Fixing Business User Role ===")

    const { db } = await connectToDatabase()

    // Find the business user
    const user = await db.collection("users").findOne({
      email: "testbusiness@example.com",
    })

    if (!user) {
      return NextResponse.json({ error: "Business user not found" }, { status: 404 })
    }

    console.log("Found user:", {
      id: user._id,
      email: user.email,
      currentRole: user.role,
      name: user.name,
    })

    // Update the user role to 'business'
    const updateResult = await db.collection("users").updateOne(
      { email: "testbusiness@example.com" },
      {
        $set: {
          role: "business",
          updatedAt: new Date(),
        },
      },
    )

    console.log("Update result:", updateResult)

    // Verify the update
    const updatedUser = await db.collection("users").findOne({
      email: "testbusiness@example.com",
    })

    return NextResponse.json({
      success: true,
      message: "Business user role fixed",
      before: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      after: {
        id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      updateResult: {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
      },
    })
  } catch (error) {
    console.error("Error fixing business user role:", error)
    return NextResponse.json(
      {
        error: "Failed to fix business user role",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
