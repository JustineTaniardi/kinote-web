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
 * /api/ai/career/analyze:
 *   post:
 *     tags:
 *       - AI Career Coach
 *     summary: Analyze streaks for career path
 *     description: Generate AI-powered career path recommendation based on selected streaks and purpose using GPT
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - streakIds
 *               - purpose
 *             properties:
 *               streakIds:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Array of streak IDs to analyze
 *                 example: [1, 2, 3]
 *               purpose:
 *                 type: string
 *                 enum: ["Lomba", "Pekerjaan", "Kursus"]
 *                 description: Career purpose
 *                 example: "Pekerjaan"
 *     responses:
 *       201:
 *         description: Analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     personality_tendencies:
 *                       type: string
 *                     strengths:
 *                       type: array
 *                       items:
 *                         type: string
 *                     weaknesses:
 *                       type: array
 *                       items:
 *                         type: string
 *                     recommended_careers:
 *                       type: array
 *                       items:
 *                         type: string
 *                     roadmap:
 *                       type: array
 *                       items:
 *                         type: string
 *                     recommended_learning:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid request or missing OpenAI key
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

export async function POST(req: Request) {
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

    const body = await req.json();
    const { streakIds, purpose } = body;

    if (!streakIds || !Array.isArray(streakIds) || streakIds.length === 0) {
      return NextResponse.json(
        { message: "streakIds array is required" },
        { status: 400 }
      );
    }

    if (!purpose || !["Lomba", "Pekerjaan", "Kursus"].includes(purpose)) {
      return NextResponse.json(
        { message: "purpose must be one of: Lomba, Pekerjaan, Kursus" },
        { status: 400 }
      );
    }

    // Fetch streaks and histories
    const streaks = await prisma.streak.findMany({
      where: {
        id: { in: streakIds },
        userId, // Ensure user owns all streaks
      },
      include: {
        histories: {
          select: {
            duration: true,
            createdAt: true,
          },
        },
        category: true,
        subCategory: true,
      },
    });

    if (streaks.length === 0) {
      return NextResponse.json(
        { message: "No valid streaks found" },
        { status: 400 }
      );
    }

    // Fetch user's tasks/checklist
    const tasks = await prisma.task.findMany({
      where: {
        userId,
      },
      include: {
        status: {
          select: {
            name: true,
          },
        },
        difficulty: {
          select: {
            name: true,
          },
        },
      },
      take: 20, // Get last 20 tasks
      orderBy: {
        createdAt: "desc",
      },
    });

    // Build source data
    const sourceData = {
      streakCount: streaks.length,
      totalSessions: streaks.reduce((sum, s) => sum + s.histories.length, 0),
      totalDuration: streaks.reduce(
        (sum, s) => sum + s.histories.reduce((sSum, h) => sSum + (h.duration || 0), 0),
        0
      ),
      streaks: streaks.map((s) => ({
        title: s.title,
        category: s.category?.name,
        subCategory: s.subCategory?.name,
        sessions: s.histories.length,
      })),
      checklist: {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status.name === "completed").length,
        pendingTasks: tasks.filter((t) => t.status.name !== "completed").length,
        tasks: tasks.map((t) => ({
          title: t.title,
          priority: t.priority,
          status: t.status.name,
          difficulty: t.difficulty.name,
          description: t.description,
        })),
      },
    };

    // Build prompt for OpenAI
    const purposeMap: { [key: string]: string } = {
      "Lomba": "competition opportunities",
      "Pekerjaan": "career paths and job opportunities",
      "Kursus": "courses and learning programs"
    };

    const purposeDescription = purposeMap[purpose] || purpose;
    
    const streakTitles = sourceData.streaks.map((s: any) => s.title).join(", ");
    const streakCategories = sourceData.streaks.map((s: any) => s.category).filter(Boolean).join(", ");

    const promptString = `BERIKAN ANALISIS LENGKAP DALAM FORMAT JSON YANG BENAR.

Streaks yang dianalisis: ${streakTitles}
Purpose: ${purpose}
Data: ${JSON.stringify(sourceData)}

JAWAB DENGAN JSON BERIKUT (JANGAN KECIL FIELD APAPUN):
- personality_tendencies: Deskripsi kepribadian
- strengths: Array 4 kekuatan/keahlian
- weaknesses: Array 3 kelemahan
- recommended_${purpose.toLowerCase()}: Array rekomendasi dengan 5+ links per item (format: "Judul - url1 / url2 / url3 / url4 / url5")
- roadmap: Array 4 langkah
- recommended_learning: Array 3+ materi pembelajaran dengan links

CONTOH LINK: "Belajar React - https://dicoding.com / https://sanbercode.com / https://buildwithangga.com / https://udemy.com / https://coursera.org"

OUTPUT HANYA JSON VALID, TIDAK ADA TEKS LAIN.`;

    const systemPrompt = `Anda adalah AI Career Coach Indonesia. INSTRUKSI WAJIB - OUTPUT HARUS JSON LENGKAP:

{
  "personality_tendencies": "string deskripsi kepribadian",
  "strengths": ["kekuatan 1", "kekuatan 2", "kekuatan 3", "kekuatan 4"],
  "weaknesses": ["kelemahan 1", "kelemahan 2", "kelemahan 3"],
  "recommended_pekerjaan": ["rekomendasi 1 - https://linkedin.com / https://jobdb.com / https://glints.com / https://bekerja.com / https://indeed.com", "rekomendasi 2 - link 5 platform"],
  "recommended_lomba": ["kompetisi 1 - https://kompetisi.com / https://hackfest.id / https://codeforces.com / https://kaggle.com / https://ictday.id", "kompetisi 2 - link 5 platform"],
  "recommended_kursus": ["kursus 1 - https://dicoding.com / https://sanbercode.com / https://buildwithangga.com / https://coursera.org / https://udemy.com", "kursus 2 - link 5 platform"],
  "roadmap": ["langkah 1", "langkah 2", "langkah 3", "langkah 4"],
  "recommended_learning": ["materi 1 - https://platform1.com / https://platform2.com / https://platform3.com / https://platform4.com / https://platform5.com", "materi 2 - link 5 platform"]
}

PENTING: Ganti "recommended_pekerjaan/recommended_lomba/recommended_kursus" sesuai PURPOSE, tapi SELALU include recommended_learning. Setiap recommendation WAJIB include 5+ LINKS dengan format " / " (spasi-slash-spasi). RETURN HANYA JSON, TIDAK ADA TEKS LAIN.`;

    // Call OpenAI
    const client = new OpenAI({ apiKey: OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: promptString,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
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

    // Save analysis to database
    const analysis = await prisma.aiAnalysis.create({
      data: {
        userId,
        purpose,
        sourceData: sourceData as any,
        promptUsed: promptString,
        result: parsed as any,
      },
    });

    return NextResponse.json(
      {
        success: true,
        analysis: parsed,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Analyze career error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

