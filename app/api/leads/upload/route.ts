export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { LEADS_COLLECTION, type Lead } from "@/models/lead"

// POST - Bulk upload leads from CSV
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "rep") {
      return NextResponse.json({ error: "Rep access required" }, { status: 403 })
    }

    const body = await request.json()
    const { leads } = body

    if (!Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "No leads provided" }, { status: 400 })
    }

    const db = await getDb()
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const leadData of leads) {
      try {
        // Validation
        if (!leadData.firstName || !leadData.lastName || !leadData.email) {
          results.failed++
          results.errors.push(`Missing required fields for ${leadData.email || "unknown"}`)
          continue
        }

        // Check for duplicate
        const existingLead = await db.collection(LEADS_COLLECTION).findOne({
          repId: session.user.id,
          email: leadData.email.toLowerCase(),
        })

        if (existingLead) {
          results.failed++
          results.errors.push(`Duplicate email: ${leadData.email}`)
          continue
        }

        const newLead: Lead = {
          repId: session.user.id,
          firstName: leadData.firstName.trim(),
          lastName: leadData.lastName.trim(),
          email: leadData.email.toLowerCase().trim(),
          phone: leadData.phone?.trim(),
          company: leadData.company?.trim(),
          jobTitle: leadData.jobTitle?.trim(),
          source: leadData.source || "other",
          sourceDetails: leadData.sourceDetails?.trim(),
          status: "new",
          priority: leadData.priority || "medium",
          estimatedValue: leadData.estimatedValue ? Number.parseFloat(leadData.estimatedValue) : undefined,
          notes: leadData.notes?.trim() || "",
          tags: leadData.tags
            ? leadData.tags
                .split(",")
                .map((tag: string) => tag.trim())
                .filter(Boolean)
            : [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await db.collection(LEADS_COLLECTION).insertOne(newLead)
        results.successful++
      } catch (error) {
        results.failed++
        results.errors.push(`Error processing ${leadData.email}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Upload complete: ${results.successful} successful, ${results.failed} failed`,
      results,
    })
  } catch (error) {
    console.error("Error uploading leads:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
