import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Valid priority values
const priorityEnum = z.enum(["must-have", "should-have", "nice-to-have"]);

// Zod schema for validating feature objects
const featureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  priority: priorityEnum,
});

const createFeaturesSchema = z.array(featureSchema).min(1, "At least one feature is required");

// POST /api/ideas/[id]/features - Add core features to an idea
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
    const validationResult = createFeaturesSchema.safeParse(body);
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

    const featuresData = validationResult.data;

    // Create all features linked to the idea
    const features = await db.feature.createManyAndReturn({
      data: featuresData.map((feature) => ({
        ideaId: id,
        name: feature.name,
        description: feature.description,
        priority: feature.priority,
      })),
    });

    return NextResponse.json({
      success: true,
      data: features,
    });
  } catch (error) {
    console.error("POST /api/ideas/[id]/features error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
