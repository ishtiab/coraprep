import './globals.css'
import { ReactNode } from 'react'
import { AppProvider } from '../context/AppContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CoraChatbot from '../components/CoraChatbot'
import StreakToast from '../components/StreakToast'

export const metadata = {
  title: 'Cora Prep',
  description: 'Train smarter for Brain Bee',
}

export default function RootLayout({ children }: { children: ReactNode }){
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <div className="min-h-screen bg-bg text-slate-900 pt-20">
            <Navbar />
            <main>{children}</main>
            <Footer />
            <CoraChatbot />
            <StreakToast />
          </div>
        </AppProvider>
      </body>
    </html>
  )
}
