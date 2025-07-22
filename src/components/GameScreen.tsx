// components/GameScreen.tsx

"use client";

import React, { useState, useEffect } from "react";
import type { GameSet, GameEvent, AppPhase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  initialPositions?: PlayerPosition[];
  teamACount?: number;
  teamBCount?: number;
}

export default function GameScreen({ 
  currentSet, 
  setCurrentSet, 
  setAppPhase, 
  initialPositions, 
  teamACount = 3, 
  teamBCount = 3 
}: Props) {
  const [gameTime, setGameTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A');
  const [eventType, setEventType] = useState<'goal' | 'ownGoal'>('goal');
  const [assistPlayer, setAssistPlayer] = useState("");
  const [customTime, setCustomTime] = useState("");
  
  // 교체 관련 상태
  const [showSubstitution, setShowSubstitution] = useState(false);
  const [substitutionTeam, setSubstitutionTeam] = useState<'A' | 'B'>('A');
  const [playerOut, setPlayerOut] = useState("");
  const [playerIn, setPlayerIn] = useState("");
  
  // 편집 상태
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editedEventTime, setEditedEventTime] = useState("");
  const [editedEventPlayer, setEditedEventPlayer] = useState("");
  const [editedEventAssist, setEditedEventAssist] = useState("");
  const [editedEventType, setEditedEventType] = useState<'goal' | 'ownGoal'>('goal');

  // 선수 포지션 상태
  const [playerPositions, setPlayerPositions] = useState<PlayerPosition[]>(() => {
    if (initialPositions) {
      return initialPositions;
    }
    
    // 기본 포지션 (3v3)
    const teamAPlayers = currentSet.teamA?.players || [];
    const teamBPlayers = currentSet.teamB?.players || [];
    
    return [
      ...teamAPlayers.slice(0, teamACount).map((player, index) => ({
        id: player.id,
        name: player.name,
        x: 15 + (index * 5),
        y: 30 + (index % 3) * 20,
        team: 'A' as const,
        isActive: true
      })),
      ...teamBPlayers.slice(0, teamBCount).map((player, index) => ({
        id: player.id,
        name: player.name,
        x: 75 - (index * 5),
        y: 30 + (index % 3) * 20,
        team: 'B' as const,
        isActive: true
      }))
    ];
  });

  // 타이머 효과
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setGameTime(prev => {
          const newTime = prev + 1;
          if (newTime >= currentSet.duration * 60) {
            setIsPlaying(false);
            alert("경기 시간이 종료되었습니다!");
            return newTime;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSet.duration]);

  // 시간을 MM:SS 형식으로 변환
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 점수 계산
  const scoreA = currentSet.events.filter(e => 
    (e.team === 'A' && e.type === 'goal') || (e.team === 'B' && e.type === 'ownGoal')
  ).length;
  
  const scoreB = currentSet.events.filter(e => 
    (e.team === 'B' && e.type === 'goal') || (e.team === 'A' && e.type === 'ownGoal')
  ).length;

  // 현재 필드에 있는 선수들
  const activePlayersA = playerPositions.filter(p => p.team === 'A' && p.isActive);
  const activePlayersB = playerPositions.filter(p => p.team === 'B' && p.isActive);

  // 벤치에 있는 선수들
  const benchPlayersA = (currentSet.teamA?.players || []).filter(p => 
    !activePlayersA.some(ap => ap.id === p.id)
  );
  const benchPlayersB = (currentSet.teamB?.players || []).filter(p => 
    !activePlayersB.some(ap => ap.id === p.id)
  );

  const handleAddEvent = () => {
    if (!selectedPlayer.trim()) {
      alert("선수를 선택하세요.");
      return;
    }

    const eventTime = customTime || formatTime(gameTime);

    const newEvent: GameEvent = {
      id: Date.now().toString(36),
      time: eventTime,
      realTime: Date.now(),
      type: eventType,
      player: { id: selectedPlayer, name: selectedPlayer },
      team: selectedTeam,
      assistPlayer: assistPlayer ? { id: assistPlayer, name: assistPlayer } : undefined,
    };

    setCurrentSet({
      ...currentSet,
      events: [...currentSet.events, newEvent].sort((a, b) => {
        return a.time.localeCompare(b.time);
      })
    });

    setSelectedPlayer("");
    setAssistPlayer("");
    setCustomTime("");
  };

  const handlePlayerClick = (player: PlayerPosition) => {
    setSelectedPlayer(player.name);
    setSelectedTeam(player.team);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("이 이벤트를 삭제하시겠습니까?")) {
      setCurrentSet({
        ...currentSet,
        events: currentSet.events.filter(event => event.id !== eventId)
      });
    }
  };

  // 선수 교체 처리
  const handleSubstitution = () => {
    if (!playerOut || !playerIn) {
      alert("교체할 선수와 투입할 선수를 모두 선택해주세요.");
      return;
    }

    const outPlayer = playerPositions.find(p => p.id === playerOut);
    const inPlayerData = substitutionTeam === 'A' 
      ? benchPlayersA.find(p => p.id === playerIn)
      : benchPlayersB.find(p => p.id === playerIn);

    if (!outPlayer || !inPlayerData) {
      alert("선수 정보를 찾을 수 없습니다.");
      return;
    }

    // 포지션 업데이트 (선수 교체)
    setPlayerPositions(prev => 
      prev.map(player => 
        player.id === playerOut 
          ? { ...player, id: inPlayerData.id, name: inPlayerData.name }
          : player
      )
    );

    setShowSubstitution(false);
    setPlayerOut("");
    setPlayerIn("");
    
    alert(`${outPlayer.name} → ${inPlayerData.name} 교체 완료!`);
  };

  // 이벤트 편집 함수들
  const startEditingEvent = (event: GameEvent) => {
    setEditingEventId(event.id);
    setEditedEventTime(event.time);
    setEditedEventPlayer(event.player.name);
    setEditedEventAssist(event.assistPlayer?.name || "");
    setEditedEventType(event.type);
  };

  const saveEditedEvent = () => {
    if (!editedEventPlayer.trim()) {
      alert("선수 이름을 입력하세요.");
      return;
    }

    setCurrentSet({
      ...currentSet,
      events: currentSet.events.map(event =>
        event.id === editingEventId
          ? {
              ...event,
              time: editedEventTime,
              player: { ...event.player, name: editedEventPlayer },
              assistPlayer: editedEventAssist ? { id: editedEventAssist, name: editedEventAssist } : undefined,
              type: editedEventType
            }
          : event
      ).sort((a, b) => a.time.localeCompare(b.time))
    });

    setEditingEventId(null);
  };

  const cancelEditingEvent = () => {
    setEditingEventId(null);
    setEditedEventTime("");
    setEditedEventPlayer("");
    setEditedEventAssist("");
    setEditedEventType('goal');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* 헤더 */}
      <div className="bg-slate-800 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{currentSet.name}</h1>
            <p className="text-sm text-slate-300">
              {currentSet.teamA?.name || '팀A'} ({activePlayersA.length}) vs ({activePlayersB.length}) {currentSet.teamB?.name || '팀B'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setAppPhase('setSetup')} variant="secondary" size="sm">
              포메이션 설정
            </Button>
            <Button onClick={() => setShowSubstitution(true)} variant="secondary" size="sm">
              🔄 선수 교체
            </Button>
          </div>
        </div>
      </div>

      {/* 경기 상태 바 */}
      <div className="bg-slate-700 text-white p-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-lg font-semibold">{currentSet.name}</div>
          <div className="text-2xl font-bold">
            {formatTime(gameTime)} / {currentSet.duration}:00
          </div>
          <div className="text-lg font-semibold">
            {isPlaying ? "진행 중" : "대기 중"}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* 스코어보드 */}
        <Card className="mb-6 overflow-hidden">
          <div className="bg-slate-700 text-white p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-2xl font-bold">
                  {activePlayersA.length}
                </div>
                <div>
                  <div className="text-2xl font-bold">{currentSet.teamA?.name || '팀A'}</div>
                  <div className="text-sm text-slate-300">{activePlayersA.length}명 경기 중</div>
                </div>
              </div>

              <div className="text-5xl font-bold">
                {scoreA} : {scoreB}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold">{currentSet.teamB?.name || '팀B'}</div>
                  <div className="text-sm text-slate-300">{activePlayersB.length}명 경기 중</div>
                </div>
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold">
                  {activePlayersB.length}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 게임 컨트롤 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-center items-center gap-4">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                size="lg"
                className={`text-lg px-8 py-4 ${
                  isPlaying 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isPlaying ? '⏸️ 일시정지' : '▶️ 게임 시작'}
              </Button>
              
              <Button
                onClick={() => setShowSubstitution(true)}
                variant="outline"
                size="lg"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                🔄 선수 교체
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-3 text-center">
              경기 시간: {formatTime(gameTime)} / {currentSet.duration}분
            </p>
          </CardContent>
        </Card>

        {/* 선수 교체 모달 */}
        {showSubstitution && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔄 선수 교체
                <Button 
                  onClick={() => setShowSubstitution(false)}
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                >
                  ✕
                </Button>
              </CardTitle>
              <CardDescription>
                교체할 선수와 투입할 선수를 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">팀 선택</label>
                  <Select value={substitutionTeam} onValueChange={(value: 'A' | 'B') => setSubstitutionTeam(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">{currentSet.teamA?.name || '팀A'}</SelectItem>
                      <SelectItem value="B">{currentSet.teamB?.name || '팀B'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">교체될 선수 (OUT)</label>
                  <Select value={playerOut} onValueChange={setPlayerOut}>
                    <SelectTrigger>
                      <SelectValue placeholder="교체될 선수 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {(substitutionTeam === 'A' ? activePlayersA : activePlayersB).map(player => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name} (필드)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">투입될 선수 (IN)</label>
                  <Select value={playerIn} onValueChange={setPlayerIn}>
                    <SelectTrigger>
                      <SelectValue placeholder="투입될 선수 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {(substitutionTeam === 'A' ? benchPlayersA : benchPlayersB).map(player => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name} (벤치)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={handleSubstitution} className="flex-1">
                  교체 확정
                </Button>
                <Button onClick={() => setShowSubstitution(false)} variant="outline" className="flex-1">
                  취소
                </Button>
              </div>

              {/* 벤치 선수 목록 표시 */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-red-600 mb-2">
                    {currentSet.teamA?.name || '팀A'} 벤치 ({benchPlayersA.length}명)
                  </h4>
                  <div className="space-y-1">
                    {benchPlayersA.map(player => (
                      <div key={player.id} className="text-sm bg-red-50 p-2 rounded">
                        {player.name}
                      </div>
                    ))}
                    {benchPlayersA.length === 0 && (
                      <div className="text-sm text-gray-500">벤치에 선수가 없습니다</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-blue-600 mb-2">
                    {currentSet.teamB?.name || '팀B'} 벤치 ({benchPlayersB.length}명)
                  </h4>
                  <div className="space-y-1">
                    {benchPlayersB.map(player => (
                      <div key={player.id} className="text-sm bg-blue-50 p-2 rounded">
                        {player.name}
                      </div>
                    ))}
                    {benchPlayersB.length === 0 && (
                      <div className="text-sm text-gray-500">벤치에 선수가 없습니다</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 풋살 필드 */}
        <Card className="mb-6 overflow-hidden">
          <div 
            className="relative bg-green-500 h-96"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          >
            {/* 필드 라인들 */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white transform -translate-x-0.5"></div>
            <div className="absolute left-1/2 top-1/2 w-20 h-20 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute left-0 top-1/3 bottom-1/3 w-12 border-r-2 border-white"></div>
            <div className="absolute left-0 top-2/5 bottom-2/5 w-6 border-r-2 border-white"></div>
            <div className="absolute right-0 top-1/3 bottom-1/3 w-12 border-l-2 border-white"></div>
            <div className="absolute right-0 top-2/5 bottom-2/5 w-6 border-l-2 border-white"></div>

            {/* 선수들 */}
            {playerPositions.filter(p => p.isActive).map((player) => (
              <div
                key={player.id}
                onClick={() => handlePlayerClick(player)}
                className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer transition-all hover:scale-110 ${
                  player.team === 'A' ? 'bg-red-500' : 'bg-blue-500'
                } ${
                  selectedPlayer === player.name ? 'ring-4 ring-yellow-400 scale-110' : 'shadow-lg'
                }`}
                style={{
                  left: `${player.x}%`,
                  top: `${player.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={`${player.name} (${player.team}팀)`}
              >
                {player.name.length > 4 ? player.name.substring(0, 3) : player.name}
              </div>
            ))}

            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
              💡 선수를 클릭하여 선택하세요
            </div>

            {/* 현재 인원 표시 */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
              {activePlayersA.length} vs {activePlayersB.length}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 이벤트 기록 패널 */}
          <Card>
            <CardHeader>
              <CardTitle>📝 이벤트 기록</CardTitle>
              <CardDescription>골과 어시스트를 기록하세요</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">시간</label>
                  <Input
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    placeholder={`현재: ${formatTime(gameTime)}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">이벤트 타입</label>
                  <Select value={eventType} onValueChange={(value: 'goal' | 'ownGoal') => setEventType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goal">⚽ 골</SelectItem>
                      <SelectItem value="ownGoal">⚫ 자책골</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">득점 선수</label>
                  <Input
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    placeholder="필드에서 클릭하거나 입력"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">어시스트</label>
                  <Input
                    value={assistPlayer}
                    onChange={(e) => setAssistPlayer(e.target.value)}
                    placeholder="선택사항"
                  />
                </div>
              </div>

              {selectedTeam && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    선택된 팀: <span className={`font-medium ${selectedTeam === 'A' ? 'text-red-600' : 'text-blue-600'}`}>
                      {selectedTeam === 'A' ? currentSet.teamA?.name || '팀A' : currentSet.teamB?.name || '팀B'}
                    </span>
                  </p>
                </div>
              )}

              <Button onClick={handleAddEvent} className="w-full" size="lg">
                <span className="mr-2">⚽</span>
                이벤트 기록
              </Button>
            </CardContent>
          </Card>

          {/* 경기 기록 */}
          <Card>
            <CardHeader>
              <CardTitle>📊 경기 기록</CardTitle>
              <CardDescription>
                {currentSet.events.length}개의 이벤트가 기록되었습니다
                <span className="block text-xs text-gray-500 mt-1">💡 이벤트를 클릭하면 수정할 수 있습니다</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 overflow-y-auto space-y-3">
                {currentSet.events.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-2">⚽</div>
                    <p>아직 기록된 이벤트가 없습니다</p>
                  </div>
                ) : (
                  currentSet.events.map(event => {
                    const isTeamA = event.team === 'A';
                    const isEditing = editingEventId === event.id;
                    
                    return (
                      <div 
                        key={event.id} 
                        className={`p-3 rounded-lg border-l-4 ${
                          isTeamA 
                            ? 'bg-red-50 border-red-500' 
                            : 'bg-blue-50 border-blue-500'
                        }`}
                      >
                        {isEditing ? (
                          /* 편집 모드 */
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={editedEventTime}
                                onChange={(e) => setEditedEventTime(e.target.value)}
                                placeholder="시간"
                                className="text-sm"
                              />
                              <Select value={editedEventType} onValueChange={(value: 'goal' | 'ownGoal') => setEditedEventType(value)}>
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="goal">⚽ 골</SelectItem>
                                  <SelectItem value="ownGoal">⚫ 자책골</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Input
                              value={editedEventPlayer}
                              onChange={(e) => setEditedEventPlayer(e.target.value)}
                              placeholder="선수 이름"
                              className="text-sm"
                            />
                            <Input
                              value={editedEventAssist}
                              onChange={(e) => setEditedEventAssist(e.target.value)}
                              placeholder="어시스트 (선택사항)"
                              className="text-sm"
                            />
                            <div className="flex gap-2">
                              <Button onClick={saveEditedEvent} size="sm" className="flex-1">
                                저장
                              </Button>
                              <Button onClick={cancelEditingEvent} variant="outline" size="sm" className="flex-1">
                                취소
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* 표시 모드 */
                          <div className="flex justify-between items-start">
                            <div 
                              className="flex-1 cursor-pointer hover:bg-white hover:bg-opacity-50 p-1 rounded transition-colors"
                              onClick={() => startEditingEvent(event)}
                              title="클릭하여 수정"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-lg">{event.time}</span>
                                <span className={`font-medium ${isTeamA ? 'text-red-600' : 'text-blue-600'}`}>
                                  {isTeamA ? currentSet.teamA?.name || '팀A' : currentSet.teamB?.name || '팀B'}
                                </span>
                              </div>
                              <p className="font-medium">
                                {event.player.name} 
                                {event.type === 'ownGoal' ? ' ⚫ 자책골' : ' ⚽ 골'}
                              </p>
                              {event.assistPlayer && (
                                <p className="text-sm text-gray-600">
                                  🅰️ 어시스트: {event.assistPlayer.name}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                onClick={() => startEditingEvent(event)}
                                variant="outline"
                                size="sm"
                              >
                                ✏️
                              </Button>
                              <Button 
                                onClick={() => handleDeleteEvent(event.id)}
                                variant="destructive"
                                size="sm"
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
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
                포메이션 설정으로
              </Button>
              
              <div className="text-center">
                <p className="text-lg font-semibold mb-1">
                  {currentSet.teamA?.name || '팀A'} {scoreA} : {scoreB} {currentSet.teamB?.name || '팀B'}
                </p>
                <p className="text-sm text-gray-600">
                  경기 시간: {formatTime(gameTime)} / {currentSet.duration}분 | {activePlayersA.length} vs {activePlayersB.length}
                </p>
              </div>

              <Button 
                onClick={() => {
                  if (confirm('경기를 종료하시겠습니까?')) {
                    setIsPlaying(false);
                    setAppPhase("matchHistory");
                  }
                }}
                variant="destructive"
                size="lg"
              >
                🏁 경기 종료 (기록 보기)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}