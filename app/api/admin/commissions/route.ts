export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { CommissionCalculatorService } from "@/lib/commission-calculator"

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const startDateParam = url.searchParams.get("startDate")
    const endDateParam = url.searchParams.get("endDate")

    // Default to current month if no dates provided
    const now = new Date()
    const startDate = startDateParam ? new Date(startDateParam) : new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = endDateParam ? new Date(endDateParam) : new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const commissions = await CommissionCalculatorService.calculateAllCommissions(startDate, endDate)

    const summary = {
      totalReps: commissions.length,
      totalSignups: commissions.reduce((sum, c) => sum + c.totalSignups, 0),
      totalRevenue: commissions.reduce((sum, c) => sum + c.totalRevenue, 0),
      totalCommissions: commissions.reduce((sum, c) => sum + c.totalCommission, 0),
      period: {
        start: startDate,
        end: endDate,
      },
    }

    return NextResponse.json({
      success: true,
      summary,
      commissions,
    })
  } catch (error) {
    console.error("Commission API error:", error)
    return NextResponse.json(
      {
        error: "Failed to calculate commissions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
