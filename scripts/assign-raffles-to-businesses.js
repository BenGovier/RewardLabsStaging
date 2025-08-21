const { MongoClient, ObjectId } = require("mongodb")

async function assignRafflesToBusinesses() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    const db = client.db(process.env.MONGODB_DB)

    console.log("🔍 Finding all raffles and business users...")

    // Get all raffles
    const raffles = await db.collection("raffles").find({}).toArray()
    console.log(`📊 Found ${raffles.length} raffles`)

    // Get all business users
    const businessUsers = await db.collection("users").find({ role: "business" }).toArray()
    console.log(`👥 Found ${businessUsers.length} business users`)

    if (raffles.length === 0) {
      console.log("⚠️ No raffles found. Please create a raffle in admin first.")
      return
    }

    if (businessUsers.length === 0) {
      console.log("⚠️ No business users found.")
      return
    }

    // Create business raffle assignments
    const businessRaffles = []

    for (const raffle of raffles) {
      for (const business of businessUsers) {
        // Check if assignment already exists
        const existing = await db.collection("businessRaffles").findOne({
          businessId: business._id.toString(),
          raffleId: raffle._id.toString(),
        })

        if (!existing) {
          businessRaffles.push({
            businessId: business._id.toString(),
            raffleId: raffle._id.toString(),
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }
      }
    }

    if (businessRaffles.length > 0) {
      await db.collection("businessRaffles").insertMany(businessRaffles)
      console.log(`✅ Created ${businessRaffles.length} business raffle assignments`)
    } else {
      console.log("ℹ️ All raffles already assigned to businesses")
    }

    // Show final counts
    const totalAssignments = await db.collection("businessRaffles").countDocuments()
    console.log(`📈 Total business raffle assignments: ${totalAssignments}`)
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await client.close()
  }
}

assignRafflesToBusinesses()
