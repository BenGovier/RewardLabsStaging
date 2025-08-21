import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { type Question, QUESTIONS_COLLECTION, validateQuestion } from "@/models/question"

// GET all questions
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const questions = await db
      .collection(QUESTIONS_COLLECTION)
      .find({ isActive: { $ne: false } })
      .sort({ order: 1, dateCreated: 1 })
      .toArray()

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST new question (admin only)
export async function POST(request: NextRequest) {
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
    const questionData: Question = {
      ...body,
      isActive: true,
      dateCreated: new Date(),
    }

    const result = await db.collection(QUESTIONS_COLLECTION).insertOne(questionData)

    return NextResponse.json({ success: true, questionId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
