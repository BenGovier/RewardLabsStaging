import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { REFERRAL_LINKS_COLLECTION } from "@/models/referralLink"
import { USERS_COLLECTION } from "@/models/user"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")

    if (!slug) {
      return NextResponse.json({ error: "Slug required" }, { status: 400 })
    }

    const db = await getDb()

    // Get the referral link
    const referralLink = await db.collection(REFERRAL_LINKS_COLLECTION).findOne({
      slug: slug,
    })

    if (!referralLink) {
      return NextResponse.json({ error: "Referral link not found" }, { status: 404 })
    }

    // Try to find rep with different approaches
    const repId = referralLink.repId

    // Approach 1: Direct lookup
    const rep1 = await db.collection(USERS_COLLECTION).findOne({
      _id: repId,
    })

    // Approach 2: ObjectId conversion
    let rep2 = null
    try {
      rep2 = await db.collection(USERS_COLLECTION).findOne({
        _id: new ObjectId(repId),
      })
    } catch (e) {
      // ObjectId conversion failed
    }

    // Approach 3: String comparison
    const rep3 = await db.collection(USERS_COLLECTION).findOne({
      _id: repId.toString(),
    })

    // Get all users to see what exists
    const allUsers = await db.collection(USERS_COLLECTION).find({}).limit(5).toArray()

    return NextResponse.json({
      referralLink: {
        _id: referralLink._id,
        repId: referralLink.repId,
        repIdType: typeof referralLink.repId,
        slug: referralLink.slug,
      },
      repLookupResults: {
        directLookup: rep1 ? "FOUND" : "NOT FOUND",
        objectIdLookup: rep2 ? "FOUND" : "NOT FOUND",
        stringLookup: rep3 ? "FOUND" : "NOT FOUND",
      },
      repDetails: rep1 || rep2 || rep3 || null,
      sampleUsers: allUsers.map((u) => ({
        _id: u._id,
        idType: typeof u._id,
        role: u.role,
        email: u.email,
      })),
    })
  } catch (error) {
    console.error("Error in rep lookup check:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
