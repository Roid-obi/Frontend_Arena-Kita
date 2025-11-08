import type { Metadata } from "next";
import { AuthProvider } from '../contexts/AuthContext';
import "./globals.css";
import CookieDebugger from "@/components/CookieDebugger";

export const metadata: Metadata = {
  title: 'Arena Kita',
  description: 'Platform booking lapangan olahraga',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CookieDebugger />
        {children}
      </AuthProvider>
      </body>
    </html>
  );
}
