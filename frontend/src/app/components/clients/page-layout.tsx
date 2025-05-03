'use client'

import type { ServiceType } from "~/types/services"
import Sidebar from "./sidebar"
import { useEffect } from "react"
import { useUIStore } from "~/store/ui-store"
import { IoClose, IoMenu } from "react-icons/io5"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SpeechSidebar } from "./speech-synthesis/right-sidebar"
import type { HistoryItem } from "~/lib/history"
import Playbar from "./playbar"
import { useAudioStore } from "~/store/audio-store"
import { MobileSettingButton } from "./speech-synthesis/mobile-setting-button"

interface TabItem {
    name: string
    path: string
}

interface PageLayoutProps {
    children: React.ReactNode
    service: ServiceType
    title: string
    tabs?: TabItem[]
    showSidebar?: boolean
    historyItems?: HistoryItem[]
}

export function PageLayout({
  children,
  service,
  title,
  tabs,
  showSidebar = true,
  historyItems
}: PageLayoutProps) {
  const pathname = usePathname()

  const {
    isMobileDrawerOpen,
    isMobileScreen,
    toggleMobileDrawer,
    setMobileScreen,
    toggleMobileMenu,
  } = useUIStore()

  const currentAudio = useAudioStore((state) => state.currentAudio)

  useEffect(() => {
    const checkScreenSize = () => {
      setMobileScreen(window.innerWidth < 1024)
    }
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [setMobileScreen])

  return (
    <div className="flex h-screen">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {isMobileScreen && isMobileDrawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/30" />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className="relative h-full w-64 bg-white shadow-log"
        >
          <button
            onClick={toggleMobileDrawer}
            className="absolute right-2 top-2 rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <IoClose />
          </button>
          <Sidebar isMobile={true}/>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex h-16 items-center px-4">
            {isMobileScreen && (
              <button
                onClick={toggleMobileDrawer}
                className="mr-3 rounded-lg hover:bg-gray-100 lg:hidden"
              ><IoMenu className="h-6 w-6"/>
              </button>
            )}
            <h1 className="text-md font-semibold">{title}</h1>

            {tabs && tabs.length > 0 && (
              <div className="ml-4 flex items-center">
                {tabs.map((tab) => (
                  <Link
                    key={tab.path}
                    href={tab.path}
                    className={`mr-2 rounded-lg px-3 py-2 text-sm transition-colors duration-200 ${pathname === tab.path ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {tab.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="flex h-full">
            <div className="flex-1 px-6 py-5">
              <div className="flex flex-col h-full">{children}</div>
            </div>
            {showSidebar && service && (
              <SpeechSidebar
                historyItems={historyItems}
                service={service}
              />
            )}
          </div>
        </div>

        {isMobileScreen && !pathname.includes("/app/sound-effects") &&
          <MobileSettingButton toggleMobileMenu={toggleMobileMenu} />
        }

        {currentAudio && <Playbar />}
      </div>
    </div>
  )
}