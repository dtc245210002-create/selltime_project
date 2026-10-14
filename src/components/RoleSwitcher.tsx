"use client";

import React from "react";
import { UserRole } from "../domain/types";
import { UserCheck, Store, Eye } from "lucide-react";
import { useViewMode } from "./ViewModeContext";

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
  const { t } = useViewMode();
  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <span className="text-xs sm:text-sm text-slate-400 font-medium">
          {isGuest ? t("Xem trước DEMO:", "DEMO Preview:") : t("Danh tính DEMO:", "DEMO Identity:")}
        </span>
        <span className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 ${
          isGuest
            ? "bg-slate-800/90 text-slate-300 border border-slate-700/80"
            : "text-purple-300 bg-purple-950/70 border border-purple-800/60"
        }`}>
          {currentRole === "CANDIDATE" ? (
            <>
              {isGuest ? <Eye className="w-4 h-4 text-slate-400" /> : <UserCheck className="w-4 h-4 text-purple-400" />}
              <span>{isGuest ? "Candidate DEMO (Khách)" : `${candidateName} · Candidate DEMO`}</span>
            </>
          ) : (
            <>
              {isGuest ? <Eye className="w-4 h-4 text-slate-400" /> : <Store className="w-4 h-4 text-purple-400" />}
              <span>{isGuest ? "Employer DEMO (Khách)" : `${employerName} · Employer DEMO`}</span>
            </>
          )}
        </span>
      </div>

      <div aria-label="Chuyển persona DEMO, không cấp quyền thật" title="Chuyển persona DEMO, không cấp quyền thật" className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => onRoleChange("CANDIDATE")}
          className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            currentRole === "CANDIDATE"
              ? "bg-slate-800 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Candidate DEMO
        </button>
        <button
          onClick={() => onRoleChange("EMPLOYER")}
          className={`text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            currentRole === "EMPLOYER"
              ? "bg-slate-800 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Employer DEMO
        </button>
        <a
          href="/admin"
          className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900/80 text-purple-300 hover:text-white border border-purple-800/60 transition-colors flex items-center gap-1.5"
          title="Mở bảng điều khiển Quản trị viên & Phân quyền"
        >
          <span>Admin Portal</span>
        </a>
      </div>
    </div>
  );
}

