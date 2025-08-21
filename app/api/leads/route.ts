export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { LEADS_COLLECTION, type Lead } from "@/models/lead"

// GET leads for the authenticated rep (or all for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !["admin", "rep"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const source = searchParams.get("source")
    const priority = searchParams.get("priority")
    const repId = searchParams.get("repId") // Admin can filter by rep

    const db = await getDb()

    // Build query
    const query: any = {}

    // Reps can only see their own leads, admins can see all or filter by rep
    if (session.user.role === "rep") {
      query.repId = session.user.id
    } else if (session.user.role === "admin" && repId) {
      query.repId = repId
    }

    // Apply filters
    if (status) query.status = status
    if (source) query.source = source
    if (priority) query.priority = priority

    const leads = await db.collection(LEADS_COLLECTION).find(query).sort({ updatedAt: -1 }).toArray()

    return NextResponse.json({ leads })
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new lead
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "rep") {
      return NextResponse.json({ error: "Rep access required" }, { status: 403 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      source,
      sourceDetails,
      priority = "medium",
      estimatedValue,
      expectedCloseDate,
      nextFollowUpDate,
      notes,
      tags = [],
    } = body

    // Validation
    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "First name, last name, and email are required" }, { status: 400 })
    }

    const db = await getDb()

    // Check for duplicate email for this rep
    const existingLead = await db.collection(LEADS_COLLECTION).findOne({
      repId: session.user.id,
      email: email.toLowerCase(),
    })

    if (existingLead) {
      return NextResponse.json({ error: "Lead with this email already exists" }, { status: 400 })
    }

    const newLead: Lead = {
      repId: session.user.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      company: company?.trim(),
      jobTitle: jobTitle?.trim(),
      source,
      sourceDetails: sourceDetails?.trim(),
      status: "new",
      priority,
      estimatedValue: estimatedValue ? Number.parseFloat(estimatedValue) : undefined,
      expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : undefined,
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : undefined,
      notes: notes?.trim() || "",
      tags: Array.isArray(tags) ? tags.map((tag) => tag.trim()).filter(Boolean) : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection(LEADS_COLLECTION).insertOne(newLead)

    return NextResponse.json({
      success: true,
      leadId: result.insertedId,
      message: "Lead created successfully",
    })
  } catch (error) {
    console.error("Error creating lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
