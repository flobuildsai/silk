import type { Metadata } from "next";
import "./globals.css";
import { ALL_FONT_VARIABLES } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Silk — prompts into beautifully animated websites",
  description:
    "Describe a site in one paragraph. Silk returns a polished, animated landing page you can host in a click.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={ALL_FONT_VARIABLES}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
