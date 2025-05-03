import { PageLayout } from "~/app/components/clients/page-layout";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { SoundEffectsGenerator } from "~/app/components/clients/sound-effects/sound-effect-generator";

export default async function SoundEffectsGeneratorPage() {
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

  const service = "make-an-audio"

  const soundEffectsTab = [
    { name: "Generate", path: "/app/sound-effects/generate" },
    { name: "History", path: "/app/sound-effects/history" },
  ]

  return (
    <PageLayout
      title="Sound effects"
      showSidebar={false}
      tabs={soundEffectsTab}
      service={service}
    >
      <SoundEffectsGenerator credits={credits} />
    </PageLayout>
  )
}
