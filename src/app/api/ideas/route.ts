import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Zod schema for validating POST request body
const createIdeaSchema = z.object({
  originalIdea: z.string().min(1, "Original idea is required"),
  enhancedIdea: z.string().min(1, "Enhanced idea is required"),
});

// POST /api/ideas - Create a new idea
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createIdeaSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { originalIdea, enhancedIdea } = validationResult.data;

    // Create idea in database
    const idea = await db.idea.create({
      data: {
        originalIdea,
        enhancedIdea,
      },
    });

    return NextResponse.json({
      success: true,
      data: idea,
    });
  } catch (error) {
    console.error("POST /api/ideas error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// GET /api/ideas - List all ideas (ordered by creation date, newest first)
export async function GET() {
  try {
    const ideas = await db.idea.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        originalIdea: true,
        enhancedIdea: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: ideas,
    });
  } catch (error) {
    console.error("GET /api/ideas error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
