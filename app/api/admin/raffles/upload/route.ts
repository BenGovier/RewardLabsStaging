import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { put } from "@vercel/blob"

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse form data
    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // "prize" or "cover"

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Supported types: JPEG, PNG, GIF, WEBP, MP4",
        },
        { status: 400 },
      )
    }

    // Upload to Vercel Blob
    const folder = type === "cover" ? "covers" : "prizes"
    const blob = await put(`raffles/${folder}/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
