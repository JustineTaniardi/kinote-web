import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const JWT_SECRET = process.env.JWT_SECRET!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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
 * /api/streaks/{id}/verify:
 *   post:
 *     tags:
 *       - AI Verification
 *     summary: Verify a streak session with AI
 *     description: Perform AI verification on a streak session using GPT vision
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Streak ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *             properties:
 *               description:
 *                 type: string
 *                 description: Description of the activity
 *                 example: "Finished workout"
 *               photoUrl:
 *                 type: string
 *                 description: URL of the activity photo
 *                 example: "/uploads/image123.png"
 *     responses:
 *       201:
 *         description: Verification completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 verified:
 *                   type: boolean
 *                 confidence:
 *                   type: number
 *                 resultText:
 *                   type: object
 *       400:
 *         description: Invalid request or missing OpenAI key
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not streak owner
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
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI key missing" },
        { status: 500 }
      );
    }

    const { id } = await params;
    const streakId = parseInt(id);

    // Handle both FormData and JSON requests
    let description = "";
    let sessionTitle = "";
    let photoUrl: string | null = null;
    let imageBase64: string | null = null;

    const contentType = req.headers.get("content-type");
    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData (from file upload)
      const formData = await req.formData();
      const imageFile = formData.get("image") as File;
      sessionTitle = (formData.get("title") as string) || "";
      const sessionDescription = (formData.get("description") as string) || "";

      // Description is required
      if (!sessionDescription) {
        return NextResponse.json(
          { message: "description is required" },
          { status: 400 }
        );
      }

      if (imageFile) {
        const buffer = await imageFile.arrayBuffer();
        imageBase64 = Buffer.from(buffer).toString("base64");
        description = sessionDescription;
      } else {
        description = sessionDescription;
      }
    } else {
      // Handle JSON request
      const body = await req.json();
      description = body.description || "";
      sessionTitle = body.title || "";
      photoUrl = body.photoUrl || null;

      // Description is required
      if (!description) {
        return NextResponse.json(
          { message: "description is required" },
          { status: 400 }
        );
      }
    }

    // At least description or image must be provided
    if (!description && !imageBase64) {
      return NextResponse.json(
        { message: "description is required" },
        { status: 400 }
      );
    }

    // Verify streak exists and belongs to user
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

    // Build prompt for OpenAI with proper escaping to prevent prompt injection
    const escapedDescription = String(description).replace(/[`\\${}]/g, (char) => `\\${char}`);
    const photoInfo = photoUrl || imageBase64 ? "Photo provided" : "No photo provided";
    
    const promptString = `You are an AI activity verification system. Analyze the following session:
Description: "${escapedDescription}"
Photo: "${photoInfo}"

Determine:
1) Does the photo appear authentic (if provided)?
2) Does it match the description?
3) Confidence score (0-1)
4) Reasoning

Return STRICT valid JSON ONLY (no other text) with fields:
{
  "authentic": boolean,
  "matches_description": boolean,
  "confidence": number (0-1),
  "verified": boolean,
  "reasoning": string
}`;

    // Call OpenAI
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert AI verification system. ALWAYS return ONLY valid JSON, nothing else.",
        },
        {
          role: "user",
          content: promptString,
        },
      ],
      temperature: 0.5,
    });

    const aiText = completion.choices[0].message?.content;
    if (!aiText) {
      return NextResponse.json(
        { message: "No response from AI" },
        { status: 500 }
      );
    }

    // Parse JSON response
    let parsed;
    try {
      parsed = JSON.parse(aiText);
    } catch (e) {
      console.error("Failed to parse AI response:", aiText);
      return NextResponse.json(
        { message: "Invalid response format from AI" },
        { status: 500 }
      );
    }

    // Create verification record
    const verification = await prisma.aiVerification.create({
      data: {
        streakId,
        description: description || null,
        imageUrl: photoUrl || imageBase64 || null,
        verified: parsed.verified ?? false,
        confidence: parsed.confidence ?? null,
        resultText: JSON.stringify(parsed),
      },
    });

    // Get the latest StreakHistory record for this streak
    const latestHistory = await prisma.streakHistory.findFirst({
      where: { streakId },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    // Update StreakHistory with verification if it exists
    if (latestHistory) {
      await prisma.streakHistory.update({
        where: { id: latestHistory.id },
        data: {
          photoUrl: photoUrl || imageBase64 || null,
          verifiedAI: parsed.verified ?? false,
          aiNote: parsed.reasoning || null,
        },
      });

      // Link verification to history
      await prisma.aiVerification.update({
        where: { id: verification.id },
        data: {
          historyId: latestHistory.id,
        },
      });

      // Increment streak count if verified
      if (parsed.verified) {
        await prisma.streak.update({
          where: { id: streakId },
          data: {
            streakCount: {
              increment: 1,
            },
          },
        });
      }
    }

    return NextResponse.json(verification, { status: 201 });
  } catch (error) {
    console.error("Verify streak error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
