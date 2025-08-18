export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { LEADS_COLLECTION, LEAD_ACTIVITIES_COLLECTION } from "@/models/lead"
import { ObjectId } from "mongodb"

// GET single lead
export async function GET(request: NextRequest, { params }: { params: { leadId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["admin", "rep"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const db = await getDb()
    const query: any = { _id: new ObjectId(params.leadId) }

    // Reps can only see their own leads
    if (session.user.role === "rep") {
      query.repId = session.user.id
    }

    const lead = await db.collection(LEADS_COLLECTION).findOne(query)

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Get lead activities
    const activities = await db
      .collection(LEAD_ACTIVITIES_COLLECTION)
      .find({ leadId: params.leadId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ lead, activities })
  } catch (error) {
    console.error("Error fetching lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update lead
export async function PUT(request: NextRequest, { params }: { params: { leadId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "rep") {
      return NextResponse.json({ error: "Rep access required" }, { status: 403 })
    }

    const body = await request.json()
    const db = await getDb()

    // Verify lead belongs to this rep
    const existingLead = await db.collection(LEADS_COLLECTION).findOne({
      _id: new ObjectId(params.leadId),
      repId: session.user.id,
    })

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    const updateData = {
      ...body,
      updatedAt: new Date(),
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id
    delete updateData.repId
    delete updateData.createdAt

    await db.collection(LEADS_COLLECTION).updateOne({ _id: new ObjectId(params.leadId) }, { $set: updateData })

    return NextResponse.json({ success: true, message: "Lead updated successfully" })
  } catch (error) {
    console.error("Error updating lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE lead
export async function DELETE(request: NextRequest, { params }: { params: { leadId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "rep") {
      return NextResponse.json({ error: "Rep access required" }, { status: 403 })
    }

    const db = await getDb()

    // Verify lead belongs to this rep
    const result = await db.collection(LEADS_COLLECTION).deleteOne({
      _id: new ObjectId(params.leadId),
      repId: session.user.id,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    // Also delete associated activities
    await db.collection(LEAD_ACTIVITIES_COLLECTION).deleteMany({
      leadId: params.leadId,
    })

    return NextResponse.json({ success: true, message: "Lead deleted successfully" })
  } catch (error) {
    console.error("Error deleting lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
