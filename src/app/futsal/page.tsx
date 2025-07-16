'use client';

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// redeploy test
export default function FutsalDashboard() {
  interface Team {
    name: string;
    score: number;
    timeline: string[];
  }

  const [teams, setTeams] = useState<Team[]>([
    { name: "Team A", score: 0, timeline: [] },
    { name: "Team B", score: 0, timeline: [] },
  ]);
  const [event, setEvent] = useState("");

  const addScore = (index: number) => {
    const newTeams = [...teams];
    newTeams[index].score += 1;
    newTeams[index].timeline.push(`+1점 (시간: ${new Date().toLocaleTimeString()})`);
    setTeams(newTeams);
  };

  const addEvent = (index: number) => {
    if (!event.trim()) return;
    const newTeams = [...teams];
    newTeams[index].timeline.push(`${event} (시간: ${new Date().toLocaleTimeString()})`);
    setTeams(newTeams);
    setEvent("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {teams.map((team, idx) => (
        <Card key={idx} className="rounded-2xl shadow-xl">
          <CardContent className="space-y-4 p-4">
            <h2 className="text-xl font-bold text-center">{team.name}</h2>
            <div className="text-6xl text-center font-semibold">{team.score}</div>
            <div className="flex space-x-2">
              <Button className="w-full" onClick={() => addScore(idx)}>
                +1점
              </Button>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="기록 추가 (예: 파울, 슛 등)"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
              />
              <Button className="w-full" variant="secondary" onClick={() => addEvent(idx)}>
                기록 추가
              </Button>
            </div>
            <div className="h-40 overflow-y-auto border-t pt-2 text-sm">
              <h3 className="font-semibold mb-1">타임라인</h3>
              {team.timeline.map((entry, i) => (
                <div key={i} className="border-b py-1">{entry}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
