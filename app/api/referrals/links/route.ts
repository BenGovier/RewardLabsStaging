import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { REFERRAL_LINKS_COLLECTION, type ReferralLink, validateReferralLink } from "@/models/referralLink"
import { REFERRAL_CLICKS_COLLECTION } from "@/models/referralClick"
import { USERS_COLLECTION } from "@/models/user"
import { BUSINESS_SIGNUPS_COLLECTION } from "@/models/businessSignup"
import { nanoid } from "nanoid"

// GET - Fetch all referral links for the current rep with stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "rep") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()

    // Get all referral links for this rep with aggregated stats
    const links = await db
      .collection(REFERRAL_LINKS_COLLECTION)
      .aggregate([
        {
          $match: {
            repId: session.user.id,
            isActive: true,
          },
        },
        {
          $lookup: {
            from: REFERRAL_CLICKS_COLLECTION,
            localField: "slug",
            foreignField: "referralSlug",
            as: "clicks",
          },
        },
        {
          $lookup: {
            from: BUSINESS_SIGNUPS_COLLECTION,
            localField: "slug",
            foreignField: "createdByRepId",
            as: "signups",
          },
        },
        {
          $lookup: {
            from: USERS_COLLECTION,
            localField: "slug",
            foreignField: "createdByRepId",
            as: "users",
          },
        },
        {
          $addFields: {
            totalClicks: { $size: "$clicks" },
            totalSignups: { $size: "$signups" },
            totalRevenue: {
              $sum: {
                $map: {
                  input: "$users",
                  as: "user",
                  in: { $ifNull: ["$$user.monthlyRevenue", 0] },
                },
              },
            },
            lastClickedAt: {
              $max: "$clicks.timestamp",
            },
          },
        },
        {
          $project: {
            clicks: 0,
            signups: 0,
            users: 0,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json({ success: true, links })
  } catch (error) {
    console.error("Error fetching referral links:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new named referral link
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "rep") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Link name is required" }, { status: 400 })
    }

    const db = await getDb()

    // Generate a unique slug
    let slug = nanoid(8)
    let isUnique = false

    while (!isUnique) {
      const existingLink = await db.collection(REFERRAL_LINKS_COLLECTION).findOne({ slug })
      if (!existingLink) {
        isUnique = true
      } else {
        slug = nanoid(8)
      }
    }

    // Create the referral link
    const referralLink: ReferralLink = {
      repId: session.user.id,
      name: name.trim(),
      slug,
      referralUrl: `${process.env.NEXTAUTH_URL}/signup/business?ref=${slug}`,
      createdAt: new Date(),
      isActive: true,
      totalClicks: 0,
      totalSignups: 0,
      totalRevenue: 0,
    }

    // Validate the link
    const errors = validateReferralLink(referralLink)
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(", ") }, { status: 400 })
    }

    // Insert the link
    const result = await db.collection(REFERRAL_LINKS_COLLECTION).insertOne(referralLink)

    return NextResponse.json({
      success: true,
      link: {
        ...referralLink,
        _id: result.insertedId,
      },
    })
  } catch (error) {
    console.error("Error creating referral link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
