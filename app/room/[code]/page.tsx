import { RoomView } from "@/components/room/room-view"

type Props = {
  params: Promise<{ code: string }>
  searchParams: Promise<{ pid?: string; created?: string }>
}

export default async function RoomPage({ params, searchParams }: Props) {
  const { code } = await params
  const { pid, created } = await searchParams

  return (
    <div className="min-h-screen bg-background">
      <RoomView code={code} participantId={pid} showShareDialog={created === "1"} />
    </div>
  )
}
