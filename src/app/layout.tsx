import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";

import { Toaster } from "@/components/ui/sonner";

const inter = localFont({
  src: "./fonts/InterVf.ttf",
  variable: "--font-inter",
  weight: "100 200 300 400 500 600 700 800 900",
});

const spaceGrotesk = localFont({
  src: "./fonts/SpaceGroteskVF.ttf",
  variable: "--font-space-grotesk",
  weight: "300 400 500 600 700",
});

export const metadata: Metadata = {
  title: "Medi Store",
  description:
    "MediStore is a full-stack e-commerce web application for purchasing over-the-counter (OTC) medicines. Customers can browse medicines, add to cart, and place orders. Sellers manage their medicine inventory and fulfill orders. Admins oversee the platform and manage all users and listings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors/>
        </ThemeProvider>
      </body>
    </html>
  );
}
