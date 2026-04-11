import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Luntian Log Cabin — Tagaytay's Nature Retreat",
  description: "A nature-inspired boutique retreat in Tagaytay. Sunrise Room, Leaf Room & 2BR Suite. Pet-friendly with premium packages for romance, family and wellness.",
  keywords: "Tagaytay staycation, log cabin, Luntian, Asisan Tagaytay, nature retreat, pet-friendly",
  openGraph: {
    title: "Luntian Log Cabin — Tagaytay's Nature Retreat",
    description: "Private rooms in a cozy nature cabin. Direct bookings available.",
    images: ['/og-image.jpg'],
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;1,500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
