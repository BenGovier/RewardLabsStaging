import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import {
  type TrainingMaterial,
  TRAINING_MATERIALS_COLLECTION,
  validateTrainingMaterial,
} from "@/models/trainingMaterial"

// GET all training materials
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const materials = await db.collection(TRAINING_MATERIALS_COLLECTION).find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ materials })
  } catch (error) {
    console.error("Error fetching training materials:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST new training material (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, type, url, filePath, fileName, fileSize } = body

    const materialData: Partial<TrainingMaterial> = {
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

    const material: TrainingMaterial = {
      ...materialData,
      createdAt: new Date(),
    } as TrainingMaterial

    const result = await db.collection(TRAINING_MATERIALS_COLLECTION).insertOne(material)

    return NextResponse.json({ success: true, materialId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating training material:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
