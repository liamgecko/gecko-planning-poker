"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateRoomForm } from "./create-room-form"
import { JoinRoomForm } from "./join-room-form"

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <main className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img
            src="/gecko-poker.svg"
            alt="Planning Poker"
            className="mx-auto h-6 w-auto"
          />
          <h1 className="mt-8 text-3xl font-semibold tracking-tight">
            Planning Poker
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create a room or join with a room ID to start estimating.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Room</TabsTrigger>
              <TabsTrigger value="join">Join Room</TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="mt-6">
              <h2 className="mb-4 text-lg font-medium">Create a new room</h2>
              <CreateRoomForm />
            </TabsContent>
            <TabsContent value="join" className="mt-6">
              <h2 className="mb-4 text-lg font-medium">Enter room ID</h2>
              <JoinRoomForm />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
