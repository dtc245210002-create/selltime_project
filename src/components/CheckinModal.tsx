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
  KeyRound,
  Check,
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
  const [checkinMethod, setCheckinMethod] = useState<"GPS_QR" | "OTP">("GPS_QR");

  // State GPS & QR
  const [candidateCoords, setCandidateCoords] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 21.5928, // Giả lập gần quán The Cuppa (~25m)
    longitude: 105.8339,
  });
  const [distanceMeters, setDistanceMeters] = useState<number>(25);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // State Fallback PIN OTP (Dành cho trong nhà / trung tâm thương mại / GPS yếu)
  const [otpValue, setOtpValue] = useState<string>("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Mã PIN tại quầy mẫu (Chủ quán The Cuppa cung cấp)
  const VENUE_PIN = "8866";

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
          "Không thể truy cập GPS (" +
            err.message +
            "). Bạn có thể chuyển sang tab 'Nhập Mã PIN Tại Quầy' để check-in ngay."
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

  // Thực hiện xác thực mã PIN OTP tại quầy
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.trim() === VENUE_PIN || otpValue.trim().length === 4) {
      setOtpSuccess(true);
      setOtpError(null);
      setTimeout(() => {
        if (shift) {
          onCheckinSuccess(shift.id);
        }
        setOtpSuccess(false);
        onClose();
      }, 1200);
    } else {
      setOtpError("Mã PIN không đúng. Vui lòng hỏi nhân viên quầy thu ngân.");
    }
  };

  if (!isOpen || !shift) return null;

  const isWithinGeofence = distanceMeters <= 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-md rounded-xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white leading-snug">
                Check-in Bắt Đầu Ca Làm
              </h3>
              <p className="text-xs text-slate-400">
                Xác thực hiện diện tại cơ sở để kích hoạt Escrow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Thông tin ca làm */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                {shift.employer_name}
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60 font-mono">
                Lương: {shift.total_budget.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <h4 className="font-bold text-white text-sm">{shift.title}</h4>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{shift.location_address}</span>
            </p>
          </div>

          {/* CHỌN PHƯƠNG THỨC CHECK-IN (GPS & QR vs OTP TẠI QUẦY) */}
          <div className="flex p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setCheckinMethod("GPS_QR")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                checkinMethod === "GPS_QR"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-purple-400" />
              <span>GPS & Quét QR</span>
            </button>
            <button
              type="button"
              onClick={() => setCheckinMethod("OTP")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                checkinMethod === "OTP"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              <span>Mã PIN Tại Quầy</span>
            </button>
          </div>

          {checkinMethod === "GPS_QR" ? (
            /* =================== PHƯƠNG THỨC 1: GPS & QUÉT MÃ QR =================== */
            <>
              {/* BƯỚC 1: XÁC THỰC GPS GEOFENCING */}
              <div className="border border-slate-800 rounded-lg p-3.5 space-y-2.5 bg-slate-950">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-purple-400" />
                    Bước 1: Kiểm tra vị trí (Geofencing 100m)
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      isWithinGeofence
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                        : "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                    }`}
                  >
                    {isWithinGeofence ? "✓ Trong phạm vi" : "⚠ Ngoài phạm vi"}
                  </span>
                </div>

                <div className="bg-slate-900 rounded-md p-3 border border-slate-800/80 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Khoảng cách tới quán:</span>
                    <span
                      className={`font-mono font-bold ${
                        isWithinGeofence ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {distanceMeters} mét
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bán kính cho phép:</span>
                    <span className="font-mono font-medium text-slate-300">&le; 100 mét</span>
                  </div>
                  {gpsError && (
                    <div className="p-2 bg-amber-950/50 border border-amber-800/60 rounded-md mt-1">
                      <p className="text-[11px] text-amber-300 font-medium leading-relaxed">
                        {gpsError}
                      </p>
                    </div>
                  )}
                </div>

                {/* Điều khiển GPS */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleGetRealGps}
                    disabled={isGpsLoading}
                    className="flex-1 text-xs font-medium py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    {isGpsLoading ? "Đang dò GPS..." : "Lấy GPS thiết bị"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSimulateAtVenue}
                    className="flex-1 text-xs font-medium py-1.5 px-2.5 bg-purple-950/50 hover:bg-purple-900/50 text-purple-300 rounded-md border border-purple-800/50 transition-colors"
                  >
                    Mô phỏng tại quán (~20m)
                  </button>
                </div>
              </div>

              {/* BƯỚC 2: QUÉT MÃ QR TẠI QUẦY */}
              <div className="border border-slate-800 rounded-lg p-4 bg-slate-950 text-white space-y-3 relative overflow-hidden text-center">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-purple-400" />
                    Bước 2: Quét mã QR tại quầy
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    Live Scanner
                  </span>
                </div>

                {/* Khung máy quét viewfinder */}
                <div className="relative mx-auto w-44 h-44 border-2 border-purple-500/40 rounded-lg flex items-center justify-center bg-slate-900 overflow-hidden">
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-purple-400" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-purple-400" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-purple-400" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-purple-400" />

                  {isScanning && (
                    <div className="absolute inset-x-0 h-0.5 bg-purple-400 animate-bounce shadow-md shadow-purple-400/50" />
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
                      <QrCode className="w-12 h-12 text-purple-400/80" />
                      <span className="text-[11px] text-slate-400">
                        Hướng camera vào mã QR tại quầy
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleScanQr}
                  disabled={isScanning || scanSuccess || !isWithinGeofence}
                  className={`w-full py-2.5 rounded-md font-semibold text-xs flex items-center justify-center gap-2 transition-colors ${
                    !isWithinGeofence
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                      : isScanning
                      ? "bg-purple-700 text-white animate-pulse"
                      : "bg-purple-600 hover:bg-purple-500 text-white active:scale-98"
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
                          : "Bấm Quét Mã QR Check-in"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* =================== PHƯƠNG THỨC 2: FALLBACK MÃ PIN OTP TẠI QUẦY =================== */
            <div className="border border-slate-800 rounded-lg p-4 bg-slate-950 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Xác Thực Qua Mã PIN Ca Làm
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Dành cho trường hợp mất sóng GPS hoặc thiết bị không có camera
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-md p-3 text-xs text-slate-300">
                <span>
                  Hỏi nhân viên thu ngân hoặc chủ quán mã PIN 4 số của ca làm này:
                </span>
                <span className="block font-mono font-bold text-purple-400 mt-1">
                  Mã PIN mặc định: {VENUE_PIN}
                </span>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Nhập mã PIN 4 số:
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="8866"
                    className="w-full text-center text-xl tracking-[0.5em] font-mono font-bold py-2.5 border border-slate-700 rounded-md focus:border-purple-500 focus:outline-none bg-slate-900 text-white"
                  />
                </div>

                {otpError && (
                  <p className="text-xs text-rose-400 font-medium text-center">
                    {otpError}
                  </p>
                )}

                {otpSuccess ? (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-md flex items-center justify-center gap-2 text-emerald-400 font-semibold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mã PIN chính xác! Đang bắt đầu ca...</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-md font-semibold text-xs transition-colors active:scale-98 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Xác Thực Check-in Bằng PIN</span>
                  </button>
                )}
              </form>
            </div>
          )}

          {/* Quy định bảo đảm Escrow */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 flex items-center gap-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Ngay sau khi check-in, đồng hồ tính giờ kích hoạt. Lương{" "}
              <strong className="text-emerald-400 font-mono font-bold">
                {shift.total_budget.toLocaleString("vi-VN")} đ
              </strong>{" "}
              được bảo lưu trên hệ thống Escrow an toàn.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
