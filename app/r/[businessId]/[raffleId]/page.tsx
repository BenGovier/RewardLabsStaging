import { getDb } from "@/lib/mongodb"
import { BUSINESS_RAFFLES_COLLECTION } from "@/models/businessRaffle"
import { RAFFLES_COLLECTION } from "@/models/raffle"
import { notFound } from "next/navigation"
import PublicRafflePage from "./public-raffle-page"
import { ObjectId } from "mongodb"

export async function generateMetadata({ params }: { params: { businessId: string; raffleId: string } }) {
  const { businessId, raffleId } = params

  try {
    const db = await getDb()

    // Get raffle data - use ObjectId
    const raffle = await db.collection(RAFFLES_COLLECTION).findOne({
      _id: new ObjectId(raffleId),
    })
    if (!raffle) return { title: "Raffle Not Found" }

    // Try multiple methods to find business
    let business = null

    // Method 1: String ID lookup
    business = await db.collection("users").findOne({ _id: businessId })

    // Method 2: ObjectId lookup (if valid ObjectId)
    if (!business && ObjectId.isValid(businessId)) {
      business = await db.collection("users").findOne({ _id: new ObjectId(businessId) })
    }

    // Method 3: Email lookup (if businessId looks like email)
    if (!business && businessId.includes("@")) {
      business = await db.collection("users").findOne({ email: businessId })
    }

    if (!business) return { title: "Raffle Not Found" }

    return {
      title: `${raffle.title} | ${business.businessName}`,
      description: raffle.description,
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return { title: "Raffle" }
  }
}

export default async function RafflePage({ params }: { params: { businessId: string; raffleId: string } }) {
  const { businessId, raffleId } = params

  try {
    const db = await getDb()
    console.log("=== PUBLIC RAFFLE PAGE DEBUG ===")
    console.log("Params:", { businessId, raffleId })
    console.log("businessId type:", typeof businessId)
    console.log("raffleId type:", typeof raffleId)

    // Step 1: Get business raffle assignment
    const businessRaffle = await db.collection(BUSINESS_RAFFLES_COLLECTION).findOne({
      businessId: businessId,
      raffleId: raffleId,
      isActive: true,
    })

    console.log("Business raffle lookup result:", !!businessRaffle)
    if (!businessRaffle) {
      console.log("❌ Business raffle not found - raffle not assigned to this business")
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Raffle Not Available</h1>
            <p className="text-gray-600">This raffle is not available for this business.</p>
            <p className="text-sm text-gray-500 mt-2">Error: Raffle assignment not found</p>
          </div>
        </div>
      )
    }

    // Step 2: Get raffle data
    let raffle = null
    try {
      raffle = await db.collection(RAFFLES_COLLECTION).findOne({
        _id: new ObjectId(raffleId),
      })
    } catch (raffleError) {
      console.log("❌ Invalid raffle ObjectId:", raffleError)
      return notFound()
    }

    console.log("Raffle lookup result:", !!raffle)
    if (!raffle) {
      console.log("❌ Raffle not found in database")
      return notFound()
    }

    // Step 3: Get business data with multiple lookup methods
    let business = null
    let lookupMethod = "none"

    console.log("Attempting business user lookup...")

    // Method 1: Direct string lookup
    try {
      business = await db.collection("users").findOne({ _id: businessId })
      if (business) {
        lookupMethod = "string_id"
        console.log("✅ Business found by string _id")
      }
    } catch (stringError) {
      console.log("String ID lookup error:", stringError)
    }

    // Method 2: ObjectId lookup (if valid ObjectId format)
    if (!business && ObjectId.isValid(businessId)) {
      try {
        business = await db.collection("users").findOne({ _id: new ObjectId(businessId) })
        if (business) {
          lookupMethod = "object_id"
          console.log("✅ Business found by ObjectId _id")
        }
      } catch (objectIdError) {
        console.log("ObjectId lookup error:", objectIdError)
      }
    }

    // Method 3: Email lookup (if businessId contains @)
    if (!business && businessId.includes("@")) {
      try {
        business = await db.collection("users").findOne({ email: businessId })
        if (business) {
          lookupMethod = "email"
          console.log("✅ Business found by email")
        }
      } catch (emailError) {
        console.log("Email lookup error:", emailError)
      }
    }

    // Method 4: Fallback - search all business users for a match
    if (!business) {
      console.log("Trying fallback search...")
      try {
        const allBusinessUsers = await db.collection("users").find({ role: "business" }).toArray()
        business = allBusinessUsers.find(
          (user) => user._id === businessId || user._id.toString() === businessId || user.email === businessId,
        )
        if (business) {
          lookupMethod = "fallback_search"
          console.log("✅ Business found by fallback search")
        }
      } catch (fallbackError) {
        console.log("Fallback search error:", fallbackError)
      }
    }

    console.log("Final business lookup result:", !!business, "Method:", lookupMethod)

    if (!business) {
      console.log("❌ Business user not found by any method")
      console.log("Available debug info:")
      console.log("- businessId:", businessId)
      console.log("- businessId type:", typeof businessId)
      console.log("- businessId length:", businessId.length)
      console.log("- Is valid ObjectId:", ObjectId.isValid(businessId))

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
            <p className="text-gray-600">The business associated with this raffle could not be found.</p>
            <div className="mt-4 text-left bg-gray-100 p-3 rounded text-xs">
              <p>
                <strong>Debug Info:</strong>
              </p>
              <p>Business ID: {businessId}</p>
              <p>Lookup Method Tried: {lookupMethod}</p>
              <p>Valid ObjectId: {ObjectId.isValid(businessId) ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>
      )
    }

    // Step 4: Check if raffle is active
    const now = new Date()
    const startDate = new Date(raffle.startDate)
    const endDate = new Date(raffle.endDate)

    if (now < startDate || now > endDate) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {now < startDate ? "Raffle Not Started Yet" : "Raffle Has Ended"}
            </h1>
            <p className="text-gray-600">
              {now < startDate
                ? `This raffle will start on ${startDate.toLocaleDateString()}.`
                : `This raffle ended on ${endDate.toLocaleDateString()}.`}
            </p>
          </div>
        </div>
      )
    }

    // Step 5: Prepare data for client component
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

    console.log("✅ Successfully prepared data for client component")
    console.log("Business lookup method used:", lookupMethod)
    return <PublicRafflePage data={data} />
  } catch (error) {
    console.error("❌ Public raffle loading error:", {
      error: error instanceof Error ? error.message : error,
      businessId,
      raffleId,
      stack: error instanceof Error ? error.stack : undefined,
    })

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Raffle</h1>
          <p className="text-gray-600">Sorry, there was an error loading this raffle.</p>
          <div className="mt-4 text-left bg-red-50 p-3 rounded text-xs text-red-700">
            <p>
              <strong>Error Details:</strong>
            </p>
            <p>{error instanceof Error ? error.message : "Unknown error"}</p>
            <p className="mt-2">
              <strong>Debug Info:</strong>
            </p>
            <p>Business ID: {businessId}</p>
            <p>Raffle ID: {raffleId}</p>
          </div>
        </div>
      </div>
    )
  }
}
