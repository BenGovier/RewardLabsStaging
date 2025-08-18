import { getDb } from "@/lib/mongodb"
import { RAFFLES_COLLECTION } from "@/models/raffle"
import { WinnerSelectionService } from "./winner-selection"

/**
 * Raffle lifecycle management service
 */
export class RaffleLifecycleService {
  /**
   * Update raffle statuses based on current date
   */
  static async updateRaffleStatuses(): Promise<{
    activated: number
    ended: number
    winnersSelected: number
  }> {
    try {
      const db = await getDb()
      const now = new Date()

      // Activate raffles that should start
      const activateResult = await db.collection(RAFFLES_COLLECTION).updateMany(
        {
          startDate: { $lte: now },
          endDate: { $gt: now },
          isActive: false,
        },
        {
          $set: {
            isActive: true,
            updatedAt: now,
          },
        },
      )

      // End raffles that have passed their end date
      const endResult = await db.collection(RAFFLES_COLLECTION).updateMany(
        {
          endDate: { $lte: now },
          isActive: true,
        },
        {
          $set: {
            isActive: false,
            status: "ended",
            updatedAt: now,
          },
        },
      )

      // Select winners for ended raffles
      const winnerResults = await WinnerSelectionService.selectWinnersForEndedRaffles()

      return {
        activated: activateResult.modifiedCount,
        ended: endResult.modifiedCount,
        winnersSelected: winnerResults.length,
      }
    } catch (error) {
      console.error("Raffle lifecycle update error:", error)
      throw error
    }
  }

  /**
   * Cleanup expired data
   */
  static async cleanupExpiredData(): Promise<{
    deletedEntries: number
    archivedRaffles: number
  }> {
    try {
      const db = await getDb()
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      // Archive old raffles (don't delete, just mark as archived)
      const archiveResult = await db.collection(RAFFLES_COLLECTION).updateMany(
        {
          endDate: { $lt: thirtyDaysAgo },
          archived: { $ne: true },
        },
        {
          $set: {
            archived: true,
            archivedAt: new Date(),
          },
        },
      )

      return {
        deletedEntries: 0, // Don't delete entries for legal/audit reasons
        archivedRaffles: archiveResult.modifiedCount,
      }
    } catch (error) {
      console.error("Cleanup error:", error)
      throw error
    }
  }
}
