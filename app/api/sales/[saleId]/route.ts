import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { SALES_COLLECTION, validateSale } from "@/models/sale"
import { CUSTOMERS_COLLECTION } from "@/models/customer"
import { ObjectId } from "mongodb"

// PUT update sale
export async function PUT(request: NextRequest, { params }: { params: { saleId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "rep") {
      return NextResponse.json({ error: "Rep access required" }, { status: 403 })
    }

    const body = await request.json()
    const { customerId, amount, dateOfSale, productDescription, commissionEarned } = body

    const db = await getDb()

    // Check if sale exists and belongs to user
    const existingSale = await db.collection(SALES_COLLECTION).findOne({
      _id: new ObjectId(params.saleId),
      repId: session.user.id,
    })

    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found or not accessible" }, { status: 404 })
    }

    const saleData = {
      customerId,
      amount: Number(amount),
      dateOfSale: new Date(dateOfSale),
      productDescription,
      commissionEarned: commissionEarned ? Number(commissionEarned) : undefined,
      repId: session.user.id,
    }

    const errors = validateSale(saleData)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 })
    }

    // Verify customer belongs to this rep
    const customer = await db.collection(CUSTOMERS_COLLECTION).findOne({
      _id: customerId,
      repId: session.user.id,
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found or not accessible" }, { status: 404 })
    }

    await db.collection(SALES_COLLECTION).updateOne(
      { _id: new ObjectId(params.saleId) },
      {
        $set: {
          ...saleData,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating sale:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE sale
export async function DELETE(request: NextRequest, { params }: { params: { saleId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "rep") {
      return NextResponse.json({ error: "Rep access required" }, { status: 403 })
    }

    const db = await getDb()

    // Check if sale exists and belongs to user
    const existingSale = await db.collection(SALES_COLLECTION).findOne({
      _id: new ObjectId(params.saleId),
      repId: session.user.id,
    })

    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found or not accessible" }, { status: 404 })
    }

    await db.collection(SALES_COLLECTION).deleteOne({ _id: new ObjectId(params.saleId) })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting sale:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
