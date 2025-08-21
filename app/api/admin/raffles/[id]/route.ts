import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import { RAFFLES_COLLECTION, validateRaffle } from "@/models/raffle"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"
import { put } from "@vercel/blob"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== GET Raffle Route Debug ===")

    // Check authentication with authOptions
    const session = await getServerSession(authOptions)
    console.log("Session exists:", !!session)

    if (!session?.user) {
      console.log("No session or user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Session user details:", {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      name: session.user.name,
    })

    // Check if user is admin
    if (session.user.role !== "admin") {
      console.log("Access denied - User role:", session.user.role, "Required: admin")
      return NextResponse.json(
        {
          error: "Forbidden - Admin access required",
          userRole: session.user.role,
          requiredRole: "admin",
        },
        { status: 403 },
      )
    }

    const id = params.id
    console.log("Fetching raffle with ID:", id)

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      console.log("Invalid ObjectId:", id)
      return NextResponse.json({ error: "Invalid raffle ID format" }, { status: 400 })
    }

    // Connect to database - use getDb() directly
    let db
    try {
      db = await getDb()
      console.log("Database connection established successfully")
    } catch (dbConnError) {
      console.error("Database connection failed:", dbConnError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: dbConnError.message,
        },
        { status: 500 },
      )
    }

    // Check if collection exists and get raffle
    try {
      console.log("Querying collection:", RAFFLES_COLLECTION)
      console.log("Looking for ObjectId:", new ObjectId(id))

      // First, let's check if the collection exists and has any documents
      const collectionStats = await db.collection(RAFFLES_COLLECTION).countDocuments()
      console.log(`Collection ${RAFFLES_COLLECTION} has ${collectionStats} documents`)

      // Try to find the specific raffle
      const raffle = await db.collection(RAFFLES_COLLECTION).findOne({
        _id: new ObjectId(id),
      })

      console.log("Raffle query result:", raffle ? "Found" : "Not found")

      if (!raffle) {
        // Let's also check if there are any raffles with this ID as a string
        const raffleByStringId = await db.collection(RAFFLES_COLLECTION).findOne({
          _id: id,
        })
        console.log("Raffle by string ID:", raffleByStringId ? "Found" : "Not found")

        return NextResponse.json({ error: "Raffle not found" }, { status: 404 })
      }

      console.log("Raffle data structure:", {
        id: raffle._id,
        title: raffle.title,
        hasImages: !!raffle.prizeImages,
        imageCount: raffle.prizeImages?.length || 0,
      })

      console.log("Returning raffle data successfully")
      return NextResponse.json({ raffle })
    } catch (dbError) {
      console.error("Database query error details:", {
        message: dbError.message,
        name: dbError.name,
        stack: dbError.stack,
      })
      return NextResponse.json(
        {
          error: "Database query failed",
          details: dbError.message,
          errorType: dbError.name,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error in GET raffle route:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    })
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication with authOptions
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Forbidden - Admin access required",
          userRole: session.user.role,
          requiredRole: "admin",
        },
        { status: 403 },
      )
    }

    const id = params.id

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid raffle ID format" }, { status: 400 })
    }

    // Connect to database - use getDb() directly
    const db = await getDb()

    // Get existing raffle
    const existingRaffle = await db.collection(RAFFLES_COLLECTION).findOne({
      _id: new ObjectId(id),
    })

    if (!existingRaffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 })
    }

    // Parse form data
    const formData = await req.formData()

    // Extract basic raffle data
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const startDate = new Date(formData.get("startDate") as string)
    const endDate = new Date(formData.get("endDate") as string)

    // Initialize with existing images
    let prizeImages = [...(existingRaffle.prizeImages || [])]
    let coverImage = existingRaffle.coverImage

    // Check if there are new prize images to upload
    const newPrizeImages = formData.getAll("newPrizeImages") as File[]
    const deleteImageIndexes = ((formData.get("deleteImageIndexes") as string) || "")
      .split(",")
      .filter(Boolean)
      .map(Number)

    // Delete images if specified
    if (deleteImageIndexes.length > 0) {
      // Create a new array without the deleted images
      const updatedPrizeImages = prizeImages.filter((_, index) => !deleteImageIndexes.includes(index))
      prizeImages = updatedPrizeImages
    }

    // Upload new prize images
    for (const file of newPrizeImages) {
      if (file && file.size > 0) {
        const blob = await put(`raffles/prizes/${Date.now()}-${file.name}`, file, {
          access: "public",
        })
        prizeImages.push(blob.url)
      }
    }

    // Check if we have at least one prize image
    if (prizeImages.length === 0) {
      return NextResponse.json({ error: "At least one prize image is required" }, { status: 400 })
    }

    // Check if we have at most 10 prize images
    if (prizeImages.length > 10) {
      return NextResponse.json({ error: "Maximum of 10 prize images allowed" }, { status: 400 })
    }

    // Handle cover image upload if provided
    const coverImageFile = formData.get("coverImage") as File
    if (coverImageFile && coverImageFile.size > 0) {
      const coverImageBlob = await put(`raffles/covers/${Date.now()}-${coverImageFile.name}`, coverImageFile, {
        access: "public",
      })
      coverImage = coverImageBlob.url
    }

    // Get main image index
    let mainImageIndex = Number.parseInt(formData.get("mainImageIndex") as string)
    if (isNaN(mainImageIndex) || mainImageIndex < 0 || mainImageIndex >= prizeImages.length) {
      mainImageIndex = 0
    }

    // Create updated raffle object
    const updatedRaffle = {
      title,
      description,
      startDate,
      endDate,
      prizeImages,
      mainImageIndex,
      coverImage,
      updatedAt: new Date(),
    }

    // Validate raffle
    const validationErrors = validateRaffle({
      ...existingRaffle,
      ...updatedRaffle,
    })

    if (validationErrors.length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 400 })
    }

    // Update raffle
    await db.collection(RAFFLES_COLLECTION).updateOne({ _id: new ObjectId(id) }, { $set: updatedRaffle })

    return NextResponse.json({
      success: true,
      message: "Raffle updated successfully",
    })
  } catch (error) {
    console.error("Error in PUT raffle route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication with authOptions
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          error: "Forbidden - Admin access required",
          userRole: session.user.role,
          requiredRole: "admin",
        },
        { status: 403 },
      )
    }

    const id = params.id

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid raffle ID format" }, { status: 400 })
    }

    // Connect to database - use getDb() directly
    const db = await getDb()

    // Get raffle to delete
    const raffle = await db.collection(RAFFLES_COLLECTION).findOne({
      _id: new ObjectId(id),
    })

    if (!raffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 })
    }

    // Delete raffle
    await db.collection(RAFFLES_COLLECTION).deleteOne({
      _id: new ObjectId(id),
    })

    // Delete associated business raffles
    await db.collection(BUSINESS_RAFFLES_COLLECTION).deleteMany({
      raffleId: id,
    })

    return NextResponse.json({
      success: true,
      message: "Raffle and associated business raffles deleted successfully",
    })
  } catch (error) {
    console.error("Error in DELETE raffle route:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
