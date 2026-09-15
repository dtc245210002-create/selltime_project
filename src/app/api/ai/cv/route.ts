import { NextResponse } from "next/server";
import { parseAndImproveCv } from "@/infrastructure/ai/gemini";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp nội dung CV hoặc thông tin kinh nghiệm." },
        { status: 400 }
      );
    }
    const result = await parseAndImproveCv(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API CV Error:", error);
    return NextResponse.json(
      { error: "Không thể phân tích CV qua AI lúc này." },
      { status: 500 }
    );
  }
}
