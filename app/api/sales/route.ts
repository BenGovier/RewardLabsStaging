import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { type Sale, SALES_COLLECTION, validateSale } from "@/models/sale"
import { USERS_COLLECTION } from "@/models/user"
import { CUSTOMERS_COLLECTION } from "@/models/customer"

// GET sales with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const repId = searchParams.get("repId")
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const db = await getDb()

    // Build match criteria
    const matchCriteria: any = {}

    // If user is rep, only show their sales
    if (session.user.role === "rep") {
      matchCriteria.repId = session.user.id
    } else if (session.user.role === "admin" && repId) {
      // Admin can filter by specific rep
      matchCriteria.repId = repId
    }

    // Date range filtering
    if (from || to) {
      matchCriteria.dateOfSale = {}
      if (from) matchCriteria.dateOfSale.$gte = new Date(from)
      if (to) matchCriteria.dateOfSale.$lte = new Date(to)
    }

    // Aggregate sales with rep and customer info
    const sales = await db
      .collection(SALES_COLLECTION)
      .aggregate([
        {
          $match: matchCriteria,
        },
        {
          $sort: { dateOfSale: -1 },
        },
        {
          $lookup: {
            from: USERS_COLLECTION,
            localField: "repId",
            foreignField: "_id",
            as: "rep",
          },
        },
        {
          $lookup: {
            from: CUSTOMERS_COLLECTION,
            localField: "customerId",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $unwind: { path: "$rep", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$customer", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            _id: 1,
            repId: 1,
            customerId: 1,
            amount: 1,
            dateOfSale: 1,
            productDescription: 1,
            commissionEarned: 1,
            createdAt: 1,
            rep: {
              _id: "$rep._id",
              firstName: "$rep.firstName",
              lastName: "$rep.lastName",
            },
            customer: {
              _id: "$customer._id",
              name: "$customer.name",
              email: "$customer.email",
            },
          },
        },
      ])
      .toArray()

    return NextResponse.json({ sales })
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST new sale
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "rep") {
      return NextResponse.json({ error: "Rep access required" }, { status: 403 })
    }

    const body = await request.json()
    const { customerId, amount, dateOfSale, productDescription, commissionEarned } = body

    const saleData: Partial<Sale> = {
      repId: session.user.id,
      customerId,
      amount: Number(amount),
      dateOfSale: new Date(dateOfSale),
      productDescription,
      commissionEarned: commissionEarned ? Number(commissionEarned) : undefined,
    }

    const errors = validateSale(saleData)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 })
    }

    const db = await getDb()

    // Verify customer belongs to this rep
    const customer = await db.collection(CUSTOMERS_COLLECTION).findOne({
      _id: customerId,
      repId: session.user.id,
    })

    if (!customer) {
      return NextResponse.json({ error: "Customer not found or not accessible" }, { status: 404 })
    }

    const sale: Sale = {
      ...saleData,
      createdAt: new Date(),
    } as Sale

    const result = await db.collection(SALES_COLLECTION).insertOne(sale)

    return NextResponse.json({ success: true, saleId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error creating sale:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
