import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pomodoro Timer',
  description: 'A beautiful, minimal Pomodoro productivity timer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&family=Sora:wght@500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-background-light text-text-primary">
        {children}
      </body>
    </html>
  )
}
