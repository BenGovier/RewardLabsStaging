import { getDb } from "@/lib/mongodb"
import { RAFFLES_COLLECTION } from "@/models/raffle"
import { notFound } from "next/navigation"
import PublicRafflePage from "../../[raffleId]/public-raffle-page"
import { ObjectId } from "mongodb"

export default async function BusinessPreviewRafflePage({
  params,
}: {
  params: { businessId: string; raffleId: string }
}) {
  const { businessId, raffleId } = params

  try {
    const db = await getDb()
    console.log("=== BUSINESS PREVIEW MODE ===")
    console.log("Params:", { businessId, raffleId })

    // Get raffle data
    let raffle = null
    try {
      raffle = await db.collection(RAFFLES_COLLECTION).findOne({
        _id: new ObjectId(raffleId),
      })
    } catch (raffleError) {
      console.log("Invalid raffle ObjectId:", raffleError)
      return notFound()
    }

    if (!raffle) {
      console.log("Raffle not found")
      return notFound()
    }

    // Try to get real business data, but fall back to mock if not found
    let business = null

    // Try multiple lookup methods
    try {
      business = await db.collection("users").findOne({ _id: businessId })
    } catch (e) {}

    if (!business && ObjectId.isValid(businessId)) {
      try {
        business = await db.collection("users").findOne({ _id: new ObjectId(businessId) })
      } catch (e) {}
    }

    // If no real business found, create mock business data
    if (!business) {
      console.log("Using mock business data for preview")
      business = {
        businessName: "Sample Business",
        firstName: "John",
        lastName: "Doe",
      }
    }

    // Create mock business raffle data for preview
    const mockBusinessRaffle = {
      businessId: businessId,
      raffleId: raffleId,
      isActive: true,
      customizations: {
        logo: "/placeholder.svg?height=100&width=200&text=Business+Logo",
        primaryColor: "#3B82F6",
        secondaryColor: "#1E40AF",
        customQuestions: [
          {
            id: "sample1",
            question: "How did you hear about us?",
            type: "text",
            required: false,
          },
          {
            id: "sample2",
            question: "What's your favorite product?",
            type: "select",
            options: ["Product A", "Product B", "Product C"],
            required: false,
          },
        ],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Check if raffle is active (but allow preview even if not)
    const now = new Date()
    const startDate = new Date(raffle.startDate)
    const endDate = new Date(raffle.endDate)
    const isActive = now >= startDate && now <= endDate

    // Prepare data for client component
    const data = {
      businessRaffle: mockBusinessRaffle,
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
      isPreview: true,
      isActive,
    }

    console.log("Successfully prepared preview data")
    return <PublicRafflePage data={data} />
  } catch (error) {
    console.error("Business preview error:", error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Preview Error</h1>
          <p className="text-gray-600">Sorry, there was an error loading the preview.</p>
          <div className="mt-4 text-left bg-red-50 p-3 rounded text-xs text-red-700">
            <p>
              <strong>Error:</strong> {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    )
  }
}
