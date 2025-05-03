'use client'

import { useEffect, useState } from "react";
import { IoBookOutline, IoFilmOutline, IoGameControllerOutline, IoHappyOutline, IoLanguageOutline, IoLeafOutline, IoMegaphoneOutline, IoMicOutline } from "react-icons/io5";
import type { ServiceType } from "~/types/services";
import { GenerateButton } from "../generate-button";
import { generateStatus, generateTextToSpeech } from "~/app/actions/generate-speech";
import { useVoiceStore } from "~/store/voice-store";
import { useAudioStore } from "~/store/audio-store";
import toast from "react-hot-toast";

const DEFAULT_PLACEHOLDER_TEXT = "Start typing here or paste any text you want to turn into lifelike speech..."

const TEMPLATE_TEXTS = {
  "Narrate a story":
    "Once upon a time in a forest shrouded in mist, a young adventurer discovered an ancient doorway hidden beneath twisted roots. As they reached out to touch the weathered stone, the forest fell silent. What secrets would be revealed beyond this mysterious threshold?",
  "Tell a silly joke":
    "Why don't scientists trust atoms? Because they make up everything! Speaking of making things up, I once convinced my friend that the moon was just the back of the sun. He believed me until nighttime when both were visible in the sky.",
  "Record an advertisement":
    "Introducing TranquilSleep, the revolutionary mattress designed with cutting-edge comfort technology. Experience the perfect balance of support and softness that adapts to your body. Wake up refreshed and energized every morning! Order now and get 30% off your first purchase.",
  "Speak in different languages":
    "Hello! Hola! Bonjour! Ciao! Konnichiwa! Guten Tag! I can help you communicate your message in multiple languages. Perfect for reaching a global audience or adding an international flair to your content.",
  "Direct a dramatic movie scene":
    "The rain beats against the windows as Sarah stares at the faded photograph. 'I never thought it would end this way,' she whispers, her voice barely audible above the storm. Behind her, the door slowly opens. 'It doesn't have to,' says a familiar voice she never expected to hear again.",
  "Hear from a video game character":
    "Greetings, adventurer! I am Captain Varrick of the Starship Horizon. Our mission to explore the outer reaches of the Andromeda galaxy has led us to this mysterious planet. The energy readings are off the charts, and we need your help to investigate the ancient ruins ahead.",
  "Introduce your podcast":
    "Welcome to 'Unexplained Phenomena,' the podcast where we explore the mysteries that science has yet to solve. I'm your host, Alex Morgan, and today we're diving into the fascinating world of synchronicity – those meaningful coincidences that seem to defy the laws of probability.",
  "Guide a meditation class":
    "Settle into a comfortable position and gently close your eyes. Take a deep breath in through your nose, filling your lungs completely. Hold for a moment, and then exhale slowly through your mouth, releasing any tension you've been carrying. Feel your body becoming heavier with each breath, melting into the surface beneath you.",
};

const SAMPLE_CONTENTS = [
  { text: "Narrate a story", icon: <IoBookOutline /> },
  { text: "Tell a silly joke", icon: <IoHappyOutline /> },
  { text: "Record an advertisement", icon: <IoMegaphoneOutline /> },
  { text: "Speak in different languages", icon: <IoLanguageOutline /> },
  { text: "Direct a dramatic movie scene", icon: <IoFilmOutline /> },
  { text: "Hear from a video game character", icon: <IoGameControllerOutline /> },
  { text: "Introduce your podcast", icon: <IoMicOutline /> },
  { text: "Guide a meditation class", icon: <IoLeafOutline /> },
]

export function TextToSpeechEditor({
  service, credits
}: {
    service: ServiceType,
    credits: number
}) {
  const [textContent, setTextContent] = useState("")
  const [activePlaceholder, setActivePlaceholder] = useState(DEFAULT_PLACEHOLDER_TEXT)
  const [loading, setLoading] = useState(false)
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null)
  const playAudio = useAudioStore(state => state.playAudio)

  const getSelectedVoice = useVoiceStore(state => state.getSelectedVoice)
  const selectedVoice = getSelectedVoice("styletts2")

  useEffect(() => {
    if (!currentAudioId || !loading || !selectedVoice) return

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
            voice: selectedVoice.id,
            duration: "0:30",
            progress: 0,
            service: service,
            createdAt: new Date().toLocaleDateString()
          }

          playAudio(newAudio)
          setCurrentAudioId(null)
        }
        else if (!status.success) {
          console.log("Text to Speech failed")
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
  }, [currentAudioId, loading, playAudio, selectedVoice, service, textContent])

  const handleButtonHover = (text: string) => {
    setActivePlaceholder(TEMPLATE_TEXTS[text as keyof typeof TEMPLATE_TEXTS])
  }

  const handleButtonClick = (text: string) => {
    setTextContent(TEMPLATE_TEXTS[text as keyof typeof TEMPLATE_TEXTS])
  }

  const handleGenerateSpeech = async () => {
    if (textContent.trim().length === 0 || !selectedVoice) return
    try {
      setLoading(true)

      const { audioId, shouldShowThrottleAlert } = await generateTextToSpeech(textContent, selectedVoice.id)
      if (shouldShowThrottleAlert) {
        toast("Exceeding 3 requests per minute will queue your requests")
      }
      setCurrentAudioId(audioId)
    } catch (error) {
      console.error("Error generating speech:", error)
      setLoading(false)
    }
  }

  return <>
    <textarea
      value={textContent}
      placeholder={activePlaceholder}
      onChange={(e) => setActivePlaceholder(e.target.value)}
      className="w-full flex-grow resize-none rounded-lg bg-white placeholder:font-light placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:ring-black"
    />

    <div className="mt-4 px-0">
      {textContent.length === 0 ? (
        <div className="mt-auto">
          <p className="mb-2 text-sm text-gray-500">
            Get started with
          </p>

          <div className="flex flex-wrap gap-2">
            {
              SAMPLE_CONTENTS.map(({text, icon}) => (
                <button
                  key={text}
                  onClick={() => handleButtonClick(text)}
                  onMouseEnter={() => handleButtonHover(text)}
                  onMouseLeave={() => setActivePlaceholder(DEFAULT_PLACEHOLDER_TEXT)}
                  className="flex items-center justify-start rounded-lg-border border-gray-200 bg-white p-2 text-xs hover:bg-gray-50"
                >
                  <span className="mr-2 text-gray-500">{icon}</span>
                  {text}
                </button>
              ))
            }
          </div>
        </div>
      ) : (
        <GenerateButton
          onGenerate={handleGenerateSpeech}
          isDisabled={
            textContent.length > 5000 ||
            textContent.trim().length === 0 ||
            loading
          }
          isLoading={loading}
          showDownload={true}
          creditsRemaining={credits}
          showCredits={true}
          characterCount={textContent.length}
          characterLimit={5000}
        />
      )}
    </div>
  </>
}