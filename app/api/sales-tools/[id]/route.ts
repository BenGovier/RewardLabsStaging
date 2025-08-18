import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { SALES_TOOLS_COLLECTION, validateSalesTool } from "@/models/salesTool"
import { ObjectId } from "mongodb"

// PUT update sales tool (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, type, url, filePath, fileName, fileSize, thumbnailUrl } = body

    const toolData = {
      title: title?.trim(),
      description: description?.trim(),
      type,
      url: url?.trim(),
      filePath,
      fileName,
      fileSize,
      thumbnailUrl,
    }

    const errors = validateSalesTool(toolData)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 })
    }

    const db = await getDb()
    const result = await db
      .collection(SALES_TOOLS_COLLECTION)
      .updateOne({ _id: new ObjectId(params.id) }, { $set: { ...toolData, updatedAt: new Date() } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Sales tool not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating sales tool:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE sales tool (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const db = await getDb()
    const result = await db.collection(SALES_TOOLS_COLLECTION).deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Sales tool not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting sales tool:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
