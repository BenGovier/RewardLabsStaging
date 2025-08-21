import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  try {
    // Test database connection
    const db = await getDb()

    // Try to ping the database
    await db.admin().ping()

    // Test if we can access collections
    const collections = await db.listCollections().toArray()

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      collections: collections.map((c) => c.name),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
