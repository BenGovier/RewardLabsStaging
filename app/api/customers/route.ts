export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { CUSTOMERS_COLLECTION } from "@/models/customer"

// GET customers for the authenticated rep
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "rep") {
      return NextResponse.json({ error: "Rep access required" }, { status: 403 })
    }

    const db = await getDb()
    const customers = await db
      .collection(CUSTOMERS_COLLECTION)
      .find({ repId: session.user.id })
      .sort({ name: 1 })
      .toArray()

    return NextResponse.json({ customers })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
