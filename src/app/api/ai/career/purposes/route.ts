import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

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
 * /api/ai/career/purposes:
 *   get:
 *     tags:
 *       - AI Career Coach
 *     summary: Get available career purposes
 *     description: Retrieve list of available career purposes for analysis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Career purposes retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       401:
 *         description: Unauthorized
 */

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Return purposes as strings only
    const purposes = ["Lomba", "Pekerjaan", "Kursus"];

    return NextResponse.json(purposes, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Get purposes error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
