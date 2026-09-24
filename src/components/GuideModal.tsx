"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  GraduationCap,
  Building2,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  QrCode,
  BatteryCharging,
  Utensils,
  Coffee,
  CreditCard,
  ChefHat,
  Smile,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: "CANDIDATE" | "EMPLOYER";
}

export function GuideModal({ isOpen, onClose, defaultRole = "CANDIDATE" }: GuideModalProps) {
  const [activeTab, setActiveTab] = useState<"STUDENT" | "EMPLOYER" | "SKILLS">(
    defaultRole === "EMPLOYER" ? "EMPLOYER" : "STUDENT"
  );
  const [selectedSkill, setSelectedSkill] = useState<string>("phuc_vu");

  if (!isOpen) return null;

  const skillsData = [
    {
      id: "phuc_vu",
      name: "Phục Vụ Bàn (Table Service)",
      icon: Utensils,
      color: "text-amber-400 bg-amber-950/50 border-amber-800/60",
      overview: "Kỹ năng cơ bản và phổ biến nhất trong các quán cafe, nhà hàng, quán lẩu nướng tại Thái Nguyên.",
      steps: [
        {
          title: "1. Chào đón & Mời nước",
          desc: "Tươi cười chào khách ngay khi khách bước vào: 'Dạ quán em xin chào anh/chị'. Mời khách vào bàn trống phù hợp.",
        },
        {
          title: "2. Tiếp nhận Order",
          desc: "Ghi nhớ hoặc nhập POS chính xác mã món, độ ngọt, mức đá, lưu ý đặc biệt (không hành, ít cay). Đọc lại order 1 lần trước khi chuyển quầy bar/bếp.",
        },
        {
          title: "3. Bưng bê an toàn",
          desc: "Dùng khay chuyên dụng, đặt cốc nặng/nóng ở giữa khay. Đặt nhẹ nhàng bên tay phải của khách, không chạm tay vào miệng cốc/chén.",
        },
        {
          title: "4. Dọn bàn & Lau dọn",
          desc: "Dọn dẹp bát đĩa, ly tách bẩn ngay sau khi khách rời đi. Dùng khăn lau sạch bàn và sắp xếp ghế ngay ngắn cho lượt khách tiếp theo.",
        },
      ],
      tips: "Luôn quan sát cử chỉ của khách (nhìn quanh, giơ tay). Nếu lỡ làm đổ nước, lập tức xin lỗi chân thành, lấy khăn sạch lau ngay và xin phép đổi đồ uống mới.",
    },
    {
      id: "pha_che",
      name: "Pha Chế Cơ Bản (Barista / Bar)",
      icon: Coffee,
      color: "text-purple-400 bg-purple-950/50 border-purple-800/60",
      overview: "Hỗ trợ quầy bar ra đồ uống nhanh, đúng định lượng công thức của quán trong giờ cao điểm.",
      steps: [
        {
          title: "1. Đọc Ticket & Định lượng (Jigger)",
          desc: "Luôn dùng ly đong (jigger) đo đúng ml siro, đường, sữa đặc theo bảng công thức dán tại quầy, không tự ý áng chừng.",
        },
        {
          title: "2. Ủ trà & Chiết xuất Cà phê",
          desc: "Canh đúng nhiệt độ nước (85°C-90°C cho trà xanh, 95°C cho trà đen) và thời gian ủ để trà không bị đắng chát.",
        },
        {
          title: "3. Lắc Shaker & Đóng nắp",
          desc: "Lắc đều tay 8-10 nhịp cho hòa quyện và tạo bọt mịn. Đóng màng dập nắp hoặc nắp tim chắc chắn trước khi chuyển phục vụ.",
        },
        {
          title: "4. Vệ sinh quầy Bar",
          desc: "Rửa cối xay, shaker ngay sau khi dùng. Giữ mặt quầy bar luôn khô ráo, gom bã cà phê và vỏ hộp sữa vào thùng rác.",
        },
      ],
      tips: "Khi quán đông, hãy chuẩn bị sẵn đá, cắt sẵn chanh/quất và ủ trước cốt trà dự phòng để phục vụ nhanh nhất.",
    },
    {
      id: "thu_ngan",
      name: "Thu Ngân POS & VietQR",
      icon: CreditCard,
      color: "text-emerald-400 bg-emerald-950/50 border-emerald-800/60",
      overview: "Kiểm soát dòng tiền, xuất hóa đơn thanh toán và hướng dẫn khách quét mã QR.",
      steps: [
        {
          title: "1. Thao tác phần mềm POS",
          desc: "Chọn đúng bàn, đúng món theo order. Kiểm tra áp dụng mã giảm giá / voucher khuyến mãi nếu khách có.",
        },
        {
          title: "2. Thanh toán tiền mặt / Chuyển khoản",
          desc: "Xác nhận số tiền nhận từ khách. Đếm tiền to trước mặt khách: 'Dạ em nhận của anh 500k, số tiền thanh toán là 120k, em thối lại 380k ạ'.",
        },
        {
          title: "3. Hướng dẫn quét VietQR",
          desc: "Mở mã QR động trên màn hình hoặc hướng dẫn khách quét đúng số tiền và nội dung bàn.",
        },
        {
          title: "4. Kiểm két cuối ca",
          desc: "In phiếu bàn giao ca, đếm tiền mặt thực tế khớp với doanh thu trên hệ thống POS trước khi bàn giao cho ca sau.",
        },
      ],
      tips: "Không bao giờ để két tiền mở tự do khi không có người trực. Luôn in hóa đơn đưa khách kèm lời cảm ơn.",
    },
    {
      id: "phu_bep",
      name: "Phụ Bếp & Sơ Chế Thực Phẩm",
      icon: ChefHat,
      color: "text-rose-400 bg-rose-950/50 border-rose-800/60",
      overview: "Hỗ trợ bếp chính sơ chế nguyên liệu, chia phần ăn và rửa chén bát trong ca gãy trưa/tối.",
      steps: [
        {
          title: "1. Nhặt rau & Cắt gọt",
          desc: "Rửa sạch rau củ qua 3 lần nước. Cắt thái đều tay theo kích thước bếp trưởng yêu cầu.",
        },
        {
          title: "2. Phân loại dao thớt",
          desc: "Tuyệt đối không dùng chung thớt đồ sống (thịt, cá) với thớt đồ chín/rau củ ăn liền để đảm bảo vệ sinh an toàn thực phẩm.",
        },
        {
          title: "3. Ra đồ & Chuẩn bị đĩa",
          desc: "Xếp đồ ăn ra đĩa/khay lẩu đẹp mắt, lau sạch viền đĩa trước khi bấm chuông gọi phục vụ ra món.",
        },
        {
          title: "4. Dọn dẹp & Rửa bát",
          desc: "Ngâm rửa bát đĩa bằng nước ấm và xà phòng, tráng nước sạch và xếp vào giá sấy khô ráo.",
        },
      ],
      tips: "Luôn mang tạp dề, đội mũ trùm tóc và mang găng tay chế biến. Sàn bếp trơn hãy đi giày đế cao su chống trượt.",
    },
    {
      id: "giao_tiep",
      name: "Tác Phong & Giao Tiếp Chuẩn",
      icon: Smile,
      color: "text-cyan-400 bg-cyan-950/50 border-cyan-800/60",
      overview: "Bí quyết để luôn nhận đánh giá 5 sao từ chủ quán và tích lũy Pin Uy Tín 100%.",
      steps: [
        {
          title: "1. Đúng giờ là số 1",
          desc: "Luôn có mặt trước giờ bắt đầu ca làm 10-15 phút để chuẩn bị trang phục và kiểm tra GPS điểm danh.",
        },
        {
          title: "2. Trang phục gọn gàng",
          desc: "Mặc quần tối màu, áo thun/sơ mi có cổ, đi giày bệt hoặc giày thể thao, tóc tai buộc gọn gàng.",
        },
        {
          title: "3. Thái độ tích cực",
          desc: "Chủ động hỏi han khi hết việc: 'Anh/chị ơi có cần em hỗ trợ lau dọn thêm khu vực nào không ạ?'.",
        },
        {
          title: "4. Tôn trọng quy định",
          desc: "Không dùng điện thoại lướt mạng xã hội trong giờ làm việc. Để chuông rung và chỉ nghe khi có việc khẩn.",
        },
      ],
      tips: "Chủ quán đánh giá cao sự trung thực, nhanh nhẹn và thái độ cầu thị hơn là kinh nghiệm ban đầu!",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-modal relative">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modal */}
        <div className="p-5 border-b border-slate-800 shrink-0 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Trung Tâm Hướng Dẫn & Cẩm Nang Kỹ Năng</h2>
              <p className="text-xs text-slate-400">
                Hiểu rõ cách vận hành nền tảng và trang bị kỹ năng làm việc thực chiến
              </p>
            </div>
          </div>

          {/* 3 Tab Điều Hướng Chính */}
          <div className="flex gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mt-4">
            <button
              onClick={() => setActiveTab("STUDENT")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === "STUDENT"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Dành Cho Sinh Viên</span>
            </button>

            <button
              onClick={() => setActiveTab("EMPLOYER")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === "EMPLOYER"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Dành Cho Chủ Quán</span>
            </button>

            <button
              onClick={() => setActiveTab("SKILLS")}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                activeTab === "SKILLS"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Cẩm Nang Kỹ Năng</span>
            </button>
          </div>
        </div>

        {/* Body Cuộn Nội Dung */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {/* ========================================================= */}
          {/* TAB 1: DÀNH CHO SINH VIÊN                                */}
          {/* ========================================================= */}
          {activeTab === "STUDENT" && (
            <div className="space-y-4">
              <div className="bg-purple-950/30 border border-purple-800/40 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                  🎓 Quy trình 5 bước kiếm tiền theo giờ linh hoạt
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sell Time giúp bạn biến thời gian rảnh giữa các tiết học hoặc buổi tối thành thu nhập mà không bị gò bó lịch cố định.
                </p>
              </div>

              {/* 5 Steps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <Clock className="w-4 h-4" />
                    <span>Bước 1: Chọn Khung Giờ Hoặc Ca Gãy</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Dùng thanh trượt hoặc bấm nhanh các mẫu ca gãy (Trưa 11h-13h30, Tối 17h30-20h30) để lọc ra việc làm quanh trường TNUT không trùng giờ học.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bước 2: Ứng Tuyển 1-Chạm (Ân Hạn 1h)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Bấm <strong>Ứng tuyển ngay</strong>. Nếu lỡ ấn nhầm hoặc bận đột xuất, bạn có quyền <strong>hủy ca miễn phí trong vòng 1 giờ</strong> mà không bị trừ Pin Uy Tín.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <QrCode className="w-4 h-4" />
                    <span>Bước 3: Check-in GPS Bán Kính 100m</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Đến quán đúng giờ, mở tab <em>Ca của tôi</em> và bấm <strong>Check-in GPS</strong>. Nếu GPS điện thoại chập chờn, bạn chỉ cần nhập mã PIN <strong>8866</strong> tại quầy.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Bước 4: Nhận Tiền Lương Tức Thì (Escrow)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Chủ quán đã nạp sẵn tiền vào quỹ Escrow. Ngay sau khi bạn Check-out kết thúc ca, tiền lương sẽ được tự động giải ngân vào ví / tài khoản ngân hàng của bạn.
                  </p>
                </div>
              </div>

              {/* PartyMode Trust Battery Notice */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <span className="font-bold text-white block">
                    🔋 Quy tắc Pin Uy Tín PartyMode (0% - 100%)
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    • Hoàn thành ca 5⭐: <strong className="text-emerald-400">+3% Pin</strong> (Ca SOS +5%).<br />
                    • Đạt Pin &ge; 80%: Mở khóa nhận các <strong>ca SOS thưởng nóng (+30k - 50k)</strong>.<br />
                    • Hủy gấp &lt; 2h hoặc bùng ca: Trừ 35% - 50% Pin và tạm khóa nhận ca mới.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: DÀNH CHO CHỦ QUÁN                                 */}
          {/* ========================================================= */}
          {activeTab === "EMPLOYER" && (
            <div className="space-y-4">
              <div className="bg-blue-950/30 border border-blue-800/40 rounded-xl p-4 space-y-2">
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block">
                  🏪 Quy trình tuyển dụng ca gãy & ca SOS cho chủ quán
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Giải quyết triệt để vấn đề thiếu nhân viên giờ cao điểm và nỗi lo nhân viên bùng ca.
                </p>
              </div>

              {/* 4 Steps Employer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <span>1. Đăng Ca Linh Hoạt 1-Chạm</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Sử dụng các mẫu ca nhanh: <em>Ca gãy trưa 2.5h (11h-13h30)</em>, <em>Ca gãy tối 3h (17h30-20h30)</em> hoặc bật cờ <strong>SOS thưởng nóng +30k</strong> để hút ứng viên nhận ca ngay.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <span>2. Ký Quỹ Escrow An Toàn (VietQR)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Nạp bảo đảm tiền công ca làm qua mã VietQR PayOS. Tiền được đối tác Ngân hàng tạm giữ an toàn, giúp sinh viên yên tâm đến làm không lo bị nợ lương.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <span>3. Duyệt Ứng Viên Khớp Điểm</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Hệ thống AI tự động gợi ý các sinh viên có kỹ năng phù hợp (Phục vụ, Pha chế, Thu ngân) và có vị trí trọ/KTX gần quán nhất (&lt; 1.5km).
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <span>4. Điểm Danh PIN 8866 & Giải Ngân</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Cung cấp mã PIN 8866 quầy để nhân viên điểm danh. Khi ca kết thúc, hệ thống tự động giải ngân tiền lương chính xác theo giờ làm thực tế.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CẨM NANG KỸ NĂNG F&B                              */}
          {/* ========================================================= */}
          {activeTab === "SKILLS" && (
            <div className="space-y-4">
              {/* Skill Pill Selector */}
              <div className="flex flex-wrap gap-1.5">
                {skillsData.map((s) => {
                  const Icon = s.icon;
                  const isSel = selectedSkill === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSkill(s.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                        isSel
                          ? "bg-purple-600 text-white border-purple-500 shadow-xs"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{s.name.split("(")[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Skill Details */}
              {(() => {
                const skill = skillsData.find((s) => s.id === selectedSkill) || skillsData[0];
                const Icon = skill.icon;
                return (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${skill.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{skill.name}</h3>
                          <p className="text-slate-400 text-[11px]">{skill.overview}</p>
                        </div>
                      </div>
                    </div>

                    {/* Step by step checklist */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Quy trình thực hiện chuẩn:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {skill.steps.map((st, idx) => (
                          <div key={idx} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                            <span className="font-bold text-purple-300 block text-[11px]">{st.title}</span>
                            <p className="text-slate-400 text-[11px] leading-relaxed">{st.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro Tip Box */}
                    <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3 text-xs flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-emerald-300 block text-[11px]">Mẹo thực chiến ghi điểm 5 sao:</strong>
                        <p className="text-emerald-200/90 text-[11px] mt-0.5 leading-relaxed">{skill.tips}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Sell Time • Nền tảng việc làm theo giờ linh hoạt ĐH TNUT
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            Đã hiểu & Bắt đầu ngay 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
