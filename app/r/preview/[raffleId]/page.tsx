import { getDb } from "@/lib/mongodb"
import { RAFFLES_COLLECTION } from "@/models/raffle"
import { notFound } from "next/navigation"
import PublicRafflePage from "../../[businessId]/[raffleId]/public-raffle-page"
import { ObjectId } from "mongodb"

export async function generateMetadata({ params }: { params: { raffleId: string } }) {
  const { raffleId } = params

  try {
    const db = await getDb()

    // Get raffle data - use ObjectId
    const raffle = await db.collection(RAFFLES_COLLECTION).findOne({
      _id: new ObjectId(raffleId),
    })
    if (!raffle) return { title: "Raffle Not Found" }

    return {
      title: `${raffle.title} | Admin Preview`,
      description: raffle.description,
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return { title: "Raffle Preview" }
  }
}

export default async function AdminPreviewPage({ params }: { params: { raffleId: string } }) {
  const { raffleId } = params

  try {
    const db = await getDb()
    console.log("Admin preview page - params:", { raffleId })

    // Get raffle data - use ObjectId (confirmed working)
    const raffle = await db.collection(RAFFLES_COLLECTION).findOne({
      _id: new ObjectId(raffleId),
    })
    console.log("Raffle lookup result:", !!raffle)
    if (!raffle) {
      console.log("Raffle not found")
      return notFound()
    }

    // Create mock data for preview
    const mockBusinessRaffle = {
      _id: "preview",
      businessId: "preview",
      raffleId: raffleId,
      isActive: true,
      businessCustomizations: {
        logo: "/placeholder.svg?height=100&width=200",
        primaryColor: "#3B82F6",
        customQuestions: [
          {
            id: "question1",
            question: "How did you hear about us?",
            type: "select",
            options: ["Social Media", "Friend", "Advertisement", "Other"],
            required: true,
          },
          {
            id: "question2",
            question: "What's your favorite color?",
            type: "text",
            required: false,
          },
        ],
      },
    }

    const mockBusiness = {
      businessName: "Preview Business",
      firstName: "Admin",
      lastName: "Preview",
    }

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
      business: mockBusiness,
    }

    console.log("Successfully prepared preview data")
    return <PublicRafflePage data={data} />
  } catch (error) {
    console.error("Error loading preview page:", error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Preview</h1>
          <p className="text-gray-600">Sorry, there was an error loading this raffle preview.</p>
          <pre className="mt-4 p-2 bg-gray-100 rounded text-xs text-left overflow-auto max-h-40">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        </div>
      </div>
    )
  }
}
