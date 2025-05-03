'use client'

import { useEffect, useState } from "react"
import { useAudioStore } from "~/store/audio-store"
import { GenerateButton } from "../generate-button"
import { BiDoorOpen } from "react-icons/bi"
import { IoCarSportOutline, IoThunderstormOutline, IoLeafOutline, IoPeopleOutline, IoWaterOutline, IoHardwareChipOutline, IoAirplaneOutline } from "react-icons/io5"
import { generateSoundEffect, generateStatus } from "~/app/actions/generate-speech"
import toast from "react-hot-toast"

const MAX_CHARACTERS = 500

const DEFAULT_PLACEHOLDER_TEXT = "Describe your sound effect and then click generate..."

const SAMPLE_EFFECTS = [
  { text: "Car engine revving", icon: <IoCarSportOutline /> },
  { text: "Heavy rainstorm", icon: <IoThunderstormOutline /> },
  { text: "Forest ambience", icon: <IoLeafOutline /> },
  { text: "Stadium crowd cheering", icon: <IoPeopleOutline /> },
  { text: "Ocean waves", icon: <IoWaterOutline /> },
  { text: "Robot sounds", icon: <IoHardwareChipOutline /> },
  { text: "Creaky door", icon: <BiDoorOpen /> },
  { text: "Helicopter flyby", icon: <IoAirplaneOutline /> },
]

const TEMPLATE_TEXTS = {
  "Car engine revving":
    "A powerful sports car engine revving up, starting low and building to a high-pitched roar with the sound of turbocharger spooling",
  "Heavy rainstorm":
    "Heavy rain pouring down with occasional thunder in the background, rain hitting windows and roof",
  "Forest ambience":
    "Peaceful forest sounds with birds chirping, leaves rustling in the wind, and a small stream flowing nearby",
  "Stadium crowd cheering":
    "A large stadium crowd erupting in cheers and applause after a goal or touchdown, with whistles and horns",
  "Ocean waves":
    "Ocean waves crashing against a rocky shore, with the rhythmic sound of water rushing in and receding",
  "Robot sounds":
    "Futuristic robot powering up with mechanical servo sounds, beeps, and electronic processing noises",
  "Creaky door":
    "Old wooden door slowly opening with an eerie creak, hinges squeaking in a haunted house",
  "Helicopter flyby":
    "Helicopter approaching from a distance, passing overhead with loud rotor blades, then flying away",
};

export function SoundEffectsGenerator({ credits }: { credits: number }) {
  const [textContent, setTextContent] = useState("")
  const [activePlaceholder, setActivePlaceholder] = useState(DEFAULT_PLACEHOLDER_TEXT)

  const [isFocus, setIsFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null)

  const playAudio = useAudioStore(state => state.playAudio)

  const isTextEmpty = textContent.trim() === ""

  useEffect(() => {
    if (!currentAudioId || !loading) return

    const pollInterval = setInterval(async () => {
      try {
        const status = await generateStatus(currentAudioId)

        if (status.success && status.audioUrl) {
          clearInterval(pollInterval)
          setLoading(false)

          const newAudio = {
            id: currentAudioId,
            title: textContent.substring(0, 50) + (textContent.length > 50 ? "..." : ""),
            audioUrl: status.audioUrl,
            voice: "",
            duration: "0:30",
            progress: 0,
            service: "make-an-audio",
            createdAt: new Date().toLocaleDateString()
          }

          playAudio(newAudio)
          setCurrentAudioId(null)
        }
        else if (!status.success) {
          console.log("Sound effect generation failed")
          clearInterval(pollInterval)
          setLoading(false)
          setCurrentAudioId(null)
        }
      } catch (error) {
        console.error(`Error polling for audio status: ${error}`)
        clearInterval(pollInterval)
        setLoading(false)
        setCurrentAudioId(null)
      }
    }, 5)

    return () => {
      clearInterval(pollInterval)
    }
  }, [currentAudioId, loading, playAudio, textContent])

  const handleGenerateSoundEffect = async () => {
    if (isTextEmpty) return

    try {
      setLoading(true)

      const { audioId, shouldShowThrottleAlert } = await generateSoundEffect(textContent)
      if (shouldShowThrottleAlert) {
        toast("Exceeding 3 requests per minute will queue your requests")
      }
      setCurrentAudioId(audioId)
    } catch (error) {
      console.error(`Error generating sound effect: ${error}`)
      setLoading(false)
    }
  }

  return <>
    <div className="relative  flex flex-col h-full w-full items-center">
      {/* <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 transform">
        <div
          className="h-[200px] w-full"
        ></div>
      </div> */}
      <div className="relative z-10 flex flex-col h-full w-full items-center gap-10 md:pt-10">
        <div className={`h-fit w-full max-w-2xl rounded-xl border bg-white p-4 shadow-xl transition-colors duration-200 ${isFocus ? "border-black" : "border-gray-200"}`}>
          <div className="flex flex-col">
            <textarea
              value={textContent}
              onChange={(e) => {
                const text = e.target.value
                if (text.length <= MAX_CHARACTERS) {
                  setTextContent(text)
                }
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              maxLength={MAX_CHARACTERS}
              placeholder={activePlaceholder}
              className="h-16 resize-none rounded-md p-2 placeholder:font-light placeholder:border-none focus:outline-none focus:ring-0"
            />
            <div className="mt-1 flex w-full justify-end">
              <span className="text-xs text-gray-400">
                {textContent.length}/{MAX_CHARACTERS}
              </span>
            </div>
            <div className="mt-3 flex justify-end">
              <GenerateButton
                onGenerate={handleGenerateSoundEffect}
                isDisabled={isTextEmpty || loading}
                isLoading={loading}
                buttonText="Generate Sound Effect"
                showDownload={false}
                fullWidth={false}
                creditsRemaining={credits}
              />
            </div>
          </div>
        </div>

        <div className="h-fit w-full max-w-2xl rounded-xl border border-gray-200 p-4 shadow-lg">
          <p className="p-2 text-center text-sm text-gray-500">
            Try a sound effect
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_EFFECTS.map(({ text, icon }) => (
              <button
                key={text}
                onMouseEnter={() => setActivePlaceholder(TEMPLATE_TEXTS[text as keyof typeof TEMPLATE_TEXTS])}
                onMouseLeave={() => setActivePlaceholder(DEFAULT_PLACEHOLDER_TEXT)}
                onClick={() => {
                  const content = TEMPLATE_TEXTS[text as keyof typeof TEMPLATE_TEXTS]
                  if (content.length <= MAX_CHARACTERS) {
                    setTextContent(content)
                  } else {
                    setTextContent(content.substring(0, MAX_CHARACTERS))
                  }
                }}
                className="flex items-center rounded-lg border border-gray-200 bg-white p-2 text-xs hover:bg-gray-50"
              >
                <span className="mr-2 text-gray-500">{icon}</span>
                {text}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  </>
}