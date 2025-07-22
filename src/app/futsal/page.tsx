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
  
  // 전역 팀 관리 (모든 경기에서 공유)
  const [globalTeams, setGlobalTeams] = useState<Team[]>([]);
  
  // 현재 경기용 임시 팀 상태 (경기별 커스터마이징용)
  const [currentMatchTeams, setCurrentMatchTeams] = useState<Team[]>([]);
  
  const [sets, setSets] = useState<GameSet[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);

  // 포메이션 관련 상태
  const [currentFormation, setCurrentFormation] = useState<PlayerPosition[]>([]);
  const [teamACount, setTeamACount] = useState(3);
  const [teamBCount, setTeamBCount] = useState(3);

  // 전체 완료된 세트들 (통계용)
  const [completedSets, setCompletedSets] = useState<GameSet[]>([]);

  // localStorage에서 데이터 로드 (클라이언트 사이드에서만)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMatches = localStorage.getItem('futsal-matches');
      const savedCompletedSets = localStorage.getItem('futsal-completed-sets');
      const savedGlobalTeams = localStorage.getItem('futsal-global-teams');
      
      if (savedMatches) {
        try {
          const parsedMatches = JSON.parse(savedMatches);
          setMatches(parsedMatches);
        } catch (error) {
          console.error('Failed to parse saved matches:', error);
        }
      }
      
      if (savedCompletedSets) {
        try {
          const parsedCompletedSets = JSON.parse(savedCompletedSets);
          setCompletedSets(parsedCompletedSets);
        } catch (error) {
          console.error('Failed to parse saved completed sets:', error);
        }
      }

      if (savedGlobalTeams) {
        try {
          const parsedGlobalTeams = JSON.parse(savedGlobalTeams);
          setGlobalTeams(parsedGlobalTeams);
        } catch (error) {
          console.error('Failed to parse saved global teams:', error);
        }
      }
    }
  }, []);

  // matches 변경 시 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('futsal-matches', JSON.stringify(matches));
    }
  }, [matches]);

  // completedSets 변경 시 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('futsal-completed-sets', JSON.stringify(completedSets));
    }
  }, [completedSets]);

  // 전역 팀 데이터 변경 시 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('futsal-global-teams', JSON.stringify(globalTeams));
    }
  }, [globalTeams]);

  // 현재 경기가 변경될 때 해당 경기의 팀과 세트 로드
  useEffect(() => {
    if (currentMatch) {
      // 현재 경기의 세트 로드
      setSets(currentMatch.sets || []);
      
      // 현재 경기에 저장된 팀이 있으면 사용, 없으면 전역 팀 사용
      if (currentMatch.sets && currentMatch.sets.length > 0) {
        // 경기에 이미 세트가 있는 경우, 세트에서 팀 정보 추출
        const teamMap = new Map<string, Team>();

        currentMatch.sets.forEach(set => {
          if (set.teamA && !teamMap.has(set.teamA.id)) {
            teamMap.set(set.teamA.id, set.teamA);
          }
          if (set.teamB && !teamMap.has(set.teamB.id)) {
            teamMap.set(set.teamB.id, set.teamB);
          }
        });

        setCurrentMatchTeams(Array.from(teamMap.values()));
      } else {
        // 새 경기이거나 세트가 없는 경우 전역 팀 사용
        setCurrentMatchTeams([...globalTeams]);
      }
    } else {
      // 경기가 선택되지 않은 경우 전역 팀 사용
      setCurrentMatchTeams([...globalTeams]);
    }
  }, [currentMatch, globalTeams]);

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

  // 경기 선택 핸들러
  const handleMatchSelect = (match: Match) => {
    console.log('Selected match:', match);
    setCurrentMatch(match);
  };

  // 현재 경기용 팀 데이터 업데이트 핸들러 (세트 설정에서 사용)
  const handleCurrentMatchTeamsUpdate: React.Dispatch<React.SetStateAction<Team[]>> = (value) => {
    if (typeof value === 'function') {
      setCurrentMatchTeams(prev => {
        const newTeams = value(prev);
        console.log('Updating current match teams (function):', newTeams);
        return newTeams;
      });
    } else {
      console.log('Updating current match teams (direct):', value);
      setCurrentMatchTeams(value);
    }
  };

  // 세트 데이터 업데이트 핸들러
  const handleSetsUpdate: React.Dispatch<React.SetStateAction<GameSet[]>> = (value) => {
    if (typeof value === 'function') {
      setSets(prev => {
        const newSets = value(prev);
        updateCurrentMatchWithSets(newSets);
        return newSets;
      });
    } else {
      setSets(value);
      updateCurrentMatchWithSets(value);
    }
  };

  // 현재 경기를 새 세트 데이터로 업데이트
  const updateCurrentMatchWithSets = (newSets: GameSet[]) => {
    if (currentMatch) {
      const updatedMatch = {
        ...currentMatch,
        sets: newSets
      };
      
      setMatches(prev => prev.map(match => 
        match.id === currentMatch.id ? updatedMatch : match
      ));
      
      setCurrentMatch(updatedMatch);
    }
  };

  // 팀 관리에서 전역으로 돌아갈 때 사용할 함수
  const handleBackToGlobalTeams = () => {
    // 현재 작업 중인 팀 데이터를 전역에 저장할지 물어보기
    if (currentMatchTeams.length > globalTeams.length || 
        JSON.stringify(currentMatchTeams) !== JSON.stringify(globalTeams)) {
      const shouldSave = confirm(
        '현재 팀 설정을 전체 팀 목록에 저장하시겠습니까?\n' +
        '저장하면 다른 경기에서도 이 팀들을 사용할 수 있습니다.'
      );
      
      if (shouldSave) {
        setGlobalTeams([...currentMatchTeams]);
      }
    }
  };

  // 앱 페이즈 변경 핸들러 (팀 관리에서 나갈 때 전역 저장 확인)
  const handleAppPhaseChange = (newPhase: AppPhase) => {
    if (appPhase === "teamManagement" && newPhase !== "teamManagement") {
      handleBackToGlobalTeams();
    }
    setAppPhase(newPhase);
  };

  // 간단한 앱 페이즈 변경 (React.Dispatch 타입 호환용)
  const simpleSetAppPhase: React.Dispatch<React.SetStateAction<AppPhase>> = (value) => {
    if (typeof value === 'function') {
      setAppPhase(prev => {
        const newPhase = value(prev);
        if (appPhase === "teamManagement" && newPhase !== "teamManagement") {
          handleBackToGlobalTeams();
        }
        return newPhase;
      });
    } else {
      handleAppPhaseChange(value);
    }
  };

  return (
    <div className="min-h-screen">
      {appPhase === "matchManagement" && (
        <MatchManagement
          matches={matches}
          setMatches={setMatches}
          setCurrentMatch={handleMatchSelect}
          setAppPhase={simpleSetAppPhase}
        />
      )}
      
      {appPhase === "teamManagement" && (
        <TeamManagement
          teams={currentMatchTeams}
          setTeams={handleCurrentMatchTeamsUpdate}
          setAppPhase={simpleSetAppPhase}
        />
      )}
      
      {appPhase === "setSetup" && (
        <SetSetup
          sets={sets}
          setSets={handleSetsUpdate}
          teams={currentMatchTeams}
          setAppPhase={simpleSetAppPhase}
          setCurrentSetIndex={setCurrentSetIndex}
        />
      )}
      
      {appPhase === "formationSetup" && currentSet && (
        <FormationSetup
          currentSet={currentSet}
          setCurrentSet={(newSet) => {
            const newSets = sets.map((set, index) => 
              index === currentSetIndex ? newSet : set
            );
            handleSetsUpdate(newSets);
          }}
          setAppPhase={simpleSetAppPhase}
          onFormationReady={handleFormationReady}
        />
      )}
      
      {(appPhase === "playing" || appPhase === "gameReady") && currentSet && (
        <GameScreen
          currentSet={currentSet}
          setCurrentSet={(newSet) => {
            const newSets = sets.map((s, idx) => (idx === currentSetIndex ? newSet : s));
            handleSetsUpdate(newSets);
          }}
          setAppPhase={simpleSetAppPhase}
          initialPositions={currentFormation}
          teamACount={teamACount}
          teamBCount={teamBCount}
          onMatchComplete={handleMatchComplete}
        />
      )}

      {appPhase === "matchHistory" && (
        <MatchHistory
          sets={[...completedSets, ...sets.filter(set => set.events.length > 0)]}
          setAppPhase={simpleSetAppPhase}
        />
      )}

      {appPhase === "statistics" && (
        <Statistics
          sets={[...completedSets, ...sets.filter(set => set.events.length > 0)]}
          setAppPhase={simpleSetAppPhase}
        />
      )}
    </div>
  );
}