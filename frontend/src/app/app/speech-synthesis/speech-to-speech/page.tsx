import { PageLayout } from "~/app/components/clients/page-layout";
import { getHistoryItems } from "~/lib/history";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { TextToSpeechEditor } from "../../../components/clients/speech-synthesis/text-to-speech-editor";
import { VoiceChanger } from "~/app/components/clients/speech-synthesis/voice-changer";

export default async function SpeechToSpeechPage() {
  const session = await auth()
  const userId = session?.user.id

  let credits = 0

  if (userId) {
    const user = await db.user.findUnique({
      where: {
        id: userId
      },
      select: {
        credits: true
      }
    })
    credits = user?.credits ?? 0
  }

  const service = "seed-vc"

  const historyItems = await getHistoryItems(service)

  return (
    <PageLayout
      title="Voice changer"
      service={service}
      historyItems={historyItems}
    >
      <VoiceChanger credits={credits} service={service}/>
    </PageLayout>
  )
}
