import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface Member {
  id: string;
  name: string;
  number: number;
}

interface Team {
  id: string;
  name: string;
  members: Member[];
}

interface SetInfo {
  name: string;
  teamA: Team;
  teamB: Team;
}

const MatchTimeline: React.FC<{ setInfo: SetInfo }> = ({ setInfo }) => {
  const [timeline, setTimeline] = useState<string[]>([]);
  const [selectedScorer, setSelectedScorer] = useState<string>("");
  const [selectedAssist, setSelectedAssist] = useState<string>("");
  const [eventType, setEventType] = useState<"goal" | "assist" | "ownGoal">("goal");

  const allPlayers = [...setInfo.teamA.members, ...setInfo.teamB.members];

  const handleRecord = () => {
    const scorer = allPlayers.find((p) => p.id === selectedScorer);
    const assist = allPlayers.find((p) => p.id === selectedAssist);
    const time = new Date().toLocaleTimeString();

    let text = "";
    if (eventType === "goal") {
      text = `${scorer?.name} (${scorer?.number}) 골! ${assist ? `도움: ${assist.name}` : ""}`;
    } else if (eventType === "assist") {
      text = `${assist?.name} (${assist?.number}) 어시스트 기록`;
    } else {
      text = `${scorer?.name} (${scorer?.number}) 자책골`;
    }

    setTimeline((prev) => [...prev, `${time} - ${text}`]);
    setSelectedScorer("");
    setSelectedAssist("");
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-bold">경기 이벤트 기록</h2>
          <div className="flex gap-2 items-center">
            <Select value={eventType} onValueChange={(v) => setEventType(v as any)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="이벤트 종류" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goal">골</SelectItem>
                <SelectItem value="assist">어시스트</SelectItem>
                <SelectItem value="ownGoal">자책골</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedScorer} onValueChange={setSelectedScorer}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="득점자" />
              </SelectTrigger>
              <SelectContent>
                {allPlayers.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{`${p.number} ${p.name}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {eventType === "goal" && (
              <Select value={selectedAssist} onValueChange={setSelectedAssist}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="어시스트" />
                </SelectTrigger>
                <SelectContent>
                  {allPlayers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{`${p.number} ${p.name}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button onClick={handleRecord}>기록</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">타임라인</h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {timeline.map((line, idx) => (
              <div key={idx} className="text-sm border-b py-1">
                {line}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchTimeline;
