import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { REFERRAL_LINKS_COLLECTION } from "@/models/referralLink"
import { ObjectId } from "mongodb"

// DELETE - Deactivate a referral link
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "rep") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid link ID" }, { status: 400 })
    }

    const db = await getDb()

    // Deactivate the link (don't delete to preserve tracking data)
    const result = await db.collection(REFERRAL_LINKS_COLLECTION).updateOne(
      {
        _id: new ObjectId(id),
        repId: session.user.id,
      },
      {
        $set: {
          isActive: false,
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deactivating referral link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
