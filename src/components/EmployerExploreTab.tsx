"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  BatteryCharging,
  Send,
  CheckCircle2,
  Filter,
} from "lucide-react";

interface CandidateCardData {
  id: string;
  name: string;
  avatar: string;
  university: string;
  trustBattery: number;
  freePeriod: string;
  distanceKm: number;
  skills: string[];
  expectedRate: number;
}

const SAMPLE_CANDIDATES: CandidateCardData[] = [
  {
    id: "cand_01",
    name: "Nguyễn Đức Huy",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    university: "ĐH Kỹ thuật Công nghiệp (TNUT)",
    trustBattery: 100,
    freePeriod: "Tối nay (18:00 - 22:00)",
    distanceKm: 1.1,
    skills: ["Phục vụ bàn", "Pha chế cơ bản", "Thu ngân POS"],
    expectedRate: 25000,
  },
  {
    id: "cand_02",
    name: "Trần Mai Anh",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    university: "ĐH Sư Phạm Thái Nguyên",
    trustBattery: 98,
    freePeriod: "Chiều & Tối (14:00 - 20:00)",
    distanceKm: 1.8,
    skills: ["Thu ngân POS", "Giao tiếp lịch thiệp", "Pha chế trà sữa"],
    expectedRate: 28000,
  },
  {
    id: "cand_03",
    name: "Lê Hoàng Nam",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    university: "ĐH Nông Lâm Thái Nguyên",
    trustBattery: 95,
    freePeriod: "Tối & Đêm (19:00 - 23:00)",
    distanceKm: 2.4,
    skills: ["Phục vụ bàn", "Bếp phụ", "Nhanh nhẹn"],
    expectedRate: 25000,
  },
];

export function EmployerExploreTab() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("EVENING");
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  const handleInvite = (id: string) => {
    if (!invitedIds.includes(id)) {
      setInvitedIds([...invitedIds, id]);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            Săn Ứng Viên Theo Giờ
          </h2>
          <p className="text-xs text-slate-500">
            Chủ động mời sinh viên đang rảnh ca vào làm việc tức thì
          </p>
        </div>
        <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
          {SAMPLE_CANDIDATES.length} ứng viên sẵn sàng
        </span>
      </div>

      {/* Bộ chọn khung giờ cần tuyển */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <span className="text-xs font-bold text-slate-700 block">
          Quán của bạn đang thiếu người vào ca nào?
        </span>
        <div className="flex gap-1.5">
          {[
            { id: "MORNING", label: "Sáng (7h-12h)" },
            { id: "AFTERNOON", label: "Chiều (12h-18h)" },
            { id: "EVENING", label: "Tối (18h-22h)" },
            { id: "NIGHT", label: "Đêm (22h-3h)" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriod(p.id)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedPeriod === p.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách ứng viên rảnh phù hợp */}
      <div className="space-y-3">
        {SAMPLE_CANDIDATES.map((cand) => {
          const isInvited = invitedIds.includes(cand.id);

          return (
            <div
              key={cand.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={cand.avatar}
                    alt={cand.name}
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-sm text-slate-900">
                        {cand.name}
                      </h3>
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded flex items-center gap-0.5 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> eKYC
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {cand.university}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>Cách quán ~{cand.distanceKm} km</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{cand.trustBattery}% Uy tín</span>
                  </div>
                  <span className="block text-[10px] text-slate-400 mt-1">
                    Lương từ: {cand.expectedRate.toLocaleString("vi-VN")} đ/h
                  </span>
                </div>
              </div>

              {/* Khung giờ rảnh & Kỹ năng */}
              <div className="bg-slate-50 rounded-xl p-2.5 text-xs space-y-1.5 border border-slate-100">
                <div className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Rảnh: {cand.freePeriod}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {cand.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Nút hành động mời nhận ca */}
              <div className="flex justify-end">
                {isInvited ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đã gửi lời mời nhận ca</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleInvite(cand.id)}
                    className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Mời Nhận Ca Tối Nay</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
