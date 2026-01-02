import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Valid status values
const statusEnum = z.enum(["backlog", "todo", "in-progress", "in-review", "done"]);

// Zod schema for validating kanban ticket objects
const kanbanTicketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: statusEnum.optional().default("backlog"),
  effort: z.string().optional(),
});

const createKanbanTicketsSchema = z.array(kanbanTicketSchema).min(1, "At least one ticket is required");

// POST /api/ideas/[id]/kanban - Add kanban tickets to an idea
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const body = await request.json();

    // Validate request body
    const validationResult = createKanbanTicketsSchema.safeParse(body);
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

    const ticketsData = validationResult.data;

    // Create all tickets linked to the idea
    const tickets = await db.kanbanTicket.createManyAndReturn({
      data: ticketsData.map((ticket) => ({
        ideaId: id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        effort: ticket.effort,
      })),
    });

    return NextResponse.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error("POST /api/ideas/[id]/kanban error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
