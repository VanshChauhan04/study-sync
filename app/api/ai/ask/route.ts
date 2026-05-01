import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { getAiDbUser, getAuthedDbUser } from "@/lib/auth";

function fallbackAnswer(question: string, subject: string) {
  const q = question.trim();
  if (!q) {
    return `Ask a specific question about ${subject} and I will help.`;
  }

  return `For ${subject}, start by defining the state/goal, work a tiny example, then generalize the rule. Question: ${q}`;
}

function normalizeGeminiModel(model: string | undefined) {
  return (model || "gemini-2.5-flash")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^models\//, "");
}

async function generateGeminiAnswer(apiKey: string, modelName: string, prompt: string) {
  const modelCandidates = Array.from(
    new Set([modelName, "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"])
  );

  for (const model of modelCandidates) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
      }
    );

    if (res.ok) {
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim() ?? "";
    }

    if (res.status !== 404) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Gemini request failed with ${res.status}: ${errorText}`);
    }
  }

  throw new Error("No configured Gemini model was found.");
}

export async function POST(req: Request) {
  const user = await getAuthedDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as
    | { groupId?: string; question?: string }
    | null;

  const groupId = body?.groupId?.trim();
  const question = body?.question?.trim();

  if (!groupId || !question) {
    return NextResponse.json(
      { error: "Invalid body. Expected { groupId, question }." },
      { status: 400 }
    );
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_groupId: { userId: user.id, groupId } }
  });
  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  const aiUser = await getAiDbUser();

  let answer = "";
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  try {
    if (geminiKey) {
      const modelName = normalizeGeminiModel(process.env.GEMINI_MODEL);
      const prompt = [
        "You are StudySync AI. Keep answers concise, practical, and aligned to the group subject.",
        `Subject: ${group.subject}`,
        `Group: ${group.name}`,
        `Question: ${question}`
      ].join("\n");

      answer = (await generateGeminiAnswer(geminiKey, modelName, prompt)) || fallbackAnswer(question, group.subject);
    } else if (openaiKey) {
      const client = new OpenAI({ apiKey: openaiKey });
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are StudySync AI. Keep answers concise, practical, and aligned to the group subject."
          },
          {
            role: "user",
            content: `Subject: ${group.subject}\nGroup: ${group.name}\nQuestion: ${question}`
          }
        ],
        temperature: 0.4
      });

      answer =
        completion.choices[0]?.message?.content?.trim() ||
        fallbackAnswer(question, group.subject);
    } else {
      answer = fallbackAnswer(question, group.subject);
    }
  } catch (error) {
    console.error("AI provider failed", error);
    answer = fallbackAnswer(question, group.subject);
  }

  const created = await prisma.message.create({
    data: {
      content: answer,
      userId: aiUser.id,
      groupId
    }
  });

  return NextResponse.json({
    message: {
      id: created.id,
      content: created.content,
      groupId: created.groupId,
      createdAt: created.createdAt.toISOString(),
      sender: "StudySync AI",
      role: "ai"
    }
  });
}
