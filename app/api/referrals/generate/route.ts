import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"
import { nanoid } from "nanoid"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only reps can generate referral links
    if (session.user.role !== "rep") {
      return NextResponse.json({ error: "Only representatives can generate referral links" }, { status: 403 })
    }

    const db = await getDb()

    // Generate a unique slug (8 characters) if user doesn't have one
    let referralSlug = session.user.referralSlug

    if (!referralSlug) {
      let slug = nanoid(8)
      let isUnique = false

      // Ensure slug is unique
      while (!isUnique) {
        const existingUser = await db.collection(USERS_COLLECTION).findOne({ referralSlug: slug })
        if (!existingUser) {
          isUnique = true
        } else {
          slug = nanoid(8)
        }
      }

      // Update user with new referral slug
      await db
        .collection(USERS_COLLECTION)
        .updateOne({ _id: session.user.id }, { $set: { referralSlug: slug, referralSlugUpdatedAt: new Date() } })

      referralSlug = slug
    }

    // Return the business signup referral URL
    const referralUrl = `${process.env.NEXTAUTH_URL}/signup/business?ref=${referralSlug}`

    return NextResponse.json({
      success: true,
      referralSlug,
      referralUrl,
      businessSignupUrl: referralUrl,
    })
  } catch (error) {
    console.error("Error generating referral slug:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
