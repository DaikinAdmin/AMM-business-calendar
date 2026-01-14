import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { events, eventParticipants } from "@/db/schema";
import { eq, and, or, gte, lte, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  try {
    let query = db.select().from(events);
    const conditions = [];

    // Filter by date range
    if (startDate) {
      conditions.push(gte(events.startTime, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(events.endTime, new Date(endDate)));
    }

    // If userId is specified, get events for that user
    if (userId) {
      const userEvents = await db.query.events.findMany({
        where: and(...(conditions.length > 0 ? conditions : [undefined])),
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

      // Filter events where user is creator or participant
      const filteredEvents = userEvents.filter(
        (event) =>
          event.createdById === parseInt(userId) ||
          event.participants.some((p) => p.userId === parseInt(userId))
      );

      return NextResponse.json(filteredEvents);
    }

    // Admin/Manager can see all events, employees see only their events
    if (session.user.role === "admin" || session.user.role === "manager") {
      const allEvents = await db.query.events.findMany({
        where: and(...(conditions.length > 0 ? conditions : [undefined])),
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
        orderBy: (events, { desc }) => [desc(events.startTime)],
      });

      return NextResponse.json(allEvents);
    } else {
      // Regular employees see only their events
      const userEvents = await db.query.events.findMany({
        where: and(...(conditions.length > 0 ? conditions : [undefined])),
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

      const filteredEvents = userEvents.filter(
        (event) =>
          event.createdById === parseInt(session.user.id) ||
          event.participants.some((p) => p.userId === parseInt(session.user.id))
      );

      return NextResponse.json(filteredEvents);
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Title, start time, and end time are required" },
        { status: 400 }
      );
    }

    // Create event
    const [newEvent] = await db
      .insert(events)
      .values({
        title,
        description,
        type: type || "meeting",
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        isAllDay: isAllDay || false,
        priority: priority || "medium",
        status: status || "pending",
        projectId: projectId || null,
        createdById: parseInt(session.user.id),
      })
      .returning();

    // Add participants if provided
    if (participantIds && participantIds.length > 0) {
      await db.insert(eventParticipants).values(
        participantIds.map((userId: number) => ({
          eventId: newEvent.id,
          userId,
          status: "pending",
        }))
      );
    }

    // Fetch complete event with relations
    const completeEvent = await db.query.events.findFirst({
      where: eq(events.id, newEvent.id),
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

    return NextResponse.json(completeEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
