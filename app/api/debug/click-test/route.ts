import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { REFERRAL_CLICKS_COLLECTION } from "@/models/referralClick"
import { REFERRAL_LINKS_COLLECTION } from "@/models/referralLink"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get("slug")

    if (!slug) {
      return NextResponse.json({ error: "Slug required" }, { status: 400 })
    }

    const db = await getDb()

    // Check if referral link exists
    const referralLink = await db.collection(REFERRAL_LINKS_COLLECTION).findOne({ slug })

    // Check clicks for this slug
    const clicks = await db.collection(REFERRAL_CLICKS_COLLECTION).find({ referralSlug: slug }).toArray()

    return NextResponse.json({
      slug,
      referralLinkExists: !!referralLink,
      referralLink,
      totalClicks: clicks.length,
      clickRecords: clicks,
      lastClick: clicks[clicks.length - 1] || null,
    })
  } catch (error) {
    console.error("Error checking clicks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
