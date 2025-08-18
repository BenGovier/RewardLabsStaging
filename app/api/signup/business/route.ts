import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, businessName } = await request.json()

    // Validate input
    if (!email || !password || !firstName || !lastName || !businessName) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "Email already in use" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const result = await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      businessName,
      role: "business",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      {
        message: "Business account created successfully",
        userId: result.insertedId.toString(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating business account:", error)
    return NextResponse.json({ message: "Error creating business account" }, { status: 500 })
  }
}
