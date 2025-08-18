import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"
import { RAFFLES_COLLECTION } from "@/models/raffle"
import { USER_COLLECTION } from "@/models/user"

export async function GET(req: NextRequest, { params }: { params: { businessId: string; raffleId: string } }) {
  try {
    const { businessId, raffleId } = params

    console.log("🔍 Detailed Debug: Starting exact page replication")
    console.log("📋 Params:", { businessId, raffleId })

    const db = await getDb()
    console.log("✅ Database connected")

    // Step 1: Exact business raffle lookup (same as page)
    console.log("🔍 Step 1: Looking up business raffle...")
    const businessRaffle = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({
      businessId,
      raffleId,
      isActive: true,
    })

    console.log("📊 Business raffle result:", {
      found: !!businessRaffle,
      query: { businessId, raffleId, isActive: true },
      result: businessRaffle,
    })

    if (!businessRaffle) {
      return NextResponse.json({
        success: false,
        error: "Business raffle not found",
        step: "businessRaffle",
        query: { businessId, raffleId, isActive: true },
        collection: BUSINESS_RAFFLES_COLLECTION,
      })
    }

    // Step 2: Exact raffle lookup (same as page)
    console.log("🔍 Step 2: Looking up raffle...")
    const raffle = await db.collection(RAFFLES_COLLECTION).findOne({ _id: raffleId })

    console.log("📊 Raffle result:", {
      found: !!raffle,
      query: { _id: raffleId },
      result: raffle,
    })

    if (!raffle) {
      return NextResponse.json({
        success: false,
        error: "Raffle not found",
        step: "raffle",
        query: { _id: raffleId },
        collection: RAFFLES_COLLECTION,
      })
    }

    // Step 3: Exact business lookup (same as page)
    console.log("🔍 Step 3: Looking up business...")
    const business = await db.collection(USER_COLLECTION).findOne({ _id: businessId })

    console.log("📊 Business result:", {
      found: !!business,
      query: { _id: businessId },
      result: business,
    })

    if (!business) {
      return NextResponse.json({
        success: false,
        error: "Business not found",
        step: "business",
        query: { _id: businessId },
        collection: USER_COLLECTION,
      })
    }

    // Step 4: Date validation (same as page)
    console.log("🔍 Step 4: Checking raffle dates...")
    const now = new Date()
    const startDate = new Date(raffle.startDate)
    const endDate = new Date(raffle.endDate)

    const dateCheck = {
      now: now.toISOString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      isBeforeStart: now < startDate,
      isAfterEnd: now > endDate,
      isActive: now >= startDate && now <= endDate,
    }

    console.log("📊 Date validation:", dateCheck)

    if (now < startDate || now > endDate) {
      return NextResponse.json({
        success: false,
        error: "Raffle not active",
        step: "dateValidation",
        dateCheck,
      })
    }

    // Step 5: Data preparation (same as page)
    console.log("🔍 Step 5: Preparing data...")
    const data = {
      businessRaffle,
      raffle: {
        title: raffle.title,
        description: raffle.description,
        startDate: raffle.startDate,
        endDate: raffle.endDate,
        coverImage: raffle.coverImage,
        prizeImages: raffle.prizeImages,
        mainImageIndex: raffle.mainImageIndex,
      },
      business: {
        businessName: business.businessName,
        firstName: business.firstName,
        lastName: business.lastName,
      },
    }

    console.log("📊 Final data prepared:", {
      hasBusinessRaffle: !!data.businessRaffle,
      hasRaffle: !!data.raffle,
      hasBusiness: !!data.business,
      raffleTitle: data.raffle.title,
      businessName: data.business.businessName,
    })

    return NextResponse.json({
      success: true,
      message: "All steps completed successfully - page should work",
      data,
      collections: {
        businessRaffles: BUSINESS_RAFFLES_COLLECTION,
        raffles: RAFFLES_COLLECTION,
        users: USER_COLLECTION,
      },
    })
  } catch (error) {
    console.error("❌ Detailed debug failed:", error)
    return NextResponse.json({
      success: false,
      error: "Detailed debug failed",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
