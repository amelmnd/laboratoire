import { AuthProvider } from '../context/AuthProvider'
import Header from '../components/Header/Header'

import '../styles/globals.css'

export const metadata = {
  title: 'Amel M - Laboratoire',
  description: "Mon laboratoire de test et d'expérimentation",
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Playwrite+HU&family=Lora&family=Montserrat&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Header />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
