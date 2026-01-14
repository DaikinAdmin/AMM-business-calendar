import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { invitations } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allInvitations = await db.query.invitations.findMany({
      where: eq(invitations.userId, parseInt(session.user.id)),
      with: {
        event: {
          with: {
            createdBy: {
              columns: {
                password: false,
              },
            },
            project: true,
          },
        },
        sentBy: {
          columns: {
            password: false,
          },
        },
      },
      orderBy: (invitations, { desc }) => [desc(invitations.sentAt)],
    });

    return NextResponse.json(allInvitations);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
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
    const { eventId, userId, message } = body;

    if (!eventId || !userId) {
      return NextResponse.json(
        { error: "Event ID and User ID are required" },
        { status: 400 }
      );
    }

    const [newInvitation] = await db
      .insert(invitations)
      .values({
        eventId,
        userId,
        sentById: parseInt(session.user.id),
        message,
        status: 'pending',
      })
      .returning();

    return NextResponse.json(newInvitation, { status: 201 });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
