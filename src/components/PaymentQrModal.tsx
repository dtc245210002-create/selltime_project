"use client";

import React, { useState } from "react";
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
  // Cấu hình tài khoản nhận tiền mặc định (VietQR NAPAS 247)
  const [bankId, setBankId] = useState("MB"); // Ngân hàng Quân Đội (MBBank)
  const [accountNo, setAccountNo] = useState("0987654321");
  const [accountName, setAccountName] = useState("SELL TIME ESCROW");
  const [isPaid, setIsPaid] = useState(false);

  if (!isOpen) return null;

  // URL tạo ảnh VietQR tự động chuẩn quốc gia NAPAS 247
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
    content
  )}&accountName=${encodeURIComponent(accountName)}`;

  const handleSimulateSuccess = () => {
    setIsPaid(true);
    setTimeout(() => {
      if (onPaymentSuccess) onPaymentSuccess();
      setIsPaid(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative border border-slate-100 overflow-hidden">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ký Quỹ Tự Động VietQR PayOS</span>
          </div>
          <h3 className="text-base font-black text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">
            Quét mã bằng bất kỳ App Ngân Hàng hoặc Ví Điện Tử nào
          </p>
        </div>

        {/* Khung Hiển Thị Mã QR Chuẩn VietQR */}
        <div className="bg-slate-50 border-2 border-indigo-100 rounded-2xl p-4 flex flex-col items-center justify-center relative shadow-inner">
          {isPaid ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Thanh Toán Ký Quỹ Thành Công!
              </h4>
              <p className="text-xs text-slate-500">
                Số tiền {amount.toLocaleString("vi-VN")} đ đã được chuyển vào ví tạm giữ Escrow.
              </p>
            </div>
          ) : (
            <>
              {/* Ảnh VietQR động */}
              <div className="bg-white p-2 rounded-xl shadow-md border border-slate-200">
                <img
                  src={qrUrl}
                  alt="Mã VietQR"
                  className="w-56 h-auto object-contain rounded-lg"
                />
              </div>

              {/* Thông tin chuyển khoản tóm tắt */}
              <div className="w-full mt-3 space-y-1.5 text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Số tiền:</span>
                  <span className="text-base font-black text-indigo-600">
                    {amount.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Nội dung CK:</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                    {content}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Người nhận:</span>
                  <span className="font-semibold text-slate-800">{accountName}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Nút hành động */}
        {!isPaid && (
          <div className="mt-4 space-y-2">
            <button
              onClick={handleSimulateSuccess}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác Nhận Đã Chuyển Khoản (Demo 3s)</span>
            </button>

            <p className="text-[10px] text-center text-slate-400">
              ⚡ Khi tích hợp PayOS thật: Ngân hàng sẽ tự động xác nhận sau 3 giây qua Webhook.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
