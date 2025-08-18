import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { type Comment, COMMENTS_COLLECTION, validateComment } from "@/models/comment"
import { USERS_COLLECTION } from "@/models/user"
import { ObjectId } from "mongodb"

// GET comments for a post
export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    console.log("🔍 Fetching comments for post:", params.postId)
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    // Debug: Check if comments exist for this post
    const commentCount = await db.collection(COMMENTS_COLLECTION).countDocuments({ postId: params.postId })
    console.log(`📊 Found ${commentCount} comments for post ${params.postId}`)

    const comments = await db
      .collection(COMMENTS_COLLECTION)
      .aggregate([
        {
          $match: { postId: params.postId },
        },
        {
          $sort: { createdAt: -1 }, // Newest first
        },
        {
          $lookup: {
            from: USERS_COLLECTION,
            let: { authorId: "$authorId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$_id", { $toObjectId: "$$authorId" }] },
                      { $eq: [{ $toString: "$_id" }, "$$authorId"] },
                    ],
                  },
                },
              },
            ],
            as: "author",
          },
        },
        {
          $unwind: {
            path: "$author",
            preserveNullAndEmptyArrays: true, // Keep comments even if author not found
          },
        },
        {
          $project: {
            _id: 1,
            postId: 1,
            authorId: 1,
            contentText: 1,
            createdAt: 1,
            author: {
              _id: "$author._id",
              firstName: "$author.firstName",
              lastName: "$author.lastName",
              profilePictureUrl: "$author.profilePictureUrl",
            },
          },
        },
      ])
      .toArray()

    console.log(`✅ Successfully fetched ${comments.length} comments`)

    // If no author found, provide placeholder data
    const processedComments = comments.map((comment) => {
      if (!comment.author || Object.keys(comment.author).length === 0) {
        console.log(`⚠️ No author found for comment ${comment._id}, using placeholder`)
        comment.author = {
          _id: comment.authorId,
          firstName: "Unknown",
          lastName: "User",
          profilePictureUrl: null,
        }
      }
      return comment
    })

    return NextResponse.json({ comments: processedComments })
  } catch (error) {
    console.error("❌ Error fetching comments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST new comment
export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    console.log("📝 Creating new comment for post:", params.postId)
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { contentText } = body

    console.log(`💬 Comment text: "${contentText}"`)
    console.log(`👤 Author ID: ${session.user.id}`)

    const commentData: Partial<Comment> = {
      postId: params.postId,
      authorId: session.user.id,
      contentText,
    }

    const errors = validateComment(commentData)
    if (errors.length > 0) {
      console.log("❌ Validation errors:", errors)
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 })
    }

    const db = await getDb()

    const comment: Comment = {
      ...commentData,
      createdAt: new Date(),
    } as Comment

    const result = await db.collection(COMMENTS_COLLECTION).insertOne(comment)
    console.log(`✅ Comment created with ID: ${result.insertedId}`)

    // Update comment count on the post
    try {
      const postCollection = db.collection("posts")
      await postCollection.updateOne({ _id: new ObjectId(params.postId) }, { $inc: { commentCount: 1 } })
      console.log("✅ Post comment count updated")
    } catch (updateError) {
      console.error("⚠️ Could not update post comment count:", updateError)
      // Continue anyway, not critical
    }

    return NextResponse.json(
      {
        success: true,
        commentId: result.insertedId,
        comment: {
          ...comment,
          _id: result.insertedId,
          author: {
            _id: session.user.id,
            firstName: session.user.firstName,
            lastName: session.user.lastName,
            profilePictureUrl: session.user.profilePictureUrl,
          },
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Error creating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
