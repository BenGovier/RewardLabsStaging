import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { put } from "@vercel/blob"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]

export async function POST(request: NextRequest) {
  try {
    console.log("📥 POST /api/feed/posts/upload - Starting file upload")

    const session = await getServerSession(authOptions)
    console.log("🔐 Session check:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
    })

    if (!session?.user || !["admin", "rep"].includes(session.user.role || "")) {
      console.log("❌ Access denied - insufficient permissions")
      return NextResponse.json({ error: "Admin or rep access required" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("❌ No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("📁 File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log("❌ File too large:", { size: file.size, maxSize: MAX_FILE_SIZE })
      return NextResponse.json(
        {
          error: "File too large",
          details: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 },
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.log("❌ Invalid file type:", file.type)
      return NextResponse.json(
        {
          error: "Invalid file type",
          details: `Allowed types: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop()
    const fileName = `posts/${session.user.id}/${timestamp}.${fileExtension}`

    console.log("☁️ Uploading to Vercel Blob:", fileName)

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: false,
    })

    console.log("✅ File uploaded successfully to Vercel Blob:", {
      fileName,
      url: blob.url,
      size: file.size,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("❌ Error uploading file:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
