import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { QUESTIONS_COLLECTION, validateQuestion } from "@/models/question"

// PUT update question (admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const errors = validateQuestion(body)

    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 })
    }

    const db = await getDb()
    const result = await db
      .collection(QUESTIONS_COLLECTION)
      .updateOne({ _id: new ObjectId(params.id) }, { $set: { ...body, updatedAt: new Date() } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE question (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const db = await getDb()
    const result = await db
      .collection(QUESTIONS_COLLECTION)
      .updateOne({ _id: new ObjectId(params.id) }, { $set: { isActive: false, deletedAt: new Date() } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
