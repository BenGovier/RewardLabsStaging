import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { WEBSITE_LEADS_COLLECTION, type WebsiteLead } from "@/models/websiteLead"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source } = body

    // Basic validation
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Email format validation
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Connect to MongoDB
    const db = await getDb()
    const websiteLeadsCollection = db.collection(WEBSITE_LEADS_COLLECTION)

    // Check if email already exists
    const existingLead = await websiteLeadsCollection.findOne({ email: email.toLowerCase() })
    if (existingLead) {
      return NextResponse.json({ message: "Email already registered" }, { status: 200 })
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Prepare data for insertion
    const websiteLeadData: WebsiteLead = {
      email: email.trim().toLowerCase(),
      source: source || "unknown",
      timestamp: new Date(),
      ipAddress,
      userAgent,
    }

    // Insert into MongoDB
    const result = await websiteLeadsCollection.insertOne(websiteLeadData)

    if (!result.insertedId) {
      throw new Error("Failed to insert website lead data")
    }

    return NextResponse.json(
      {
        success: true,
        message: "Email registered successfully",
        id: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Website lead registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // This endpoint is for admin use only - you might want to add authentication here
    const db = await getDb()
    const websiteLeadsCollection = db.collection(WEBSITE_LEADS_COLLECTION)

    // Get query parameters for pagination
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    // Get total count
    const totalCount = await websiteLeadsCollection.countDocuments()

    // Get leads with pagination
    const leads = await websiteLeadsCollection.find({}).sort({ timestamp: -1 }).skip(skip).limit(limit).toArray()

    return NextResponse.json({
      leads,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching website leads:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
