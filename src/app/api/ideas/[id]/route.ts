import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/ideas/[id] - Retrieve a complete idea with all relations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch idea with all related data
    const idea = await db.idea.findUnique({
      where: { id },
      include: {
        scores: true,
        improvements: true,
        features: true,
        techStack: true,
        kanbanTickets: true,
      },
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

    return NextResponse.json({
      success: true,
      data: idea,
    });
  } catch (error) {
    console.error("GET /api/ideas/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
