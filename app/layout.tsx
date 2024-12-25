import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OpenAI Fine-tune Training Set Editor',
  description: 'A free, open-source web-based editor for OpenAI fine-tuning JSONL files. Edit and prepare your training data with a simple interface.',
  keywords: ['OpenAI', 'fine-tuning', 'JSONL', 'editor', 'training data', 'AI', 'machine learning'],
  authors: [{ name: 'Bary Huang' }],
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        url: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    apple: {
      url: '/apple-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
  },
  openGraph: {
    title: 'OpenAI Fine-tune Training Set Editor',
    description: 'A free, open-source web-based editor for OpenAI fine-tuning JSONL files',
    url: 'https://jsonleditor.org',
    siteName: 'OpenAI Fine-tune Editor',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenAI Fine-tune Training Set Editor',
    description: 'A free, open-source web-based editor for OpenAI fine-tuning JSONL files',
    creator: '@buryhuang',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

