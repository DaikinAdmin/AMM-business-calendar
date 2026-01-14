import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { invitations, eventParticipants } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status } = body; // 'accepted' or 'declined'

    if (!status || !['accepted', 'declined'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Get invitation
    const invitation = await db.query.invitations.findFirst({
      where: eq(invitations.id, parseInt(id)),
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    // Check if user owns this invitation
    if (invitation.userId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update invitation status
    const [updatedInvitation] = await db
      .update(invitations)
      .set({
        status,
        respondedAt: new Date(),
      })
      .where(eq(invitations.id, parseInt(id)))
      .returning();

    // If accepted, add to event participants
    if (status === 'accepted') {
      // Check if already a participant
      const existingParticipant = await db.query.eventParticipants.findFirst({
        where: and(
          eq(eventParticipants.eventId, invitation.eventId),
          eq(eventParticipants.userId, invitation.userId)
        ),
      });

      if (!existingParticipant) {
        await db.insert(eventParticipants).values({
          eventId: invitation.eventId,
          userId: invitation.userId,
          status: 'accepted',
        });
      } else {
        await db
          .update(eventParticipants)
          .set({ status: 'accepted' })
          .where(
            and(
              eq(eventParticipants.eventId, invitation.eventId),
              eq(eventParticipants.userId, invitation.userId)
            )
          );
      }
    }

    return NextResponse.json(updatedInvitation);
  } catch (error) {
    console.error('Error updating invitation:', error);
    return NextResponse.json(
      { error: "Failed to update invitation" },
      { status: 500 }
    );
  }
}
