import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { events, eventParticipants } from "@/db/schema";
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
    const event = await db.query.events.findFirst({
      where: eq(events.id, parseInt(id)),
      with: {
        createdBy: {
          columns: {
            password: false,
          },
        },
        participants: {
          with: {
            user: {
              columns: {
                password: false,
              },
            },
          },
        },
        project: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Check if user has access to this event
    const hasAccess =
      session.user.role === "admin" ||
      session.user.role === "manager" ||
      event.createdById === parseInt(session.user.id) ||
      event.participants.some((p) => p.userId === parseInt(session.user.id));

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
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

  const eventId = parseInt(id);

  try {
    // Check if user created this event or is admin/manager
    const existingEvent = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const canEdit =
      session.user.role === "admin" ||
      session.user.role === "manager" ||
      existingEvent.createdById === parseInt(session.user.id);

    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      startTime,
      endTime,
      location,
      isAllDay,
      priority,
      status,
      projectId,
      participantIds,
    } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);
    if (location !== undefined) updateData.location = location;
    if (isAllDay !== undefined) updateData.isAllDay = isAllDay;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (projectId !== undefined) updateData.projectId = projectId;

    const [updatedEvent] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, eventId))
      .returning();

    // Update participants if provided
    if (participantIds !== undefined) {
      // Remove existing participants
      await db
        .delete(eventParticipants)
        .where(eq(eventParticipants.eventId, eventId));

      // Add new participants
      if (participantIds.length > 0) {
        await db.insert(eventParticipants).values(
          participantIds.map((userId: number) => ({
            eventId,
            userId,
            status: "pending",
          }))
        );
      }
    }

    // Fetch complete event with relations
    const completeEvent = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      with: {
        createdBy: {
          columns: {
            password: false,
          },
        },
        participants: {
          with: {
            user: {
              columns: {
                password: false,
              },
            },
          },
        },
        project: true,
      },
    });

    return NextResponse.json(completeEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
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

  const eventId = parseInt(id);

  try {
    const existingEvent = await db.query.events.findFirst({
      where: eq(events.id, eventId),
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const canDelete =
      session.user.role === "admin" ||
      existingEvent.createdById === parseInt(session.user.id);

    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(events).where(eq(events.id, eventId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
