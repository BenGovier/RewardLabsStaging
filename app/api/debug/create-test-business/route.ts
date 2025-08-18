import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { USERS_COLLECTION } from "@/models/user"

export async function GET() {
  console.log("Creating test business account...")

  try {
    const db = await getDb()
    const usersCollection = db.collection(USERS_COLLECTION)

    // Check if test business already exists
    const existingUser = await usersCollection.findOne({ email: "testbusiness@example.com" })

    if (existingUser) {
      console.log("Test business account already exists. Updating password...")

      // Update password
      const passwordHash = await bcrypt.hash("TestBusiness123!", 10)
      await usersCollection.updateOne(
        { email: "testbusiness@example.com" },
        {
          $set: {
            passwordHash,
            isActive: true,
          },
        },
      )

      return NextResponse.json({
        success: true,
        message: "Test business account updated successfully",
        user: {
          email: "testbusiness@example.com",
          password: "TestBusiness123!",
          businessName: existingUser.businessName,
          role: existingUser.role,
          _id: existingUser._id,
        },
      })
    } else {
      // Create new test business account
      const passwordHash = await bcrypt.hash("TestBusiness123!", 10)

      const newBusiness = {
        firstName: "Test",
        lastName: "Business",
        email: "testbusiness@example.com",
        passwordHash,
        role: "business",
        businessName: "Test Business Ltd",
        isActive: true,
        dateCreated: new Date(),
      }

      const result = await usersCollection.insertOne(newBusiness)

      return NextResponse.json({
        success: true,
        message: "Test business account created successfully",
        user: {
          _id: result.insertedId,
          email: "testbusiness@example.com",
          password: "TestBusiness123!",
          businessName: "Test Business Ltd",
          role: "business",
        },
      })
    }
  } catch (error) {
    console.error("Error creating test business account:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create test business account",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
