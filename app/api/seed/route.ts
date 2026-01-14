import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";

// Seed script to create initial admin user
export async function POST(request: NextRequest) {
  try {
    const { secret } = await request.json();

    // Simple protection - in production use better security
    if (secret !== "initialize-amm-calendar-2026") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if admin already exists
    const existingAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, "admin@amm.com"),
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Admin user already exists" },
        { status: 200 }
      );
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const [admin] = await db
      .insert(users)
      .values({
        email: "admin@amm.com",
        password: hashedPassword,
        name: "System Administrator",
        role: "admin",
        position: "Administrator",
        department: "IT",
        active: true,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
      });

    // Create a few sample employees
    const sampleUsers = [
      {
        email: "manager@amm.com",
        password: await bcrypt.hash("manager123", 10),
        name: "John Manager",
        role: "manager" as const,
        position: "Project Manager",
        department: "Operations",
      },
      {
        email: "employee1@amm.com",
        password: await bcrypt.hash("employee123", 10),
        name: "Alice Smith",
        role: "employee" as const,
        position: "Senior Developer",
        department: "Development",
      },
      {
        email: "employee2@amm.com",
        password: await bcrypt.hash("employee123", 10),
        name: "Bob Johnson",
        role: "employee" as const,
        position: "Designer",
        department: "Design",
      },
    ];

    await db.insert(users).values(sampleUsers);

    return NextResponse.json(
      {
        message: "Database initialized successfully",
        admin: {
          email: admin.email,
          password: "admin123",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error initializing database:", error);
    return NextResponse.json(
      { error: "Failed to initialize database" },
      { status: 500 }
    );
  }
}
