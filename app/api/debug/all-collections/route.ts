import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDb()

    // Get all collection names
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // Sample data from each collection
    const data: any = {
      collections: collectionNames,
    }

    for (const collectionName of collectionNames) {
      const sampleDocs = await db.collection(collectionName).find({}).limit(3).toArray()
      data[collectionName] = {
        count: await db.collection(collectionName).countDocuments(),
        sample: sampleDocs,
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
