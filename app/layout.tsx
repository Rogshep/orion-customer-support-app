import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orion Entrance Control | Archer AI Support",
  description: "Official customer support powered by Archer AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white font-sans">{children}</body>
    </html>
  );
}
