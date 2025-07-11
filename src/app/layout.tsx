import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FarmConnect - Smart Farm Management Platform",
    template: "%s | FarmConnect",
  },
  description: "FarmConnect is a comprehensive farm management platform connecting livestock owners with suppliers for medicine, feed, and equipment needs.",
  keywords: ["farm management", "livestock", "agriculture", "feed", "medicine", "suppliers", "farm technology"],
  authors: [{ name: "Chhatresh Khatri", url: "https://chhatreshkhatri.com" }],
  creator: "Chhatresh Khatri",
  icons: {
    icon: "https://cdn.chhatreshkhatri.com/icons/FarmConnect.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "FarmConnect",
    title: "FarmConnect - Smart Farm Management Platform",
    description: "Comprehensive farm management platform connecting livestock owners with suppliers.",
    images: [
      {
        url: "https://cdn.chhatreshkhatri.com/icons/FarmConnect-1200x630.png",
        width: 1200,
        height: 630,
        alt: "FarmConnect Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FarmConnect - Smart Farm Management Platform",
    description: "Comprehensive farm management platform connecting livestock owners with suppliers.",
    creator: "@chhatreshkhatri",
    images: ["https://cdn.chhatreshkhatri.com/icons/FarmConnect-1200x630.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 bg-gray-50">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
