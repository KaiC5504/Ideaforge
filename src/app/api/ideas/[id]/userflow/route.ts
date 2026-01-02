import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Zod schema for validating user flow nodes
const nodeSchema = z.object({
  id: z.string().min(1, "Node id is required"),
  type: z.string().min(1, "Node type is required"),
  label: z.string().min(1, "Node label is required"),
  description: z.string().optional(),
});

// Zod schema for validating user flow edges
const edgeSchema = z.object({
  id: z.string().min(1, "Edge id is required"),
  source: z.string().min(1, "Edge source is required"),
  target: z.string().min(1, "Edge target is required"),
  label: z.string().optional(),
  condition: z.string().optional(),
});

// Zod schema for validating the complete user flow
const userFlowSchema = z.object({
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

// POST /api/ideas/[id]/userflow - Add user flow diagram data to an idea
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
    const validationResult = userFlowSchema.safeParse(body);
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

    const userFlowData = validationResult.data;

    // Update the idea with the user flow data
    const updatedIdea = await db.idea.update({
      where: { id },
      data: { userFlow: userFlowData },
      select: {
        id: true,
        userFlow: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedIdea,
    });
  } catch (error) {
    console.error("POST /api/ideas/[id]/userflow error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
