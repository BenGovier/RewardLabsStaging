import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Generate a unique filename
    const fileName = file.name
    const fileExtension = fileName.split(".").pop()?.toLowerCase() || ""

    // Validate file type
    const allowedExtensions = ["pdf", "ppt", "pptx", "doc", "docx", "jpg", "jpeg", "png"]
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedExtensions.join(", ")}` },
        { status: 400 },
      )
    }

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
    })

    return NextResponse.json({
      success: true,
      fileName: blob.pathname,
      fileUrl: blob.url,
      fileSize: file.size,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
