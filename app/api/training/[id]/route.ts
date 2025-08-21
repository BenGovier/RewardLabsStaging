import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { TRAINING_MATERIALS_COLLECTION, validateTrainingMaterial } from "@/models/trainingMaterial"
import { ObjectId } from "mongodb"

// PUT update training material (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, type, url, filePath, fileName, fileSize } = body

    const materialData = {
      title: title?.trim(),
      description: description?.trim(),
      type,
      url: url?.trim(),
      filePath,
      fileName,
      fileSize,
    }

    const errors = validateTrainingMaterial(materialData)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 })
    }

    const db = await getDb()
    const result = await db
      .collection(TRAINING_MATERIALS_COLLECTION)
      .updateOne({ _id: new ObjectId(params.id) }, { $set: { ...materialData, updatedAt: new Date() } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Training material not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating training material:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE training material (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const db = await getDb()
    const result = await db.collection(TRAINING_MATERIALS_COLLECTION).deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Training material not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting training material:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
