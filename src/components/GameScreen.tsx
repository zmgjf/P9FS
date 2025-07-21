// components/GameScreen.tsx

"use client";

import React, { useState } from "react";
import type { GameSet, Team, GameEvent, AppPhase } from "@/lib/types";
import EventTimeline from "@/components/EventTimeline";

interface Props {
  currentSet: GameSet;
  setCurrentSet: (newSet: GameSet) => void;
  setAppPhase: React.Dispatch<React.SetStateAction<AppPhase>>;
}

export default function GameScreen({ currentSet, setCurrentSet, setAppPhase }: Props) {
  const [time, setTime] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");

  const handleAddEvent = () => {
    if (!time.trim() || !selectedPlayer.trim()) return;

    const newEvent: GameEvent = {
      id: Date.now().toString(36),
      time,
      realTime: Date.now(),
      type: "goal",
      player: { id: selectedPlayer, name: selectedPlayer },
      team: "A",
    };

    setCurrentSet({
      ...currentSet,
      events: [...currentSet.events, newEvent]
    });

    setTime("");
    setSelectedPlayer("");
  };

  const handleDeleteEvent = (eventId: string) => {
    setCurrentSet({
      ...currentSet,
      events: currentSet.events.filter(event => event.id !== eventId)
    });
  };

  const handleEditEvent = (eventId: string, newPlayerName: string) => {
    setCurrentSet({
      ...currentSet,
      events: currentSet.events.map(event =>
        event.id === eventId
          ? { ...event, player: { ...event.player, name: newPlayerName } }
          : event
      )
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>⚽ 경기 진행 중</h2>

      <div>
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="시간"
        />
        <input
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          placeholder="선수 이름"
        />
        <button onClick={handleAddEvent}>기록 추가</button>
      </div>

      <EventTimeline
        currentSet={currentSet}
        onDeleteEvent={handleDeleteEvent}
        onEditEvent={handleEditEvent}
      />

      <button onClick={() => setAppPhase("paused")}>⏸ 일시정지</button>
      <button onClick={() => setAppPhase("finished")}>🏁 종료</button>
    </div>
  );
}
