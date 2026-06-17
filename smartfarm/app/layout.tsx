import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../components/providers/AuthProvider";
import RouteGuard from "../components/shared/RouteGuard";

export const metadata: Metadata = {
  title: "SmartFarm — Intelligent Farm Management",
  description: "Manage fields, crops, finances, and workers from a single premium dashboard built for modern agriculture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <RouteGuard>
            {children}
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
