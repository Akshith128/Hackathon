import { storage } from "./storage";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create default Admin user
    await storage.createUser({
      id: "admin",
      name: "System Admin",
      role: "admin",
      password: "admin",
      dob: "01011990",
      academic_status: "active",
    });
    console.log("✓ Created default Admin user (ID: admin, Password: admin)");
  } catch (error) {
    console.log("✓ Admin user already exists");
  }

  try {
    // Create sample Student user
    await storage.createUser({
      id: "R101",
      name: "John Student",
      role: "student",
      password: "10011999", // DDMMYYYY format
      department: "Computer Science",
      year: 2,
      academic_status: "active",
    });
    console.log("✓ Created sample Student user (ID: R101, Password: 10011999)");
  } catch (error) {
    console.log("✓ Student user already exists");
  }

  try {
    // Create sample Faculty user
    await storage.createUser({
      id: "FAC001",
      name: "Dr. Jane Faculty",
      role: "faculty",
      password: "faculty123",
      designation: "Associate Professor",
      department: "Computer Science",
      academic_status: "active",
    });
    console.log("✓ Created sample Faculty user (ID: FAC001, Password: faculty123)");
  } catch (error) {
    console.log("✓ Faculty user already exists");
  }

  console.log("\n✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
