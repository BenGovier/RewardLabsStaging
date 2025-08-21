import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { BUSINESS_SIGNUPS_COLLECTION } from "@/models/businessSignup"
import { USERS_COLLECTION } from "@/models/user"
import { REFERRAL_LINKS_COLLECTION } from "@/models/referralLink"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")

    if (!slug) {
      return NextResponse.json({ error: "Slug required" }, { status: 400 })
    }

    const db = await getDb()

    // Get referral link details
    const referralLink = await db.collection(REFERRAL_LINKS_COLLECTION).findOne({ slug })

    // Get all business signups
    const allBusinessSignups = await db
      .collection(BUSINESS_SIGNUPS_COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    // Get all business users
    const allBusinessUsers = await db
      .collection(USERS_COLLECTION)
      .find({ role: "business" })
      .sort({ dateCreated: -1 })
      .limit(10)
      .toArray()

    // Check for signups with this referral code
    const referralSignups = await db.collection(BUSINESS_SIGNUPS_COLLECTION).find({ createdByRepId: slug }).toArray()

    // Check for users with this rep ID
    const referralUsers = await db.collection(USERS_COLLECTION).find({ createdByRepId: referralLink?.repId }).toArray()

    return NextResponse.json({
      slug,
      referralLink: referralLink
        ? {
            _id: referralLink._id,
            repId: referralLink.repId,
            name: referralLink.name,
            totalClicks: referralLink.totalClicks || 0,
            totalSignups: referralLink.totalSignups || 0,
            totalRevenue: referralLink.totalRevenue || 0,
          }
        : null,
      recentBusinessSignups: allBusinessSignups.map((signup) => ({
        _id: signup._id,
        email: signup.email,
        businessName: signup.businessName,
        createdByRepId: signup.createdByRepId,
        paymentStatus: signup.paymentStatus,
        createdAt: signup.createdAt,
      })),
      recentBusinessUsers: allBusinessUsers.map((user) => ({
        _id: user._id,
        email: user.email,
        businessName: user.businessName,
        createdByRepId: user.createdByRepId,
        stripeSubscriptionStatus: user.stripeSubscriptionStatus,
        monthlyRevenue: user.monthlyRevenue,
        dateCreated: user.dateCreated,
      })),
      referralSignups,
      referralUsers,
      diagnosis: {
        referralLinkExists: !!referralLink,
        hasRecentSignups: allBusinessSignups.length > 0,
        hasRecentUsers: allBusinessUsers.length > 0,
        hasReferralSignups: referralSignups.length > 0,
        hasReferralUsers: referralUsers.length > 0,
      },
    })
  } catch (error) {
    console.error("Error in tracking diagnosis:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
