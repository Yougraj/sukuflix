import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Configure Geist fonts with CSS variables
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Improves loading performance
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Primary Metadata and Video referer fix
export const metadata: Metadata = {
  title: "Suku Flix",
  description: "Made with love for Suku ❤️",
  referrer: "no-referrer", // Prevents video hosts from blocking the stream
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Secondary referrer fix for maximum compatibility */}
        <meta name="referrer" content="no-referrer" />

        {/* Mobile & Web App optimization */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
        <meta name="theme-color" content="#141414" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="min-h-full bg-[#141414] text-white flex flex-col overflow-x-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
