import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { USERS_COLLECTION } from "@/models/user"

export const dynamic = "force-dynamic"

// This is a one-time setup endpoint to create the first admin user
export async function POST(request: NextRequest) {
  try {
    // Parse the request body first
    const { email, password, firstName, lastName, setupKey } = await request.json()

    // Validate setup key from request body instead of headers
    if (!setupKey || setupKey !== process.env.SETUP_KEY) {
      console.log("Setup attempt with invalid key. Received:", setupKey ? "***" : "undefined")
      console.log("Expected setup key exists:", !!process.env.SETUP_KEY)
      return NextResponse.json(
        { error: "Invalid setup key" },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    const db = await getDb()
    const usersCollection = db.collection(USERS_COLLECTION)

    // Check if any admin users already exist
    const existingAdmin = await usersCollection.findOne({ role: "admin" })
    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin user already exists" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "All fields are required" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Check if email is already in use
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create the admin user
    const newAdmin = {
      email: email.toLowerCase(),
      passwordHash,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: "admin",
      isActive: true,
      dateCreated: new Date(),
    }

    // Insert the admin user
    const result = await usersCollection.insertOne(newAdmin)

    console.log("Admin user created successfully:", result.insertedId)

    return NextResponse.json(
      {
        success: true,
        message: "Admin user created successfully",
        userId: result.insertedId,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json(
      { error: "Failed to create admin user" },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
