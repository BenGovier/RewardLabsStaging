import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { POSTS_COLLECTION } from "@/models/post"
import { ObjectId } from "mongodb"

// DELETE post
export async function DELETE(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const post = await db.collection(POSTS_COLLECTION).findOne({ _id: new ObjectId(params.postId) })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user is author or admin
    if (post.authorId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    await db.collection(POSTS_COLLECTION).deleteOne({ _id: new ObjectId(params.postId) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
