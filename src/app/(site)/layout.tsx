import type { Metadata } from "next";
import { Sen, Public_Sans } from "next/font/google"; //
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const sen = Sen({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-sen", //
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-public-sans", //
});

export const metadata: Metadata = {
  title: "TermSheetGenie",
  description: "Simulate and manage investment rounds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sen.variable} ${publicSans.variable} antialiased font-sans bg-white`}
      >
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}