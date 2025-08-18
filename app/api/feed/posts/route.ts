import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { type Post, POSTS_COLLECTION, validatePost } from "@/models/post"
import { COMMENTS_COLLECTION } from "@/models/comment"
import { REACTIONS_COLLECTION } from "@/models/reaction"
import { USERS_COLLECTION } from "@/models/user"

// GET posts with pagination
export async function GET(request: NextRequest) {
  try {
    console.log("📥 GET /api/feed/posts - Starting request")

    const session = await getServerSession(authOptions)
    console.log("🔐 Session check:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
    })

    if (!session?.user) {
      console.log("❌ Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    console.log("📊 Query params:", { limit, page, skip })

    const db = await getDb()
    console.log("🗄️ Database connection established")

    // First, let's check what's in the posts collection
    const totalPosts = await db.collection(POSTS_COLLECTION).countDocuments()
    console.log("📊 Total posts in database:", totalPosts)

    // Let's also check a sample post to see the data structure
    const samplePost = await db.collection(POSTS_COLLECTION).findOne({})
    console.log("🔍 Sample post structure:", {
      _id: samplePost?._id,
      authorId: samplePost?.authorId,
      authorIdType: typeof samplePost?.authorId,
      hasContent: !!samplePost?.contentText,
    })

    // Let's check users collection too
    const sampleUser = await db.collection(USERS_COLLECTION).findOne({})
    console.log("🔍 Sample user structure:", {
      _id: sampleUser?._id,
      _idType: typeof sampleUser?._id,
      firstName: sampleUser?.firstName,
    })

    // Try different lookup strategies based on the data format
    let posts = []

    // Strategy 1: Try with ObjectId conversion
    try {
      posts = await db
        .collection(POSTS_COLLECTION)
        .aggregate([
          {
            $sort: { createdAt: -1 },
          },
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
          {
            $addFields: {
              authorObjectId: {
                $cond: {
                  if: { $type: "$authorId" },
                  then: { $toObjectId: "$authorId" },
                  else: "$authorId",
                },
              },
            },
          },
          {
            $lookup: {
              from: USERS_COLLECTION,
              localField: "authorObjectId",
              foreignField: "_id",
              as: "author",
            },
          },
          {
            $unwind: {
              path: "$author",
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $lookup: {
              from: REACTIONS_COLLECTION,
              localField: "_id",
              foreignField: "postId",
              as: "reactions",
            },
          },
          {
            $lookup: {
              from: COMMENTS_COLLECTION,
              localField: "_id",
              foreignField: "postId",
              as: "comments",
            },
          },
          {
            $addFields: {
              reactionCounts: {
                like: {
                  $size: {
                    $filter: {
                      input: "$reactions",
                      cond: { $eq: ["$$this.reactionType", "like"] },
                    },
                  },
                },
                heart: {
                  $size: {
                    $filter: {
                      input: "$reactions",
                      cond: { $eq: ["$$this.reactionType", "heart"] },
                    },
                  },
                },
              },
              userReaction: {
                $arrayElemAt: [
                  {
                    $map: {
                      input: {
                        $filter: {
                          input: "$reactions",
                          cond: { $eq: ["$$this.userId", session.user.id] },
                        },
                      },
                      in: "$$this.reactionType",
                    },
                  },
                  0,
                ],
              },
              commentCount: { $size: "$comments" },
            },
          },
          {
            $project: {
              _id: 1,
              authorId: 1,
              contentText: 1,
              mediaUrls: 1,
              createdAt: 1,
              updatedAt: 1,
              author: {
                _id: "$author._id",
                firstName: "$author.firstName",
                lastName: "$author.lastName",
                profilePictureUrl: "$author.profilePictureUrl",
              },
              reactionCounts: 1,
              userReaction: 1,
              commentCount: 1,
            },
          },
        ])
        .toArray()

      console.log("✅ Strategy 1 (ObjectId conversion) result:", {
        count: posts.length,
        firstPostHasAuthor: !!posts[0]?.author,
      })
    } catch (error) {
      console.log("❌ Strategy 1 failed:", error)
    }

    // Strategy 2: If Strategy 1 failed, try direct string lookup
    if (posts.length === 0) {
      try {
        posts = await db
          .collection(POSTS_COLLECTION)
          .aggregate([
            {
              $sort: { createdAt: -1 },
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
            {
              $lookup: {
                from: USERS_COLLECTION,
                let: { authorId: "$authorId" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $or: [{ $eq: ["$_id", "$$authorId"] }, { $eq: [{ $toString: "$_id" }, "$$authorId"] }],
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
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $addFields: {
                reactionCounts: {
                  like: 0,
                  heart: 0,
                },
                userReaction: null,
                commentCount: 0,
              },
            },
            {
              $project: {
                _id: 1,
                authorId: 1,
                contentText: 1,
                mediaUrls: 1,
                createdAt: 1,
                updatedAt: 1,
                author: {
                  _id: "$author._id",
                  firstName: "$author.firstName",
                  lastName: "$author.lastName",
                  profilePictureUrl: "$author.profilePictureUrl",
                },
                reactionCounts: 1,
                userReaction: 1,
                commentCount: 1,
              },
            },
          ])
          .toArray()

        console.log("✅ Strategy 2 (flexible lookup) result:", {
          count: posts.length,
          firstPostHasAuthor: !!posts[0]?.author,
        })
      } catch (error) {
        console.log("❌ Strategy 2 failed:", error)
      }
    }

    // Strategy 3: If both failed, get posts without author lookup for debugging
    if (posts.length === 0) {
      const rawPosts = await db
        .collection(POSTS_COLLECTION)
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .toArray()

      console.log("🔍 Raw posts without lookup:", {
        count: rawPosts.length,
        firstPost: rawPosts[0],
      })

      // Return posts with placeholder author data for now
      posts = rawPosts.map((post) => ({
        ...post,
        author: {
          _id: post.authorId,
          firstName: "Unknown",
          lastName: "User",
          profilePictureUrl: null,
        },
        reactionCounts: { like: 0, heart: 0 },
        userReaction: null,
        commentCount: 0,
      }))
    }

    console.log("✅ Final posts result:", {
      count: posts.length,
      totalInDb: totalPosts,
      firstPostId: posts[0]?._id,
      firstPostAuthor: posts[0]?.author,
    })

    return NextResponse.json({
      posts,
      meta: {
        total: totalPosts,
        page,
        limit,
        hasMore: skip + posts.length < totalPosts,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching posts:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST new post
export async function POST(request: NextRequest) {
  try {
    console.log("📥 POST /api/feed/posts - Starting request")

    const session = await getServerSession(authOptions)
    console.log("🔐 Session check:", {
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
    })

    if (!session?.user || !["admin", "rep"].includes(session.user.role || "")) {
      console.log("❌ Access denied - insufficient permissions")
      return NextResponse.json({ error: "Admin or rep access required" }, { status: 403 })
    }

    const body = await request.json()
    console.log("📝 Request body:", {
      hasContentText: !!body.contentText,
      contentLength: body.contentText?.length,
      mediaUrlsCount: body.mediaUrls?.length || 0,
      mediaUrls: body.mediaUrls,
    })

    const { contentText, mediaUrls = [] } = body

    const postData: Partial<Post> = {
      authorId: session.user.id, // Store as string to match user lookup
      contentText,
      mediaUrls,
    }

    console.log("🔍 Validating post data...")
    const errors = validatePost(postData)
    if (errors.length > 0) {
      console.log("❌ Validation failed:", errors)
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 })
    }

    const db = await getDb()
    console.log("🗄️ Database connection established")

    const now = new Date()

    const post: Post = {
      ...postData,
      authorId: session.user.id, // Keep as string for consistency
      createdAt: now,
      updatedAt: now,
    } as Post

    console.log("💾 Inserting post into database:", {
      authorId: post.authorId,
      authorIdType: typeof post.authorId,
      contentText: post.contentText?.substring(0, 50) + "...",
      mediaUrlsCount: post.mediaUrls.length,
    })

    const result = await db.collection(POSTS_COLLECTION).insertOne(post)

    console.log("✅ Post created successfully:", {
      postId: result.insertedId,
      acknowledged: result.acknowledged,
    })

    // Verify the post was saved
    const savedPost = await db.collection(POSTS_COLLECTION).findOne({ _id: result.insertedId })
    console.log("🔍 Verification - Post saved:", {
      exists: !!savedPost,
      authorId: savedPost?.authorId,
      authorIdType: typeof savedPost?.authorId,
    })

    return NextResponse.json(
      {
        success: true,
        postId: result.insertedId,
        message: "Post created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("❌ Error creating post:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
