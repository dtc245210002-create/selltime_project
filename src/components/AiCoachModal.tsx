"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Bot,
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  FileText,
  CheckCircle2,
  AlertCircle,
  Award,
  Loader2,
  Languages,
  RotateCcw,
} from "lucide-react";

interface AiCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateSkills: string[];
  onUpdateSkills?: (newSkills: string[]) => void;
}

interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  placeholder: string;
  greeting: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: "vi-VN",
    name: "Tiếng Việt",
    flag: "🇻🇳",
    placeholder: "Gõ câu trả lời theo chuẩn STAR hoặc bấm Micro để nói...",
    greeting:
      "Chào em! Chị là Lan - Chủ quán The Cuppa Coffee Thái Nguyên. Chị sẽ hỏi nhanh em 3 câu hỏi tình huống theo chuẩn STAR để đánh giá sự phù hợp với ca làm việc tối nay nhé!\n\n👉 Câu 1: Vào giờ cao điểm 20h tối, nếu quán rất đông khách mà có một vị khách phàn nàn vì phải đợi nước hơn 15 phút, em sẽ xử lý tình huống đó thế nào?",
  },
  {
    code: "en-US",
    name: "English",
    flag: "🇬🇧",
    placeholder: "Type your answer or click the Microphone to speak...",
    greeting:
      "Hello! I'm Lan, the owner of The Cuppa Coffee. I will ask you 3 quick STAR situational questions to assess your fit for tonight's shift!\n\n👉 Question 1: During the 8 PM peak rush, if the cafe is packed and an impatient customer complains angrily about waiting 15 minutes for their drink, how would you handle the situation?",
  },
  {
    code: "zh-CN",
    name: "中文 (Tiếng Trung)",
    flag: "🇨🇳",
    placeholder: "输入您的回答或点击麦克风说出答案...",
    greeting:
      "你好！我是The Cuppa Coffee的负责人阿兰。我将向你提出3个简短的STAR情景面试问题，评估你是否适合今晚的兼职班次！\n\n👉 第1题：晚上8点客流高峰期，如果咖啡厅非常拥挤，一位顾客因等待了15分钟还没拿到饮品而情绪激动地抱怨，你会如何应对和处理？",
  },
  {
    code: "ja-JP",
    name: "日本語 (Tiếng Nhật)",
    flag: "🇯🇵",
    placeholder: "回答を入力するか、マイクをクリックして話してください...",
    greeting:
      "こんにちは！The Cuppa Coffeeのオーナーのランです。今夜のシフトの適性を確認するため、STAR形式で3つのシチュエーション質問をします！\n\n👉 質問1：夜8時のピーク時に店内が非常に混雑しており、お客様が「15分待ってもドリンクが来ない」と不満を言われた場合、どのように対応しますか？",
  },
  {
    code: "ko-KR",
    name: "한국어 (Tiếng Hàn)",
    flag: "🇰🇷",
    placeholder: "답변을 입력하거나 마이크를 눌러 음성으로 말씀하세요...",
    greeting:
      "안녕하세요! The Cuppa Coffee 점주 란입니다. 오늘 저녁 파트타임 근무 적합성을 확인하기 위해 STAR 방식의 질문 3가지를 드리겠습니다!\n\n👉 질문 1: 저녁 8시 피크 시간대에 매장이 매우 혼잡한 상황에서, 음료가 15분 이상 늦어져 손님이 화를 내며 항의할 때 어떻게 대처하시겠습니까?",
  },
];

export function AiCoachModal({
  isOpen,
  onClose,
  candidateSkills,
  onUpdateSkills,
}: AiCoachModalProps) {
  const [activeTab, setActiveTab] = useState<"interview" | "cv">("interview");

  // Ngôn ngữ phỏng vấn đã chọn (Mặc định Tiếng Việt)
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(LANGUAGES[0]);

  // Messages Chat phỏng vấn
  const [messages, setMessages] = useState<{ role: "user" | "model"; text: string }[]>([
    { role: "model", text: LANGUAGES[0].greeting },
  ]);

  const [userInput, setUserInput] = useState("");
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Danh sách voice của hệ thống
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // CV Builder state
  const [cvInputText, setCvInputText] = useState(
    "Em là sinh viên năm 3 ĐH Kỹ thuật Công nghiệp (TNUT), từng có kinh nghiệm bưng bê ở quán ốc 2 tháng và phụ việc bán hàng quần áo. Em nói chuyện vui vẻ, nhiệt tình, không ngại dọn dẹp, muốn tìm ca tối kiếm tiền đóng học phí."
  );
  const [isAnalyzingCv, setIsAnalyzingCv] = useState(false);
  const [cvResult, setCvResult] = useState<any>(null);

  // Load danh sách giọng đọc từ trình duyệt
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Khi người dùng đổi ngôn ngữ phỏng vấn
  const handleLanguageChange = (lang: LanguageOption) => {
    setSelectedLang(lang);
    setMessages([{ role: "model", text: lang.greeting }]);
    setUserInput("");
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!isOpen) return null;

  // ==========================================
  // HỆ THỐNG PHÁT ÂM THANH NÂNG CAO (TTS)
  // ==========================================
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel(); // Dừng câu đang đọc cũ

    // Lọc lấy đoạn văn bản cần đọc (loại bỏ các ký tự icon và markdown)
    const cleanText = text
      .replace(/👉/g, "")
      .replace(/\*\*/g, "")
      .replace(/#+/g, "")
      .slice(0, 300);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = selectedLang.code;
    utterance.rate = 0.95; // Tốc độ vừa phải để phát âm rõ chữ
    utterance.pitch = 1.05; // Giọng nữ nhẹ nhàng truyền cảm

    // Tìm giọng đọc bản địa chuẩn nhất cho ngôn ngữ đã chọn
    const langPrefix = selectedLang.code.split("-")[0];
    const bestVoice =
      availableVoices.find(
        (v) =>
          v.lang.toLowerCase() === selectedLang.code.toLowerCase() ||
          v.lang.toLowerCase().startsWith(langPrefix)
      ) ||
      availableVoices.find((v) =>
        v.name.toLowerCase().includes(selectedLang.name.toLowerCase())
      );

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // ==========================================
  // NHẬN DIỆN GIỌNG NÓI MICRO (STT)
  // ==========================================
  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Trình duyệt chưa hỗ trợ nhận diện giọng nói. Vui lòng dùng Chrome hoặc Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang.code; // Nhận diện theo đúng ngôn ngữ đã chọn
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserInput((prev) => (prev ? prev + " " + transcript : transcript));
    };

    recognition.start();
  };

  // ==========================================
  // GỬI TIN NHẮN TỚI GEMINI AI
  // ==========================================
  const handleSendInterview = async () => {
    if (!userInput.trim() || isAiReplying) return;

    const newHistory = [...messages, { role: "user" as const, text: userInput }];
    setMessages(newHistory);
    setUserInput("");
    setIsAiReplying(true);

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: newHistory,
          jobTitle: "Phục vụ Cafe The Cuppa",
          language: selectedLang.code,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "model" as const, text: data.reply }]);
        speakText(data.reply);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiReplying(false);
    }
  };

  // ==========================================
  // PHÂN TÍCH CV
  // ==========================================
  const handleAnalyzeCv = async () => {
    if (!cvInputText.trim() || isAnalyzingCv) return;
    setIsAnalyzingCv(true);

    try {
      const res = await fetch("/api/ai/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cvInputText }),
      });
      const data = await res.json();
      setCvResult(data);
      if (onUpdateSkills && data.extracted_skills) {
        onUpdateSkills(data.extracted_skills);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingCv(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 font-sans">
      <div className="bg-white w-full max-w-2xl h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-slate-100">
        {/* Nút đóng */}
        <button
          onClick={() => {
            stopSpeaking();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 z-10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-indigo-950 text-white p-4 sm:p-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-purple-300">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  Sell Time AI Voice & Interview
                </h2>
                <span className="text-[10px] bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full font-bold border border-purple-400/30">
                  Gemini 3.6 Flash
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Luyện phỏng vấn đa ngôn ngữ theo chuẩn STAR & Bóc tách CV thông minh
              </p>
            </div>
          </div>

          {/* Sub Tabs */}
          <div className="flex bg-black/25 p-1 rounded-xl mt-4 max-w-md">
            <button
              onClick={() => setActiveTab("interview")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "interview"
                  ? "bg-white text-indigo-950 shadow-sm"
                  : "text-indigo-200 hover:text-white"
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-purple-600" />
              <span>Phỏng Vấn Đa Ngôn Ngữ</span>
            </button>
            <button
              onClick={() => setActiveTab("cv")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "cv"
                  ? "bg-white text-indigo-950 shadow-sm"
                  : "text-indigo-200 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bóc Tách & Tối Ưu CV</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          {/* ======================================================== */}
          {/* TAB 1: PHỎNG VẤN STAR ĐA NGÔN NGỮ                        */}
          {/* ======================================================== */}
          {activeTab === "interview" && (
            <div className="flex flex-col h-full space-y-3">
              {/* THANH CHỌN NGÔN NGỮ PHỎNG VẤN */}
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Languages className="w-4 h-4 text-indigo-600" />
                  <span>Chọn ngôn ngữ phỏng vấn:</span>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
                        selectedLang.code === lang.code
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-xs scale-[1.02]"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Băng thông tin trạng thái */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-purple-950">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-700" />
                  <span className="font-semibold">
                    Người phỏng vấn: Chị Lan AI ({selectedLang.name})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isSpeaking && (
                    <button
                      onClick={stopSpeaking}
                      className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 hover:bg-rose-200"
                    >
                      <VolumeX className="w-3 h-3" /> Dừng đọc
                    </button>
                  )}
                  <button
                    onClick={() => handleLanguageChange(selectedLang)}
                    className="text-[10px] text-slate-500 hover:text-indigo-600 flex items-center gap-0.5"
                    title="Bắt đầu lại buổi phỏng vấn"
                  >
                    <RotateCcw className="w-3 h-3" /> Bắt đầu lại
                  </button>
                </div>
              </div>

              {/* Khu vực Chat Transcript */}
              <div className="flex-1 overflow-y-auto space-y-3 p-1">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      m.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3.5 text-xs whitespace-pre-wrap leading-relaxed ${
                        m.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-sm"
                          : "bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                    {m.role === "model" && (
                      <button
                        onClick={() => speakText(m.text)}
                        className="text-[10px] text-purple-600 hover:text-purple-800 flex items-center gap-1 mt-1 px-1 font-semibold transition-colors"
                      >
                        <Volume2 className="w-3 h-3" /> Nghe AI phát âm
                      </button>
                    )}
                  </div>
                ))}

                {isAiReplying && (
                  <div className="flex items-center gap-2 text-xs text-purple-600 p-2 bg-purple-50 rounded-xl w-fit">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Gemini 3.6 Flash đang phân tích câu trả lời...</span>
                  </div>
                )}
              </div>

              {/* Hộp nhập liệu & Micro */}
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 flex items-center gap-2 shrink-0 shadow-sm">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isListening
                      ? "bg-rose-600 text-white border-rose-600 animate-pulse shadow-md"
                      : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                  }`}
                  title={
                    isListening
                      ? `Đang lắng nghe tiếng ${selectedLang.name}...`
                      : `Bấm Micro để nói bằng ${selectedLang.name}`
                  }
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </button>

                <input
                  type="text"
                  placeholder={
                    isListening
                      ? `Đang nghe tiếng ${selectedLang.name}...`
                      : selectedLang.placeholder
                  }
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendInterview()}
                  className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <button
                  onClick={handleSendInterview}
                  disabled={!userInput.trim() || isAiReplying}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: AI BÓC TÁCH & TỐI ƯU CV                           */}
          {/* ======================================================== */}
          {activeTab === "cv" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <label className="text-xs font-bold text-slate-800 block">
                  Dán nội dung giới thiệu bản thân / CV sinh viên vào đây:
                </label>
                <textarea
                  rows={4}
                  value={cvInputText}
                  onChange={(e) => setCvInputText(e.target.value)}
                  placeholder="Ví dụ: Em học trường gì, từng làm công việc gì, tính cách và mong muốn..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  onClick={handleAnalyzeCv}
                  disabled={isAnalyzingCv}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isAnalyzingCv ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini đang đọc và trích xuất kỹ năng...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Bóc Tách Kỹ Năng & Tối Ưu CV 1-Chạm</span>
                    </>
                  )}
                </button>
              </div>

              {/* Kết quả sau khi AI phân tích */}
              {cvResult && (
                <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-500" />
                      Điểm Đánh Giá CV:
                    </span>
                    <span className="text-base font-black text-indigo-600">
                      {cvResult.cv_score}/100
                    </span>
                  </div>

                  {/* Kỹ năng được AI bóc tách */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1">
                      Kỹ năng trích xuất được (Tự động nạp vào hồ sơ):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cvResult.extracted_skills?.map(
                        (skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Đoạn giới thiệu được AI viết lại chuyên nghiệp */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block mb-1">
                      Tóm tắt giới thiệu ấn tượng (AI Polished):
                    </span>
                    <p className="italic">&ldquo;{cvResult.professional_summary}&rdquo;</p>
                  </div>

                  {/* Lời khuyên nâng cấp CV */}
                  {cvResult.improvement_tips && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                      <span className="font-bold block flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Gợi ý cải thiện để tăng cơ hội trúng tuyển:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {cvResult.improvement_tips.map(
                          (tip: string, idx: number) => (
                            <li key={idx}>{tip}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
