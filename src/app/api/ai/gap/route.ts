import { NextResponse } from "next/server";
import { analyzeGapAndFit } from "@/infrastructure/ai/gemini";

export async function POST(req: Request) {
  try {
    const { candidateSkills, shiftTitle, requiredSkills } = await req.json();
    const result = await analyzeGapAndFit(
      candidateSkills || [],
      shiftTitle || "Ca làm việc",
      requiredSkills || []
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Gap Error:", error);
    return NextResponse.json(
      { error: "Lỗi phân tích Gap Analysis." },
      { status: 500 }
    );
  }
}
