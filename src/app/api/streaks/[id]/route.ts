import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

// Helper to get userId from JWT
function getUserIdFromRequest(req: Request): number | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.substring(7);
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

/**
 * @swagger
 * /api/streaks/{id}:
 *   get:
 *     tags:
 *       - Streak
 *     summary: Get streak detail with history
 *     description: Retrieve a specific streak and all its session history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Streak detail retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - streak belongs to another user
 *       404:
 *         description: Streak not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     tags:
 *       - Streak
 *     summary: Update streak
 *     description: Update fields of an existing streak
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               categoryId:
 *                 type: number
 *               subCategoryId:
 *                 type: number
 *               dayId:
 *                 type: number
 *               totalTime:
 *                 type: number
 *               breakTime:
 *                 type: number
 *               breakCount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Streak updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Streak not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags:
 *       - Streak
 *     summary: Delete streak
 *     description: Delete a streak and all its associated history records
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Streak deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Streak not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const streakId = parseInt(id);
    const streak = await prisma.streak.findUnique({
      where: { id: streakId },
      include: { histories: true },
    });

    if (!streak) {
      return NextResponse.json(
        { message: "Streak not found" },
        { status: 404 }
      );
    }

    if (streak.userId !== userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json(streak);
  } catch (error) {
    console.error("Get streak error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const streakId = parseInt(id);
    const streak = await prisma.streak.findUnique({
      where: { id: streakId },
    });

    if (!streak) {
      return NextResponse.json(
        { message: "Streak not found" },
        { status: 404 }
      );
    }

    if (streak.userId !== userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.subCategoryId !== undefined) updateData.subCategoryId = body.subCategoryId;
    if (body.dayId !== undefined) updateData.dayId = body.dayId;
    if (body.dayIds !== undefined) {
      // Support array of day IDs
      const dayIdsArray = Array.isArray(body.dayIds) ? body.dayIds : [body.dayIds].filter(Boolean);
      updateData.dayIds = dayIdsArray;
      // Set dayId to first item for backward compatibility
      if (dayIdsArray.length > 0) {
        updateData.dayId = dayIdsArray[0];
      }
    }
    if (body.totalTime !== undefined) updateData.totalTime = body.totalTime;
    if (body.breakTime !== undefined) updateData.breakTime = body.breakTime;
    if (body.breakCount !== undefined) updateData.breakCount = body.breakCount;
    if (body.description !== undefined) updateData.description = body.description;

    const updatedStreak = await prisma.streak.update({
      where: { id: streakId },
      data: updateData,
    });

    return NextResponse.json(updatedStreak);
  } catch (error) {
    console.error("Update streak error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const streakId = parseInt(id);
    const streak = await prisma.streak.findUnique({
      where: { id: streakId },
    });

    if (!streak) {
      return NextResponse.json(
        { message: "Streak not found" },
        { status: 404 }
      );
    }

    if (streak.userId !== userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // Delete all history records first
    await prisma.streakHistory.deleteMany({
      where: { streakId },
    });

    // Delete the streak
    await prisma.streak.delete({
      where: { id: streakId },
    });

    return NextResponse.json({ message: "Streak deleted successfully" });
  } catch (error) {
    console.error("Delete streak error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
