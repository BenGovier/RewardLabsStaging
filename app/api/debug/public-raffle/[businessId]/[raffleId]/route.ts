import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"
import { RAFFLES_COLLECTION } from "@/models/raffle"
import { USERS_COLLECTION } from "@/models/user"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest, { params }: { params: { businessId: string; raffleId: string } }) {
  try {
    const { businessId, raffleId } = params

    console.log("🔍 Debug: Starting public raffle investigation")
    console.log("📋 Received params:", { businessId, raffleId })

    // Step 1: Check if we received the correct parameters
    const step1 = {
      receivedBusinessId: businessId,
      receivedRaffleId: raffleId,
      businessIdType: typeof businessId,
      raffleIdType: typeof raffleId,
      businessIdLength: businessId?.length,
      raffleIdLength: raffleId?.length,
    }

    console.log("✅ Step 1 - URL Parameters:", step1)

    // Step 2: Connect to database
    let db
    try {
      db = await getDb()
      console.log("✅ Step 2 - Database connection successful")
    } catch (dbError) {
      console.error("❌ Step 2 - Database connection failed:", dbError)
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        step: 2,
        details: dbError instanceof Error ? dbError.message : "Unknown DB error",
      })
    }

    // Step 3: Check if business exists
    let business
    try {
      // Try both with and without ObjectId conversion
      business = await db.collection(USERS_COLLECTION).findOne({ _id: businessId })
      if (!business) {
        // Try with ObjectId conversion
        business = await db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(businessId) })
      }

      console.log("🔍 Step 3 - Business lookup result:", {
        found: !!business,
        businessData: business
          ? {
              id: business._id,
              email: business.email,
              role: business.role,
              businessName: business.businessName,
            }
          : null,
      })
    } catch (businessError) {
      console.error("❌ Step 3 - Business lookup failed:", businessError)
      return NextResponse.json({
        success: false,
        error: "Business lookup failed",
        step: 3,
        details: businessError instanceof Error ? businessError.message : "Unknown business error",
        params: { businessId, raffleId },
      })
    }

    // Step 4: Check if raffle exists
    let raffle
    try {
      // Try both with and without ObjectId conversion
      raffle = await db.collection(RAFFLES_COLLECTION).findOne({ _id: raffleId })
      if (!raffle) {
        // Try with ObjectId conversion
        raffle = await db.collection(RAFFLES_COLLECTION).findOne({ _id: new ObjectId(raffleId) })
      }

      console.log("🔍 Step 4 - Raffle lookup result:", {
        found: !!raffle,
        raffleData: raffle
          ? {
              id: raffle._id,
              title: raffle.title,
              startDate: raffle.startDate,
              endDate: raffle.endDate,
            }
          : null,
      })
    } catch (raffleError) {
      console.error("❌ Step 4 - Raffle lookup failed:", raffleError)
      return NextResponse.json({
        success: false,
        error: "Raffle lookup failed",
        step: 4,
        details: raffleError instanceof Error ? raffleError.message : "Unknown raffle error",
        params: { businessId, raffleId },
      })
    }

    // Step 5: Check if business raffle assignment exists
    let businessRaffle
    try {
      businessRaffle = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({
        businessId: businessId,
        raffleId: raffleId,
      })

      if (!businessRaffle) {
        // Try with ObjectId conversion
        businessRaffle = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({
          businessId: new ObjectId(businessId).toString(),
          raffleId: new ObjectId(raffleId).toString(),
        })
      }

      console.log("🔍 Step 5 - Business raffle assignment result:", {
        found: !!businessRaffle,
        assignmentData: businessRaffle
          ? {
              id: businessRaffle._id,
              businessId: businessRaffle.businessId,
              raffleId: businessRaffle.raffleId,
              isActive: businessRaffle.isActive,
              hasCustomizations: !!businessRaffle.businessCustomizations,
            }
          : null,
      })
    } catch (assignmentError) {
      console.error("❌ Step 5 - Business raffle assignment lookup failed:", assignmentError)
      return NextResponse.json({
        success: false,
        error: "Business raffle assignment lookup failed",
        step: 5,
        details: assignmentError instanceof Error ? assignmentError.message : "Unknown assignment error",
        params: { businessId, raffleId },
      })
    }

    // Step 6: Check all business raffle assignments for this business
    let allBusinessRaffles
    try {
      allBusinessRaffles = await db
        .collection(BUSINESS_RAFFLES_COLLECTION)
        .find({
          businessId: businessId,
        })
        .toArray()

      if (allBusinessRaffles.length === 0) {
        // Try with ObjectId conversion
        allBusinessRaffles = await db
          .collection(BUSINESS_RAFFLES_COLLECTION)
          .find({
            businessId: new ObjectId(businessId).toString(),
          })
          .toArray()
      }

      console.log("🔍 Step 6 - All business raffle assignments:", {
        count: allBusinessRaffles.length,
        assignments: allBusinessRaffles.map((br) => ({
          id: br._id,
          businessId: br.businessId,
          raffleId: br.raffleId,
          isActive: br.isActive,
        })),
      })
    } catch (allAssignmentsError) {
      console.error("❌ Step 6 - All business raffle assignments lookup failed:", allAssignmentsError)
    }

    // Summary
    const summary = {
      step1_urlParams: step1,
      step2_dbConnection: "✅ Success",
      step3_businessExists: !!business,
      step4_raffleExists: !!raffle,
      step5_assignmentExists: !!businessRaffle,
      step6_totalAssignments: allBusinessRaffles?.length || 0,

      // Detailed data
      businessData: business
        ? {
            id: business._id,
            email: business.email,
            role: business.role,
            businessName: business.businessName,
          }
        : null,

      raffleData: raffle
        ? {
            id: raffle._id,
            title: raffle.title,
            description: raffle.description,
            startDate: raffle.startDate,
            endDate: raffle.endDate,
          }
        : null,

      assignmentData: businessRaffle
        ? {
            id: businessRaffle._id,
            businessId: businessRaffle.businessId,
            raffleId: businessRaffle.raffleId,
            isActive: businessRaffle.isActive,
            customizations: businessRaffle.businessCustomizations,
          }
        : null,

      allAssignments: allBusinessRaffles || [],
    }

    console.log("📊 Final Summary:", summary)

    return NextResponse.json({
      success: true,
      summary,
      recommendation: !business
        ? "Business not found - check business ID"
        : !raffle
          ? "Raffle not found - check raffle ID"
          : !businessRaffle
            ? "Business raffle assignment missing - need to assign raffle to business"
            : "All data found - check for other issues",
    })
  } catch (error) {
    console.error("❌ Debug endpoint failed:", error)
    return NextResponse.json({
      success: false,
      error: "Debug endpoint failed",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
