import AuthProvider from "@/components/auth-provider";
import { TRPCReactProvider } from "@/trpc/client";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

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
    default: "Unlovable - AI-Powered Web Development Platform",
    template: "%s | Unlovable",
  },
  description:
    "Build full-stack web applications instantly with AI. Unlovable generates production-ready Next.js code, complete with components, styling, and interactivity - all from simple text prompts.",
  keywords: [
    "AI code generation",
    "web development",
    "Next.js builder",
    "AI website creator",
    "no-code platform",
    "React components",
    "Tailwind CSS",
    "shadcn/ui",
    "automated coding",
    "web app builder",
  ],
  authors: [{ name: "ucokman" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TRPCReactProvider>
              {children}
              <Toaster />
            </TRPCReactProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
