import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { projects, projectMembers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, parseInt(id)),
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
        events: {
          with: {
            participants: {
              with: {
                user: {
                  columns: {
                    password: false,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if user has access to this project
    const hasAccess =
      session.user.role === "admin" ||
      session.user.role === "manager" ||
      project.createdById === parseInt(session.user.id) ||
      project.members.some((m) => m.userId === parseInt(session.user.id));

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins and managers can update projects
  if (session.user.role !== "admin" && session.user.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const projectId = parseInt(id);

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

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (startDate !== undefined)
      updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined)
      updateData.endDate = endDate ? new Date(endDate) : null;
    if (budget !== undefined) updateData.budget = budget;
    if (clientName !== undefined) updateData.clientName = clientName;

    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, projectId))
      .returning();

    // Update members if provided
    if (memberIds !== undefined) {
      // Remove existing members
      await db
        .delete(projectMembers)
        .where(eq(projectMembers.projectId, projectId));

      // Add new members
      if (memberIds.length > 0) {
        await db.insert(projectMembers).values(
          memberIds.map((userId: number) => ({
            projectId,
            userId,
          }))
        );
      }
    }

    // Fetch complete project with relations
    const completeProject = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
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

    return NextResponse.json(completeProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admins can delete projects
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await db.delete(projects).where(eq(projects.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
