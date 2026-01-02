import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Zod schema for validating score objects
const scoreSchema = z.object({
  dimension: z.string().min(1, "Dimension is required"),
  score: z.number().int().min(1).max(10, "Score must be between 1 and 10"),
  justification: z.string().min(1, "Justification is required"),
});

const createScoresSchema = z.array(scoreSchema).min(1, "At least one score is required");

// POST /api/ideas/[id]/scores - Add validation scores to an idea
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
    const validationResult = createScoresSchema.safeParse(body);
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

    const scoresData = validationResult.data;

    // Create all scores linked to the idea
    const scores = await db.score.createManyAndReturn({
      data: scoresData.map((score) => ({
        ideaId: id,
        dimension: score.dimension,
        score: score.score,
        justification: score.justification,
      })),
    });

    return NextResponse.json({
      success: true,
      data: scores,
    });
  } catch (error) {
    console.error("POST /api/ideas/[id]/scores error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
