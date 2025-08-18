import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { type SalesTool, SALES_TOOLS_COLLECTION, validateSalesTool } from "@/models/salesTool"

// GET all sales tools
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDb()
    const tools = await db.collection(SALES_TOOLS_COLLECTION).find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ tools })
  } catch (error) {
    console.error("Error fetching sales tools:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST new sales tool (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, type, url, filePath, fileName, fileSize, thumbnailUrl } = body

    const toolData: Partial<SalesTool> = {
      title: title?.trim(),
      description: description?.trim(),
      type,
      url: url?.trim(),
      filePath,
      fileName,
      fileSize,
      thumbnailUrl,
    }

    const errors = validateSalesTool(toolData)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 })
    }

    const db = await getDb()

    const tool: SalesTool = {
      ...toolData,
      createdAt: new Date(),
    } as SalesTool

    const result = await db.collection(SALES_TOOLS_COLLECTION).insertOne(tool)

    return NextResponse.json({ success: true, toolId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating sales tool:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
