import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"
import { put } from "@vercel/blob"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Profile picture upload started for user ID:", params.id)

    // Step 1: Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log("Authentication failed: No session")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.log("Authenticated as:", session.user.id, "Role:", session.user.role)

    // Step 2: Check permissions
    if (session.user.id !== params.id && session.user.role !== "admin") {
      console.log("Permission denied: User", session.user.id, "tried to update", params.id)
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }
    console.log("Permission check passed")

    // Step 3: Parse form data
    let formData
    try {
      formData = await request.formData()
      console.log("Form data parsed successfully")
    } catch (error) {
      console.error("Error parsing form data:", error)
      return NextResponse.json({ error: "Failed to parse form data" }, { status: 400 })
    }

    // Step 4: Get file from form data
    const file = formData.get("profilePicture") as File
    if (!file) {
      console.log("No file provided in form data")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    console.log("File received:", file.name, "Type:", file.type, "Size:", file.size)

    // Step 5: Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      console.log("Invalid file type:", file.type)
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" }, { status: 400 })
    }

    // Step 6: Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.log("File too large:", file.size)
      return NextResponse.json({ error: "File too large. Maximum size is 5MB" }, { status: 400 })
    }

    // Step 7: Upload to Vercel Blob
    let blob
    try {
      const timestamp = Date.now()
      const extension = file.name.split(".").pop() || "jpg"
      const filename = `profile-${params.id}-${timestamp}.${extension}`

      console.log("Uploading to Vercel Blob:", filename)
      blob = await put(filename, file, {
        access: "public",
      })
      console.log("Upload successful, blob URL:", blob.url)
    } catch (error) {
      console.error("Blob storage error:", error)
      return NextResponse.json(
        {
          error: "Failed to upload image to storage",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

    // Step 8: Update user in database with ObjectId conversion
    try {
      const db = await getDb()
      console.log("Connected to database")

      // Convert string ID to ObjectId for MongoDB query
      const userId = new ObjectId(params.id)
      console.log("Using ObjectId for database query:", userId)

      const result = await db.collection(USERS_COLLECTION).updateOne(
        { _id: userId },
        {
          $set: {
            profilePictureUrl: blob.url,
            profilePictureUpdatedAt: new Date(),
          },
        },
      )

      console.log("Database update result:", result)

      if (result.matchedCount === 0) {
        console.log("User not found in database with ID:", userId)
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      console.log("Profile picture updated successfully")
    } catch (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        {
          error: "Database error",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }

    // Step 9: Return success response
    return NextResponse.json({
      success: true,
      profilePictureUrl: blob.url,
      message: "Profile picture updated successfully",
    })
  } catch (error) {
    // Catch-all error handler
    console.error("Unhandled error in profile picture upload:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
