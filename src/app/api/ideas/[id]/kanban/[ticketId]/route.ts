import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Valid status values
const statusEnum = z.enum(["backlog", "todo", "in-progress", "in-review", "done"]);

// Zod schema for validating status update
const updateStatusSchema = z.object({
  status: statusEnum,
});

// PATCH /api/ideas/[id]/kanban/[ticketId] - Update a kanban ticket's status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  try {
    const { id, ticketId } = await params;

    // Check if idea exists
    const idea = await db.idea.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!idea) {
      return NextResponse.json(
        {
          success: false,
          error: "Idea not found",
        },
        { status: 404 }
      );
    }

    // Check if ticket exists and belongs to this idea
    const existingTicket = await db.kanbanTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, ideaId: true },
    });

    if (!existingTicket) {
      return NextResponse.json(
        {
          success: false,
          error: "Ticket not found",
        },
        { status: 404 }
      );
    }

    if (existingTicket.ideaId !== id) {
      return NextResponse.json(
        {
          success: false,
          error: "Ticket does not belong to this idea",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = updateStatusSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { status } = validationResult.data;

    // Update ticket status
    const updatedTicket = await db.kanbanTicket.update({
      where: { id: ticketId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      data: updatedTicket,
    });
  } catch (error) {
    console.error("PATCH /api/ideas/[id]/kanban/[ticketId] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
