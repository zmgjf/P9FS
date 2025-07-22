// components/FormationSetup.tsx

"use client";

import React, { useState, useEffect } from "react";
import type { GameSet, AppPhase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlayerPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  team: 'A' | 'B';
  isActive: boolean;
}

interface Props {
  currentSet: GameSet;
  setCurrentSet: (newSet: GameSet) => void;
  setAppPhase: React.Dispatch<React.SetStateAction<AppPhase>>;
  onFormationReady: (positions: PlayerPosition[], teamACount: number, teamBCount: number) => void;
}

// 기본 포메이션 템플릿
const formations = {
  "2v2": {
    teamA: [
      { x: 20, y: 35 }, // 수비
      { x: 35, y: 50 }, // 공격
    ],
    teamB: [
      { x: 65, y: 50 }, // 공격
      { x: 80, y: 35 }, // 수비
    ]
  },
  "3v3": {
    teamA: [
      { x: 15, y: 40 }, // 골키퍼
      { x: 30, y: 25 }, // 수비
      { x: 30, y: 55 }, // 공격
    ],
    teamB: [
      { x: 70, y: 25 }, // 공격
      { x: 70, y: 55 }, // 수비
      { x: 85, y: 40 }, // 골키퍼
    ]
  },
  "4v4": {
    teamA: [
      { x: 15, y: 40 }, // 골키퍼
      { x: 30, y: 20 }, // 수비1
      { x: 30, y: 60 }, // 수비2
      { x: 45, y: 40 }, // 공격
    ],
    teamB: [
      { x: 55, y: 40 }, // 공격
      { x: 70, y: 20 }, // 수비1
      { x: 70, y: 60 }, // 수비2
      { x: 85, y: 40 }, // 골키퍼
    ]
  },
  "5v5": {
    teamA: [
      { x: 15, y: 40 }, // 골키퍼
      { x: 30, y: 20 }, // 수비1
      { x: 30, y: 60 }, // 수비2
      { x: 45, y: 30 }, // 미드필더
      { x: 45, y: 50 }, // 공격
    ],
    teamB: [
      { x: 55, y: 30 }, // 공격
      { x: 55, y: 50 }, // 미드필더
      { x: 70, y: 20 }, // 수비1
      { x: 70, y: 60 }, // 수비2
      { x: 85, y: 40 }, // 골키퍼
    ]
  },
  "6v6": {
    teamA: [
      { x: 15, y: 40 }, // 골키퍼
      { x: 28, y: 20 }, // 수비1 (좌)
      { x: 28, y: 60 }, // 수비2 (우)
      { x: 40, y: 25 }, // 미드필더1 (좌)
      { x: 40, y: 55 }, // 미드필더2 (우)
      { x: 50, y: 40 }, // 공격수
    ],
    teamB: [
      { x: 50, y: 40 }, // 공격수
      { x: 60, y: 25 }, // 미드필더1 (좌)
      { x: 60, y: 55 }, // 미드필더2 (우)
      { x: 72, y: 20 }, // 수비1 (좌)
      { x: 72, y: 60 }, // 수비2 (우)
      { x: 85, y: 40 }, // 골키퍼
    ]
  }
};

export default function FormationSetup({ currentSet, setAppPhase, onFormationReady }: Props) {
  const [selectedFormation, setSelectedFormation] = useState<"2v2" | "3v3" | "4v4" | "5v5" | "6v6">("3v3");
  const [playerPositions, setPlayerPositions] = useState<PlayerPosition[]>([]);
  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null);
  const [selectedPlayerTeamA, setSelectedPlayerTeamA] = useState<string[]>([]);
  const [selectedPlayerTeamB, setSelectedPlayerTeamB] = useState<string[]>([]);
  const [isFormationApplied, setIsFormationApplied] = useState(false);

  const teamAPlayers = currentSet.teamA?.players || [];
  const teamBPlayers = currentSet.teamB?.players || [];

  // 자동 선수 배치 함수
  const autoAssignPlayers = () => {
    const formation = formations[selectedFormation];
    const teamACount = formation.teamA.length;
    const teamBCount = formation.teamB.length;

    // 팀A 선수 자동 배치
    const autoTeamA = teamAPlayers.slice(0, teamACount).map(player => player.id);
    while (autoTeamA.length < teamACount) {
      autoTeamA.push(""); // 부족한 경우 빈 문자열
    }

    // 팀B 선수 자동 배치
    const autoTeamB = teamBPlayers.slice(0, teamBCount).map(player => player.id);
    while (autoTeamB.length < teamBCount) {
      autoTeamB.push(""); // 부족한 경우 빈 문자열
    }

    setSelectedPlayerTeamA(autoTeamA);
    setSelectedPlayerTeamB(autoTeamB);

    // 자동으로 포메이션 적용
    applyFormationWithPlayers(autoTeamA, autoTeamB);
  };

  // 포메이션이 변경될 때마다 자동으로 선수 배치
  useEffect(() => {
    autoAssignPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFormation]);

  // 특정 선수 배치로 포메이션 적용
  const applyFormationWithPlayers = (teamAPlayerIds: string[], teamBPlayerIds: string[]) => {
    const formation = formations[selectedFormation];
    const positions: PlayerPosition[] = [];
    
    // 팀A 포지션
    formation.teamA.forEach((pos, index) => {
      const playerId = teamAPlayerIds[index];
      const player = teamAPlayers.find(p => p.id === playerId);
      if (player) {
        positions.push({
          id: player.id,
          name: player.name,
          x: pos.x,
          y: pos.y,
          team: 'A',
          isActive: true
        });
      }
    });

    // 팀B 포지션
    formation.teamB.forEach((pos, index) => {
      const playerId = teamBPlayerIds[index];
      const player = teamBPlayers.find(p => p.id === playerId);
      if (player) {
        positions.push({
          id: player.id,
          name: player.name,
          x: pos.x,
          y: pos.y,
          team: 'B',
          isActive: true
        });
      }
    });

    setPlayerPositions(positions);
    setIsFormationApplied(true);
  };

  // 포메이션 적용 (수동 호출)
  const applyFormation = () => {
    applyFormationWithPlayers(selectedPlayerTeamA, selectedPlayerTeamB);
  };

  // 선수 드래그 핸들러
  const handlePlayerDrag = (playerId: string, newX: number, newY: number) => {
    setPlayerPositions(prev => 
      prev.map(player => 
        player.id === playerId 
          ? { ...player, x: Math.max(5, Math.min(95, newX)), y: Math.max(10, Math.min(90, newY)) }
          : player
      )
    );
  };

  // 포메이션 확정
  const confirmFormation = () => {
    if (playerPositions.length === 0) {
      alert("먼저 포메이션을 적용해주세요.");
      return;
    }

    const teamACount = formations[selectedFormation].teamA.length;
    const teamBCount = formations[selectedFormation].teamB.length;
    
    // 실제 배치된 선수 수 확인
    const actualTeamACount = playerPositions.filter(p => p.team === 'A').length;
    const actualTeamBCount = playerPositions.filter(p => p.team === 'B').length;

    if (actualTeamACount < teamACount || actualTeamBCount < teamBCount) {
      alert("모든 포지션에 선수를 배치해주세요.");
      return;
    }
    
    onFormationReady(playerPositions, teamACount, teamBCount);
    setAppPhase("playing");
  };

  // 선수 선택 핸들러
  const handlePlayerSelection = (team: 'A' | 'B', index: number, playerId: string) => {
    if (team === 'A') {
      const newSelection = [...selectedPlayerTeamA];
      newSelection[index] = playerId;
      setSelectedPlayerTeamA(newSelection);
      
      // 실시간 업데이트
      if (isFormationApplied) {
        applyFormationWithPlayers(newSelection, selectedPlayerTeamB);
      }
    } else {
      const newSelection = [...selectedPlayerTeamB];
      newSelection[index] = playerId;
      setSelectedPlayerTeamB(newSelection);
      
      // 실시간 업데이트
      if (isFormationApplied) {
        applyFormationWithPlayers(selectedPlayerTeamA, newSelection);
      }
    }
  };

  // 포메이션 리셋
  const resetFormation = () => {
    autoAssignPlayers();
  };

  // 선수 부족 여부 확인
  const teamANeeded = formations[selectedFormation].teamA.length;
  const teamBNeeded = formations[selectedFormation].teamB.length;
  const teamAAvailable = teamAPlayers.length;
  const teamBAvailable = teamBPlayers.length;

  const isTeamAShort = teamAAvailable < teamANeeded;
  const isTeamBShort = teamBAvailable < teamBNeeded;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">⚽ 포메이션 설정</h1>
          <p className="text-gray-600">{currentSet.name} - 선수 배치와 전술을 설정하세요</p>
        </div>

        {/* 선수 부족 경고 */}
        {(isTeamAShort || isTeamBShort) && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-medium text-yellow-800">선수가 부족합니다</p>
                  <div className="text-sm text-yellow-600 space-y-1">
                    {isTeamAShort && (
                      <p>{currentSet.teamA?.name || '팀A'}: {teamAAvailable}명 보유 / {teamANeeded}명 필요</p>
                    )}
                    {isTeamBShort && (
                      <p>{currentSet.teamB?.name || '팀B'}: {teamBAvailable}명 보유 / {teamBNeeded}명 필요</p>
                    )}
                  </div>
                </div>
                <Button 
                  onClick={() => setAppPhase("teamManagement")}
                  variant="outline"
                  className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  팀 관리로 이동
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 포메이션 선택 및 선수 배치 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>🎯 포메이션 선택</CardTitle>
              <CardDescription>
                포메이션을 선택하면 자동으로 선수가 배치됩니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">포메이션</label>
                <Select 
                  value={selectedFormation} 
                  onValueChange={(value: "2v2" | "3v3" | "4v4" | "5v5" | "6v6") => setSelectedFormation(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2v2">2 vs 2 (미니 게임)</SelectItem>
                    <SelectItem value="3v3">3 vs 3 (표준)</SelectItem>
                    <SelectItem value="4v4">4 vs 4 (확장)</SelectItem>
                    <SelectItem value="5v5">5 vs 5 (풀 게임)</SelectItem>
                    <SelectItem value="6v6">6 vs 6 (대형 게임)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button onClick={resetFormation} variant="outline" className="flex-1">
                  🔄 자동 배치
                </Button>
                <Button onClick={applyFormation} className="flex-1">
                  ✅ 적용
                </Button>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="font-medium text-blue-800 mb-1">💡 사용법</p>
                <ul className="text-blue-600 space-y-1">
                  <li>• 포메이션 선택 시 자동 배치</li>
                  <li>• 아래에서 선수 개별 변경 가능</li>
                  <li>• 필드에서 드래그로 위치 조정</li>
                </ul>
              </div>

              {/* 팀A 선수 선택 */}
              <div className="space-y-3">
                <h4 className="font-semibold text-red-600 flex items-center gap-2">
                  <span className="w-4 h-4 bg-red-500 rounded-full"></span>
                  {currentSet.teamA?.name || '팀A'} 선수 배치
                </h4>
                {formations[selectedFormation].teamA.map((_, index) => (
                  <div key={`teamA-${index}`} className="space-y-1">
                    <label className="text-xs text-gray-600">
                      {index === 0 ? '골키퍼' : 
                       index === 1 ? '수비수' :
                       index === 2 ? (formations[selectedFormation].teamA.length > 3 ? '수비수' : '공격수') :
                       index === 3 ? (formations[selectedFormation].teamA.length > 4 ? '미드필더' : '공격수') :
                       index === 4 ? '공격수' : '공격수'}
                    </label>
                    <Select 
                      value={selectedPlayerTeamA[index] || ""} 
                      onValueChange={(value) => handlePlayerSelection('A', index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`선수 ${index + 1} 선택`} />
                      </SelectTrigger>
                      <SelectContent>
                        {teamAPlayers.map(player => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              {/* 팀B 선수 선택 */}
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                  <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                  {currentSet.teamB?.name || '팀B'} 선수 배치
                </h4>
                {formations[selectedFormation].teamB.map((_, index) => (
                  <div key={`teamB-${index}`} className="space-y-1">
                    <label className="text-xs text-gray-600">
                      {index === 0 ? '공격수' : 
                       index === 1 ? (formations[selectedFormation].teamB.length > 3 ? '미드필더' : '수비수') :
                       index === 2 ? '수비수' :
                       index === 3 ? '수비수' :
                       index === 4 ? '수비수' : '골키퍼'}
                    </label>
                    <Select 
                      value={selectedPlayerTeamB[index] || ""} 
                      onValueChange={(value) => handlePlayerSelection('B', index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`선수 ${index + 1} 선택`} />
                      </SelectTrigger>
                      <SelectContent>
                        {teamBPlayers.map(player => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 필드 미리보기 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>🏟️ 필드 미리보기</CardTitle>
              <CardDescription>
                {isFormationApplied ? (
                  <>
                    <span className="text-green-600 font-medium">
                      ✅ {selectedFormation} 포메이션이 적용되었습니다
                    </span>
                    <span className="block text-gray-600 mt-1">
                      선수를 드래그하여 위치를 조정하거나 왼쪽에서 선수를 변경하세요
                    </span>
                  </>
                ) : (
                  "포메이션을 선택하면 자동으로 배치됩니다"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="relative bg-green-500 h-96 rounded-lg overflow-hidden"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
              >
                {/* 필드 라인들 */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white transform -translate-x-0.5"></div>
                <div className="absolute left-1/2 top-1/2 w-20 h-20 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute left-0 top-1/3 bottom-1/3 w-12 border-r-2 border-white"></div>
                <div className="absolute left-0 top-2/5 bottom-2/5 w-6 border-r-2 border-white"></div>
                <div className="absolute right-0 top-1/3 bottom-1/3 w-12 border-l-2 border-white"></div>
                <div className="absolute right-0 top-2/5 bottom-2/5 w-6 border-l-2 border-white"></div>

                {/* 선수 포지션 */}
                {playerPositions.map((player) => (
                  <div
                    key={player.id}
                    draggable
                    onDragStart={() => setDraggedPlayer(player.id)}
                    onDragEnd={(e) => {
                      if (draggedPlayer) {
                        const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                        const x = ((e.clientX - rect.left) / rect.width) * 100;
                        const y = ((e.clientY - rect.top) / rect.height) * 100;
                        handlePlayerDrag(draggedPlayer, x, y);
                        setDraggedPlayer(null);
                      }
                    }}
                    className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-move transition-all hover:scale-110 ${
                      player.team === 'A' ? 'bg-red-500' : 'bg-blue-500'
                    } shadow-lg border-2 border-white`}
                    style={{
                      left: `${player.x}%`,
                      top: `${player.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    title={`${player.name} (${player.team}팀) - 드래그하여 이동`}
                  >
                    {player.name.length > 4 ? player.name.substring(0, 3) : player.name}
                  </div>
                ))}

                {playerPositions.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center bg-black bg-opacity-50 p-4 rounded-lg">
                      <p className="text-lg font-bold mb-2">포메이션을 선택해주세요</p>
                      <p className="text-sm">← 왼쪽에서 포메이션을 선택하면 자동으로 선수가 배치됩니다</p>
                    </div>
                  </div>
                )}

                {playerPositions.length > 0 && (
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                    💡 선수를 드래그하여 위치를 조정하세요
                  </div>
                )}

                {/* 포메이션 정보 */}
                {isFormationApplied && (
                  <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                    {selectedFormation} 포메이션 ({playerPositions.filter(p => p.team === 'A').length} vs {playerPositions.filter(p => p.team === 'B').length})
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 하단 컨트롤 */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Button onClick={() => setAppPhase("setSetup")} variant="outline" size="lg">
                <span className="mr-2">←</span>
                세트 관리로
              </Button>
              
              <div className="text-center">
                <p className="text-lg font-semibold mb-1">
                  {selectedFormation} 포메이션
                </p>
                <p className="text-sm text-gray-600">
                  {currentSet.teamA?.name || '팀A'} vs {currentSet.teamB?.name || '팀B'}
                </p>
                {isFormationApplied && playerPositions.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ 포메이션 설정 완료 - 경기를 시작할 수 있습니다
                  </p>
                )}
              </div>

              <Button 
                onClick={confirmFormation}
                disabled={!isFormationApplied || playerPositions.length === 0 || isTeamAShort || isTeamBShort}
                size="lg"
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
              >
                <span className="mr-2">▶️</span>
                경기 시작
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}