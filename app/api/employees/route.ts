import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allUsers = await db.query.users.findMany({
      columns: {
        password: false, // Exclude password from response
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins and managers can create employees
  if (session.user.role !== "admin" && session.user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email, password, name, role, position, department, phone, avatar } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        role: role || "employee",
        position,
        department,
        phone,
        avatar,
      })
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        position: users.position,
        department: users.department,
        phone: users.phone,
        avatar: users.avatar,
        active: users.active,
        createdAt: users.createdAt,
      });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Error creating employee:", error);
    if (error.code === "23505") {
      // Unique constraint violation
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
