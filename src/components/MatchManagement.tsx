// components/MatchManagement.tsx

"use client";

import React, { useState } from "react";
import type { Match } from "@/lib/types";
import type { AppPhase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  setCurrentMatch: (match: Match) => void;
  setAppPhase: React.Dispatch<React.SetStateAction<AppPhase>>;
}

export default function MatchManagement({ matches, setMatches, setCurrentMatch, setAppPhase }: Props) {
  const [newMatchName, setNewMatchName] = useState('');
  const [newMatchVenue, setNewMatchVenue] = useState('');
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editedMatchName, setEditedMatchName] = useState('');
  const [editedMatchVenue, setEditedMatchVenue] = useState('');

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const createMatch = () => {
    if (!newMatchName.trim() || !newMatchVenue.trim()) {
      alert("경기명과 구장명을 입력하세요.");
      return;
    }
    const newMatch: Match = {
      id: generateId(),
      name: newMatchName,
      venue: newMatchVenue,
      date: new Date().toLocaleDateString("ko-KR"),
      sets: [],
      createdAt: new Date().toISOString(),
    };
    setMatches(prev => [...prev, newMatch]);
    setCurrentMatch(newMatch);
    setAppPhase("teamManagement");
    setNewMatchName("");
    setNewMatchVenue("");
  };

  const updateMatch = (matchId: string) => {
    if (!editedMatchName.trim() || !editedMatchVenue.trim()) {
      alert("경기명과 구장명을 입력하세요.");
      return;
    }
    
    setMatches(prev => prev.map(match => 
      match.id === matchId 
        ? { ...match, name: editedMatchName, venue: editedMatchVenue }
        : match
    ));
    setEditingMatchId(null);
  };

  const deleteMatch = (matchId: string) => {
    if (confirm("이 경기를 삭제하시겠습니까?")) {
      setMatches(prev => prev.filter(match => match.id !== matchId));
    }
  };

  const startEditing = (match: Match) => {
    setEditingMatchId(match.id);
    setEditedMatchName(match.name);
    setEditedMatchVenue(match.venue);
  };

  const cancelEditing = () => {
    setEditingMatchId(null);
    setEditedMatchName('');
    setEditedMatchVenue('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">⚽ 풋살 매니저</h1>
          <p className="text-gray-600">경기를 생성하고 관리하세요</p>
        </div>

        {/* 새 경기 생성 카드 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🆕</span>
              새 경기 만들기
            </CardTitle>
            <CardDescription>
              새로운 풋살 경기를 생성하여 팀과 선수를 관리하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">경기명</label>
                <Input
                  value={newMatchName}
                  onChange={(e) => setNewMatchName(e.target.value)}
                  placeholder="예: 주말 친선경기"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">구장명</label>
                <Input
                  value={newMatchVenue}
                  onChange={(e) => setNewMatchVenue(e.target.value)}
                  placeholder="예: 강남 풋살장"
                  className="w-full"
                />
              </div>
            </div>
            <Button 
              onClick={createMatch} 
              className="w-full md:w-auto"
              size="lg"
            >
              <span className="text-lg mr-2">⚽</span>
              경기 생성하기
            </Button>
          </CardContent>
        </Card>

        {/* 기존 경기 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📋</span>
              경기 목록
            </CardTitle>
            <CardDescription>
              {matches.length === 0 
                ? "아직 등록된 경기가 없습니다. 위에서 새 경기를 만들어보세요!" 
                : `총 ${matches.length}개의 경기가 등록되어 있습니다`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {matches.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚽</div>
                <p className="text-gray-500 text-lg mb-2">등록된 경기가 없습니다</p>
                <p className="text-gray-400">위에서 새 경기를 만들어 시작하세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map(match => (
                  <Card key={match.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {editingMatchId === match.id ? (
                        /* 편집 모드 */
                        <div className="space-y-3">
                          <Input
                            value={editedMatchName}
                            onChange={(e) => setEditedMatchName(e.target.value)}
                            placeholder="경기명"
                            className="font-semibold"
                          />
                          <Input
                            value={editedMatchVenue}
                            onChange={(e) => setEditedMatchVenue(e.target.value)}
                            placeholder="구장명"
                          />
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => updateMatch(match.id)}
                              size="sm"
                              className="flex-1"
                            >
                              저장
                            </Button>
                            <Button 
                              onClick={cancelEditing}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              취소
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* 표시 모드 */
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 
                                className="font-semibold text-lg text-gray-800 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => startEditing(match)}
                                title="클릭하여 수정"
                              >
                                {match.name}
                              </h3>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div 
                                  className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors"
                                  onClick={() => startEditing(match)}
                                  title="클릭하여 수정"
                                >
                                  <span>📍</span>
                                  {match.venue}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>📅</span>
                                  {match.date}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>⚽</span>
                                  {match.sets.length}개 세트
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 mb-3">
                            💡 경기명이나 구장명을 클릭하면 수정할 수 있습니다
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => startEditing(match)}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <span className="mr-1">✏️</span>
                              수정
                            </Button>
                            <Button 
                              onClick={() => {
                                setCurrentMatch(match);
                                setAppPhase("teamManagement");
                              }}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <span className="mr-1">👥</span>
                              팀 관리
                            </Button>
                            <Button 
                              onClick={() => {
                                setCurrentMatch(match);
                                setAppPhase("setSetup");
                              }}
                              size="sm"
                              className="flex-1"
                            >
                              <span className="mr-1">▶️</span>
                              진행
                            </Button>
                          </div>

                          <div className="mt-2">
                            <Button 
                              onClick={() => deleteMatch(match.id)}
                              variant="destructive"
                              size="sm"
                              className="w-full"
                            >
                              <span className="mr-1">🗑️</span>
                              경기 삭제
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}