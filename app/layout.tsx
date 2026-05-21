import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Onboarding Revamp",
  description: "Made with Claude",
  openGraph: {
    title: "Onboarding Revamp",
    description: "Made with Claude",
  },
  twitter: {
    card: "summary",
    title: "Onboarding Revamp",
    description: "Made with Claude",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
