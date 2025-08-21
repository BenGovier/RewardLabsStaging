import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { REFERRAL_LINKS_COLLECTION } from "@/models/referralLink"
import { REFERRAL_CLICKS_COLLECTION } from "@/models/referralClick"
import { BUSINESS_SIGNUPS_COLLECTION } from "@/models/businessSignup"

export interface ReferralPerformanceData {
  totalLinks: number
  totalClicks: number
  totalSignups: number
  totalCommission: number
  repPerformance: Array<{
    repId: string
    repName: string
    email: string
    activeLinks: number
    totalClicks: number
    totalSignups: number
    revenueGenerated: number
    commissionEarned: number
  }>
  topLinks: Array<{
    linkId: string
    name: string
    repName: string
    clicks: number
    signups: number
    revenue: number
    createdAt: string
  }>
}

export async function GET() {
  try {
    const db = await getDb()

    // Get total referral links
    const referralLinksCollection = db.collection(REFERRAL_LINKS_COLLECTION)
    const totalLinks = await referralLinksCollection.countDocuments({ isActive: true })

    // Get total clicks
    const referralClicksCollection = db.collection(REFERRAL_CLICKS_COLLECTION)
    const totalClicks = await referralClicksCollection.countDocuments()

    // Get total signups from referrals
    const businessSignupsCollection = db.collection(BUSINESS_SIGNUPS_COLLECTION)
    const totalSignups = await businessSignupsCollection.countDocuments({
      paymentStatus: "completed",
      createdByRepId: { $exists: true, $ne: null },
    })

    // Calculate total commission (assuming 10% commission on $29.99)
    const totalCommission = totalSignups * 29.99 * 0.1

    // Get rep performance data
    const repPerformance = await referralLinksCollection
      .aggregate([
        {
          $match: { isActive: true },
        },
        {
          $lookup: {
            from: "users",
            localField: "repId",
            foreignField: "_id",
            as: "rep",
          },
        },
        { $unwind: "$rep" },
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
            let: { repId: "$repId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$createdByRepId", "$$repId"] }, { $eq: ["$paymentStatus", "completed"] }],
                  },
                },
              },
            ],
            as: "signups",
          },
        },
        {
          $group: {
            _id: "$repId",
            repName: { $first: { $concat: ["$rep.firstName", " ", "$rep.lastName"] } },
            email: { $first: "$rep.email" },
            activeLinks: { $sum: 1 },
            totalClicks: { $sum: { $size: "$clicks" } },
            totalSignups: { $sum: { $size: "$signups" } },
            revenueGenerated: { $sum: { $multiply: [{ $size: "$signups" }, 29.99] } },
            commissionEarned: { $sum: { $multiply: [{ $size: "$signups" }, 29.99, 0.1] } },
          },
        },
        {
          $project: {
            repId: { $toString: "$_id" },
            repName: 1,
            email: 1,
            activeLinks: 1,
            totalClicks: 1,
            totalSignups: 1,
            revenueGenerated: 1,
            commissionEarned: 1,
            _id: 0,
          },
        },
        { $sort: { totalSignups: -1 } },
      ])
      .toArray()

    // Get top performing links
    const topLinks = await referralLinksCollection
      .aggregate([
        {
          $match: { isActive: true },
        },
        {
          $lookup: {
            from: "users",
            localField: "repId",
            foreignField: "_id",
            as: "rep",
          },
        },
        { $unwind: "$rep" },
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
            let: { repId: "$repId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$createdByRepId", "$$repId"] }, { $eq: ["$paymentStatus", "completed"] }],
                  },
                },
              },
            ],
            as: "signups",
          },
        },
        {
          $project: {
            linkId: { $toString: "$_id" },
            name: 1,
            repName: { $concat: ["$rep.firstName", " ", "$rep.lastName"] },
            clicks: { $size: "$clicks" },
            signups: { $size: "$signups" },
            revenue: { $multiply: [{ $size: "$signups" }, 29.99] },
            createdAt: 1,
            _id: 0,
          },
        },
        { $sort: { signups: -1, clicks: -1 } },
        { $limit: 10 },
      ])
      .toArray()

    const performanceData: ReferralPerformanceData = {
      totalLinks,
      totalClicks,
      totalSignups,
      totalCommission,
      repPerformance,
      topLinks,
    }

    return NextResponse.json(performanceData)
  } catch (error) {
    console.error("Referral performance fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch referral performance data" }, { status: 500 })
  }
}
