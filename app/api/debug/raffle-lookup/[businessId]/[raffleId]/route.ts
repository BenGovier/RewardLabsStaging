import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { RAFFLES_COLLECTION } from "@/models/raffle"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest, { params }: { params: { businessId: string; raffleId: string } }) {
  try {
    const { businessId, raffleId } = params

    console.log("=== RAFFLE DEBUG LOOKUP ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Business ID:", businessId, "Type:", typeof businessId)
    console.log("Raffle ID:", raffleId, "Type:", typeof raffleId)

    const db = await getDb()
    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      parameters: {
        businessId,
        raffleId,
        businessIdType: typeof businessId,
        raffleIdType: typeof raffleId,
      },
      lookupResults: {},
      errors: [],
    }

    // 1. Try direct string lookup for raffle
    try {
      console.log("1. Trying direct string lookup for raffle...")
      const raffleDirectString = await db.collection(RAFFLES_COLLECTION).findOne({ _id: raffleId })
      debugInfo.lookupResults.raffleDirectString = {
        found: !!raffleDirectString,
        data: raffleDirectString
          ? {
              _id: raffleDirectString._id,
              title: raffleDirectString.title,
              startDate: raffleDirectString.startDate,
              endDate: raffleDirectString.endDate,
            }
          : null,
      }
      console.log("Direct string lookup result:", !!raffleDirectString)
    } catch (error) {
      debugInfo.errors.push(`Direct string lookup error: ${error.message}`)
      console.log("Direct string lookup error:", error.message)
    }

    // 2. Try ObjectId conversion lookup for raffle
    try {
      console.log("2. Trying ObjectId conversion lookup for raffle...")
      const objectIdRaffleId = new ObjectId(raffleId)
      const raffleWithObjectId = await db.collection(RAFFLES_COLLECTION).findOne({ _id: objectIdRaffleId })
      debugInfo.lookupResults.raffleWithObjectId = {
        found: !!raffleWithObjectId,
        objectIdString: objectIdRaffleId.toString(),
        data: raffleWithObjectId
          ? {
              _id: raffleWithObjectId._id,
              title: raffleWithObjectId.title,
              startDate: raffleWithObjectId.startDate,
              endDate: raffleWithObjectId.endDate,
            }
          : null,
      }
      console.log("ObjectId lookup result:", !!raffleWithObjectId)
    } catch (error) {
      debugInfo.errors.push(`ObjectId conversion error: ${error.message}`)
      console.log("ObjectId conversion error:", error.message)
    }

    // 3. Check business raffle association with string IDs
    try {
      console.log("3. Checking business raffle association (string IDs)...")
      const businessRaffleString = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({
        businessId: businessId,
        raffleId: raffleId,
      })
      debugInfo.lookupResults.businessRaffleString = {
        found: !!businessRaffleString,
        data: businessRaffleString
          ? {
              _id: businessRaffleString._id,
              businessId: businessRaffleString.businessId,
              raffleId: businessRaffleString.raffleId,
              isActive: businessRaffleString.isActive,
            }
          : null,
      }
      console.log("Business raffle (string) result:", !!businessRaffleString)
    } catch (error) {
      debugInfo.errors.push(`Business raffle string lookup error: ${error.message}`)
      console.log("Business raffle string lookup error:", error.message)
    }

    // 4. Check business raffle association with ObjectId conversion
    try {
      console.log("4. Checking business raffle association (ObjectId conversion)...")
      const businessIdObj = new ObjectId(businessId)
      const raffleIdObj = new ObjectId(raffleId)
      const businessRaffleObjectId = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({
        businessId: businessIdObj,
        raffleId: raffleIdObj,
      })
      debugInfo.lookupResults.businessRaffleObjectId = {
        found: !!businessRaffleObjectId,
        data: businessRaffleObjectId
          ? {
              _id: businessRaffleObjectId._id,
              businessId: businessRaffleObjectId.businessId,
              raffleId: businessRaffleObjectId.raffleId,
              isActive: businessRaffleObjectId.isActive,
            }
          : null,
      }
      console.log("Business raffle (ObjectId) result:", !!businessRaffleObjectId)
    } catch (error) {
      debugInfo.errors.push(`Business raffle ObjectId lookup error: ${error.message}`)
      console.log("Business raffle ObjectId lookup error:", error.message)
    }

    // 5. List all raffles in the collection (first 5)
    try {
      console.log("5. Listing sample raffles in collection...")
      const allRaffles = await db.collection(RAFFLES_COLLECTION).find({}).limit(5).toArray()
      debugInfo.lookupResults.sampleRaffles = allRaffles.map((raffle) => ({
        _id: raffle._id,
        _idType: typeof raffle._id,
        title: raffle.title,
      }))
      console.log("Sample raffles found:", allRaffles.length)
    } catch (error) {
      debugInfo.errors.push(`Sample raffles lookup error: ${error.message}`)
      console.log("Sample raffles lookup error:", error.message)
    }

    // 6. List all business raffles for this business
    try {
      console.log("6. Listing business raffles for this business...")
      const businessRaffles = await db
        .collection(BUSINESS_RAFFLES_COLLECTION)
        .find({
          businessId: businessId,
        })
        .toArray()
      debugInfo.lookupResults.businessRafflesForBusiness = businessRaffles.map((br) => ({
        _id: br._id,
        businessId: br.businessId,
        raffleId: br.raffleId,
        raffleIdType: typeof br.raffleId,
        isActive: br.isActive,
      }))
      console.log("Business raffles for business found:", businessRaffles.length)
    } catch (error) {
      debugInfo.errors.push(`Business raffles for business lookup error: ${error.message}`)
      console.log("Business raffles for business lookup error:", error.message)
    }

    console.log("=== DEBUG COMPLETE ===")

    return NextResponse.json(debugInfo, { status: 200 })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      {
        error: "Debug endpoint failed",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
