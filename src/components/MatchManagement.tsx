// components/MatchManagement.tsx

"use client";

import React, { useState } from "react";
import type { Match } from "@/lib/types";
import type { AppPhase } from "@/lib/types";

interface Props {
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  setCurrentMatch: (match: Match) => void;
  setAppPhase: React.Dispatch<React.SetStateAction<AppPhase>>;
}

export default function MatchManagement({ matches, setMatches, setCurrentMatch, setAppPhase }: Props) {
  const [newMatchName, setNewMatchName] = useState('');
  const [newMatchVenue, setNewMatchVenue] = useState('');

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const createMatch = () => {
    if (!newMatchName.trim() || !newMatchVenue.trim()) {
      alert("경기명과 구장명을 입력하세요.");
      return;
    }
    const newMatch: Match = {
      id: generateId(),
      name: newMatchName,
      venue: newMatchVenue,
      date: new Date().toLocaleDateString("ko-KR"),
      sets: [],
      createdAt: new Date().toISOString(),
    };
    setMatches(prev => [...prev, newMatch]);
    setCurrentMatch(newMatch);
    setAppPhase("teamManagement");
    setNewMatchName("");
    setNewMatchVenue("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>⚽ 풋살 매니저</h1>

      <div>
        <h3>새 경기 만들기</h3>
        <input value={newMatchName} onChange={(e) => setNewMatchName(e.target.value)} placeholder="경기명" />
        <input value={newMatchVenue} onChange={(e) => setNewMatchVenue(e.target.value)} placeholder="구장명" />
        <button onClick={createMatch}>만들기</button>
      </div>

      <div>
        <h3>기존 경기</h3>
        {matches.length === 0 ? (
          <p>등록된 경기가 없습니다.</p>
        ) : (
          matches.map(match => (
            <div key={match.id} style={{ margin: '10px 0', padding: '10px', border: '1px solid #ccc' }}>
              <strong>{match.name}</strong> ({match.venue})<br />
              <button onClick={() => {
                setCurrentMatch(match);
                setAppPhase("setSetup");
              }}>진행하기</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
