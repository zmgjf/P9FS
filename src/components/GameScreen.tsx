// components/GameScreen.tsx

"use client";

import React, { useEffect, useState } from "react";
import type { GameSet, GameEvent, Player } from "@/lib/types";
import EventTimeline from "./EventTimeline";

interface Props {
  currentSet: GameSet;
  setCurrentSet: React.Dispatch<React.SetStateAction<GameSet>>;
  onCompleteSet: (updatedSet: GameSet) => void;
}

export default function GameScreen({ currentSet, setCurrentSet, onCompleteSet }: Props) {
  const [timeLeft, setTimeLeft] = useState(currentSet.duration * 60);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      handleComplete();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timeLeft]);

  const handleScore = (team: "A" | "B", player: Player, assistPlayer?: Player, ownGoal = false) => {
    const newEvent: GameEvent = {
      id: Date.now().toString(),
      time: `${Math.floor((currentSet.duration * 60 - timeLeft) / 60)}:${(currentSet.duration * 60 - timeLeft) % 60}`,
      realTime: currentSet.duration * 60 - timeLeft,
      type: ownGoal ? 'ownGoal' : 'goal',
      player,
      assistPlayer,
      team,
    };
    setCurrentSet(prev => ({
      ...prev,
      events: [...prev.events, newEvent],
    }));
  };

  const handleDeleteEvent = (eventId: string) => {
    setCurrentSet(prev => ({
      ...prev,
      events: prev.events.filter(event => event.id !== eventId)
    }));
  };

  const handleEditEvent = (eventId: string, newPlayerName: string) => {
    setCurrentSet(prev => ({
      ...prev,
      events: prev.events.map(event =>
        event.id === eventId ? {
          ...event,
          player: { ...event.player, name: newPlayerName }
        } : event
      )
    }));
  };

  const handleComplete = () => {
    const finalScore = currentSet.events.reduce((acc, ev) => {
      if (ev.type === "goal") {
        acc[ev.team === "A" ? "teamA" : "teamB"]++;
      } else if (ev.type === "ownGoal") {
        acc[ev.team === "A" ? "teamB" : "teamA"]++;
      }
      return acc;
    }, { teamA: 0, teamB: 0 });

    onCompleteSet({
      ...currentSet,
      isActive: false,
      finalScore,
      completedAt: new Date().toISOString(),
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>⚽ 경기 중: {currentSet.name}</h2>
      <div>
        ⏱ 시간: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
        <button onClick={() => setTimerRunning(prev => !prev)}>{timerRunning ? "일시정지" : "시작"}</button>
        <button onClick={handleComplete}>경기 종료</button>
      </div>

      <EventTimeline
        currentSet={currentSet}
        onDeleteEvent={handleDeleteEvent}
        onEditEvent={handleEditEvent}
      />

      {/* 득점 처리 등은 별도 UI에서 호출 필요 */}
    </div>
  );
}