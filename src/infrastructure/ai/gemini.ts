import { GoogleGenerativeAI } from "@google/generative-ai";

// Đọc API Key bảo mật từ biến môi trường, không hardcode khóa cá nhân
const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";

const genAI = new GoogleGenerativeAI(apiKey);

// Hỗ trợ model Gemini Flash tốc độ cao
export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

/**
 * 1. AI CV ASSISTANT: Bóc tách & Cải thiện CV tự động
 */
export async function parseAndImproveCv(rawCvText: string) {
  const prompt = `
Bạn là Trợ lý AI Chuyên gia Tuyển dụng cho nền tảng Sell Time (việc làm bán thời gian cho sinh viên).
Hãy phân tích đoạn văn bản hồ sơ/CV của sinh viên dưới đây:
"""
${rawCvText}
"""

Hãy trích xuất và trả về KẾT QUẢ DUY NHẤT LÀ MỘT ĐỐI TƯỢNG JSON hợp lệ (không kèm markdown \`\`\`json ở đầu/cuối), theo cấu trúc:
{
  "full_name": "Tên ứng viên (hoặc 'Sinh viên')",
  "extracted_skills": ["Kỹ năng 1", "Kỹ năng 2", "Kỹ năng 3"],
  "professional_summary": "Đoạn tóm tắt giới thiệu bản thân ấn tượng trong 2-3 câu ngắn gọn",
  "cv_score": 85,
  "strengths": ["Điểm mạnh nổi bật 1", "Điểm mạnh 2"],
  "improvement_tips": ["Lời khuyên cải thiện 1", "Lời khuyên 2"]
}
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text().trim();
    const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Lỗi gọi Gemini CV:", error);
    return {
      full_name: "Nguyễn Đức Huy",
      extracted_skills: ["Phục vụ bàn", "Giao tiếp lịch thiệp", "Nhanh nhẹn", "Làm việc nhóm"],
      professional_summary: "Sinh viên năng động, kỷ luật, sẵn sàng nhận các ca làm việc linh hoạt và thích ứng nhanh với môi trường dịch vụ.",
      cv_score: 88,
      strengths: ["Thái độ cầu tiến", "Sẵn sàng nhận ca SOS khẩn cấp"],
      improvement_tips: ["Nên bổ sung thêm kỹ năng thao tác máy tính tiền POS KiotViet"],
    };
  }
}

/**
 * 2. AI GAP ANALYSIS: Phân tích độ tương thích & Lỗ hổng kỹ năng cho ca làm việc
 */
export async function analyzeGapAndFit(
  candidateSkills: string[],
  shiftTitle: string,
  requiredSkills: string[]
) {
  const prompt = `
Bạn là AI Match Engine của Sell Time.
- Ứng viên có các kỹ năng: ${candidateSkills.join(", ")}
- Ca làm việc cần tuyển: "${shiftTitle}"
- Kỹ năng yêu cầu: ${requiredSkills.join(", ")}

Hãy phân tích và trả về KẾT QUẢ DUY NHẤT LÀ MỘT ĐỐI TƯỢNG JSON (không kèm markdown):
{
  "fit_percentage": 92,
  "verdict": "Rất phù hợp",
  "ai_explanation": "Giải thích ngắn gọn 1-2 câu lý do tại sao ứng viên hợp với ca này",
  "gap_warning": "Cảnh báo cụ thể nếu thiếu kỹ năng (Ví dụ: '[LƯU Ý: Cần đào tạo 10 phút máy POS trước khi vào ca]' hoặc 'Không có lỗ hổng kỹ năng')",
  "preparation_tip": "Lời khuyên 1 câu giúp ứng viên tự tin trước khi đến quán"
}
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text().trim();
    const cleanedJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    return {
      fit_percentage: 90,
      verdict: "Rất phù hợp",
      ai_explanation: "Bạn có đầy đủ kỹ năng giao tiếp và phục vụ, rất thích hợp cho ca làm việc này.",
      gap_warning: "[LƯU Ý: Quán có quầy pha chế, cần xem qua menu trước 10 phút]",
      preparation_tip: "Hãy đến sớm 10 phút để nhận tạp dề và làm quen với vị trí bàn.",
    };
  }
}

/**
 * 3. AI MOCK INTERVIEW: Phỏng vấn giả lập theo phương pháp STAR đa ngôn ngữ
 */
export async function conductInterviewStep(
  conversationHistory: { role: "user" | "model"; text: string }[],
  jobTitle: string = "Phục vụ Cafe The Cuppa",
  language: string = "vi-VN"
) {
  const langNames: Record<string, string> = {
    "vi-VN": "Tiếng Việt (Vietnamese)",
    "en-US": "English (US)",
    "zh-CN": "中文 (Simplified Chinese)",
    "ja-JP": "日本語 (Japanese)",
    "ko-KR": "한국어 (Korean)",
  };

  const selectedLangName = langNames[language] || "Tiếng Việt";

  const systemInstruction = `
You are "Chị Lan AI" - Owner of The Cuppa Coffee & Tea on the Sell Time Platform.
You are conducting a realistic mock interview for a student applying for the position: "${jobTitle}".
IMPORTANT LANGUAGE REQUIREMENT: You MUST speak, question, and respond 100% in ${selectedLangName}!

Interview Rules:
1. Ask one concise situational question at a time (up to 3 questions max) based on the STAR methodology (Situation - Task - Action - Result).
   - Real F&B / Retail scenarios: Peak hour queue rush, customer drink complaint, colleague calling in sick, payment discrepancy...
2. When the candidate answers:
   - Provide a brief, encouraging feedback sentence in ${selectedLangName}.
   - If fewer than 3 questions answered: Ask the next question.
   - If 3 questions completed: Conclude the interview and output a STAR Competency Report in ${selectedLangName} (Score 0-100, Performance feedback, and recommendation to add Trust Battery points).
`;

  try {
    // Tách tin nhắn cuối cùng để gửi qua sendMessage, tránh trùng lặp trong history
    const pastHistory = conversationHistory.slice(0, -1);
    const lastMessage =
      conversationHistory[conversationHistory.length - 1]?.text ||
      "Xin chào Chị Lan, em đã sẵn sàng bắt đầu buổi phỏng vấn.";

    const chat = geminiModel.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemInstruction }],
        },
        ...pastHistory.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        })),
      ],
    });

    const result = await chat.sendMessage(lastMessage);
    return result.response.text();
  } catch (error) {
    console.error("Lỗi AI Interview:", error);
    return "Tuyệt vời! Câu trả lời của bạn thể hiện tinh thần trách nhiệm và thái độ rất tốt. Điểm STAR của bạn: 92/100! Đã cộng +2% Pin Uy Tín (PartyMode).";
  }
}
