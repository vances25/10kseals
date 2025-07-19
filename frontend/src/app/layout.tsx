import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "10k SEALS",
  description: "Revive And Protect Your Driveway",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
