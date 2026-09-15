import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sell Time - Nền Tảng Kết Nối Thời Gian Rảnh & Kỹ Năng Lao Động Thông Minh",
  description: "Bắt đầu bằng quỹ giờ rảnh của bạn: 'How much time do you want to sell?'",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
