export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { LEADS_COLLECTION, LEAD_ACTIVITIES_COLLECTION } from "@/models/lead"
import { ObjectId } from "mongodb"

// POST - Add activity to lead
export async function POST(request: NextRequest, { params }: { params: { leadId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "rep") {
      return NextResponse.json({ error: "Rep access required" }, { status: 403 })
    }

    const body = await request.json()
    const db = await getDb()

    // Verify lead belongs to this rep
    const lead = await db.collection(LEADS_COLLECTION).findOne({
      _id: new ObjectId(params.leadId),
      repId: session.user.id,
    })

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Create activity
    const activity = {
      leadId: params.leadId,
      repId: session.user.id,
      type: body.type,
      description: body.description,
      outcome: body.outcome || "",
      scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : undefined,
      completedDate: new Date(), // Mark as completed immediately for now
      createdAt: new Date(),
    }

    await db.collection(LEAD_ACTIVITIES_COLLECTION).insertOne(activity)

    // Update lead's lastContactDate if this is a contact activity
    if (["call", "email", "meeting"].includes(body.type)) {
      await db.collection(LEADS_COLLECTION).updateOne(
        { _id: new ObjectId(params.leadId) },
        {
          $set: {
            lastContactDate: new Date(),
            updatedAt: new Date(),
          },
        },
      )
    }

    return NextResponse.json({ success: true, message: "Activity added successfully" })
  } catch (error) {
    console.error("Error adding activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
