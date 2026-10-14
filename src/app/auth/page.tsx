"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { VerifiedIdentity } from "@/domain/types";

// Danh tính tài khoản thật chỉ tồn tại trong state của trang riêng.
export default function AccountPage() {
  const [identity, setIdentity] = useState<VerifiedIdentity | null>(null);
  const [signup, setSignup] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  async function action(operation: string, body?: object) {
    setBusy(true); setNotice("");
    try {
      const response = await fetch(`/api/auth/${operation}`, { method: operation === "session" ? "GET" : "POST", headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined, cache: "no-store", credentials: "same-origin" });
      const result = await response.json();
      if (!response.ok) { setIdentity(null); throw new Error(result.error); }
      if (operation === "logout") setIdentity(null);
      else if (result.identity) setIdentity(result.identity);
      if (result.confirmationRequired) setNotice("Kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.");
      setPassword("");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Không thể kết nối."); }
    finally { setBusy(false); }
  }
  useEffect(() => { void action("session"); }, []);
  return <main className="min-h-screen bg-slate-950 text-white p-6 flex justify-center">
    <section className="w-full max-w-md space-y-5">
      <Link href="/" className="text-purple-300">← Trở về DEMO</Link>
      <h1 className="text-2xl font-bold">Tài khoản SellTime</h1>
      <p className="text-slate-400">Khu vực tài khoản thật riêng biệt. Đăng ký mới tạo hồ sơ Candidate.</p>
      {notice && <p role="status" className="border border-slate-700 rounded p-3">{notice}</p>}
      {identity ? <div className="space-y-3">
        <p>{identity.fullName} · {identity.role}</p><p>{identity.email}</p>
        <button disabled={busy} onClick={() => void action("session")} className="block text-purple-300">Kiểm tra session và quyền hiện tại</button>
        <button disabled={busy} onClick={() => void action("refresh")} className="block text-purple-300">Gia hạn session</button>
        <button disabled={busy} onClick={() => void action("logout")} className="rounded bg-purple-600 px-4 py-2">Đăng xuất</button>
      </div> : <form className="space-y-4" onSubmit={event => { event.preventDefault(); void action(signup ? "signup" : "login", { email, password, ...(signup ? { full_name: name } : {}) }); }}>
        {signup && <label className="block">Họ tên<input required maxLength={100} value={name} onChange={e => setName(e.target.value)} className="block w-full bg-slate-900 p-3 rounded" autoComplete="name" /></label>}
        <label className="block">Email<input required type="email" maxLength={120} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" className="block w-full bg-slate-900 p-3 rounded" /></label>
        <label className="block">Mật khẩu<input required type="password" minLength={8} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} autoComplete={signup ? "new-password" : "current-password"} className="block w-full bg-slate-900 p-3 rounded" /></label>
        <button disabled={busy} className="w-full bg-purple-600 p-3 rounded">{busy ? "Đang xử lý…" : signup ? "Đăng ký Candidate" : "Đăng nhập"}</button>
        <button type="button" disabled={busy} onClick={() => { setSignup(!signup); setPassword(""); }} className="text-purple-300">{signup ? "Đã có tài khoản? Đăng nhập" : "Tạo tài khoản Candidate"}</button>
        <button type="button" disabled={busy} onClick={() => void action("refresh")} className="block text-purple-300">Khôi phục session đã hết hạn</button>
      </form>}
    </section>
  </main>;
}

