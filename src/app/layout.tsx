// File: app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import the CartProvider we just created
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Canteen",
  description: "Order food easily from the school canteen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap the children with the CartProvider */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
