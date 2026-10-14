"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Smartphone,
  Building2,
  Lock,
  RotateCcw,
  Check,
  Radio,
} from "lucide-react";

interface PaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  amount: number;
  content: string;
  onPaymentSuccess?: () => void;
}

export function PaymentQrModal({
  isOpen,
  onClose,
  title = "Ký Quỹ Escrow Qua Mã VietQR",
  amount = 153000,
  content = "SELLTIME SOS 01",
  onPaymentSuccess,
}: PaymentQrModalProps) {
  const [bankId, setBankId] = useState("MB");
  const [accountNo, setAccountNo] = useState("0987654321");
  const [accountName, setAccountName] = useState("SELL TIME ESCROW");
  const [isPaid, setIsPaid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // URL tạo ảnh VietQR tự động chuẩn quốc gia NAPAS 247
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
    content
  )}&accountName=${encodeURIComponent(accountName)}`;

  const handleCopy = (text: string, field: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleVerifyPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsPaid(true);
      setTimeout(() => {
        if (onPaymentSuccess) onPaymentSuccess();
        setIsPaid(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
      <div className="bg-slate-900 w-full max-w-sm rounded-xl p-5 sm:p-6 shadow-2xl relative border border-slate-800 overflow-hidden">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-md bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-800/80 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>DEMO — Không trừ/chuyển tiền thật</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60 mb-1.5 mx-auto w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ký Quỹ Tự Động VietQR PayOS (Demo)</span>
          </div>
          <h3 className="text-base font-bold text-white">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Màn hình mô phỏng quy trình ký quỹ bảo chứng thù lao ca làm việc
          </p>
        </div>

        {/* Khung Hiển Thị Mã QR Chuẩn VietQR */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col items-center justify-center relative">
          {isPaid ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-white">
                Ký Quỹ DEMO Thành Công!
              </h4>
              <p className="text-xs text-slate-400">
                Số tiền <strong className="text-emerald-400 font-mono font-bold">{amount.toLocaleString("vi-VN")} đ</strong> đã được mô phỏng ghi nhận an toàn.
              </p>
            </div>
          ) : (
            <>
              {/* Trạng thái lắng nghe giao dịch */}
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md mb-3 font-medium border border-emerald-800/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Đang lắng nghe giao dịch NAPAS 24/7 (Mô phỏng)...</span>
              </div>

              {/* Mã QR minh họa (Không dùng QR thanh toán thật) */}
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex flex-col items-center justify-center w-52 h-52 relative overflow-hidden">
                <div className="w-full h-full border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center p-2 text-center bg-slate-50">
                  <QrCode className="w-24 h-24 text-slate-700 mb-1" />
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    MÃ QR MINH HỌA
                  </span>
                  <span className="text-[9px] text-slate-500 mt-1 leading-tight">
                    Chế độ thử nghiệm SellTime
                  </span>
                </div>
              </div>

              {/* Thông tin chuyển khoản kèm nút sao chép */}
              <div className="w-full mt-3 space-y-1.5 text-xs text-slate-300 bg-slate-900 p-3 rounded-md border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số tiền ký quỹ:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      {amount.toLocaleString("vi-VN")} đ
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(amount.toString(), "amount")}
                      className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                    >
                      {copiedField === "amount" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mã ca / Nội dung:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono font-bold text-purple-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-xs">
                      {content}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(content, "content")}
                      className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                    >
                      {copiedField === "content" ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Tài khoản thụ hưởng:</span>
                  <span className="font-mono font-medium text-amber-300 text-[11px]">
                    [Tài khoản thử nghiệm - Demo]
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Nút hành động */}
        {!isPaid && (
          <div className="mt-4 space-y-2">
            <button
              onClick={handleVerifyPayment}
              disabled={isVerifying}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang mô phỏng kiểm tra...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận Ký Quỹ (Thao Tác Mô Phỏng)</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-500">
              ⚡ Chế độ thử nghiệm: Thao tác này mô phỏng xác nhận biến động số dư và giữ tiền ký quỹ Escrow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
