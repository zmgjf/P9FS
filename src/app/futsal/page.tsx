// src/app/futsal/page.tsx

"use client";

import React, { useState } from "react";
import type { Match, GameSet, Team, AppPhase } from "@/lib/types";
import TeamManagement from "@/components/TeamManagement";
import SetSetup from "@/components/SetSetup";
import GameScreen from "@/components/GameScreen";
import MatchManagement from "@/components/MatchManagement";

export default function Page() {
  const [appPhase, setAppPhase] = useState<AppPhase>("matchManagement");

  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sets, setSets] = useState<GameSet[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  const currentSet = sets[currentSetIndex];

  return (
    <>
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
      {appPhase === "playing" && currentSet && (
        <GameScreen
          currentSet={currentSet}
          setCurrentSet={(newSet) =>
            setSets((prev) =>
              prev.map((s, idx) => (idx === currentSetIndex ? newSet : s))
            )
          }
          setAppPhase={setAppPhase}
        />
      )}
    </>
  );
}
