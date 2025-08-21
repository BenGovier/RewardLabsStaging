import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { REFERRAL_LINKS_COLLECTION } from "@/models/referralLink"
import { REFERRAL_CLICKS_COLLECTION } from "@/models/referralClick"
import { BUSINESS_SIGNUPS_COLLECTION } from "@/models/businessSignup"

export async function GET() {
  try {
    const db = await getDb()

    // Sample referral links data
    const referralLinksCollection = db.collection(REFERRAL_LINKS_COLLECTION)
    const sampleLinks = await referralLinksCollection.find({}).limit(2).toArray()

    // Sample users data (reps)
    const usersCollection = db.collection("users")
    const sampleReps = await usersCollection.find({ role: "rep" }).limit(2).toArray()

    // Sample referral clicks data
    const referralClicksCollection = db.collection(REFERRAL_CLICKS_COLLECTION)
    const sampleClicks = await referralClicksCollection.find({}).limit(2).toArray()

    // Sample business signups data
    const businessSignupsCollection = db.collection(BUSINESS_SIGNUPS_COLLECTION)
    const sampleSignups = await businessSignupsCollection.find({}).limit(2).toArray()

    // Collection counts
    const counts = {
      referralLinks: await referralLinksCollection.countDocuments(),
      users: await usersCollection.countDocuments({ role: "rep" }),
      referralClicks: await referralClicksCollection.countDocuments(),
      businessSignups: await businessSignupsCollection.countDocuments(),
    }

    // Test a simple aggregation
    const testAggregation = await referralLinksCollection
      .aggregate([
        { $limit: 1 },
        {
          $lookup: {
            from: "users",
            localField: "repId",
            foreignField: "_id",
            as: "rep",
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      message: "Referral data structure analysis",
      counts,
      sampleData: {
        referralLinks: sampleLinks,
        reps: sampleReps,
        referralClicks: sampleClicks,
        businessSignups: sampleSignups,
      },
      testAggregation,
      fieldAnalysis: {
        referralLinkFields: sampleLinks[0] ? Object.keys(sampleLinks[0]) : [],
        repFields: sampleReps[0] ? Object.keys(sampleReps[0]) : [],
        clickFields: sampleClicks[0] ? Object.keys(sampleClicks[0]) : [],
        signupFields: sampleSignups[0] ? Object.keys(sampleSignups[0]) : [],
      },
    })
  } catch (error) {
    console.error("Debug referral data structure error:", error)
    return NextResponse.json({ error: "Failed to analyze referral data structure" }, { status: 500 })
  }
}
