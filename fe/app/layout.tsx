"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import BottomNav from "../components/BottomNav";

// Jika BottomNav ada di app/components, perbaiki seperti ini (jika Anda tidak menghapusnya)
// import BottomNav from "./components/BottomNav"; 
import { UserProvider } from './context/UserContext'; // <--- Perbaikan
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 🚫 Sembunyikan BottomNav di halaman tertentu
  const hideBottomNav =
    pathname.startsWith("/message") ||
    pathname.startsWith("/chat") ||
    pathname.startsWith("/login") ||
     pathname.startsWith("/admin") ||
     pathname.startsWith("/") ||

    pathname.startsWith("/register");

  return (
    <html lang="en" className="h-full overflow-hidden">
      <body
        className={`${inter.className} h-full overflow-hidden bg-gradient-to-b from-[#f5f5f5] to-[#fff] text-gray-800`}
      >
        {/* ✅ Bungkus seluruh aplikasi dengan UserProvider */}
        <UserProvider>
          <div className="flex flex-col h-full relative">
            <main className="flex-1 overflow-y-auto">{children}</main>

            {/* ✅ Tampilkan BottomNav hanya jika bukan halaman login/register/message/chat */}
            {!hideBottomNav && (
              <div className="flex-shrink-0">
                <BottomNav />
              </div>
            )}
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
