"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { UserProvider } from "@/app/context/UserContext"; // ✅ pastikan path sesuai
import "./globals.css";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const pathname = usePathname();

  // ✅ Daftar halaman tanpa navbar (login, register, lupa password)
  const hideNavbarPaths = ["/login", "/register", "/forgot-password"];
  const shouldHideNavbar = hideNavbarPaths.includes(pathname);

  return (
    <html lang="en">
      <body>
        {/* 🔹 Bungkus semua halaman di dalam UserProvider */}
        <UserProvider>
          {!shouldHideNavbar && <Navbar />}
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}
