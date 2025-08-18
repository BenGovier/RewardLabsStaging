import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { BUSINESS_RAFFLES_COLLECTION, type BusinessCustomizations } from "@/models/businessRaffle"
import { put } from "@vercel/blob"

export async function PUT(req: NextRequest, { params }: { params: { raffleId: string } }) {
  try {
    console.log("=== Customize API Debug ===")
    console.log("Request URL:", req.url)
    console.log("Raffle ID:", params.raffleId)

    // Check authentication
    const session = await getServerSession(authOptions)
    console.log("Session exists:", !!session)
    console.log("Session user:", session?.user ? JSON.stringify(session.user, null, 2) : "No user")

    if (!session?.user) {
      console.log("❌ No session or user found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is business
    console.log("User role check:", session.user.role, "=== 'business'?", session.user.role === "business")

    if (session.user.role !== "business") {
      console.log("❌ User role is not business:", session.user.role)
      return NextResponse.json(
        {
          error: "Forbidden - Business access required",
          userRole: session.user.role || "undefined",
        },
        { status: 403 },
      )
    }

    console.log("✅ Authentication passed - User is business")

    const raffleId = params.raffleId

    // Validate raffleId format
    if (!raffleId || raffleId.length !== 24) {
      console.log("❌ Invalid raffle ID format:", raffleId)
      return NextResponse.json({ error: "Invalid raffle ID format" }, { status: 400 })
    }

    // Connect to database - Fix: Use getDb() directly
    console.log("Connecting to database...")
    const db = await getDb()
    console.log("✅ Database connected")

    // Check if business raffle exists
    console.log("Checking business raffle access for:", {
      businessId: session.user.id,
      raffleId: raffleId,
    })

    const existingBusinessRaffle = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({
      businessId: session.user.id,
      raffleId: raffleId,
      isActive: true,
    })

    console.log("Business raffle found:", !!existingBusinessRaffle)

    if (!existingBusinessRaffle) {
      console.log("❌ Business raffle not found or not accessible")
      return NextResponse.json({ error: "Business raffle not found or not accessible" }, { status: 404 })
    }

    console.log("✅ Business raffle access confirmed")

    // Parse form data with error handling
    let formData
    try {
      formData = await req.formData()
      console.log("Form data keys:", Array.from(formData.keys()))
    } catch (error) {
      console.error("❌ Error parsing form data:", error)
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
    }

    // Extract customization data
    const primaryColor = formData.get("primaryColor") as string
    const customQuestionsJson = formData.get("customQuestions") as string
    const redirectUrl = formData.get("redirectUrl") as string
    const template = formData.get("template") as string
    const customDescription = formData.get("customDescription") as string

    console.log("Extracted data:", {
      primaryColor,
      redirectUrl,
      template,
      customQuestionsJson: customQuestionsJson ? "present" : "not present",
      customDescription: customDescription ? "present" : "not present",
    })

    // Validate and parse custom questions
    let customQuestions = []
    if (customQuestionsJson && customQuestionsJson.trim() !== "") {
      try {
        customQuestions = JSON.parse(customQuestionsJson)
        console.log("Parsed custom questions:", customQuestions.length, "questions")

        // Validate max 5 questions
        if (customQuestions.length > 5) {
          return NextResponse.json({ error: "Maximum of 5 custom questions allowed" }, { status: 400 })
        }

        // Validate each question
        for (const question of customQuestions) {
          if (!question.question || question.question.trim().length === 0) {
            return NextResponse.json({ error: "All questions must have text" }, { status: 400 })
          }
          if (!["text", "email", "phone", "select"].includes(question.type)) {
            return NextResponse.json({ error: "Invalid question type" }, { status: 400 })
          }
          if (question.type === "select" && (!question.options || question.options.length === 0)) {
            return NextResponse.json({ error: "Select questions must have options" }, { status: 400 })
          }
        }
      } catch (error) {
        console.error("❌ Error parsing custom questions:", error)
        return NextResponse.json({ error: "Invalid custom questions format" }, { status: 400 })
      }
    }

    // Handle logo upload
    let logoUrl = existingBusinessRaffle.businessCustomizations?.logo
    const logoFile = formData.get("logo") as File

    console.log("Logo file:", logoFile ? `${logoFile.name} (${logoFile.size} bytes)` : "No file")

    if (logoFile && logoFile.size > 0) {
      try {
        // Validate file type
        if (!logoFile.type.startsWith("image/")) {
          return NextResponse.json({ error: "Logo must be an image file" }, { status: 400 })
        }

        // Validate file size (max 5MB)
        if (logoFile.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: "Logo file size must be less than 5MB" }, { status: 400 })
        }

        console.log("Uploading logo to Vercel Blob...")
        const logoBlob = await put(`business-logos/${session.user.id}/${Date.now()}-${logoFile.name}`, logoFile, {
          access: "public",
        })
        logoUrl = logoBlob.url
        console.log("✅ Logo uploaded successfully:", logoUrl)
      } catch (error) {
        console.error("❌ Error uploading logo:", error)
        return NextResponse.json({ error: "Failed to upload logo" }, { status: 500 })
      }
    }

    // Handle cover photo upload
    let coverPhotoUrl = existingBusinessRaffle.businessCustomizations?.coverPhoto
    const coverPhotoFile = formData.get("coverPhoto") as File

    console.log(
      "Cover photo file:",
      coverPhotoFile ? `${coverPhotoFile.name} (${coverPhotoFile.size} bytes)` : "No file",
    )

    if (coverPhotoFile && coverPhotoFile.size > 0) {
      try {
        // Validate file type
        if (!coverPhotoFile.type.startsWith("image/")) {
          return NextResponse.json({ error: "Cover photo must be an image file" }, { status: 400 })
        }

        // Validate file size (max 5MB)
        if (coverPhotoFile.size > 5 * 1024 * 1024) {
          return NextResponse.json({ error: "Cover photo file size must be less than 5MB" }, { status: 400 })
        }

        console.log("Uploading cover photo to Vercel Blob...")
        const coverPhotoBlob = await put(
          `business-cover-photos/${session.user.id}/${Date.now()}-${coverPhotoFile.name}`,
          coverPhotoFile,
          {
            access: "public",
          },
        )
        coverPhotoUrl = coverPhotoBlob.url
        console.log("✅ Cover photo uploaded successfully:", coverPhotoUrl)
      } catch (error) {
        console.error("❌ Error uploading cover photo:", error)
        return NextResponse.json({ error: "Failed to upload cover photo" }, { status: 500 })
      }
    }

    // Handle background video upload
    let backgroundVideoUrl = existingBusinessRaffle.businessCustomizations?.backgroundVideo
    const backgroundVideoFile = formData.get("backgroundVideo") as File

    console.log(
      "Background video file:",
      backgroundVideoFile ? `${backgroundVideoFile.name} (${backgroundVideoFile.size} bytes)` : "No file",
    )

    if (backgroundVideoFile && backgroundVideoFile.size > 0) {
      try {
        // Validate file type
        if (!backgroundVideoFile.type.startsWith("video/")) {
          return NextResponse.json({ error: "Background video must be a video file" }, { status: 400 })
        }

        // Validate file size (max 50MB)
        if (backgroundVideoFile.size > 50 * 1024 * 1024) {
          return NextResponse.json({ error: "Background video file size must be less than 50MB" }, { status: 400 })
        }

        console.log("Uploading background video to Vercel Blob...")
        const backgroundVideoBlob = await put(
          `business-background-videos/${session.user.id}/${Date.now()}-${backgroundVideoFile.name}`,
          backgroundVideoFile,
          {
            access: "public",
          },
        )
        backgroundVideoUrl = backgroundVideoBlob.url
        console.log("✅ Background video uploaded successfully:", backgroundVideoUrl)
      } catch (error) {
        console.error("❌ Error uploading background video:", error)
        return NextResponse.json({ error: "Failed to upload background video" }, { status: 500 })
      }
    }

    // Handle additional media uploads
    const additionalMediaUrls: string[] = []
    let mediaIndex = 0

    while (mediaIndex < 10) {
      const mediaFile = formData.get(`additionalMedia_${mediaIndex}`) as File
      if (!mediaFile || mediaFile.size === 0) {
        mediaIndex++
        continue
      }

      // Validate file
      if (!mediaFile.type.startsWith("image/") && !mediaFile.type.startsWith("video/")) {
        return NextResponse.json({ error: "Additional media must be images or videos" }, { status: 400 })
      }

      if (mediaFile.size > 25 * 1024 * 1024) {
        return NextResponse.json({ error: "Additional media files must be less than 25MB" }, { status: 400 })
      }

      try {
        const mediaBlob = await put(
          `business-additional-media/${session.user.id}/${Date.now()}-${mediaFile.name}`,
          mediaFile,
          {
            access: "public",
          },
        )
        additionalMediaUrls.push(mediaBlob.url)
      } catch (error) {
        console.error("❌ Error uploading additional media:", error)
        return NextResponse.json({ error: "Failed to upload additional media" }, { status: 500 })
      }

      mediaIndex++
    }

    // Validate primary color
    if (primaryColor && primaryColor.trim() !== "" && !/^#[0-9A-F]{6}$/i.test(primaryColor)) {
      return NextResponse.json({ error: "Invalid color format. Use hex format like #FF0000" }, { status: 400 })
    }

    // Validate redirect URL if provided
    if (redirectUrl && redirectUrl.trim() !== "") {
      try {
        new URL(redirectUrl)
      } catch {
        return NextResponse.json({ error: "Invalid redirect URL format. Please enter a valid URL" }, { status: 400 })
      }
    }

    // Validate template
    if (template && !["classic", "hero", "split"].includes(template)) {
      return NextResponse.json({ error: "Invalid template selection" }, { status: 400 })
    }

    // Create customizations object
    const businessCustomizations: BusinessCustomizations = {
      logo: logoUrl,
      coverPhoto: coverPhotoUrl,
      backgroundVideo: backgroundVideoUrl,
      primaryColor: primaryColor && primaryColor.trim() !== "" ? primaryColor : "#3B82F6", // Default blue
      redirectUrl: redirectUrl && redirectUrl.trim() !== "" ? redirectUrl.trim() : undefined,
      template: (template as "classic" | "hero" | "split") || "classic", // NEW: Template with default
      customQuestions: customQuestions.length > 0 ? customQuestions : undefined,
      customDescription: customDescription && customDescription.trim() !== "" ? customDescription.trim() : undefined,
      additionalMedia: additionalMediaUrls.length > 0 ? additionalMediaUrls : undefined,
    }

    console.log("Saving customizations:", JSON.stringify(businessCustomizations, null, 2))

    // Update business raffle with customizations
    try {
      const updateResult = await db.collection(BUSINESS_RAFFLES_COLLECTION).updateOne(
        {
          businessId: session.user.id,
          raffleId: raffleId,
        },
        {
          $set: {
            businessCustomizations,
            updatedAt: new Date(),
          },
        },
      )

      console.log("Update result:", {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount,
      })

      if (updateResult.matchedCount === 0) {
        console.log("❌ No documents matched for update")
        return NextResponse.json({ error: "Failed to update raffle customizations" }, { status: 500 })
      }

      console.log("✅ Customizations saved successfully")

      return NextResponse.json({
        success: true,
        message: "Raffle customizations saved successfully",
        businessCustomizations,
      })
    } catch (dbError) {
      console.error("❌ Database update error:", dbError)
      return NextResponse.json(
        {
          error: "Database update failed",
          details: dbError instanceof Error ? dbError.message : "Unknown database error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Customize API Error:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
