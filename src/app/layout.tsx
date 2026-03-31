import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Golf Charity Platform | Play. Win. Give.",
  description:
    "Subscribe, enter your golf scores, win monthly prizes, and support charities that matter. Every round counts.",
  keywords: ["golf", "charity", "subscription", "prize draw", "stableford"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: "12px",
                background: "#1a1a2e",
                color: "#fff",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
