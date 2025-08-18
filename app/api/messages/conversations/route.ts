export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { CONVERSATIONS_COLLECTION } from "@/models/conversation"
import { USERS_COLLECTION } from "@/models/user"

// GET all conversations for authenticated user
export async function GET() {
  try {
    console.log("=== CONVERSATIONS API DEBUG ===")
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      console.log("No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Session user ID:", session.user.id)
    const db = await getDb()

    // First, let's see what conversations exist
    const allConversations = await db.collection(CONVERSATIONS_COLLECTION).find({}).toArray()
    console.log("All conversations in DB:", allConversations)

    // Find conversations where user is a participant
    const conversations = await db
      .collection(CONVERSATIONS_COLLECTION)
      .aggregate([
        {
          $match: {
            participants: session.user.id,
          },
        },
        {
          $sort: { lastUpdated: -1 },
        },
        {
          $addFields: {
            otherParticipantId: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$participants",
                    cond: { $ne: ["$$this", session.user.id] },
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $lookup: {
            from: USERS_COLLECTION,
            let: { otherParticipantId: "$otherParticipantId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", { $toObjectId: "$$otherParticipantId" }],
                  },
                },
              },
            ],
            as: "otherParticipant",
          },
        },
        {
          $unwind: "$otherParticipant",
        },
        {
          $project: {
            _id: 1,
            participants: 1,
            lastUpdated: 1,
            lastMessage: 1,
            otherParticipant: {
              _id: "$otherParticipant._id",
              firstName: "$otherParticipant.firstName",
              lastName: "$otherParticipant.lastName",
              profilePictureUrl: "$otherParticipant.profilePictureUrl",
              role: "$otherParticipant.role",
            },
          },
        },
      ])
      .toArray()

    console.log("Found conversations:", conversations.length)
    console.log("Conversations data:", conversations)

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
