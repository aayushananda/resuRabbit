import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ message: "Invalid query" }, { status: 400 });
    }

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: query }],
      model: "llama3-8b-8192",
    });

    const content = response.choices[0]?.message?.content || "No response.";
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Groq API Error:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}