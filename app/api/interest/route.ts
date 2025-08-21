import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

interface InterestData {
  name: string
  email: string
  phone: string
  comments: string
  timestamp: Date
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, comments } = body

    // Basic validation
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Connect to MongoDB
    const db = await getDb()
    const interestsCollection = db.collection("interests")

    // Prepare data for insertion
    const interestData: InterestData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || "",
      comments: comments?.trim() || "",
      timestamp: new Date(),
    }

    // Insert into MongoDB
    const result = await interestsCollection.insertOne(interestData)

    if (!result.insertedId) {
      throw new Error("Failed to insert interest data")
    }

    return NextResponse.json(
      {
        success: true,
        message: "Interest registered successfully",
        id: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Interest registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
