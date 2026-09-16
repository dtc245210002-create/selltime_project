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
  Keyboard,
  Check,
  Copy,
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
      "안녕하세요! The Cuppa Coffee 점주 란입니다. 오늘 저녁 파트타임 근무 적합성을 확인하기 위해 STAR 방식 của 질문 3가지를 드리겠습니다!\n\n👉 질문 1: 저녁 8시 피크 시간대에 매장이 매우 혼잡한 상황에서, 음료가 15분 이상 늦어져 손님이 화를 내며 항의할 때 어떻게 대처하시겠습니까?",
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

  // Chế độ nhập liệu: Giọng nói (voice) hoặc Gõ phím (text chat fallback)
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [hasSpeechSupport, setHasSpeechSupport] = useState<boolean>(true);

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
  const [appliedSkillsSuccess, setAppliedSkillsSuccess] = useState(false);
  const [copiedSummarySuccess, setCopiedSummarySuccess] = useState(false);

  const handleApplySkills = () => {
    if (cvResult?.extracted_skills && onUpdateSkills) {
      onUpdateSkills(cvResult.extracted_skills);
      setAppliedSkillsSuccess(true);
      setTimeout(() => setAppliedSkillsSuccess(false), 2500);
    }
  };

  const handleCopySummary = () => {
    if (cvResult?.professional_summary) {
      navigator.clipboard.writeText(cvResult.professional_summary);
      setCopiedSummarySuccess(true);
      setTimeout(() => setCopiedSummarySuccess(false), 2500);
    }
  };

  // Kiểm tra hỗ trợ Web Speech API và load voices
  useEffect(() => {
    if (typeof window !== "undefined") {
      const speechAvailable =
        "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
      setHasSpeechSupport(speechAvailable);
      if (!speechAvailable) {
        setInputMode("text"); // Tự động fallback sang gõ text trên Safari iOS / thiết bị không hỗ trợ
      }

      if ("speechSynthesis" in window) {
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          setAvailableVoices(voices);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
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

  // Phát âm thanh TTS
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/👉/g, "")
      .replace(/\*\*/g, "")
      .replace(/#+/g, "")
      .slice(0, 300);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = selectedLang.code;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

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

  // Nhận diện giọng nói STT
  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setInputMode("text");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang.code;
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

  // Gửi tin nhắn tới Gemini AI
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

  // Phân tích CV
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200 font-sans">
      <div className="bg-slate-900 w-full max-w-2xl h-[88vh] rounded-xl shadow-2xl flex flex-col overflow-hidden relative border border-slate-800">
        {/* Nút đóng */}
        <button
          onClick={() => {
            stopSpeaking();
            onClose();
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white z-10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 sm:p-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Sell Time AI Voice & Interview
                </h2>
                <span className="text-[10px] bg-purple-950/60 text-purple-300 px-2 py-0.5 rounded-md font-semibold border border-purple-800/60">
                  Gemini Flash STAR
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Luyện phỏng vấn đa ngôn ngữ theo chuẩn STAR & Bóc tách CV thông minh
              </p>
            </div>
          </div>

          {/* Sub Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-md mt-4 max-w-md border border-slate-800">
            <button
              onClick={() => setActiveTab("interview")}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === "interview"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-purple-400" />
              <span>Phỏng Vấn STAR</span>
            </button>
            <button
              onClick={() => setActiveTab("cv")}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === "cv"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Bóc Tách & Tối Ưu CV</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
          {/* ======================================================== */}
          {/* TAB 1: PHỎNG VẤN STAR ĐA NGÔN NGỮ                        */}
          {/* ======================================================== */}
          {activeTab === "interview" && (
            <div className="flex flex-col h-full space-y-3">
              {/* THANH CHỌN NGÔN NGỮ PHỎNG VẤN */}
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Languages className="w-4 h-4 text-purple-400" />
                  <span>Ngôn ngữ:</span>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-2 py-0.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 border ${
                        selectedLang.code === lang.code
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Băng thông tin trạng thái & Chuyển đổi Voice vs Gõ phím */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-slate-200">
                    Người phỏng vấn: Chị Lan AI ({selectedLang.name})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Nút chuyển chế độ Gõ phím vs Micro */}
                  <div className="flex bg-slate-900 rounded-md p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setInputMode("voice")}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                        inputMode === "voice"
                          ? "bg-purple-600 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Mic className="w-3 h-3" /> Voice
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("text")}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                        inputMode === "text"
                          ? "bg-purple-600 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Keyboard className="w-3 h-3" /> Gõ phím
                    </button>
                  </div>

                  {isSpeaking && (
                    <button
                      onClick={stopSpeaking}
                      className="text-[10px] bg-rose-950/60 text-rose-400 border border-rose-800/50 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 hover:bg-rose-900/60 transition-colors"
                    >
                      <VolumeX className="w-3 h-3" /> Dừng
                    </button>
                  )}
                  <button
                    onClick={() => handleLanguageChange(selectedLang)}
                    className="text-slate-400 hover:text-white p-1 transition-colors"
                    title="Bắt đầu lại buổi phỏng vấn"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Thông báo nếu chạy trên trình duyệt không có Web Speech API */}
              {!hasSpeechSupport && (
                <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-2 text-xs text-amber-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>
                    Trình duyệt đang bật <strong>Chế độ Gõ phím</strong> (Hỗ trợ tốt trên Safari iOS & Mọi thiết bị).
                  </span>
                </div>
              )}

              {/* Khu vực Chat Transcript */}
              <div className="flex-1 overflow-y-auto space-y-3 p-1 min-h-[220px]">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      m.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-lg p-3 text-xs whitespace-pre-wrap leading-relaxed ${
                        m.role === "user"
                          ? "bg-purple-600 text-white rounded-tr-none shadow-xs"
                          : "bg-slate-950 text-slate-200 rounded-tl-none border border-slate-800 shadow-xs"
                      }`}
                    >
                      {m.text}
                    </div>
                    {m.role === "model" && (
                      <button
                        onClick={() => speakText(m.text)}
                        className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-1 px-1 font-medium transition-colors"
                      >
                        <Volume2 className="w-3 h-3" /> Nghe phát âm
                      </button>
                    )}
                  </div>
                ))}

                {isAiReplying && (
                  <div className="flex items-center gap-2 text-xs text-purple-400 p-2 bg-slate-950 border border-slate-800 rounded-lg w-fit">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini đang phân tích câu trả lời theo chuẩn STAR...</span>
                  </div>
                )}
              </div>

              {/* Hộp nhập liệu & Điều khiển gửi tin */}
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2 shrink-0">
                {inputMode === "voice" && hasSpeechSupport && (
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`p-2.5 rounded-md border transition-colors ${
                      isListening
                        ? "bg-rose-600 text-white border-rose-600 animate-pulse"
                        : "bg-slate-900 text-purple-400 border-slate-800 hover:bg-slate-800"
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
                )}

                <input
                  type="text"
                  placeholder={
                    isListening
                      ? `Đang nghe tiếng ${selectedLang.name}...`
                      : inputMode === "text"
                      ? "Gõ câu trả lời theo cấu trúc Tình huống - Hành động - Kết quả..."
                      : selectedLang.placeholder
                  }
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendInterview()}
                  className="flex-1 bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-md px-3 py-2.5 focus:outline-none focus:border-purple-500"
                />

                <button
                  onClick={handleSendInterview}
                  disabled={!userInput.trim() || isAiReplying}
                  className="p-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-md transition-colors"
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
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
                <label className="text-xs font-medium text-slate-300 block">
                  Dán nội dung giới thiệu bản thân / CV sinh viên vào đây:
                </label>
                <textarea
                  rows={4}
                  value={cvInputText}
                  onChange={(e) => setCvInputText(e.target.value)}
                  placeholder="Ví dụ: Em học trường gì, từng làm công việc gì, tính cách và mong muốn..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-md p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />

                <button
                  onClick={handleAnalyzeCv}
                  disabled={isAnalyzingCv}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
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
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      Điểm Đánh Giá CV:
                    </span>
                    <span className="text-base font-mono font-bold text-emerald-400">
                      {cvResult.cv_score}/100
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-400">
                        Kỹ năng trích xuất được:
                      </span>
                      <button
                        type="button"
                        onClick={handleApplySkills}
                        className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
                      >
                        {appliedSkillsSuccess ? (
                          <>
                            <Check className="w-3 h-3 text-white" />
                            <span>Đã nạp vào Hồ sơ!</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            <span>Áp dụng vào Hồ sơ</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cvResult.extracted_skills?.map(
                        (skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-emerald-950/60 text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-md border border-emerald-800/60 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            {skill}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-md border border-slate-800 text-xs text-slate-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">
                        Tóm tắt giới thiệu ấn tượng (AI Polished):
                      </span>
                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1 transition-colors"
                      >
                        {copiedSummarySuccess ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Đã sao chép!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép tóm tắt</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="italic text-slate-300">&ldquo;{cvResult.professional_summary}&rdquo;</p>
                  </div>

                  {cvResult.improvement_tips && (
                    <div className="bg-amber-950/40 p-3 rounded-md border border-amber-800/60 text-xs text-amber-200 space-y-1.5">
                      <span className="font-semibold text-amber-300 block flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        Gợi ý cải thiện để tăng cơ hội trúng tuyển:
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300">
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
