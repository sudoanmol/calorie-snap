import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calorie Snap",
  description: "Snap your food, log calories & macros automatically.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Calorie Snap",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground min-h-full overscroll-none font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <ServiceWorkerRegister />
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
