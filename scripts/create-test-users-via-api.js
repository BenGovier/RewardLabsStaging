// This script will create test users using the existing admin API
async function createTestUsers() {
  console.log("Creating test users via admin API...")

  // First test user
  const user1Data = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@test.com",
    mobile: "+1234567890",
  }

  // Second test user
  const user2Data = {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@test.com",
    mobile: "+1987654321",
  }

  try {
    console.log("Creating first test user...")
    const response1 = await fetch("/api/admin/reps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user1Data),
    })

    const result1 = await response1.json()
    console.log("First user result:", result1)

    console.log("Creating second test user...")
    const response2 = await fetch("/api/admin/reps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user2Data),
    })

    const result2 = await response2.json()
    console.log("Second user result:", result2)

    if (result1.success && result2.success) {
      console.log("✅ Both test users created successfully!")
      console.log("")
      console.log("Test User 1:")
      console.log("📧 Email: john.doe@test.com")
      console.log("🔑 Password: Check the invitation email or database")
      console.log("")
      console.log("Test User 2:")
      console.log("📧 Email: jane.smith@test.com")
      console.log("🔑 Password: Check the invitation email or database")
    }
  } catch (error) {
    console.error("❌ Error creating test users:", error)
  }
}

createTestUsers()
