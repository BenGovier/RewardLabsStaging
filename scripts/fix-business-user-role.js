const { MongoClient } = require("mongodb")

async function fixBusinessUserRole() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    const db = client.db(process.env.MONGODB_DB)

    console.log("=== Fixing Business User Role ===")

    // Find the business user
    const user = await db.collection("users").findOne({
      email: "testbusiness@example.com",
    })

    if (!user) {
      console.log("❌ Business user not found")
      return
    }

    console.log("Found user:", {
      id: user._id,
      email: user.email,
      currentRole: user.role,
      name: user.name,
    })

    // Update the user role to 'business'
    const updateResult = await db.collection("users").updateOne(
      { email: "testbusiness@example.com" },
      {
        $set: {
          role: "business",
          updatedAt: new Date(),
        },
      },
    )

    console.log("Update result:", updateResult)

    // Verify the update
    const updatedUser = await db.collection("users").findOne({
      email: "testbusiness@example.com",
    })

    console.log("Updated user:", {
      id: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
    })

    console.log("✅ Business user role fixed!")
  } catch (error) {
    console.error("❌ Error fixing business user role:", error)
  } finally {
    await client.close()
  }
}

fixBusinessUserRole()
