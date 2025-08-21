import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { REFERRAL_CLICKS_COLLECTION, type ReferralClick } from "@/models/referralClick"
import { REFERRAL_LINKS_COLLECTION } from "@/models/referralLink"
import { USERS_COLLECTION } from "@/models/user"

export async function POST(request: Request) {
  try {
    const { referralSlug } = await request.json()

    if (!referralSlug) {
      return NextResponse.json({ error: "Referral slug is required" }, { status: 400 })
    }

    const db = await getDb()

    // Find the referral link by slug
    const referralLink = await db.collection(REFERRAL_LINKS_COLLECTION).findOne({
      slug: referralSlug,
      isActive: true,
    })

    if (!referralLink) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 })
    }

    // Get the rep details - CONVERT STRING TO OBJECTID
    const rep = await db.collection(USERS_COLLECTION).findOne({
      _id: new ObjectId(referralLink.repId),
      role: "rep",
    })

    if (!rep) {
      return NextResponse.json({ error: "Rep not found" }, { status: 404 })
    }

    // Get client IP and user agent
    const forwarded = request.headers.get("x-forwarded-for")
    const ipAddress = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Create referral click record
    const referralClick: ReferralClick = {
      repId: rep._id.toString(),
      referralLinkId: referralLink._id.toString(),
      timestamp: new Date(),
      ipAddress,
      userAgent,
      referralSlug,
    }

    await db.collection(REFERRAL_CLICKS_COLLECTION).insertOne(referralClick)

    // Update click count on referral link
    await db.collection(REFERRAL_LINKS_COLLECTION).updateOne(
      { _id: new ObjectId(referralLink._id) },
      {
        $inc: { totalClicks: 1 },
        $set: { lastClickDate: new Date() },
      },
    )

    return NextResponse.json({
      success: true,
      repName: `${rep.firstName} ${rep.lastName}`,
      businessName: rep.businessName || "Sales Team",
    })
  } catch (error) {
    console.error("Error tracking referral click:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
