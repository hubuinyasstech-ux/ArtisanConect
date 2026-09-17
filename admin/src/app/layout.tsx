import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ArtisanConnect Admin Console",
    template: "%s — ArtisanConnect Admin",
  },
  description: "Platform Administration and Governance Console for ArtisanConnect.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-100">
      <body className={`${inter.className} h-full antialiased text-slate-900 bg-slate-100`}>
        {children}
      </body>
    </html>
  );
}
