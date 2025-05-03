import { PageLayout } from "~/app/components/clients/page-layout";
import { getHistoryItems } from "~/lib/history";
import { HistoryList } from "~/app/components/clients/sound-effects/history-list";

export default async function SoundEffectsHistoryPage() {
  const service = "make-an-audio"

  const soundEffectsTab = [
    { name: "Generate", path: "/app/sound-effects/generate" },
    { name: "History", path: "/app/sound-effects/history" },
  ]

  const historyItems = await getHistoryItems(service)

  return (
    <PageLayout
      title="Sound effects"
      showSidebar={false}
      tabs={soundEffectsTab}
      service={service}
    >
      <HistoryList historyItems={historyItems}/>
    </PageLayout>
  )
}
