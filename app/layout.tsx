import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { authOptions } from "@/lib/auth/options";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Automated Scraping & Monitoring Dashboard",
  description:
    "Add instructions, run AI-assisted scrapers, and monitor changes across the web.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen overflow-x-hidden font-sans antialiased`}
      >
        <AppProviders session={session}>
          <AnimatedBackground />
          <div className="relative z-10">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
