import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { REFERRAL_CLICKS_COLLECTION } from "@/models/referralClick"
import { REFERRAL_LINKS_COLLECTION } from "@/models/referralLink"
import { BUSINESS_SIGNUPS_COLLECTION } from "@/models/businessSignup"
import { USERS_COLLECTION } from "@/models/user"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug") // e.g., FvNkTSvy

    const db = await getDb()

    // 1. Check if referral link exists
    const referralLink = await db.collection(REFERRAL_LINKS_COLLECTION).findOne({ slug })

    // 2. Check clicks for this slug
    const clicks = await db
      .collection(REFERRAL_CLICKS_COLLECTION)
      .find({ referralSlug: slug })
      .sort({ timestamp: -1 })
      .toArray()

    // 3. Check business signups with this referral
    const signups = await db.collection(BUSINESS_SIGNUPS_COLLECTION).find({ referralCode: slug }).toArray()

    // 4. Check users created by this rep
    const repId = referralLink?.repId
    const businessUsers = repId
      ? await db
          .collection(USERS_COLLECTION)
          .find({
            role: "business",
            createdByRepId: repId,
          })
          .toArray()
      : []

    // 5. Check all collections for any reference to this slug
    const allCollections = await db.listCollections().toArray()
    const collectionChecks = {}

    for (const collection of allCollections) {
      const name = collection.name
      try {
        const count = await db.collection(name).countDocuments({
          $or: [{ referralSlug: slug }, { referralCode: slug }, { ref: slug }, { slug: slug }],
        })
        if (count > 0) {
          collectionChecks[name] = count
        }
      } catch (e) {
        // Skip collections that can't be queried
      }
    }

    return NextResponse.json({
      slug,
      referralLink: referralLink
        ? {
            id: referralLink._id,
            name: referralLink.name,
            repId: referralLink.repId,
            createdAt: referralLink.createdAt,
            isActive: referralLink.isActive,
          }
        : null,
      clicks: {
        total: clicks.length,
        recent: clicks.slice(0, 5).map((c) => ({
          timestamp: c.timestamp,
          ipAddress: c.ipAddress,
          userAgent: c.userAgent?.substring(0, 50) + "...",
        })),
      },
      signups: {
        total: signups.length,
        list: signups.map((s) => ({
          email: s.email,
          businessName: s.businessName,
          paymentStatus: s.paymentStatus,
          completedAt: s.completedAt,
        })),
      },
      businessUsers: {
        total: businessUsers.length,
        list: businessUsers.map((u) => ({
          email: u.email,
          businessName: u.businessName,
          dateCreated: u.dateCreated,
          stripeSubscriptionStatus: u.stripeSubscriptionStatus,
        })),
      },
      collectionReferences: collectionChecks,
      diagnosis: {
        linkExists: !!referralLink,
        hasClicks: clicks.length > 0,
        hasSignups: signups.length > 0,
        hasBusinessUsers: businessUsers.length > 0,
        trackingWorking: clicks.length > 0 && signups.length > 0,
      },
    })
  } catch (error) {
    console.error("Referral tracking check error:", error)
    return NextResponse.json({ error: "Failed to check referral tracking" }, { status: 500 })
  }
}
