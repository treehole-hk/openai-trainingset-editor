import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'OpenAI Fine-tune JSONL Editor',
  description: 'Edit your OpenAI fine-tune JSONL files',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full w-full">
      <body className={`${inter.className} h-full w-full`}>{children}</body>
    </html>
  )
}

