'use client'

import { useEffect, useRef, useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { useVoiceStore } from "~/store/voice-store";
import type { ServiceType } from "~/types/services";

export function VoiceSelector({service} : {service: ServiceType}) {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const getVoices = useVoiceStore((state) => state.getVoices)
  const getSelectedVoice = useVoiceStore((state) => state.getSelectedVoice)
  const selectVoice = useVoiceStore((state) => state.selectVoice)

  const voices = getVoices(service)
  const selectedVoice = getSelectedVoice(service)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside)
      }
    }

    return () => {
      document.addEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return <div className="relative mt-2" ref={dropdownRef}>
    <div
      onClick={() => setIsOpen(!isOpen)}
      className="flex items-center justify-between border-gray-200 rounded-xl border px-3 py-2 hover:cursor-pointer hover:bg-gray-100/30"
    >
      <div className="flex items-center">
        <div className="relative mr-2.5 flex h-4 w-4 items-center justify-center rounded-full" style={{ background: selectedVoice?.gradientColors }} />
        <span className="text-sm">{selectedVoice?.name ?? "No voice selected"}</span>
      </div>
      {isOpen
        ? <IoChevronUp className="h-4 w-4 text-gray-400" />
        : <IoChevronDown className="h-4 w-4 text-gray-400" />
      }
    </div>
    {isOpen && (
      <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
        {voices.map((voice) => (
          <div
            onClick={() => {
              selectVoice(service, voice.id)
              setIsOpen(false)
            }}
            key={voice.id}
            className={`flex items-center px-3 py-2 hover:cursor-pointer hover:bg-gray-100 ${voice.id === selectedVoice?.id ? "bg-gray-50" : ""}`}
          >
            <div
              className="relative mr-2 h-4 w-4 items-center justify-center overflow-hidden rounded-full"
              style={{ background: voice.gradientColors }}
            />
            <span className="text-sm">{voice.name}</span>
          </div>))}
      </div>
    )}
  </div>
}