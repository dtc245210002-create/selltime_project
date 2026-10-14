import type { Metadata } from "next";
import "./globals.css";
import { ViewModeProvider } from "@/components/ViewModeContext";

export const metadata: Metadata = {
  title: "SellTime - Sàn việc làm theo giờ rảnh | Time-First Marketplace",
  description: "Thị trường việc làm theo giờ linh hoạt cho sinh viên & chủ quán F&B tại Thái Nguyên",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ViewModeProvider>{children}</ViewModeProvider>
      </body>
    </html>
  );
}
