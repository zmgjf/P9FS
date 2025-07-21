// components/TeamManagement.tsx

"use client";

import React, { useState } from "react";
import type { Team, Player } from "@/lib/types";
import type { AppPhase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  setAppPhase: React.Dispatch<React.SetStateAction<AppPhase>>;
}

export default function TeamManagement({ teams, setTeams, setAppPhase }: Props) {
  const [newTeamName, setNewTeamName] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editedTeamName, setEditedTeamName] = useState("");
  const [editedPlayerName, setEditedPlayerName] = useState("");
  const [addingPlayerToTeam, setAddingPlayerToTeam] = useState<string | null>(null);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

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
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">👥 팀 관리</h1>
          <p className="text-gray-600">팀과 선수를 추가하고 관리하세요</p>
        </div>

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
              <p className="text-gray-400">위에서 새 팀을 만들어보세요!</p>
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
                    : `⚠️ 최소 2개 팀이 필요합니다 (현재: ${teams.length}개)`
                  }
                </p>
                <p className="text-xs text-gray-500">
                  총 {teams.reduce((acc, team) => acc + team.players.length, 0)}명의 선수가 등록되어 있습니다
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  💡 팀명이나 선수명을 클릭하면 수정할 수 있습니다
                </p>
              </div>

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}