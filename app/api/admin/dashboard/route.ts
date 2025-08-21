import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export interface DashboardData {
  clients: {
    total: number
    thisMonth: number
    active: number
  }
  monthlyRevenue: {
    total: number
    thisMonth: number
    breakdown: Array<{
      planName: string
      count: number
      revenue: number
    }>
  }
  leads: {
    total: number
    thisMonth: number
    last7Days: number
  }
  totalEntries: {
    total: number
    thisMonth: number
    last7Days: number
  }
}

export async function GET() {
  try {
    const db = await getDb()

    // Get current date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    console.log("📊 Fetching dashboard data...")

    // 1. GET CLIENTS DATA (Business Users)
    const usersCollection = db.collection("users")

    const totalClients = await usersCollection.countDocuments({
      role: "business",
    })

    const clientsThisMonth = await usersCollection.countDocuments({
      role: "business",
      createdAt: { $gte: startOfMonth },
    })

    // Count active clients (those with active subscriptions)
    const activeClients = await usersCollection.countDocuments({
      role: "business",
      $or: [
        { stripeSubscriptionStatus: "active" },
        { subscriptionStatus: "active" },
        { paymentStatus: "completed" },
        { status: "active" },
      ],
    })

    console.log(`👥 Clients: ${totalClients} total, ${activeClients} active, ${clientsThisMonth} this month`)

    // 2. GET MONTHLY REVENUE DATA
    // Get all business users with subscription data
    const businessUsers = await usersCollection
      .find({
        role: "business",
      })
      .toArray()

    let totalMonthlyRevenue = 0
    let thisMonthRevenue = 0
    const planBreakdown = new Map()

    businessUsers.forEach((user) => {
      // Check if user has active subscription
      const status = (
        user.stripeSubscriptionStatus ||
        user.subscriptionStatus ||
        user.paymentStatus ||
        user.status ||
        ""
      ).toLowerCase()
      const isActive = ["active", "completed", "paid"].includes(status)

      if (isActive) {
        // Default to $29.99 if no specific amount
        const monthlyAmount = user.monthlyRevenue || user.subscriptionAmount || 29.99
        totalMonthlyRevenue += monthlyAmount

        // If user joined this month, add to this month's revenue
        const userCreatedAt = user.createdAt || user.dateCreated
        if (userCreatedAt && new Date(userCreatedAt) >= startOfMonth) {
          thisMonthRevenue += monthlyAmount
        }

        // Track plan breakdown
        const planName = user.planName || user.subscriptionPlan || "Standard Plan"
        if (!planBreakdown.has(planName)) {
          planBreakdown.set(planName, { count: 0, revenue: 0 })
        }
        const plan = planBreakdown.get(planName)
        plan.count += 1
        plan.revenue += monthlyAmount
      }
    })

    const revenueBreakdown = Array.from(planBreakdown.entries()).map(([planName, data]) => ({
      planName,
      count: data.count,
      revenue: data.revenue,
    }))

    console.log(`💰 Revenue: $${totalMonthlyRevenue} total MRR, $${thisMonthRevenue} this month`)

    // 3. GET LEADS DATA (Website Leads)
    const websiteLeadsCollection = db.collection("websiteLeads")

    const totalLeads = await websiteLeadsCollection.countDocuments()

    const leadsThisMonth = await websiteLeadsCollection.countDocuments({
      timestamp: { $gte: startOfMonth },
    })

    const leadsLast7Days = await websiteLeadsCollection.countDocuments({
      timestamp: { $gte: last7Days },
    })

    console.log(`📧 Leads: ${totalLeads} total, ${leadsThisMonth} this month, ${leadsLast7Days} last 7 days`)

    // 4. GET TOTAL ENTRIES DATA
    const entriesCollection = db.collection("entries")

    const totalEntries = await entriesCollection.countDocuments()

    const entriesThisMonth = await entriesCollection.countDocuments({
      $or: [{ createdAt: { $gte: startOfMonth } }, { submittedAt: { $gte: startOfMonth } }],
    })

    const entriesLast7Days = await entriesCollection.countDocuments({
      $or: [{ createdAt: { $gte: last7Days } }, { submittedAt: { $gte: last7Days } }],
    })

    console.log(`🎫 Entries: ${totalEntries} total, ${entriesThisMonth} this month, ${entriesLast7Days} last 7 days`)

    const dashboardData: DashboardData = {
      clients: {
        total: totalClients,
        thisMonth: clientsThisMonth,
        active: activeClients,
      },
      monthlyRevenue: {
        total: Math.round(totalMonthlyRevenue * 100) / 100, // Round to 2 decimal places
        thisMonth: Math.round(thisMonthRevenue * 100) / 100,
        breakdown: revenueBreakdown,
      },
      leads: {
        total: totalLeads,
        thisMonth: leadsThisMonth,
        last7Days: leadsLast7Days,
      },
      totalEntries: {
        total: totalEntries,
        thisMonth: entriesThisMonth,
        last7Days: entriesLast7Days,
      },
    }

    console.log("✅ Dashboard data compiled successfully")
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("❌ Dashboard data fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data", details: error.message }, { status: 500 })
  }
}
