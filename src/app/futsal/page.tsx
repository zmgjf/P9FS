"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
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

type EventType = "goal" | "assist" | "ownGoal";

// UUID 생성 함수 (uuid 패키지 의존성 제거)
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 기본 플레이어 데이터
const createDefaultTeams = (): { teamA: Team; teamB: Team } => ({
  teamA: {
    id: generateId(),
    name: "팀 A",
    members: [
      { id: generateId(), name: "선수1", number: 1 },
      { id: generateId(), name: "선수2", number: 2 },
      { id: generateId(), name: "선수3", number: 3 },
      { id: generateId(), name: "선수4", number: 4 },
      { id: generateId(), name: "선수5", number: 5 },
    ],
  },
  teamB: {
    id: generateId(),
    name: "팀 B",
    members: [
      { id: generateId(), name: "선수6", number: 6 },
      { id: generateId(), name: "선수7", number: 7 },
      { id: generateId(), name: "선수8", number: 8 },
      { id: generateId(), name: "선수9", number: 9 },
      { id: generateId(), name: "선수10", number: 10 },
    ],
  },
});

export default function MatchTimeline() {
  // 기본 세트 생성
  const [sets, setSets] = useState<SetInfo[]>(() => {
    const { teamA, teamB } = createDefaultTeams();
    return [
      {
        name: "세트 1",
        teamA,
        teamB,
      },
    ];
  });

  const [selectedSetIndex, setSelectedSetIndex] = useState(0);
  
  // timeline 초기화
  const [timeline, setTimeline] = useState<string[][]>([[]]);  // 기본 세트 1개에 대한 빈 타임라인

  const [selectedScorer, setSelectedScorer] = useState<string>("");
  const [selectedAssist, setSelectedAssist] = useState<string>("");
  const [eventType, setEventType] = useState<EventType>("goal");

  const selectedSet = sets[selectedSetIndex];
  const allPlayers = selectedSet ? [...selectedSet.teamA.members, ...selectedSet.teamB.members] : [];

  const handleRecord = () => {
    // 유효성 검사
    if (!selectedScorer) {
      alert("득점자를 선택해주세요.");
      return;
    }

    const scorer = allPlayers.find((p) => p.id === selectedScorer);
    const assist = selectedAssist ? allPlayers.find((p) => p.id === selectedAssist) : null;
    
    if (!scorer) {
      alert("선택된 득점자가 유효하지 않습니다.");
      return;
    }

    const time = new Date().toLocaleTimeString();

    let text = "";
    if (eventType === "goal") {
      text = `${scorer.name} (${scorer.number}) 골!${assist ? ` 도움: ${assist.name} (${assist.number})` : ""}`;
    } else if (eventType === "assist") {
      if (!assist) {
        alert("어시스트 선수를 선택해주세요.");
        return;
      }
      text = `${assist.name} (${assist.number}) 어시스트 기록`;
    } else {
      text = `${scorer.name} (${scorer.number}) 자책골`;
    }

    setTimeline((prev) => {
      const newTimeline = [...prev];
      if (!newTimeline[selectedSetIndex]) {
        newTimeline[selectedSetIndex] = [];
      }
      newTimeline[selectedSetIndex] = [...newTimeline[selectedSetIndex], `${time} - ${text}`];
      return newTimeline;
    });

    // 입력 필드 초기화
    setSelectedScorer("");
    setSelectedAssist("");
  };

  const handleAddSet = () => {
    const { teamA, teamB } = createDefaultTeams();
    const newSet: SetInfo = {
      name: `세트 ${sets.length + 1}`,
      teamA,
      teamB,
    };
    setSets((prev) => [...prev, newSet]);
    setTimeline((prev) => [...prev, []]);
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
                <SelectItem key={idx} value={String(idx)}>
                  {`${idx + 1}세트: ${s.teamA.name} vs ${s.teamB.name}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-bold">경기 이벤트 기록</h2>
          <div className="flex gap-2 items-center flex-wrap">
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
                  <SelectItem key={p.id} value={p.id}>
                    {`${p.number} ${p.name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {eventType === "goal" && (
              <Select value={selectedAssist} onValueChange={setSelectedAssist}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="어시스트 (선택)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">없음</SelectItem>
                  {allPlayers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {`${p.number} ${p.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {eventType === "assist" && (
              <Select value={selectedAssist} onValueChange={setSelectedAssist}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="어시스트 선수" />
                </SelectTrigger>
                <SelectContent>
                  {allPlayers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {`${p.number} ${p.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button onClick={handleRecord} disabled={!selectedScorer}>
              기록
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-semibold mb-2">
            타임라인 - {selectedSet?.name || ""}
          </h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {timeline[selectedSetIndex]?.length ? (
              timeline[selectedSetIndex].map((line, idx) => (
                <div key={idx} className="text-sm border-b py-1">
                  {line}
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 py-2">
                아직 기록된 이벤트가 없습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}