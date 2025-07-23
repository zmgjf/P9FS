// src/components/TeamManagement.tsx - 간단한 버전
"use client";

import React, { useState, useEffect } from "react";
import type { Team, Player, AppPhase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  setAppPhase: React.Dispatch<React.SetStateAction<AppPhase>>;
}

interface SavedTeamSet {
  id: string;
  name: string;
  description: string;
  teams: Team[];
  createdAt: string;
  lastUsed?: string;
}

export default function TeamManagement({ teams, setTeams, setAppPhase }: Props) {
  const [newTeamName, setNewTeamName] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editedTeamName, setEditedTeamName] = useState("");
  const [editedPlayerName, setEditedPlayerName] = useState("");
  const [addingPlayerToTeam, setAddingPlayerToTeam] = useState<string | null>(null);
  
  // 팀 세트 저장/불러오기 관련 상태
  const [savedTeamSets, setSavedTeamSets] = useState<SavedTeamSet[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveSetName, setSaveSetName] = useState("");
  const [saveSetDescription, setSaveSetDescription] = useState("");
  const [selectedTeamSetId, setSelectedTeamSetId] = useState("");

  // 파일 공유 관련 상태
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState("");

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  // 저장된 팀 세트들 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('futsal-saved-team-sets');
      if (saved) {
        try {
          setSavedTeamSets(JSON.parse(saved));
        } catch (error) {
          console.error('Failed to load saved team sets:', error);
        }
      }
    }
  }, []);

  // 팀 세트 저장
  const saveTeamSet = () => {
    if (!saveSetName.trim()) {
      alert("팀 세트 이름을 입력해주세요.");
      return;
    }

    if (teams.length === 0) {
      alert("저장할 팀이 없습니다.");
      return;
    }

    const newTeamSet: SavedTeamSet = {
      id: generateId(),
      name: saveSetName,
      description: saveSetDescription,
      teams: [...teams],
      createdAt: new Date().toISOString(),
    };

    const updatedSets = [...savedTeamSets, newTeamSet];
    setSavedTeamSets(updatedSets);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('futsal-saved-team-sets', JSON.stringify(updatedSets));
    }

    setSaveSetName("");
    setSaveSetDescription("");
    setShowSaveDialog(false);
    alert(`"${saveSetName}" 팀 세트가 저장되었습니다!`);
  };

  // 팀 세트 불러오기
  const loadTeamSet = (teamSetId: string) => {
    const teamSet = savedTeamSets.find(set => set.id === teamSetId);
    if (!teamSet) {
      alert("선택된 팀 세트를 찾을 수 없습니다.");
      return;
    }

    const shouldReplace = confirm(
      `"${teamSet.name}" 팀 세트를 불러오시겠습니까?\n` +
      `${teamSet.teams.length}개의 팀이 현재 팀 목록을 대체합니다.`
    );

    if (shouldReplace) {
      setTeams([...teamSet.teams]);
      
      // 마지막 사용 시간 업데이트
      const updatedSets = savedTeamSets.map(set => 
        set.id === teamSetId 
          ? { ...set, lastUsed: new Date().toISOString() }
          : set
      );
      setSavedTeamSets(updatedSets);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('futsal-saved-team-sets', JSON.stringify(updatedSets));
      }

      setShowLoadDialog(false);
      alert(`"${teamSet.name}" 팀 세트를 불러왔습니다!`);
    }
  };

  // 팀 세트 삭제
  const deleteTeamSet = (teamSetId: string) => {
    const teamSet = savedTeamSets.find(set => set.id === teamSetId);
    if (!teamSet) return;

    const shouldDelete = confirm(`"${teamSet.name}" 팀 세트를 삭제하시겠습니까?`);
    if (shouldDelete) {
      const updatedSets = savedTeamSets.filter(set => set.id !== teamSetId);
      setSavedTeamSets(updatedSets);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('futsal-saved-team-sets', JSON.stringify(updatedSets));
      }
      
      alert("팀 세트가 삭제되었습니다.");
    }
  };

  // 데이터 내보내기 (파일로)
  const exportTeamData = () => {
    const exportData = {
      teams,
      savedTeamSets,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `futsal-teams-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportDialog(false);
    alert("팀 데이터가 파일로 내보내기 되었습니다!");
  };

  // 데이터 가져오기 (파일에서)
  const importTeamData = () => {
    if (!importData.trim()) {
      alert("가져올 데이터를 입력해주세요.");
      return;
    }

    try {
      const data = JSON.parse(importData);
      
      if (!data.teams && !data.savedTeamSets) {
        alert("올바른 팀 데이터 형식이 아닙니다.");
        return;
      }

      const shouldImport = confirm(
        "팀 데이터를 가져오시겠습니까?\n" +
        `현재 팀: ${teams.length}개 → 가져올 팀: ${data.teams?.length || 0}개\n` +
        `현재 저장된 세트: ${savedTeamSets.length}개 → 가져올 세트: ${data.savedTeamSets?.length || 0}개`
      );

      if (shouldImport) {
        if (data.teams) {
          setTeams(data.teams);
        }
        
        if (data.savedTeamSets) {
          // 기존 세트와 중복 방지
          const mergedSets = [...savedTeamSets];
          data.savedTeamSets.forEach((newSet: SavedTeamSet) => {
            if (!mergedSets.find(existing => existing.name === newSet.name)) {
              mergedSets.push({
                ...newSet,
                id: generateId(), // 새 ID 생성
              });
            }
          });
          
          setSavedTeamSets(mergedSets);
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('futsal-saved-team-sets', JSON.stringify(mergedSets));
          }
        }

        setImportData("");
        setShowImportDialog(false);
        alert("팀 데이터를 성공적으로 가져왔습니다!");
      }
    } catch (error) {
      alert("데이터 형식이 올바르지 않습니다. JSON 형식을 확인해주세요.");
    }
  };

  // 파일 업로드 핸들러
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  // 기존 팀 관리 함수들
  const createTeam = () => {
    if (!newTeamName.trim()) {
      alert("팀 이름을 입력하세요.");
      return;
    }
    
    const newTeam: Team = {
      id: generateId(),
      name: newTeamName,
      players: [],
      createdAt: new Date().toISOString(),
    };
    
    setTeams(prev => [...prev, newTeam]);
    setNewTeamName("");
  };

  const updateTeamName = (teamId: string) => {
    if (!editedTeamName.trim()) {
      alert("팀 이름을 입력하세요.");
      return;
    }
    
    setTeams(prev => prev.map(team => team.id === teamId ? { ...team, name: editedTeamName } : team));
    setEditingTeamId(null);
    setEditedTeamName("");
  };

  const addPlayer = (teamId: string) => {
    if (!newPlayerName.trim()) {
      alert("선수 이름을 입력하세요.");
      return;
    }
    
    const newPlayer: Player = {
      id: generateId(),
      name: newPlayerName,
    };
    
    setTeams(prev =>
      prev.map(t =>
        t.id === teamId ? { ...t, players: [...t.players, newPlayer] } : t
      )
    );
    setNewPlayerName("");
    setAddingPlayerToTeam(null);
  };

  const updatePlayerName = (teamId: string, playerId: string) => {
    if (!editedPlayerName.trim()) {
      alert("선수 이름을 입력하세요.");
      return;
    }
    
    setTeams(prev =>
      prev.map(team =>
        team.id === teamId
          ? {
              ...team,
              players: team.players.map(player =>
                player.id === playerId ? { ...player, name: editedPlayerName } : player
              )
            }
          : team
      )
    );
    setEditingPlayerId(null);
    setEditedPlayerName("");
  };

  const deletePlayer = (teamId: string, playerId: string) => {
    if (confirm("이 선수를 삭제하시겠습니까?")) {
      setTeams(prev =>
        prev.map(t =>
          t.id === teamId ? { ...t, players: t.players.filter(p => p.id !== playerId) } : t
        )
      );
    }
  };

  const deleteTeam = (teamId: string) => {
    if (confirm("이 팀을 삭제하시겠습니까?")) {
      setTeams(prev => prev.filter(t => t.id !== teamId));
    }
  };

  const startEditingTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setEditedTeamName(team.name);
  };

  const startEditingPlayer = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditedPlayerName(player.name);
  };

  const cancelEditingTeam = () => {
    setEditingTeamId(null);
    setEditedTeamName("");
  };

  const cancelEditingPlayer = () => {
    setEditingPlayerId(null);
    setEditedPlayerName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 팀 세트 관리 */}
        <Card className="mb-6 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">💾</span>
              팀 세트 관리
            </CardTitle>
            <CardDescription>
              여러 팀 구성을 저장하고 불러와서 재사용하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Button onClick={() => setShowSaveDialog(true)} variant="outline" className="flex-1">
                <span className="mr-2">💾</span>
                현재 팀 저장
              </Button>
              <Button onClick={() => setShowLoadDialog(true)} variant="outline" className="flex-1">
                <span className="mr-2">📂</span>
                팀 세트 불러오기
              </Button>
              <Button onClick={() => setShowExportDialog(true)} variant="outline" className="flex-1">
                <span className="mr-2">📤</span>
                파일로 내보내기
              </Button>
              <Button onClick={() => setShowImportDialog(true)} variant="outline" className="flex-1">
                <span className="mr-2">📥</span>
                파일에서 가져오기
              </Button>
            </div>
            
            {savedTeamSets.length > 0 && (
              <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                <p className="text-sm text-purple-700 font-medium mb-2">
                  💡 저장된 팀 세트: {savedTeamSets.length}개
                </p>
                <div className="text-xs text-purple-600 space-y-1">
                  {savedTeamSets.slice(0, 3).map(set => (
                    <div key={set.id}>• {set.name} ({set.teams.length}개 팀)</div>
                  ))}
                  {savedTeamSets.length > 3 && <div>• 그 외 {savedTeamSets.length - 3}개...</div>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 저장 다이얼로그 */}
        {showSaveDialog && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle>💾 팀 세트 저장</CardTitle>
              <CardDescription>현재 {teams.length}개 팀을 새로운 세트로 저장합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">세트 이름 *</label>
                  <Input
                    value={saveSetName}
                    onChange={(e) => setSaveSetName(e.target.value)}
                    placeholder="예: 주말 정기모임 팀"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">설명 (선택사항)</label>
                  <textarea
                    value={saveSetDescription}
                    onChange={(e) => setSaveSetDescription(e.target.value)}
                    placeholder="이 팀 세트에 대한 설명을 입력하세요"
                    rows={3}
                    className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveTeamSet} className="flex-1">저장</Button>
                  <Button onClick={() => setShowSaveDialog(false)} variant="outline" className="flex-1">취소</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 불러오기 다이얼로그 */}
        {showLoadDialog && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>📂 팀 세트 불러오기</CardTitle>
              <CardDescription>저장된 팀 세트를 선택하여 불러오세요</CardDescription>
            </CardHeader>
            <CardContent>
              {savedTeamSets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>저장된 팀 세트가 없습니다.</p>
                  <p>먼저 팀을 만들고 저장해보세요!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Select value={selectedTeamSetId} onValueChange={setSelectedTeamSetId}>
                      <SelectTrigger>
                        <SelectValue placeholder="불러올 팀 세트를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {savedTeamSets.map(teamSet => (
                          <SelectItem key={teamSet.id} value={teamSet.id}>
                            {teamSet.name} ({teamSet.teams.length}개 팀)
                            {teamSet.lastUsed && (
                              <span className="text-xs text-gray-500 ml-2">
                                마지막 사용: {new Date(teamSet.lastUsed).toLocaleDateString()}
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedTeamSetId && (
                    <div className="p-3 bg-white rounded border">
                      {(() => {
                        const selected = savedTeamSets.find(set => set.id === selectedTeamSetId);
                        return selected ? (
                          <div>
                            <h4 className="font-medium">{selected.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{selected.description}</p>
                            <div className="text-xs text-gray-500 mt-2">
                              생성일: {new Date(selected.createdAt).toLocaleDateString()}
                            </div>
                            <div className="mt-2">
                              <div className="text-sm font-medium">포함된 팀:</div>
                              <div className="grid grid-cols-2 gap-1 mt-1">
                                {selected.teams.map(team => (
                                  <div key={team.id} className="text-xs bg-gray-100 p-1 rounded">
                                    {team.name} ({team.players.length}명)
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => selectedTeamSetId && loadTeamSet(selectedTeamSetId)} 
                      disabled={!selectedTeamSetId}
                      className="flex-1"
                    >
                      불러오기
                    </Button>
                    <Button 
                      onClick={() => selectedTeamSetId && deleteTeamSet(selectedTeamSetId)} 
                      disabled={!selectedTeamSetId}
                      variant="destructive"
                    >
                      삭제
                    </Button>
                    <Button onClick={() => setShowLoadDialog(false)} variant="outline">취소</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 내보내기 다이얼로그 */}
        {showExportDialog && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle>📤 데이터 내보내기</CardTitle>
              <CardDescription>팀 데이터를 파일로 저장하여 다른 사람과 공유하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-white rounded border">
                  <div className="text-sm">
                    <p><strong>현재 팀:</strong> {teams.length}개</p>
                    <p><strong>저장된 팀 세트:</strong> {savedTeamSets.length}개</p>
                    <p className="text-gray-600 mt-2">
                      이 데이터들이 JSON 파일로 내보내집니다.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={exportTeamData} className="flex-1">파일로 내보내기</Button>
                  <Button onClick={() => setShowExportDialog(false)} variant="outline">취소</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 가져오기 다이얼로그 */}
        {showImportDialog && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle>📥 데이터 가져오기</CardTitle>
              <CardDescription>다른 사람이 공유한 팀 데이터를 가져오세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">파일 선택</label>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">또는 JSON 데이터 직접 입력</label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder='{"teams": [...], "savedTeamSets": [...]}'
                    rows={6}
                    className="font-mono text-xs flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={importTeamData} className="flex-1">데이터 가져오기</Button>
                  <Button onClick={() => setShowImportDialog(false)} variant="outline">취소</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 새 팀 추가 카드 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">➕</span>
              새 팀 추가
            </CardTitle>
            <CardDescription>
              경기에 참여할 팀을 생성하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="팀 이름을 입력하세요"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && createTeam()}
              />
              <Button onClick={createTeam} size="lg">
                <span className="mr-2">👥</span>
                팀 추가
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 팀 목록 */}
        {teams.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-500 text-lg mb-2">아직 팀이 없습니다</p>
              <p className="text-gray-400 mb-4">위에서 새 팀을 만들거나 저장된 팀을 불러와보세요!</p>
              <Button onClick={() => setShowLoadDialog(true)} variant="outline">
                <span className="mr-2">📂</span>
                저장된 팀 불러오기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {teams.map((team, index) => (
              <Card key={team.id} className="overflow-hidden">
                <CardHeader className={`${index % 2 === 0 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingTeamId === team.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={editedTeamName}
                            onChange={(e) => setEditedTeamName(e.target.value)}
                            className="flex-1"
                            onKeyPress={(e) => e.key === 'Enter' && updateTeamName(team.id)}
                            autoFocus
                          />
                          <Button onClick={() => updateTeamName(team.id)} size="sm" variant="outline">
                            저장
                          </Button>
                          <Button onClick={cancelEditingTeam} size="sm" variant="ghost">
                            취소
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <CardTitle 
                            className="cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2"
                            onClick={() => startEditingTeam(team)}
                            title="클릭하여 수정"
                          >
                            <span className={`w-4 h-4 rounded-full ${index % 2 === 0 ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                            {team.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {team.players.length}명의 선수 | 클릭하여 팀명 수정
                          </CardDescription>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => startEditingTeam(team)} variant="outline" size="sm">
                        ✏️
                      </Button>
                      <Button onClick={() => deleteTeam(team.id)} variant="destructive" size="sm">
                        🗑️
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  {/* 선수 추가 */}
                  <div className="mb-4">
                    {addingPlayerToTeam === team.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={newPlayerName}
                          onChange={(e) => setNewPlayerName(e.target.value)}
                          placeholder="선수 이름"
                          className="flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && addPlayer(team.id)}
                          autoFocus
                        />
                        <Button onClick={() => addPlayer(team.id)} size="sm">
                          추가
                        </Button>
                        <Button onClick={() => setAddingPlayerToTeam(null)} size="sm" variant="outline">
                          취소
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => setAddingPlayerToTeam(team.id)} 
                        variant="outline" 
                        className="w-full"
                        size="sm"
                      >
                        <span className="mr-2">➕</span>
                        선수 추가
                      </Button>
                    )}
                  </div>

                  {/* 선수 목록 */}
                  {team.players.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-3xl mb-2">⚽</div>
                      <p>아직 선수가 없습니다</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        선수 목록 ({team.players.length}명)
                      </div>
                      {team.players.map((player, playerIndex) => (
                        <div key={player.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-8 h-8 rounded-full ${index % 2 === 0 ? 'bg-red-500' : 'bg-blue-500'} text-white flex items-center justify-center text-sm font-bold`}>
                              {playerIndex + 1}
                            </div>
                            {editingPlayerId === player.id ? (
                              <Input
                                value={editedPlayerName}
                                onChange={(e) => setEditedPlayerName(e.target.value)}
                                className="flex-1"
                                onKeyPress={(e) => e.key === 'Enter' && updatePlayerName(team.id, player.id)}
                                autoFocus
                              />
                            ) : (
                              <span 
                                className="cursor-pointer hover:text-blue-600 transition-colors flex-1"
                                onClick={() => startEditingPlayer(player)}
                                title="클릭하여 수정"
                              >
                                {player.name}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {editingPlayerId === player.id ? (
                              <>
                                <Button onClick={() => updatePlayerName(team.id, player.id)} size="sm" variant="outline">
                                  저장
                                </Button>
                                <Button onClick={cancelEditingPlayer} size="sm" variant="ghost">
                                  취소
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button onClick={() => startEditingPlayer(player)} size="sm" variant="outline">
                                  ✏️
                                </Button>
                                <Button onClick={() => deletePlayer(team.id, player.id)} size="sm" variant="destructive">
                                  🗑️
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
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
              <Button onClick={() => setAppPhase("matchManagement")} variant="outline" size="lg">
                <span className="mr-2">←</span>
                경기 목록으로
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  {teams.length >= 2 
                    ? "✅ 팀이 준비되었습니다!" 
                    : "⚠️ 최소 2개 팀이 필요합니다 (현재: " + teams.length + "개)"
                  }
                </p>
                <p className="text-xs text-gray-500">
                  총 {teams.reduce((acc, team) => acc + team.players.length, 0)}명의 선수가 등록되어 있습니다
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  💡 팀명이나 선수명을 클릭하면 수정할 수 있습니다
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowSaveDialog(true)}
                  variant="outline"
                  size="lg"
                  disabled={teams.length === 0}
                >
                  <span className="mr-2">💾</span>
                  저장
                </Button>
                <Button 
                  onClick={() => setAppPhase("setSetup")} 
                  disabled={teams.length < 2}
                  size="lg"
                >
                  <span className="mr-2">⚽</span>
                  세트 설정으로
                  <span className="ml-2">→</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}