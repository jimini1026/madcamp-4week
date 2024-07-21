import { Inter, Fira_Code as FontMono } from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import { Providers } from "./providers";
import ClientNavigation from "./clientNavigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = FontMono({ subsets: ["latin"], variable: "--font-geist-mono" });

export default function RootLayout({ children }) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${inter.variable} ${fontMono.variable} font-sans`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={clsx("min-h-screen bg-background antialiased")}>
        <ClientNavigation />
        <Providers themeProps={{ attribute: "class", defaultTheme: "light" }}>
          <main className="relative flex flex-col h-screen w-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
