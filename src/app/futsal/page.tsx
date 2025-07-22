"use client";

import React, { useState, useEffect } from "react";
import type { Match, GameSet, Team, AppPhase, PlayerPosition } from "@/lib/types";
import TeamManagement from "@/components/TeamManagement";
import SetSetup from "@/components/SetSetup";
import FormationSetup from "@/components/FormationSetup";
import GameScreen from "@/components/GameScreen";
import MatchManagement from "@/components/MatchManagement";
import MatchHistory from "@/components/MatchHistory";
import Statistics from "@/components/Statistics";

export default function Page() {
  const [appPhase, setAppPhase] = useState<AppPhase>("matchManagement");

  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [sets, setSets] = useState<GameSet[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  // 포메이션 관련 상태
  const [currentFormation, setCurrentFormation] = useState<PlayerPosition[]>([]);
  const [teamACount, setTeamACount] = useState(3);
  const [teamBCount, setTeamBCount] = useState(3);

  // 전체 완료된 세트들 (통계용)
  const [completedSets, setCompletedSets] = useState<GameSet[]>([]);

  // localStorage에서 데이터 로드
  useEffect(() => {
    const savedMatches = localStorage.getItem('futsal-matches');
    const savedCompletedSets = localStorage.getItem('futsal-completed-sets');
    
    if (savedMatches) {
      try {
        setMatches(JSON.parse(savedMatches));
      } catch (error) {
        console.error('Failed to parse saved matches:', error);
      }
    }
    
    if (savedCompletedSets) {
      try {
        setCompletedSets(JSON.parse(savedCompletedSets));
      } catch (error) {
        console.error('Failed to parse saved completed sets:', error);
      }
    }
  }, []);

  // matches 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('futsal-matches', JSON.stringify(matches));
  }, [matches]);

  // completedSets 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('futsal-completed-sets', JSON.stringify(completedSets));
  }, [completedSets]);

  // 현재 경기가 변경될 때 해당 경기의 팀과 세트 로드
  useEffect(() => {
    if (currentMatch) {
      // 현재 경기의 팀들을 추출하여 teams 상태 설정
      const matchTeams: Team[] = [];
      const teamMap = new Map<string, Team>();

      currentMatch.sets.forEach(set => {
        if (set.teamA && !teamMap.has(set.teamA.id)) {
          teamMap.set(set.teamA.id, set.teamA);
        }
        if (set.teamB && !teamMap.has(set.teamB.id)) {
          teamMap.set(set.teamB.id, set.teamB);
        }
      });

      setTeams(Array.from(teamMap.values()));
      setSets(currentMatch.sets || []);
    }
  }, [currentMatch]);

  // 팀이나 세트가 변경될 때 현재 경기에 업데이트
  useEffect(() => {
    if (currentMatch) {
      const updatedMatch: Match = {
        ...currentMatch,
        sets: sets
      };
      
      setMatches(prev => prev.map(match => 
        match.id === currentMatch.id ? updatedMatch : match
      ));
      
      setCurrentMatch(updatedMatch);
    }
  }, [teams, sets]);

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

  // 경기 완료 시 통계에 추가
  const handleMatchComplete = () => {
    if (currentSet) {
      const completedSet = {
        ...currentSet,
        completedAt: new Date().toISOString(),
        finalScore: {
          teamA: currentSet.events.filter(e => 
            (e.team === 'A' && e.type === 'goal') || (e.team === 'B' && e.type === 'ownGoal')
          ).length,
          teamB: currentSet.events.filter(e => 
            (e.team === 'B' && e.type === 'goal') || (e.team === 'A' && e.type === 'ownGoal')
          ).length
        }
      };
      setCompletedSets(prev => [...prev, completedSet]);
    }
  };

  // 경기 선택 핸들러 개선
  const handleMatchSelect = (match: Match) => {
    setCurrentMatch(match);
  };

  return (
    <div className="min-h-screen">
      {appPhase === "matchManagement" && (
        <MatchManagement
          matches={matches}
          setMatches={setMatches}
          setCurrentMatch={handleMatchSelect}
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
          onMatchComplete={handleMatchComplete}
        />
      )}

      {appPhase === "matchHistory" && (
        <MatchHistory
          sets={[...completedSets, ...sets.filter(set => set.events.length > 0)]}
          setAppPhase={setAppPhase}
        />
      )}

      {appPhase === "statistics" && (
        <Statistics
          sets={[...completedSets, ...sets.filter(set => set.events.length > 0)]}
          setAppPhase={setAppPhase}
        />
      )}
    </div>
  );
}