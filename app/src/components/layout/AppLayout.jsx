import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomTabBar from './BottomTabBar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 pb-16 lg:pb-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      <BottomTabBar />
    </div>
  )
}
