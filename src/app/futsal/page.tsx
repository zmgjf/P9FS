// src/app/futsal/page.tsx

"use client";

import React, { useState } from "react";
import type { Match, GameSet, Team, AppPhase, PlayerPosition } from "@/lib/types";
import TeamManagement from "@/components/TeamManagement";
import SetSetup from "@/components/SetSetup";
import FormationSetup from "@/components/FormationSetup";
import GameScreen from "@/components/GameScreen";
import MatchManagement from "@/components/MatchManagement";
import MatchHistory from "@/components/MatchHistory";

export default function Page() {
  const [appPhase, setAppPhase] = useState<AppPhase>("matchManagement");

  const [matches, setMatches] = useState<Match[]>([]);
  const [, setCurrentMatch] = useState<Match | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sets, setSets] = useState<GameSet[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  // 포메이션 관련 상태
  const [currentFormation, setCurrentFormation] = useState<PlayerPosition[]>([]);
  const [teamACount, setTeamACount] = useState(3);
  const [teamBCount, setTeamBCount] = useState(3);

  const currentSet = sets[currentSetIndex];

  // 포메이션 설정 완료 핸들러
  const handleFormationReady = (positions: PlayerPosition[], teamACountValue: number, teamBCountValue: number) => {
    setCurrentFormation(positions);
    setTeamACount(teamACountValue);
    setTeamBCount(teamBCountValue);
    
    // 현재 세트에 포메이션 정보 저장
    if (currentSet) {
      const updatedSet = {
        ...currentSet,
        playerPositions: positions,
        teamACount: teamACountValue,
        teamBCount: teamBCountValue
      };
      
      setSets(prev => prev.map((set, index) => 
        index === currentSetIndex ? updatedSet : set
      ));
    }
  };

  return (
    <div className="min-h-screen">
      {appPhase === "matchManagement" && (
        <MatchManagement
          matches={matches}
          setMatches={setMatches}
          setCurrentMatch={setCurrentMatch}
          setAppPhase={setAppPhase}
        />
      )}
      
      {appPhase === "teamManagement" && (
        <TeamManagement
          teams={teams}
          setTeams={setTeams}
          setAppPhase={setAppPhase}
        />
      )}
      
      {appPhase === "setSetup" && (
        <SetSetup
          sets={sets}
          setSets={setSets}
          teams={teams}
          setAppPhase={setAppPhase}
          setCurrentSetIndex={setCurrentSetIndex}
        />
      )}
      
      {appPhase === "formationSetup" && currentSet && (
        <FormationSetup
          currentSet={currentSet}
          setCurrentSet={(newSet) => {
            setSets(prev => prev.map((set, index) => 
              index === currentSetIndex ? newSet : set
            ));
          }}
          setAppPhase={setAppPhase}
          onFormationReady={handleFormationReady}
        />
      )}
      
      {(appPhase === "playing" || appPhase === "gameReady") && currentSet && (
        <GameScreen
          currentSet={currentSet}
          setCurrentSet={(newSet) => {
            setSets((prev: GameSet[]): GameSet[] =>
              prev.map((s, idx) => (idx === currentSetIndex ? newSet : s))
            );
          }}
          setAppPhase={setAppPhase}
          initialPositions={currentFormation}
          teamACount={teamACount}
          teamBCount={teamBCount}
        />
      )}

      {appPhase === "matchHistory" && (
        <MatchHistory
          sets={sets}
          setAppPhase={setAppPhase}
        />
      )}
    </div>
  );
}