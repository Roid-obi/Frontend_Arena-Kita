import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "../contexts/AuthContext";
import "./globals.css";
import CookieDebugger from "@/components/CookieDebugger";

export const metadata: Metadata = {
  title: "Arena Kita",
  description: "Platform booking lapangan olahraga",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {/* Google reCAPTCHA v3 */}
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />

        <AuthProvider>
          <CookieDebugger />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
