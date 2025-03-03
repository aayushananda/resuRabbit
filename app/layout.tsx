// app/layout.tsx
import Providers from './providers'
import './globals.css'

export const metadata = {
  title: 'ResuRabbit',
  description: 'Resume Management App',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}