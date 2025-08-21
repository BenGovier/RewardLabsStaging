import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"
import { RAFFLES_COLLECTION } from "@/models/raffle"
import { USER_COLLECTION } from "@/models/user"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest, { params }: { params: { businessId: string; raffleId: string } }) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    params: params,
    steps: {},
    errors: [],
    collections: {},
    queries: {},
    results: {},
  }

  try {
    const { businessId, raffleId } = params
    debugInfo.receivedParams = { businessId, raffleId }

    // Step 1: Check if IDs are valid ObjectId format
    debugInfo.steps.step1_idValidation = {
      businessIdLength: businessId.length,
      raffleIdLength: raffleId.length,
      businessIdIsValidObjectId: ObjectId.isValid(businessId),
      raffleIdIsValidObjectId: ObjectId.isValid(raffleId),
    }

    // Step 2: Database connection
    let db
    try {
      db = await getDb()
      debugInfo.steps.step2_dbConnection = "✅ Success"
    } catch (error) {
      debugInfo.steps.step2_dbConnection = `❌ Failed: ${error}`
      debugInfo.errors.push(`DB Connection: ${error}`)
      return NextResponse.json(debugInfo)
    }

    // Step 3: Check what collections exist
    try {
      const collections = await db.listCollections().toArray()
      debugInfo.collections.available = collections.map((c) => c.name)
      debugInfo.collections.hasBusinessRaffles = collections.some((c) => c.name === BUSINESS_RAFFLES_COLLECTION)
      debugInfo.collections.hasRaffles = collections.some((c) => c.name === RAFFLES_COLLECTION)
      debugInfo.collections.hasUsers = collections.some((c) => c.name === USER_COLLECTION)
    } catch (error) {
      debugInfo.errors.push(`Collections check: ${error}`)
    }

    // Step 4: Try different query variations for business raffle
    debugInfo.steps.step4_businessRaffleQueries = {}

    // Query 1: String IDs
    try {
      const query1 = { businessId, raffleId, isActive: true }
      const result1 = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne(query1)
      debugInfo.steps.step4_businessRaffleQueries.stringIds = {
        query: query1,
        found: !!result1,
        result: result1,
      }
    } catch (error) {
      debugInfo.steps.step4_businessRaffleQueries.stringIds = { error: String(error) }
    }

    // Query 2: ObjectId conversion
    try {
      const query2 = {
        businessId: new ObjectId(businessId),
        raffleId: new ObjectId(raffleId),
        isActive: true,
      }
      const result2 = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne(query2)
      debugInfo.steps.step4_businessRaffleQueries.objectIds = {
        query: { ...query2, businessId: businessId, raffleId: raffleId }, // For JSON serialization
        found: !!result2,
        result: result2,
      }
    } catch (error) {
      debugInfo.steps.step4_businessRaffleQueries.objectIds = { error: String(error) }
    }

    // Query 3: Check all business raffles for this business
    try {
      const query3 = { businessId }
      const result3 = await db.collection(BUSINESS_RAFFLES_COLLECTION).find(query3).toArray()
      debugInfo.steps.step4_businessRaffleQueries.allForBusiness = {
        query: query3,
        count: result3.length,
        results: result3,
      }
    } catch (error) {
      debugInfo.steps.step4_businessRaffleQueries.allForBusiness = { error: String(error) }
    }

    // Step 5: Try different query variations for raffle
    debugInfo.steps.step5_raffleQueries = {}

    // Query 1: String ID
    try {
      const query1 = { _id: raffleId }
      const result1 = await db.collection(RAFFLES_COLLECTION).findOne(query1)
      debugInfo.steps.step5_raffleQueries.stringId = {
        query: query1,
        found: !!result1,
        result: result1,
      }
    } catch (error) {
      debugInfo.steps.step5_raffleQueries.stringId = { error: String(error) }
    }

    // Query 2: ObjectId
    try {
      const query2 = { _id: new ObjectId(raffleId) }
      const result2 = await db.collection(RAFFLES_COLLECTION).findOne(query2)
      debugInfo.steps.step5_raffleQueries.objectId = {
        query: { _id: raffleId }, // For JSON serialization
        found: !!result2,
        result: result2,
      }
    } catch (error) {
      debugInfo.steps.step5_raffleQueries.objectId = { error: String(error) }
    }

    // Query 3: All raffles
    try {
      const result3 = await db.collection(RAFFLES_COLLECTION).find({}).toArray()
      debugInfo.steps.step5_raffleQueries.allRaffles = {
        count: result3.length,
        results: result3.map((r) => ({ _id: r._id, title: r.title })),
      }
    } catch (error) {
      debugInfo.steps.step5_raffleQueries.allRaffles = { error: String(error) }
    }

    // Step 6: Try different query variations for business
    debugInfo.steps.step6_businessQueries = {}

    // Query 1: String ID
    try {
      const query1 = { _id: businessId }
      const result1 = await db.collection(USER_COLLECTION).findOne(query1)
      debugInfo.steps.step6_businessQueries.stringId = {
        query: query1,
        found: !!result1,
        result: result1,
      }
    } catch (error) {
      debugInfo.steps.step6_businessQueries.stringId = { error: String(error) }
    }

    // Query 2: ObjectId
    try {
      const query2 = { _id: new ObjectId(businessId) }
      const result2 = await db.collection(USER_COLLECTION).findOne(query2)
      debugInfo.steps.step6_businessQueries.objectId = {
        query: { _id: businessId }, // For JSON serialization
        found: !!result2,
        result: result2,
      }
    } catch (error) {
      debugInfo.steps.step6_businessQueries.objectId = { error: String(error) }
    }

    // Step 7: Check collection schemas
    debugInfo.steps.step7_schemas = {}

    try {
      // Sample documents from each collection
      const sampleBusinessRaffle = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({})
      const sampleRaffle = await db.collection(RAFFLES_COLLECTION).findOne({})
      const sampleUser = await db.collection(USER_COLLECTION).findOne({})

      debugInfo.steps.step7_schemas = {
        businessRaffle: sampleBusinessRaffle ? Object.keys(sampleBusinessRaffle) : "No documents",
        raffle: sampleRaffle ? Object.keys(sampleRaffle) : "No documents",
        user: sampleUser ? Object.keys(sampleUser) : "No documents",
      }
    } catch (error) {
      debugInfo.steps.step7_schemas = { error: String(error) }
    }

    return NextResponse.json({
      success: true,
      message: "Comprehensive debug completed",
      debug: debugInfo,
    })
  } catch (error) {
    debugInfo.errors.push(`Main error: ${error}`)
    return NextResponse.json({
      success: false,
      error: "Comprehensive debug failed",
      debug: debugInfo,
      mainError: error instanceof Error ? error.message : String(error),
    })
  }
}
