import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Zod schema for validating tech stack items
const techStackItemSchema = z.object({
  category: z.string().min(1, "Category is required"),
  technology: z.string().min(1, "Technology is required"),
  justification: z.string().min(1, "Justification is required"),
});

const createTechStackSchema = z.array(techStackItemSchema).min(1, "At least one tech stack item is required");

// POST /api/ideas/[id]/techstack - Add technology stack recommendations to an idea
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
    const validationResult = createTechStackSchema.safeParse(body);
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

    const techStackData = validationResult.data;

    // Create all tech stack items linked to the idea
    const techStack = await db.techStack.createManyAndReturn({
      data: techStackData.map((item) => ({
        ideaId: id,
        category: item.category,
        technology: item.technology,
        justification: item.justification,
      })),
    });

    return NextResponse.json({
      success: true,
      data: techStack,
    });
  } catch (error) {
    console.error("POST /api/ideas/[id]/techstack error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
