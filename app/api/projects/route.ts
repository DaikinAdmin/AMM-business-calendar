import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { projects, projectMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allProjects = await db.query.projects.findMany({
      with: {
        createdBy: {
          columns: {
            password: false,
          },
        },
        members: {
          with: {
            user: {
              columns: {
                password: false,
              },
            },
          },
        },
        events: true,
      },
      orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    });

    // Filter based on role
    if (session.user.role === "admin" || session.user.role === "manager") {
      return NextResponse.json(allProjects);
    } else {
      // Regular employees see only projects they're members of
      const userProjects = allProjects.filter(
        (project) =>
          project.createdById === parseInt(session.user.id) ||
          project.members.some((m) => m.userId === parseInt(session.user.id))
      );
      return NextResponse.json(userProjects);
    }
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins and managers can create projects
  if (session.user.role !== "admin" && session.user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      name,
      description,
      status,
      priority,
      startDate,
      endDate,
      budget,
      clientName,
      memberIds,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    // Create project
    const [newProject] = await db
      .insert(projects)
      .values({
        name,
        description,
        status: status || "pending",
        priority: priority || "medium",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget,
        clientName,
        createdById: parseInt(session.user.id),
      })
      .returning();

    // Add members if provided
    if (memberIds && memberIds.length > 0) {
      await db.insert(projectMembers).values(
        memberIds.map((userId: number) => ({
          projectId: newProject.id,
          userId,
        }))
      );
    }

    // Fetch complete project with relations
    const completeProject = await db.query.projects.findFirst({
      where: eq(projects.id, newProject.id),
      with: {
        createdBy: {
          columns: {
            password: false,
          },
        },
        members: {
          with: {
            user: {
              columns: {
                password: false,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(completeProject, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
