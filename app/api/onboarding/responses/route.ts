import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { type OnboardingResponse, RESPONSES_COLLECTION } from "@/models/question"
import { USERS_COLLECTION } from "@/models/user"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "rep") {
      return NextResponse.json({ error: "Rep access required" }, { status: 403 })
    }

    const body = await request.json()
    const { responses } = body

    if (!responses || !Array.isArray(responses)) {
      return NextResponse.json({ error: "Responses array is required" }, { status: 400 })
    }

    const db = await getDb()

    // Prepare response documents
    const responseDocuments: OnboardingResponse[] = responses.map((response: any) => ({
      userId: session.user.id,
      questionId: response.questionId,
      answer: response.answer,
      timestamp: new Date(),
    }))

    // Insert all responses
    await db.collection(RESPONSES_COLLECTION).insertMany(responseDocuments)

    // Mark user's onboarding as completed
    await db.collection(USERS_COLLECTION).updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          onboardingCompleted: true,
          onboardingCompletedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving onboarding responses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
