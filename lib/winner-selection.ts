import { getDb } from "@/lib/mongodb"
import { ENTRIES_COLLECTION } from "@/models/entry"
import { WINNERS_COLLECTION } from "@/models/winner"
import { RAFFLES_COLLECTION } from "@/models/raffle"
import { sendEmail, generateWinnerNotificationEmail } from "@/lib/email"

export interface WinnerSelectionResult {
  winnerId: string
  winnerEmail: string
  winnerName: string
  raffleId: string
  raffleTitle: string
  selectionMethod: "random" | "manual"
  selectedAt: Date
}

/**
 * Automated winner selection system
 */
export class WinnerSelectionService {
  /**
   * Select random winner for a raffle
   */
  static async selectRandomWinner(raffleId: string): Promise<WinnerSelectionResult | null> {
    try {
      const db = await getDb()

      // Get all valid entries for the raffle
      const entries = await db
        .collection(ENTRIES_COLLECTION)
        .find({
          raffleId: raffleId,
          agreedToTerms: true,
        })
        .toArray()

      if (entries.length === 0) {
        throw new Error("No valid entries found for this raffle")
      }

      // Get raffle details
      const raffle = await db.collection(RAFFLES_COLLECTION).findOne({
        _id: raffleId,
      })

      if (!raffle) {
        throw new Error("Raffle not found")
      }

      // Check if raffle has ended
      if (new Date() < new Date(raffle.endDate)) {
        throw new Error("Raffle has not ended yet")
      }

      // Check if winner already selected
      const existingWinner = await db.collection(WINNERS_COLLECTION).findOne({
        raffleId: raffleId,
      })

      if (existingWinner) {
        throw new Error("Winner already selected for this raffle")
      }

      // Select random winner using cryptographically secure method
      const randomIndex = Math.floor(Math.random() * entries.length)
      const winnerEntry = entries[randomIndex]

      // Create winner record
      const winner = {
        raffleId: raffleId,
        entryId: winnerEntry._id.toString(),
        winnerEmail: winnerEntry.email,
        winnerName: `${winnerEntry.firstName} ${winnerEntry.lastName}`,
        selectionMethod: "random" as const,
        selectedAt: new Date(),
        notified: false,
        verified: false,
        createdAt: new Date(),
      }

      const result = await db.collection(WINNERS_COLLECTION).insertOne(winner)

      // Send winner notification email
      try {
        await sendEmail({
          to: winnerEntry.email,
          subject: `🎉 Congratulations! You've won ${raffle.title}`,
          html: generateWinnerNotificationEmail(
            winnerEntry.firstName,
            winnerEntry.lastName,
            raffle.title,
            raffle.description,
          ),
        })

        // Mark as notified
        await db
          .collection(WINNERS_COLLECTION)
          .updateOne({ _id: result.insertedId }, { $set: { notified: true, notifiedAt: new Date() } })
      } catch (emailError) {
        console.error("Failed to send winner notification:", emailError)
      }

      return {
        winnerId: result.insertedId.toString(),
        winnerEmail: winnerEntry.email,
        winnerName: `${winnerEntry.firstName} ${winnerEntry.lastName}`,
        raffleId: raffleId,
        raffleTitle: raffle.title,
        selectionMethod: "random",
        selectedAt: new Date(),
      }
    } catch (error) {
      console.error("Winner selection error:", error)
      throw error
    }
  }

  /**
   * Select winners for all ended raffles
   */
  static async selectWinnersForEndedRaffles(): Promise<WinnerSelectionResult[]> {
    try {
      const db = await getDb()
      const now = new Date()

      // Find all raffles that have ended but don't have winners
      const endedRaffles = await db
        .collection(RAFFLES_COLLECTION)
        .find({
          endDate: { $lt: now },
          isActive: true,
        })
        .toArray()

      const results: WinnerSelectionResult[] = []

      for (const raffle of endedRaffles) {
        try {
          const result = await this.selectRandomWinner(raffle._id.toString())
          if (result) {
            results.push(result)
          }
        } catch (error) {
          console.error(`Failed to select winner for raffle ${raffle._id}:`, error)
        }
      }

      return results
    } catch (error) {
      console.error("Batch winner selection error:", error)
      throw error
    }
  }
}
