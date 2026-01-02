import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Zod schema for validating improvement objects
const improvementSchema = z.object({
  dimension: z.string().min(1, "Dimension is required"),
  suggestion: z.string().min(1, "Suggestion is required"),
});

const createImprovementsSchema = z.array(improvementSchema).min(1, "At least one improvement is required");

// POST /api/ideas/[id]/improvements - Add strategic improvements to an idea
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
    const validationResult = createImprovementsSchema.safeParse(body);
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

    const improvementsData = validationResult.data;

    // Create all improvements linked to the idea
    const improvements = await db.improvement.createManyAndReturn({
      data: improvementsData.map((improvement) => ({
        ideaId: id,
        dimension: improvement.dimension,
        suggestion: improvement.suggestion,
      })),
    });

    return NextResponse.json({
      success: true,
      data: improvements,
    });
  } catch (error) {
    console.error("POST /api/ideas/[id]/improvements error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
