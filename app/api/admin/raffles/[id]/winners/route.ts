import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"
import { RAFFLES_COLLECTION } from "@/models/raffle"
import { ENTRIES_COLLECTION } from "@/models/entry"
import { WINNERS_COLLECTION, validateWinner, type Winner } from "@/models/winner"

// Get all winners for a raffle
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const raffleId = params.id

    // Connect to database
    const { db } = await connectToDatabase()

    // Get raffle to verify it exists
    const raffle = await db.collection(RAFFLES_COLLECTION).findOne({
      _id: new ObjectId(raffleId),
    })

    if (!raffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 })
    }

    // Get all winners for this raffle
    const winners = await db.collection(WINNERS_COLLECTION).find({ raffleId }).sort({ selectedAt: -1 }).toArray()

    // Get all entries for this raffle (for winner selection)
    const entries = await db.collection(ENTRIES_COLLECTION).find({ raffleId }).toArray()

    // Check if raffle has ended
    const hasEnded = new Date() > new Date(raffle.endDate)

    return NextResponse.json({
      winners,
      entries,
      raffle,
      hasEnded,
      totalEntries: entries.length,
      totalWinners: winners.length,
    })
  } catch (error) {
    console.error("Error fetching winners:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Select a winner (manual or random)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const raffleId = params.id
    const body = await req.json()
    const { selectionMethod, entryId, prizeDescription, notes } = body

    // Connect to database
    const { db } = await connectToDatabase()

    // Get raffle to verify it exists and has ended
    const raffle = await db.collection(RAFFLES_COLLECTION).findOne({
      _id: new ObjectId(raffleId),
    })

    if (!raffle) {
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 })
    }

    // Check if raffle has ended
    const hasEnded = new Date() > new Date(raffle.endDate)
    if (!hasEnded) {
      return NextResponse.json({ error: "Cannot select winner until raffle has ended" }, { status: 400 })
    }

    let selectedEntry

    if (selectionMethod === "manual") {
      // Manual selection - get the specific entry
      if (!entryId) {
        return NextResponse.json({ error: "Entry ID is required for manual selection" }, { status: 400 })
      }

      selectedEntry = await db.collection(ENTRIES_COLLECTION).findOne({
        _id: new ObjectId(entryId),
        raffleId,
      })

      if (!selectedEntry) {
        return NextResponse.json({ error: "Selected entry not found" }, { status: 404 })
      }
    } else if (selectionMethod === "random") {
      // Random selection - get all entries and pick one randomly
      const allEntries = await db.collection(ENTRIES_COLLECTION).find({ raffleId }).toArray()

      if (allEntries.length === 0) {
        return NextResponse.json({ error: "No entries found for this raffle" }, { status: 400 })
      }

      // Get already selected winners to avoid duplicates
      const existingWinners = await db.collection(WINNERS_COLLECTION).find({ raffleId }).toArray()

      const winnerEntryIds = existingWinners.map((w) => w.entryId)
      const availableEntries = allEntries.filter((entry) => !winnerEntryIds.includes(entry._id.toString()))

      if (availableEntries.length === 0) {
        return NextResponse.json({ error: "No more entries available for selection" }, { status: 400 })
      }

      // Random selection
      const randomIndex = Math.floor(Math.random() * availableEntries.length)
      selectedEntry = availableEntries[randomIndex]
    } else {
      return NextResponse.json({ error: "Invalid selection method" }, { status: 400 })
    }

    // Check if this entry is already a winner
    const existingWinner = await db.collection(WINNERS_COLLECTION).findOne({
      raffleId,
      entryId: selectedEntry._id.toString(),
    })

    if (existingWinner) {
      return NextResponse.json({ error: "This entry has already been selected as a winner" }, { status: 400 })
    }

    // Generate ticket number
    const existingWinners = await db.collection(WINNERS_COLLECTION).countDocuments({ raffleId })
    const ticketNumber = `${raffle.title.substring(0, 3).toUpperCase()}-${String(existingWinners + 1).padStart(4, "0")}`

    // Create winner object
    const winner: Winner = {
      raffleId,
      businessId: selectedEntry.businessId,
      entryId: selectedEntry._id.toString(),
      ticketNumber,
      winnerName: `${selectedEntry.firstName} ${selectedEntry.lastName}`,
      winnerEmail: selectedEntry.email,
      winnerPhone: selectedEntry.answers?.phone || undefined,
      selectedAt: new Date(),
      selectedBy: session.user.id,
      selectionMethod,
      prizeDescription: prizeDescription || undefined,
      notes: notes || undefined,
      createdAt: new Date(),
    }

    // Validate winner
    const validationErrors = validateWinner(winner)
    if (validationErrors.length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 400 })
    }

    // Insert winner
    const result = await db.collection(WINNERS_COLLECTION).insertOne(winner)

    return NextResponse.json({
      success: true,
      message: "Winner selected successfully",
      winner: {
        ...winner,
        _id: result.insertedId,
      },
    })
  } catch (error) {
    console.error("Error selecting winner:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
