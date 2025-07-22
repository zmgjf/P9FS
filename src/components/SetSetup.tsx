// components/SetSetup.tsx

"use client";

import React, { useState } from "react";
import type { GameSet, Team, AppPhase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  sets: GameSet[];
  setSets: React.Dispatch<React.SetStateAction<GameSet[]>>;
  teams: Team[];
  setAppPhase: React.Dispatch<React.SetStateAction<AppPhase>>;
  setCurrentSetIndex: (index: number) => void;
}

export default function SetSetup({ sets, setSets, teams, setAppPhase, setCurrentSetIndex }: Props) {
  const [newSetName, setNewSetName] = useState("");
  const [duration, setDuration] = useState(10);
  const [teamAId, setTeamAId] = useState<string>("");
  const [teamBId, setTeamBId] = useState<string>("");
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editedSetName, setEditedSetName] = useState("");
  const [editedDuration, setEditedDuration] = useState<number>(10);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const createSet = () => {
    if (!newSetName.trim()) {
      alert("세트 이름을 입력하세요.");
      return;
    }
    
    if (teams.length < 2) {
      alert("먼저 팀을 2개 이상 만들어주세요.");
      return;
    }

    const selectedTeamA = teams.find(team => team.id === teamAId) || teams[0];
    const selectedTeamB = teams.find(team => team.id === teamBId) || teams[1];

    if (selectedTeamA.id === selectedTeamB.id) {
      alert("다른 팀을 선택해주세요.");
      return;
    }

    const newSet: GameSet = {
      id: generateId(),
      name: newSetName,
      duration,
      teamA: selectedTeamA,
      teamB: selectedTeamB,
      isActive: false,
      events: [],
    };
    setSets(prev => [...prev, newSet]);
    setNewSetName("");
    setDuration(10);
    setTeamAId("");
    setTeamBId("");
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
    if (confirm("이 세트를 삭제하시겠습니까?")) {
      setSets(prev => prev.filter(set => set.id !== setId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">⚙️ 세트 설정</h1>
          <p className="text-gray-600">경기 세트를 구성하고 팀을 배정하세요</p>
        </div>

        {/* 팀 부족 경고 */}
        {teams.length < 2 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-medium text-yellow-800">팀이 부족합니다</p>
                  <p className="text-sm text-yellow-600">세트를 만들려면 최소 2개의 팀이 필요합니다.</p>
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

        {/* 새 세트 추가 카드 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">➕</span>
              새 세트 추가
            </CardTitle>
            <CardDescription>
              경기 세트를 만들고 참여할 팀을 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">세트 이름</label>
                <Input
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  placeholder="1세트, 결승전 등"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">경기 시간 (분)</label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
                  min="1"
                  max="90"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">팀A (빨강)</label>
                <Select value={teamAId} onValueChange={setTeamAId}>
                  <SelectTrigger>
                    <SelectValue placeholder="팀 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} ({team.players.length}명)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">팀B (파랑)</label>
                <Select value={teamBId} onValueChange={setTeamBId}>
                  <SelectTrigger>
                    <SelectValue placeholder="팀 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} ({team.players.length}명)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={createSet} 
              disabled={teams.length < 2}
              className="w-full md:w-auto"
              size="lg"
            >
              <span className="mr-2">⚽</span>
              세트 추가
            </Button>
          </CardContent>
        </Card>

        {/* 세트 목록 */}
        {sets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">⚙️</div>
              <p className="text-gray-500 text-lg mb-2">아직 생성된 세트가 없습니다</p>
              <p className="text-gray-400">위에서 새 세트를 추가해보세요!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 mb-8">
            {sets.map((set, index) => (
              <Card key={set.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {editingSetId === set.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          value={editedSetName}
                          onChange={(e) => setEditedSetName(e.target.value)}
                          placeholder="세트 이름"
                        />
                        <Input
                          type="number"
                          value={editedDuration}
                          onChange={(e) => setEditedDuration(parseInt(e.target.value) || 10)}
                          min="1"
                          placeholder="시간 (분)"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => updateSet(set.id)} variant="outline">
                          저장
                        </Button>
                        <Button onClick={() => setEditingSetId(null)} variant="ghost">
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 
                            className="text-xl font-semibold text-gray-800 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => {
                              setEditingSetId(set.id);
                              setEditedSetName(set.name);
                              setEditedDuration(set.duration);
                            }}
                          >
                            {set.name} <span className="text-sm font-normal text-gray-500">(클릭하여 수정)</span>
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            ⏱️ {set.duration}분 경기 | 📊 {set.events?.length || 0}개 이벤트 기록됨
                          </p>
                          
                          {/* 팀 대결 표시 */}
                          <div className="flex items-center justify-center gap-4 bg-gray-50 rounded-lg p-4">
                            <div className="text-center">
                              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                                A
                              </div>
                              <div className="font-medium text-gray-800">{set.teamA?.name || '팀A'}</div>
                              <div className="text-sm text-gray-600">{set.teamA?.players?.length || 0}명</div>
                            </div>
                            
                            <div className="text-3xl font-bold text-gray-400">VS</div>
                            
                            <div className="text-center">
                              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                                B
                              </div>
                              <div className="font-medium text-gray-800">{set.teamB?.name || '팀B'}</div>
                              <div className="text-sm text-gray-600">{set.teamB?.players?.length || 0}명</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button 
                          onClick={() => deleteSet(set.id)} 
                          variant="destructive"
                          size="sm"
                        >
                          🗑️ 삭제
                        </Button>
                        <Button 
                          onClick={() => {
                            setCurrentSetIndex(index);
                            setAppPhase("formationSetup");
                          }}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          ⚙️ 포메이션 설정
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 하단 네비게이션 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Button onClick={() => setAppPhase("teamManagement")} variant="outline" size="lg">
                <span className="mr-2">←</span>
                팀 관리로
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  📊 총 {sets.length}개의 세트가 준비되었습니다
                </p>
                <p className="text-xs text-gray-500">
                  세트를 선택하여 경기를 시작하세요
                </p>
              </div>

              <Button onClick={() => setAppPhase("matchManagement")} variant="outline" size="lg">
                경기 목록으로
                <span className="ml-2">→</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}