import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { ENTRIES_COLLECTION, validateEntry, type Entry } from "@/models/entry"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"
import { RAFFLES_COLLECTION } from "@/models/raffle"
import { USERS_COLLECTION } from "@/models/user"
import { ObjectId } from "mongodb"
import { sendEmail, generateRaffleEntryConfirmationEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json()
    const { businessId, raffleId, firstName, lastName, email, answers, agreedToTerms, agreedToMarketing } = body

    console.log("Entry submission attempt:", { businessId, raffleId, email })

    // Validate required fields
    if (!businessId || !raffleId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Missing required fields", details: "All fields are required" },
        { status: 400 },
      )
    }

    // Validate terms agreement
    if (!agreedToTerms) {
      return NextResponse.json(
        { error: "Terms agreement required", details: "You must agree to the terms and conditions" },
        { status: 400 },
      )
    }

    // Create entry object
    const entry: Partial<Entry> = {
      businessId,
      raffleId,
      firstName,
      lastName,
      email: email.toLowerCase().trim(), // Normalize email
      answers: answers || {},
      agreedToTerms: Boolean(agreedToTerms),
      agreedToMarketing: Boolean(agreedToMarketing),
      ipAddress: req.headers.get("x-forwarded-for") || req.ip || "unknown",
      createdAt: new Date(),
    }

    // Validate entry
    const validationErrors = validateEntry(entry)
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: validationErrors }, { status: 400 })
    }

    // Connect to database
    const db = await getDb()

    // Verify the business-raffle association exists (using string IDs)
    console.log("Checking business raffle association with string IDs...")
    const businessRaffle = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({
      businessId,
      raffleId,
      isActive: true,
    })

    if (!businessRaffle) {
      console.log("Business raffle association not found")
      return NextResponse.json({ error: "Raffle not found or inactive" }, { status: 404 })
    }

    console.log("Business raffle association found:", businessRaffle._id)

    // Verify the raffle exists (using ObjectId conversion)
    console.log("Looking up raffle with ObjectId conversion...")
    let raffleObjectId
    try {
      raffleObjectId = new ObjectId(raffleId)
    } catch (error) {
      console.log("Invalid raffle ID format:", error)
      return NextResponse.json({ error: "Invalid raffle ID format" }, { status: 400 })
    }

    const raffle = await db.collection(RAFFLES_COLLECTION).findOne({ _id: raffleObjectId })
    if (!raffle) {
      console.log("Raffle not found in raffles collection")
      return NextResponse.json({ error: "Raffle not found" }, { status: 404 })
    }

    console.log("Raffle found:", raffle.title)

    // Get business information for email
    let businessObjectId
    try {
      businessObjectId = new ObjectId(businessId)
    } catch (error) {
      console.log("Invalid business ID format:", error)
      return NextResponse.json({ error: "Invalid business ID format" }, { status: 400 })
    }

    const business = await db.collection(USERS_COLLECTION).findOne({ _id: businessObjectId })
    if (!business) {
      console.log("Business not found")
      return NextResponse.json({ error: "Business not found" }, { status: 404 })
    }

    // Check raffle dates
    const now = new Date()
    const startDate = new Date(raffle.startDate)
    const endDate = new Date(raffle.endDate)

    if (now < startDate) {
      return NextResponse.json({ error: "Raffle has not started yet" }, { status: 400 })
    }

    if (now > endDate) {
      return NextResponse.json({ error: "Raffle has ended" }, { status: 400 })
    }

    // Check for duplicate entries (same email for same raffle)
    console.log("Checking for duplicate entries...")
    const existingEntry = await db.collection(ENTRIES_COLLECTION).findOne({
      raffleId,
      email: email.toLowerCase().trim(),
    })

    if (existingEntry) {
      console.log("Duplicate entry found for email:", email)
      return NextResponse.json(
        { error: "Duplicate entry", details: "You have already entered this raffle" },
        { status: 409 },
      )
    }

    // Insert entry into database
    console.log("Inserting new entry...")
    const result = await db.collection(ENTRIES_COLLECTION).insertOne(entry as Entry)

    console.log("Entry created successfully:", result.insertedId)

    // Generate ticket number (last 8 characters of entry ID in uppercase)
    const ticketNumber = result.insertedId.toString().slice(-8).toUpperCase()

    // Format draw date
    const drawDate = new Date(raffle.endDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Send confirmation email
    try {
      console.log("Sending confirmation email...")
      const emailHtml = generateRaffleEntryConfirmationEmail(
        firstName,
        lastName,
        raffle.title,
        ticketNumber,
        drawDate,
        business.businessName || `${business.firstName} ${business.lastName}`,
        businessRaffle.businessCustomizations?.logo,
        businessRaffle.businessCustomizations?.primaryColor,
      )

      const emailSent = await sendEmail({
        to: email,
        subject: `🎉 Entry Confirmed: ${raffle.title} - Ticket #${ticketNumber}`,
        html: emailHtml,
      })

      if (emailSent) {
        console.log("Confirmation email sent successfully")
      } else {
        console.log("Failed to send confirmation email")
      }
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError)
      // Don't fail the entry if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Entry submitted successfully",
      entryId: result.insertedId,
      ticketNumber,
    })
  } catch (error) {
    console.error("Error submitting entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
