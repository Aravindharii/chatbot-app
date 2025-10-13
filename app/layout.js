import './globals.css'

export const metadata = {
  title: 'AI ChatBot',
  description: 'A modern ChatGPT-like chatbot interface',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="h-screen bg-gray-50" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
