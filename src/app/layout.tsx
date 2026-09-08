import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Job Hunt Agent — AI Career Command Center",
  description: "AI-powered job search for AI Product Manager roles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
