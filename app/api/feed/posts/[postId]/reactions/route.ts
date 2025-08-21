import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { type Reaction, REACTIONS_COLLECTION } from "@/models/reaction"
import { ObjectId } from "mongodb"

// POST toggle reaction
export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    console.log("👍 Toggling reaction for post:", params.postId)
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { reactionType = "like" } = body

    if (!["like", "heart"].includes(reactionType)) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 })
    }

    console.log(`🔍 Checking if user ${session.user.id} already reacted to post ${params.postId}`)
    const db = await getDb()

    // Check if user already has a reaction on this post
    const existingReaction = await db.collection(REACTIONS_COLLECTION).findOne({
      postId: params.postId,
      userId: session.user.id,
    })

    const postCollection = db.collection("posts")
    let action = ""

    if (existingReaction) {
      console.log("✅ Found existing reaction:", existingReaction)
      if (existingReaction.reactionType === reactionType) {
        // Remove reaction if same type
        console.log("🗑️ Removing reaction")
        await db.collection(REACTIONS_COLLECTION).deleteOne({
          postId: params.postId,
          userId: session.user.id,
        })

        // Decrement reaction count
        await postCollection.updateOne(
          { _id: new ObjectId(params.postId) },
          {
            $inc: { [`reactionCounts.${reactionType}`]: -1 },
            $set: {
              updatedAt: new Date(),
              ...(session.user.id === existingReaction.userId ? { userReaction: null } : {}),
            },
          },
        )
        action = "removed"
      } else {
        // Update reaction type
        console.log(`🔄 Updating reaction from ${existingReaction.reactionType} to ${reactionType}`)
        await db.collection(REACTIONS_COLLECTION).updateOne(
          {
            postId: params.postId,
            userId: session.user.id,
          },
          {
            $set: {
              reactionType,
              createdAt: new Date(),
            },
          },
        )

        // Update reaction counts
        await postCollection.updateOne(
          { _id: new ObjectId(params.postId) },
          {
            $inc: {
              [`reactionCounts.${existingReaction.reactionType}`]: -1,
              [`reactionCounts.${reactionType}`]: 1,
            },
            $set: {
              updatedAt: new Date(),
              userReaction: reactionType,
            },
          },
        )
        action = "updated"
      }
    } else {
      // Add new reaction
      console.log("➕ Adding new reaction")
      const reaction: Reaction = {
        postId: params.postId,
        userId: session.user.id,
        reactionType,
        createdAt: new Date(),
      }

      await db.collection(REACTIONS_COLLECTION).insertOne(reaction)

      // Increment reaction count
      await postCollection.updateOne(
        { _id: new ObjectId(params.postId) },
        {
          $inc: { [`reactionCounts.${reactionType}`]: 1 },
          $set: {
            updatedAt: new Date(),
            userReaction: reactionType,
          },
        },
      )
      action = "added"
    }

    console.log(`✅ Reaction ${action} successfully`)
    return NextResponse.json({ success: true, action })
  } catch (error) {
    console.error("❌ Error toggling reaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
