import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { type Raffle, RAFFLES_COLLECTION, validateRaffle } from "@/models/raffle"
import { USERS_COLLECTION } from "@/models/user"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"
import { put } from "@vercel/blob"

export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/admin/raffles - Starting request")

    // Check authentication
    const session = await getServerSession(authOptions)
    console.log("Session check:", {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role,
    })

    if (!session?.user) {
      console.log("No session found - returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (using lowercase to match the database)
    if (session.user.role !== "admin") {
      console.log("User role is not admin:", session.user.role, "- returning 403")
      return NextResponse.json(
        {
          error: "Forbidden",
          debug: {
            userRole: session.user.role,
            expectedRole: "admin",
          },
        },
        { status: 403 },
      )
    }

    console.log("User is admin - proceeding to fetch raffles")

    // Connect to database
    const db = await getDb()

    // Get all raffles
    const raffles = await db.collection(RAFFLES_COLLECTION).find({}).sort({ createdAt: -1 }).toArray()

    console.log("Found raffles:", raffles.length)

    return NextResponse.json({ raffles })
  } catch (error) {
    console.error("Error fetching raffles:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/admin/raffles - Starting request")

    // Check authentication
    const session = await getServerSession(authOptions)
    console.log("Session check:", {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.role,
    })

    if (!session?.user) {
      console.log("No session found - returning 401")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (using lowercase to match the database)
    if (session.user.role !== "admin") {
      console.log("User role is not admin:", session.user.role, "- returning 403")
      return NextResponse.json(
        {
          error: "Forbidden",
          debug: {
            userRole: session.user.role,
            expectedRole: "admin",
          },
        },
        { status: 403 },
      )
    }

    console.log("User is admin - proceeding to create raffle")

    // Parse form data
    const formData = await req.formData()

    // Extract basic raffle data
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const startDate = new Date(formData.get("startDate") as string)
    const endDate = new Date(formData.get("endDate") as string)

    console.log("Raffle data:", { title, description, startDate, endDate })

    // Handle prize images upload (up to 10)
    const prizeImageFiles = []
    for (let i = 0; i < 10; i++) {
      const file = formData.get(`prizeImage${i}`) as File
      if (file && file.size > 0) {
        prizeImageFiles.push(file)
      }
    }

    if (prizeImageFiles.length === 0) {
      return NextResponse.json({ error: "At least one prize image is required" }, { status: 400 })
    }

    console.log("Prize images to upload:", prizeImageFiles.length)

    // Upload prize images to Vercel Blob
    const prizeImages = []
    for (const file of prizeImageFiles) {
      const blob = await put(`raffles/prizes/${Date.now()}-${file.name}`, file, {
        access: "public",
      })
      prizeImages.push(blob.url)
    }

    // Handle cover image upload
    const coverImageFile = formData.get("coverImage") as File
    if (!coverImageFile || coverImageFile.size === 0) {
      return NextResponse.json({ error: "Cover image is required" }, { status: 400 })
    }

    const coverImageBlob = await put(`raffles/covers/${Date.now()}-${coverImageFile.name}`, coverImageFile, {
      access: "public",
    })

    // Get main image index
    const mainImageIndex = Number.parseInt(formData.get("mainImageIndex") as string) || 0

    // Create raffle object
    const raffle: Partial<Raffle> = {
      title,
      description,
      startDate,
      endDate,
      prizeImages,
      mainImageIndex,
      coverImage: coverImageBlob.url,
      createdBy: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Validate raffle
    const validationErrors = validateRaffle(raffle)
    if (validationErrors.length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 400 })
    }

    // Connect to database
    const db = await getDb()

    // Insert raffle
    const result = await db.collection(RAFFLES_COLLECTION).insertOne(raffle)
    const insertedRaffleId = result.insertedId

    console.log("Raffle created with ID:", insertedRaffleId)

    // Get all business users
    const businessUsers = await db.collection(USERS_COLLECTION).find({ role: "business" }).toArray()
    console.log("Found business users:", businessUsers.length)

    // Create business raffle instances for each business user
    const businessRaffles = businessUsers.map((user) => ({
      businessId: user._id.toString(),
      raffleId: insertedRaffleId.toString(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    if (businessRaffles.length > 0) {
      await db.collection(BUSINESS_RAFFLES_COLLECTION).insertMany(businessRaffles)
      console.log("Created business raffle instances:", businessRaffles.length)
    }

    return NextResponse.json({
      success: true,
      raffleId: insertedRaffleId,
      message: `Raffle created and associated with ${businessRaffles.length} business users`,
    })
  } catch (error) {
    console.error("Error creating raffle:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
