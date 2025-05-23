import { Outlet } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'

export default function RootLayout() {
  return (
    <div className="flex flex-col w-full h-full bg-black text-white">
      <Navbar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
} 