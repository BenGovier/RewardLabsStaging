import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { put } from "@vercel/blob"

// POST - Upload file for message
export async function POST(request: NextRequest) {
  console.log("=== FILE UPLOAD API CALLED ===")

  try {
    const session = await getServerSession(authOptions)
    console.log("Session user:", session?.user?.id)

    if (!session?.user) {
      console.log("❌ No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    console.log("📁 File received:", {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      hasFile: !!file,
    })

    if (!file) {
      console.log("❌ No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "application/zip",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    console.log("🔍 File type validation:", {
      fileType: file.type,
      isAllowed: allowedTypes.includes(file.type),
    })

    if (!allowedTypes.includes(file.type)) {
      console.log("❌ File type not allowed:", file.type)
      return NextResponse.json({ error: "File type not allowed" }, { status: 400 })
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    console.log("📏 File size validation:", {
      fileSize: file.size,
      maxSize: maxSize,
      isValid: file.size <= maxSize,
    })

    if (file.size > maxSize) {
      console.log("❌ File too large:", file.size)
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    // Upload to Vercel Blob
    const fileName = `message-attachments/${Date.now()}-${file.name}`
    console.log("☁️ Uploading to blob:", fileName)

    const blob = await put(fileName, file, {
      access: "public",
    })

    console.log("✅ Blob upload successful:", {
      url: blob.url,
      size: blob.size,
    })

    const attachment = {
      fileName: file.name,
      fileUrl: blob.url,
      fileType: file.type,
      fileSize: file.size,
    }

    console.log("📎 Returning attachment:", attachment)

    return NextResponse.json({
      success: true,
      attachment: attachment,
    })
  } catch (error) {
    console.error("❌ Error uploading file:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack")
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
