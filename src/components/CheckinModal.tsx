"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Sparkles,
  Camera,
  ShieldCheck,
} from "lucide-react";
import { Shift } from "../domain/types";
import { calculateHaversineDistance } from "../domain/matching-engine";

interface CheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
  onCheckinSuccess: (shiftId: string) => void;
}

export function CheckinModal({
  isOpen,
  onClose,
  shift,
  onCheckinSuccess,
}: CheckinModalProps) {
  const [candidateCoords, setCandidateCoords] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 21.5928, // Mặc định giả lập gần quán The Cuppa (~25m)
    longitude: 105.8339,
  });

  const [distanceMeters, setDistanceMeters] = useState<number>(25);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // Tính khoảng cách khi tọa độ thay đổi hoặc khi mở modal
  useEffect(() => {
    if (shift && candidateCoords) {
      const distKm = calculateHaversineDistance(
        candidateCoords,
        shift.location_coords
      );
      setDistanceMeters(Math.round(distKm * 1000));
    }
  }, [shift, candidateCoords]);

  // Lấy tọa độ GPS thực tế từ trình duyệt
  const handleGetRealGps = () => {
    if (!navigator.geolocation) {
      setGpsError("Trình duyệt không hỗ trợ Geolocation API");
      return;
    }

    setIsGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setCandidateCoords(newCoords);
        setIsGpsLoading(false);
      },
      (err) => {
        setIsGpsLoading(false);
        setGpsError(
          "Không thể truy cập GPS thực tế (" +
            err.message +
            "). Đang dùng tọa độ Thái Nguyên mô phỏng."
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Đặt lại tọa độ về vị trí quán (Mô phỏng đứng tại quầy quán)
  const handleSimulateAtVenue = () => {
    if (!shift) return;
    setCandidateCoords({
      latitude: shift.location_coords.latitude + 0.0001,
      longitude: shift.location_coords.longitude + 0.0001,
    });
    setGpsError(null);
  };

  // Thực hiện quét QR Check-in
  const handleScanQr = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      setTimeout(() => {
        if (shift) {
          onCheckinSuccess(shift.id);
        }
        setScanSuccess(false);
        onClose();
      }, 1200);
    }, 1500);
  };

  if (!isOpen || !shift) return null;

  const isWithinGeofence = distanceMeters <= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white p-4.5 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-snug">
                Check-in Bắt Đầu Ca Làm
              </h3>
              <p className="text-[11px] text-indigo-100/90 font-medium">
                Xác thực Geofencing GPS & Quét mã QR tại quán
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Thông tin ca làm */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                {shift.employer_name}
              </span>
              <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Lương: {shift.total_budget.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <h4 className="font-bold text-slate-800 text-sm">{shift.title}</h4>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">{shift.location_address}</span>
            </p>
          </div>

          {/* BƯỚC 1: XÁC THỰC GPS GEOFENCING */}
          <div className="border border-slate-200 rounded-2xl p-3.5 space-y-2.5 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-indigo-600" />
                Bước 1: Kiểm tra vị trí (Geofencing 100m)
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isWithinGeofence
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {isWithinGeofence ? "✅ Trong phạm vi" : "⚠️ Ngoài phạm vi"}
              </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Khoảng cách tới quán:</span>
                <span
                  className={`font-black ${
                    isWithinGeofence ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {distanceMeters} mét
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bán kính cho phép:</span>
                <span className="font-bold text-slate-700">&le; 100 mét</span>
              </div>
              {gpsError && (
                <p className="text-[10px] text-amber-600 mt-1 font-medium">
                  {gpsError}
                </p>
              )}
            </div>

            {/* Điều khiển GPS */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGetRealGps}
                disabled={isGpsLoading}
                className="flex-1 text-[11px] font-bold py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1"
              >
                <MapPin className="w-3 h-3 text-indigo-600" />
                {isGpsLoading ? "Đang dò GPS..." : "Lấy GPS thiết bị"}
              </button>
              <button
                type="button"
                onClick={handleSimulateAtVenue}
                className="flex-1 text-[11px] font-bold py-1.5 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors border border-indigo-200/60"
              >
                Mô phỏng tại quán (~20m)
              </button>
            </div>
          </div>

          {/* BƯỚC 2: QUÉT MÃ QR TẠI QUẦY CỦA CHỦ QUÁN */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-900 text-white space-y-3 relative overflow-hidden text-center">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                Bước 2: Quét mã QR tại quầy thu ngân
              </span>
              <span className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded">
                Live Scanner
              </span>
            </div>

            {/* Khung máy quét viewfinder */}
            <div className="relative mx-auto w-44 h-44 border-2 border-indigo-400/60 rounded-2xl flex items-center justify-center bg-slate-950/60 overflow-hidden">
              {/* Các góc scanner */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-400" />

              {/* Tia quét Laser khi scanning */}
              {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce shadow-lg shadow-cyan-400/50" />
              )}

              {scanSuccess ? (
                <div className="flex flex-col items-center gap-2 text-emerald-400 animate-in zoom-in-75">
                  <CheckCircle2 className="w-12 h-12" />
                  <span className="text-xs font-bold text-white">
                    Check-in Thành Công!
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <QrCode className="w-14 h-14 text-indigo-400 opacity-80" />
                  <span className="text-[10px] text-slate-400">
                    Hướng camera vào mã QR của chủ quán
                  </span>
                </div>
              )}
            </div>

            {/* Nút kích hoạt quét QR */}
            <button
              onClick={handleScanQr}
              disabled={isScanning || scanSuccess || !isWithinGeofence}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                !isWithinGeofence
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : isScanning
                  ? "bg-indigo-700 text-white animate-pulse"
                  : "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white active:scale-98"
              }`}
            >
              {isScanning ? (
                <span>Đang quét mã QR...</span>
              ) : scanSuccess ? (
                <span>Đã ghi nhận ca làm việc!</span>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>
                    {!isWithinGeofence
                      ? "Cần đến gần quán < 100m để quét QR"
                      : "Bấm Quét Mã QR Check-in Ngay"}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Quy định bảo đảm Escrow */}
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Ngay sau khi check-in, đồng hồ tính giờ kích hoạt. Lương{" "}
              <strong>{shift.total_budget.toLocaleString("vi-VN")} đ</strong>{" "}
              được bảo lưu trên hệ thống Escrow.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
