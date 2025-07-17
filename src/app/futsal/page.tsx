"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { v4 as uuidv4 } from 'uuid';

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

type EventType = "goal" | "assist" | "ownGoal";

const MatchTimeline: React.FC<{ sets?: SetInfo[] }> = ({ sets: initialSets = [] }) => {
  const [sets, setSets] = useState<SetInfo[]>(initialSets);
  const [selectedSetIndex, setSelectedSetIndex] = useState(0);

  const selectedSet = sets[selectedSetIndex] ?? {
    name: "세트 1",
    teamA: { id: "", name: "팀 A", members: [] },
    teamB: { id: "", name: "팀 B", members: [] },
  };

  const [timeline, setTimeline] = useState<string[][]>(initialSets.map(() => []));
  const [selectedScorer, setSelectedScorer] = useState<string>("");
  const [selectedAssist, setSelectedAssist] = useState<string>("");
  const [eventType, setEventType] = useState<EventType>("goal");

  const allPlayers = [...selectedSet.teamA.members, ...selectedSet.teamB.members];

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

    const updatedTimeline = [...timeline];
    updatedTimeline[selectedSetIndex].push(`${time} - ${text}`);
    setTimeline(updatedTimeline);
    setSelectedScorer("");
    setSelectedAssist("");
  };

  const handleAddSet = () => {
    const newSet: SetInfo = {
      name: `세트 ${sets.length + 1}`,
      teamA: { id: uuidv4(), name: "팀 A", members: [] },
      teamB: { id: uuidv4(), name: "팀 B", members: [] },
    };
    setSets([...sets, newSet]);
    setTimeline([...timeline, []]);
    setSelectedSetIndex(sets.length);
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">세트 선택</h2>
            <Button onClick={handleAddSet}>세트 추가</Button>
          </div>
          <Select value={String(selectedSetIndex)} onValueChange={(v) => setSelectedSetIndex(Number(v))}>
            <SelectTrigger className="w-60">
              <SelectValue placeholder="세트를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {sets.map((s, idx) => (
                <SelectItem key={idx} value={String(idx)}>{`${idx + 1}세트: ${s.teamA.name} vs ${s.teamB.name}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-bold">경기 이벤트 기록</h2>
          <div className="flex gap-2 items-center">
            <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
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
            {timeline[selectedSetIndex]?.map((line, idx) => (
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
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { v4 as uuidv4 } from 'uuid';

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

type EventType = "goal" | "assist" | "ownGoal";

const MatchTimeline: React.FC<{ sets?: SetInfo[] }> = ({ sets: initialSets = [] }) => {
  const [sets, setSets] = useState<SetInfo[]>(initialSets);
  const [selectedSetIndex, setSelectedSetIndex] = useState(0);

  const selectedSet = sets[selectedSetIndex] ?? {
    name: "세트 1",
    teamA: { id: "", name: "팀 A", members: [] },
    teamB: { id: "", name: "팀 B", members: [] },
  };

  const [timeline, setTimeline] = useState<string[][]>(initialSets.map(() => []));
  const [selectedScorer, setSelectedScorer] = useState<string>("");
  const [selectedAssist, setSelectedAssist] = useState<string>("");
  const [eventType, setEventType] = useState<EventType>("goal");

  const allPlayers = [...selectedSet.teamA.members, ...selectedSet.teamB.members];

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

    const updatedTimeline = [...timeline];
    updatedTimeline[selectedSetIndex].push(`${time} - ${text}`);
    setTimeline(updatedTimeline);
    setSelectedScorer("");
    setSelectedAssist("");
  };

  const handleAddSet = () => {
    const newSet: SetInfo = {
      name: `세트 ${sets.length + 1}`,
      teamA: { id: uuidv4(), name: "팀 A", members: [] },
      teamB: { id: uuidv4(), name: "팀 B", members: [] },
    };
    setSets([...sets, newSet]);
    setTimeline([...timeline, []]);
    setSelectedSetIndex(sets.length);
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">세트 선택</h2>
            <Button onClick={handleAddSet}>세트 추가</Button>
          </div>
          <Select value={String(selectedSetIndex)} onValueChange={(v) => setSelectedSetIndex(Number(v))}>
            <SelectTrigger className="w-60">
              <SelectValue placeholder="세트를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {sets.map((s, idx) => (
                <SelectItem key={idx} value={String(idx)}>{`${idx + 1}세트: ${s.teamA.name} vs ${s.teamB.name}`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-bold">경기 이벤트 기록</h2>
          <div className="flex gap-2 items-center">
            <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
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
            {timeline[selectedSetIndex]?.map((line, idx) => (
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
