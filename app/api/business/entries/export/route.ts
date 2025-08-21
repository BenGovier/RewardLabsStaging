import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { getDb } from "@/lib/mongodb"
import { ENTRIES_COLLECTION } from "@/models/entry"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is business
    if (session.user.role !== "business") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get query parameters
    const url = new URL(req.url)
    const raffleId = url.searchParams.get("raffleId")

    if (!raffleId) {
      return NextResponse.json({ error: "Raffle ID is required" }, { status: 400 })
    }

    // Connect to database
    const db = await getDb()

    // Verify the business owns this raffle
    const businessRaffle = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({
      businessId: session.user.id,
      raffleId,
    })

    if (!businessRaffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 })
    }

    // Get entries
    const entries = await db
      .collection(ENTRIES_COLLECTION)
      .find({
        businessId: session.user.id,
        raffleId,
      })
      .sort({ createdAt: 1 })
      .toArray()

    // Get custom questions to include in CSV headers
    const customQuestions = businessRaffle.businessCustomizations?.customQuestions || []

    // Create CSV headers
    const headers = ["First Name", "Last Name", "Email", "Date"]

    // Add custom question headers
    customQuestions.forEach((question) => {
      headers.push(question.question)
    })

    // Create CSV rows
    const rows = entries.map((entry) => {
      const row = [entry.firstName, entry.lastName, entry.email, new Date(entry.createdAt).toLocaleString()]

      // Add custom question answers
      customQuestions.forEach((question) => {
        const answer = entry.answers[question.id] || ""
        row.push(answer)
      })

      return row
    })

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    // Return CSV as text/csv
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="raffle-entries-${raffleId}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting entries:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
