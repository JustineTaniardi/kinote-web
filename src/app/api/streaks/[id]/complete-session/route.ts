import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

interface BreakSession {
  startTime: number;
  endTime?: number;
  duration: number;
  focusTimeBeforeBreak: number;
  type: "completed" | "skipped";
}

function getUserIdFromRequest(req: Request): number | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    return decoded.id;
  } catch {
    return null;
  }
}

/**
 * @swagger
 * /api/streaks/{id}/complete-session:
 *   post:
 *     tags:
 *       - Streak
 *     summary: Complete a streak session with multiple breaks support
 *     description: End a streak session and save with accumulated focus time and break sessions data
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
 *               focusSeconds:
 *                 type: number
 *                 description: Total accumulated focus time in seconds
 *               breakRepetitionsUsed:
 *                 type: number
 *                 description: Number of break sessions used
 *               breakSessions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     startTime:
 *                       type: number
 *                     endTime:
 *                       type: number
 *                     duration:
 *                       type: number
 *                     focusTimeBeforeBreak:
 *                       type: number
 *                     type:
 *                       type: string
 *                       enum: ["completed", "skipped"]
 *               description:
 *                 type: string
 *                 description: Optional session description
 *     responses:
 *       200:
 *         description: Session completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 historyId:
 *                   type: number
 *                 focusDuration:
 *                   type: number
 *                 totalBreakTime:
 *                   type: number
 *                 breakCount:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Streak not found
 *       500:
 *         description: Internal server error
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title = "",
      focusSeconds = 0,
      breakRepetitionsUsed = 0,
      breakSessions = [],
      description = "",
    } = body;

    // Calculate total break time and validate break sessions
    let totalBreakTime = 0;
    const breakSessionsData = (breakSessions as BreakSession[]).map(
      (session) => {
        if (session.type === "completed") {
          totalBreakTime += session.duration;
        }
        return session;
      }
    );

    // Create new history entry with multiple breaks data
    const now = new Date();
    const history = await prisma.streakHistory.create({
      data: {
        streakId,
        userId,
        title,
        description,
        startTime: now,
        endTime: now,
        focusDuration: focusSeconds,
        totalBreakTime,
        duration: Math.round((focusSeconds + totalBreakTime) / 60), // Total duration in minutes
        breakSessions: JSON.stringify(breakSessionsData), // Store as JSON string
      },
    });

    // Count completed sessions from StreakHistory for this user and streak
    const completedCount = await prisma.streakHistory.count({
      where: {
        streakId,
        userId,
      },
    });

    // Update streak metadata
    // NOTE: totalTime should NEVER be updated - it's the user's fixed duration input
    // Only update breakTime and streakCount for analytics
    await prisma.streak.update({
      where: { id: streakId },
      data: {
        // ❌ DO NOT UPDATE totalTime - it must stay as the user's original input (e.g., 120 minutes)
        breakTime: streak.breakTime + totalBreakTime,
        streakCount: completedCount, // Set to count of history entries
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      historyId: history.id,
      focusDuration: focusSeconds,
      totalBreakTime,
      breakRepetitionsUsed,
      streakCount: completedCount,
      sessionData: history,
    });
  } catch (error) {
    console.error("Complete session error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
