// FutsalManager를 구성 요소별로 분리한 루트 컴포넌트

"use client";

import React, { useState, useEffect } from "react";
import MatchManagement from "@/components/MatchManagement";
import TeamManagement from "@/components/TeamManagement";
import SetSetup from "@/components/SetSetup";
import GameScreen from "@/components/GameScreen";

import type {
  Player,
  Team,
  GameEvent,
  GameSet,
  Match,
  AppPhase,
  ActionMode
} from "@/lib/types";

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export default function FutsalManager() {
  const [appPhase, setAppPhase] = useState<AppPhase>('matchManagement');
  const [actionMode, setActionMode] = useState<ActionMode>('none');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [gameTime, setGameTime] = useState(0);

  // TODO: 데이터 로딩 및 로컬 스토리지 처리 등 여기에 유지

  const currentSet = currentMatch?.sets[currentSetIndex];

  if (appPhase === 'matchManagement') {
    return (
      <MatchManagement
        matches={matches}
        setMatches={setMatches}
        setCurrentMatch={setCurrentMatch}
        setAppPhase={setAppPhase}
      />
    );
  }

  if (!currentMatch) {
    return <div style={{ padding: 20 }}>경기가 선택되지 않았습니다.</div>;
  }

  if (appPhase === 'teamManagement') {
    return (
      <TeamManagement
        teams={teams}
        setTeams={setTeams}
        setAppPhase={setAppPhase}
      />
    );
  }

  if (appPhase === 'setSetup') {
    return (
      <SetSetup
        teams={teams}
        currentMatch={currentMatch}
        setCurrentMatch={setCurrentMatch}
        setMatches={setMatches}
        setCurrentSetIndex={setCurrentSetIndex}
        setAppPhase={setAppPhase}
      />
    );
  }

  return (
    <GameScreen
      appPhase={appPhase}
      setAppPhase={setAppPhase}
      actionMode={actionMode}
      setActionMode={setActionMode}
      selectedPlayer={selectedPlayer}
      setSelectedPlayer={setSelectedPlayer}
      currentMatch={currentMatch}
      setCurrentMatch={setCurrentMatch}
      currentSetIndex={currentSetIndex}
      setCurrentSetIndex={setCurrentSetIndex}
      gameTime={gameTime}
      setGameTime={setGameTime}
      teams={teams}
      matches={matches}
      setMatches={setMatches}
    />
  );
}
