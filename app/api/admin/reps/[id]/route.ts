import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getDb } from "@/lib/mongodb"
import { USERS_COLLECTION, validateUser } from "@/models/user"
import { sendEmail, generateEmailChangeNotification } from "@/lib/email"
import { ObjectId } from "mongodb"

// PUT update rep
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { firstName, lastName, email, mobile } = body

    const db = await getDb()

    // Get current user data
    const currentUser = await db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(params.id) })
    if (!currentUser) {
      return NextResponse.json({ error: "Rep not found" }, { status: 404 })
    }

    if (currentUser.role !== "rep") {
      return NextResponse.json({ error: "User is not a rep" }, { status: 400 })
    }

    const updateData = {
      firstName: firstName?.trim(),
      lastName: lastName?.trim(),
      email: email?.trim().toLowerCase(),
      mobile: mobile?.trim(),
      role: "rep", // Ensure role stays as rep
    }

    const errors = validateUser(updateData)
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 })
    }

    // Check if email changed and if new email already exists
    const emailChanged = currentUser.email !== updateData.email
    if (emailChanged) {
      const existingUser = await db.collection(USERS_COLLECTION).findOne({
        email: updateData.email,
        _id: { $ne: new ObjectId(params.id) },
      })
      if (existingUser) {
        return NextResponse.json({ error: "Email address already exists" }, { status: 400 })
      }
    }

    // Update user
    await db.collection(USERS_COLLECTION).updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    )

    // Send email notification if email changed
    if (emailChanged) {
      await sendEmail({
        to: updateData.email,
        subject: "Your Email Address Has Been Updated",
        html: generateEmailChangeNotification(updateData.firstName, updateData.lastName, updateData.email),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating rep:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE deactivate rep
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const db = await getDb()

    // Check if user exists and is a rep
    const user = await db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(params.id) })
    if (!user) {
      return NextResponse.json({ error: "Rep not found" }, { status: 404 })
    }

    if (user.role !== "rep") {
      return NextResponse.json({ error: "User is not a rep" }, { status: 400 })
    }

    // Deactivate user instead of deleting
    await db.collection(USERS_COLLECTION).updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          isActive: false,
          deactivatedAt: new Date(),
          deactivatedBy: session.user.id,
        },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deactivating rep:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
