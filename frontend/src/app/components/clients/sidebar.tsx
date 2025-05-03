'use client'

import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { IoChatboxOutline, IoMicOutline, IoMusicalNoteOutline, IoPersonOutline, IoPinOutline } from "react-icons/io5"

export default function Sidebar({isMobile = false}: {isMobile?: boolean}) {
  const pathname = usePathname()

  const [isPinned, setIsPinned] = useState<boolean>(true)
  const [isHovered, setIsHovered] = useState<boolean>(false)

  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  const isExpanded = isMobile || isPinned || isHovered

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setShowAccountMenu(false)
  }

  return (
    <div
      className={`${isExpanded ? "w-64" : "w-16"} flex flex-col h-full border-r border-gray-200 bg-white px-3 py-4 transition-all duration-300`}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      <div
        className="flex items-center justify-between"
      >
        <h1
          className={`text-xl font-bold ${!isExpanded && "hidden"}`}
        >
            10TenLabs
        </h1>
        {!isMobile && (
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100`}
            title={isPinned ? "Unpinned sidebar" : "Pinned sidebar"}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center transition-all ${isPinned ? "rounded-lg bg-gray-200": "text-gray-500"}`}
            >
              {isExpanded
                ? <IoPinOutline className="h-5 w-5"/>
                : (
                  <div className="flex h-fit w-fit items-center justify-center rounded-lg bg-white px-3 py-2 shadow">
                    <span className="text-black text-lg font-bold">10</span>
                  </div>
                )}
            </div>
          </button>
        )}
      </div>
      {/* Navigation */}
      <nav className="mt-8 flex flex-1 flex-col">
        <SectionHeader isExpanded={isExpanded}>Playground</SectionHeader>
        <SidebarButton
          icon={<IoChatboxOutline />}
          isExpanded={isExpanded}
          isActive={pathname.includes("/app/speech-synthesis/text-to-speech")}
          href="/app/speech-synthesis/text-to-speech"
        >
            Text To Speech
        </SidebarButton>
        <SidebarButton
          icon={<IoMicOutline />}
          isExpanded={isExpanded}
          isActive={pathname.includes("/app/speech-synthesis/speech-to-speech")}
          href="/app/speech-synthesis/speech-to-speech"
        >
            Voice Changer
        </SidebarButton>
        <SidebarButton
          icon={<IoMusicalNoteOutline />}
          isExpanded={isExpanded}
          isActive={pathname.includes("/app/sound-effects/generate")}
          href="/app/sound-effects/generate
          "
        >
            Sound Effects
        </SidebarButton>
      </nav>

      {/* Bottom section */}
      <div className="relative mt-auto" ref={accountMenuRef}>
        <button
          className="flex w-full items-center rounded-lg px-2.5 py-2 text-sm text-gray-600"
          onClick={() => setShowAccountMenu(!showAccountMenu)}
        >
          <div
            className="flex h-5 w-5 flex-shrink-0 items-center justify-center"
          ><IoPersonOutline/>
          </div>
          <div
            className={`ml-3 overflow-hidden transition-all duration-300 ${isExpanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}
            style={ {whiteSpace: "nowrap"} }
          >
            My Account
          </div>
        </button>

        {showAccountMenu && (
          <div className="absolute bottom-12 left-0 z-10 min-w-[180px] rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            <button
              onClick={handleSignOut}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign Out</button>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionHeader({
  children, isExpanded
}: {
    children: React.ReactNode,
    isExpanded: boolean
}) {
  return <div className="mb-2 mt-4 h-6 pl-4">
    <span className={`text-sm text-gray-500 transition-opacity ${isExpanded ? "opacity-100" : "opacity-0"}`}>
      {children}
    </span>
  </div>
}

function SidebarButton({
  icon, children, isExpanded, isActive, href
} : {
  icon: React.ReactNode,
  children: React.ReactNode,
  isExpanded: boolean,
  isActive: boolean,
  href: string
}) {
  return <Link
    href={href}
    className={`flex w-full items-center rounded-lg px-2.5 py-2 text-sm transition-colors ${isActive ? "bg-gray-100 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
  >
    <div
      className="flex w-5 h-5 flex-shrink-0 items-center justify-center"
    >
      {icon}
    </div>
    <div
      className={`ml-3 overflow-hidden transition-all duration-300 ${isExpanded ? "w-auto : opacity-100" : "w-0 opacity-0"}`}
      style={ {whiteSpace: "nowrap"} }
    >
      {children}
    </div>
  </Link>
}