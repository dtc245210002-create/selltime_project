import { NextResponse } from "next/server";
import { conductInterviewStep } from "@/infrastructure/ai/gemini";

export async function POST(req: Request) {
  try {
    const { history, jobTitle, language } = await req.json();
    const result = await conductInterviewStep(
      history || [],
      jobTitle || "Phục vụ ca tối Cafe The Cuppa",
      language || "vi-VN"
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Interview Error:", error);
    return NextResponse.json(
      { error: "Lỗi phản hồi phỏng vấn AI." },
      { status: 500 }
    );
  }
}
