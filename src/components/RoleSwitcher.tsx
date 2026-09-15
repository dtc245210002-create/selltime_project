"use client";

import React from "react";
import { UserRole } from "../domain/types";
import { UserCheck, Store, ShieldCheck } from "lucide-react";

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
  candidateName: string;
  employerName: string;
}

export function RoleSwitcher({
  currentRole,
  onRoleChange,
  candidateName,
  employerName,
}: RoleSwitcherProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-medium text-slate-500">Đang đóng vai:</span>
        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md flex items-center gap-1">
          {currentRole === "CANDIDATE" ? (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              <span>{candidateName} (SV)</span>
            </>
          ) : (
            <>
              <Store className="w-3.5 h-3.5" />
              <span>{employerName} (Quán)</span>
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
        <button
          onClick={() => onRoleChange("CANDIDATE")}
          className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-all ${
            currentRole === "CANDIDATE"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Sinh viên
        </button>
        <button
          onClick={() => onRoleChange("EMPLOYER")}
          className={`text-[11px] font-semibold px-2 py-1 rounded-md transition-all ${
            currentRole === "EMPLOYER"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Chủ quán
        </button>
      </div>
    </div>
  );
}
