import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Silk — generate beautifully animated websites",
  description: "Prompt → animated React site. v0 spike.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
