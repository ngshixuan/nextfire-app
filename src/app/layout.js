'use client'

import { Toaster } from "react-hot-toast";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { UserContext } from "@/lib/context";
import { useUserData } from "@/lib/hooks";

export default function RootLayout({ children }) {
  const userData = useUserData()

  return (
    <html lang="en">
      <body>
        <UserContext.Provider value={userData}>
          <Navbar />
          {children}
          <Toaster />
        </UserContext.Provider>
      </body>
    </html>
  );
}
