import "./globals.css";

export const metadata = {
  title: 'AI Coach',
  description: 'Basketball Coaching built with Llama A.I',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
