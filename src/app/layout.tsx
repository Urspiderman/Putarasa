
import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import Chatbot from "@/components/Chatbot";

export const metadata: Metadata = {
  title: {
    default: "Putarasa | Dari Dapur, Untuk Bumi",
    template: "%s | Putarasa",
  },
  description:
    "Putarasa adalah platform pengelolaan sampah organik, penjemputan, pengolahan, dan marketplace produk organik.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#FFFBF1] text-[#302218] antialiased">
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
