"use client";

import { HackathonHeader } from "@/types/hackathons";
import { Crown } from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import TrackCard from "../TrackCard";
import TrackDialogContent from "../TrackDialogContent";

function Tracks({ hackathon }: { hackathon: HackathonHeader }) {
  return (
    <section>
      <h2 className="text-4xl font-bold mb-8" id="tracks">
        Tracks
      </h2>
      <Separator className="my-8 bg-zinc-300 dark:bg-zinc-800" />
      <div className="relative py-32 mt-24 grid">
        <div className="absolute -z-10 w-screen h-full left-1/2 transform -translate-x-1/2 bg-zinc-200" />
        <Card className="w-[200px] sm:w-[356px] absolute top-[-80px] left-1/2 transform -translate-x-1/2  bg-red-300 rounded-xl border-2 border-red-500">
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <div className="p-2 rounded-full bg-white">
              <Crown color="#FF394A" />
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-zinc-900">
                ${(hackathon.total_prizes || 0).toLocaleString("en-US")}
              </span>
              <span className="text-sm text-zinc-900">Total price pool</span>
            </div>
          </CardContent>
        </Card>
        <div>
          <h4 className="text-4xl font-bold mb-8 text-black">What to build</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hackathon.content?.tracks?.map((track, index) => (
              <Dialog key={index}>
                <DialogTrigger>
                  <TrackCard key={index} track={track} />
                </DialogTrigger>
                <DialogContent className="dark:bg-zinc-900 bg-zinc-50 border-2">
                  <DialogTitle />
                  <TrackDialogContent track={track} />
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Tracks;
