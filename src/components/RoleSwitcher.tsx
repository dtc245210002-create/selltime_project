"use client";

import React from "react";
import { UserRole } from "../domain/types";
import { UserCheck, Store, Eye } from "lucide-react";

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
  candidateName: string;
  employerName: string;
  isGuest?: boolean;
}

export function RoleSwitcher({
  currentRole,
  onRoleChange,
  candidateName,
  employerName,
  isGuest = false,
}: RoleSwitcherProps) {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-400">
          {isGuest ? "Xem trước:" : "Đang đăng nhập:"}
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1.5 ${
          isGuest
            ? "bg-slate-800/90 text-slate-300 border border-slate-700/80"
            : "text-purple-300 bg-purple-950/70 border border-purple-800/60"
        }`}>
          {currentRole === "CANDIDATE" ? (
            <>
              {isGuest ? <Eye className="w-3.5 h-3.5 text-slate-400" /> : <UserCheck className="w-3.5 h-3.5 text-purple-400" />}
              <span>{isGuest ? "Sinh viên tìm việc (Khách)" : `${candidateName} (SV)`}</span>
            </>
          ) : (
            <>
              {isGuest ? <Eye className="w-3.5 h-3.5 text-slate-400" /> : <Store className="w-3.5 h-3.5 text-purple-400" />}
              <span>{isGuest ? "Chủ quán F&B (Khách)" : `${employerName} (Quán)`}</span>
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-md border border-slate-800">
        <button
          onClick={() => onRoleChange("CANDIDATE")}
          className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors ${
            currentRole === "CANDIDATE"
              ? "bg-slate-800 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Sinh viên
        </button>
        <button
          onClick={() => onRoleChange("EMPLOYER")}
          className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors ${
            currentRole === "EMPLOYER"
              ? "bg-slate-800 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Chủ quán
        </button>
      </div>
    </div>
  );
}

