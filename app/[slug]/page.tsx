import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION } from "@/models/user"
import { REFERRAL_CLICKS_COLLECTION } from "@/models/referralClick"

export default async function ReferralPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const db = await getDb()

  // Find user with this referral slug
  const user = await db.collection(USERS_COLLECTION).findOne({ referralSlug: slug })

  if (user) {
    // Get IP address from headers
    const headersList = headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    // Record the referral click
    await db.collection(REFERRAL_CLICKS_COLLECTION).insertOne({
      repId: user._id,
      referralSlug: slug,
      timestamp: new Date(),
      ipAddress,
      userAgent,
    })

    // Redirect to signup page with referral parameter
    redirect(`/signup?referral=${slug}`)
  } else {
    // If no matching slug found, redirect to home page
    redirect("/")
  }

  // This will never be rendered due to the redirects above
  return null
}
