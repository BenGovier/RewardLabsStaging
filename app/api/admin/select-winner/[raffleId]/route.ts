import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { WinnerSelectionService } from "@/lib/winner-selection"

export async function POST(request: Request, { params }: { params: { raffleId: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const raffleId = params.raffleId

    if (!raffleId) {
      return NextResponse.json({ error: "Raffle ID is required" }, { status: 400 })
    }

    // Select winner
    const result = await WinnerSelectionService.selectRandomWinner(raffleId)

    if (!result) {
      return NextResponse.json({ error: "Failed to select winner" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      winner: result,
    })
  } catch (error) {
    console.error("Winner selection error:", error)
    return NextResponse.json(
      {
        error: "Failed to select winner",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
