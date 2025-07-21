// components/SetSetup.tsx

"use client";

import React, { useState } from "react";
import type { GameSet, Team } from "@/lib/types";

interface Props {
  sets: GameSet[];
  setSets: React.Dispatch<React.SetStateAction<GameSet[]>>;
  teams: Team[];
  setAppPhase: (phase: string) => void;
  setCurrentSetIndex: (index: number) => void;
}

export default function SetSetup({ sets, setSets, teams, setAppPhase, setCurrentSetIndex }: Props) {
  const [newSetName, setNewSetName] = useState("");
  const [duration, setDuration] = useState(10);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editedSetName, setEditedSetName] = useState("");
  const [editedDuration, setEditedDuration] = useState<number>(10);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const createSet = () => {
    if (!newSetName.trim()) return;
    const newSet: GameSet = {
      id: generateId(),
      name: newSetName,
      duration,
      teamA: teams[0],
      teamB: teams[1],
      isActive: false,
      events: [],
    };
    setSets(prev => [...prev, newSet]);
    setNewSetName("");
    setDuration(10);
  };

  const updateSet = (setId: string) => {
    setSets(prev => prev.map(set => set.id === setId ? {
      ...set,
      name: editedSetName,
      duration: editedDuration
    } : set));
    setEditingSetId(null);
  };

  const deleteSet = (setId: string) => {
    setSets(prev => prev.filter(set => set.id !== setId));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🛠 세트 설정</h2>

      <div>
        <input
          value={newSetName}
          onChange={(e) => setNewSetName(e.target.value)}
          placeholder="세트 이름"
        />
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          placeholder="진행 시간 (분)"
        />
        <button onClick={createSet}>세트 추가</button>
      </div>

      {sets.map((set, index) => (
        <div key={set.id} style={{ margin: '20px 0', border: '1px solid #ccc', padding: 10 }}>
          {editingSetId === set.id ? (
            <>
              <input
                value={editedSetName}
                onChange={(e) => setEditedSetName(e.target.value)}
              />
              <input
                type="number"
                value={editedDuration}
                onChange={(e) => setEditedDuration(parseInt(e.target.value))}
              />
              <button onClick={() => updateSet(set.id)}>저장</button>
              <button onClick={() => setEditingSetId(null)}>취소</button>
            </>
          ) : (
            <h3 onDoubleClick={() => {
              setEditingSetId(set.id);
              setEditedSetName(set.name);
              setEditedDuration(set.duration);
            }}>{set.name} – {set.duration}분</h3>
          )}

          <button onClick={() => deleteSet(set.id)}>세트 삭제</button>
          <button onClick={() => {
            setCurrentSetIndex(index);
            setAppPhase("gameReady");
          }}>이 세트로 시작</button>
        </div>
      ))}
    </div>
  );
}