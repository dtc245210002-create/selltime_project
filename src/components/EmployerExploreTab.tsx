"use client";

import React, { useState } from "react";
import {
  Clock,
  MapPin,
  ShieldCheck,
  BatteryCharging,
  Send,
  CheckCircle2,
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
    <div className="space-y-4 w-full p-2 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Săn Ứng Viên Theo Giờ
          </h2>
          <p className="text-xs text-slate-400">
            Chủ động mời sinh viên đang rảnh ca vào làm việc
          </p>
        </div>
        <span className="text-xs font-mono font-medium bg-slate-900 text-slate-300 border border-slate-800 px-2.5 py-0.5 rounded-md">
          {SAMPLE_CANDIDATES.length} ứng viên
        </span>
      </div>

      {/* Bộ chọn khung giờ cần tuyển */}
      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2">
        <span className="text-xs font-medium text-slate-300 block">
          Quán đang cần người vào ca nào?
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
              className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedPeriod === p.id
                  ? "bg-purple-600 text-white"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách ứng viên */}
      <div className="space-y-3">
        {SAMPLE_CANDIDATES.map((cand) => {
          const isInvited = invitedIds.includes(cand.id);

          return (
            <div
              key={cand.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-flat"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={cand.avatar}
                    alt={cand.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-white">
                        {cand.name}
                      </h3>
                      <span className="text-[10px] font-medium bg-slate-950 text-emerald-400 border border-slate-800 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> eKYC
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {cand.university}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>Cách quán ~{cand.distanceKm} km</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-md">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{cand.trustBattery}%</span>
                  </div>
                  <span className="block text-[11px] text-slate-400 mt-1 font-mono">
                    từ {cand.expectedRate.toLocaleString("vi-VN")} đ/h
                  </span>
                </div>
              </div>

              {/* Khung giờ rảnh & Kỹ năng */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-purple-300 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Rảnh: {cand.freePeriod}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {cand.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Nút hành động */}
              <div className="flex justify-end">
                {isInvited ? (
                  <span className="text-xs font-medium text-emerald-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-md flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Đã gửi lời mời</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleInvite(cand.id)}
                    className="text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Mời Nhận Ca</span>
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
