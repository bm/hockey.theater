import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Navbar } from "@/components/layout/Navbar";
import { FavoriteTeamModal } from "@/components/layout/FavoriteTeamModal";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "hockey.theater",
    template: "%s | hockey.theater",
  },
  description:
    "Browse NHL game highlights, recaps, and goal clips. Spoiler-free, free forever.",
  openGraph: {
    title: "hockey.theater",
    description: "Browse NHL game highlights, recaps, and goal clips.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${dmSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <FavoriteTeamModal />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
