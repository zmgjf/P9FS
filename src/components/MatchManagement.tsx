"use client";

import React, { useState } from "react";
import type { Match } from "@/lib/types";
import type { AppPhase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  setCurrentMatch: (match: Match) => void;
  setAppPhase: React.Dispatch<React.SetStateAction<AppPhase>>;
}

export default function MatchManagement({ matches, setMatches, setCurrentMatch, setAppPhase }: Props) {
  const [newMatchName, setNewMatchName] = useState('');
  const [newMatchVenue, setNewMatchVenue] = useState('');
  const [newMatchDescription, setNewMatchDescription] = useState('');
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editedMatchName, setEditedMatchName] = useState('');
  const [editedMatchVenue, setEditedMatchVenue] = useState('');
  const [editedMatchDescription, setEditedMatchDescription] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'ongoing' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

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
      description: newMatchDescription,
      status: 'scheduled'
    };
    setMatches(prev => [...prev, newMatch]);
    setCurrentMatch(newMatch);
    setAppPhase("teamManagement");
    setNewMatchName("");
    setNewMatchVenue("");
    setNewMatchDescription("");
  };

  const updateMatch = (matchId: string) => {
    if (!editedMatchName.trim() || !editedMatchVenue.trim()) {
      alert("경기명과 구장명을 입력하세요.");
      return;
    }
    
    setMatches(prev => prev.map(match => 
      match.id === matchId 
        ? { 
            ...match, 
            name: editedMatchName, 
            venue: editedMatchVenue,
            description: editedMatchDescription
          }
        : match
    ));
    setEditingMatchId(null);
  };

  const deleteMatch = (matchId: string) => {
    if (confirm("이 경기를 삭제하시겠습니까? 모든 세트와 기록이 함께 삭제됩니다.")) {
      setMatches(prev => prev.filter(match => match.id !== matchId));
    }
  };

  const duplicateMatch = (match: Match) => {
    const duplicatedMatch: Match = {
      ...match,
      id: generateId(),
      name: `${match.name} (복사본)`,
      date: new Date().toLocaleDateString("ko-KR"),
      createdAt: new Date().toISOString(),
      status: 'scheduled',
      sets: match.sets.map(set => ({
        ...set,
        id: generateId(),
        events: [],
        completedAt: undefined,
        finalScore: undefined,
        isActive: false
      }))
    };
    setMatches(prev => [...prev, duplicatedMatch]);
  };

  const startEditing = (match: Match) => {
    setEditingMatchId(match.id);
    setEditedMatchName(match.name);
    setEditedMatchVenue(match.venue);
    setEditedMatchDescription(match.description || '');
  };

  const cancelEditing = () => {
    setEditingMatchId(null);
    setEditedMatchName('');
    setEditedMatchVenue('');
    setEditedMatchDescription('');
  };

  const getMatchStatus = (match: Match): string => {
    if (match.status === 'completed') return '완료';
    if (match.status === 'ongoing') return '진행중';
    if (match.status === 'cancelled') return '취소';
    return '예정';
  };

  const getMatchStatusColor = (match: Match): string => {
    if (match.status === 'completed') return 'text-green-600 bg-green-50';
    if (match.status === 'ongoing') return 'text-blue-600 bg-blue-50';
    if (match.status === 'cancelled') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  // 안전한 경기 진행 핸들러
  const handleMatchProgress = (match: Match) => {
    try {
      console.log('Processing match:', match);
      setCurrentMatch(match);
      
      // 경기에 세트가 있으면 바로 세트 설정으로, 없으면 팀 관리로
      if (match.sets && match.sets.length > 0) {
        setAppPhase("setSetup");
      } else {
        setAppPhase("teamManagement");
      }
    } catch (error) {
      console.error('Error in handleMatchProgress:', error);
      alert("경기 진행 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 안전한 팀 관리 핸들러
  const handleTeamManagement = (match: Match) => {
    try {
      console.log('Managing teams for match:', match);
      setCurrentMatch(match);
      setAppPhase("teamManagement");
    } catch (error) {
      console.error('Error in handleTeamManagement:', error);
      alert("팀 관리 진입 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 필터링된 경기 목록
  const filteredMatches = matches.filter(match => {
    const matchesStatus = filterStatus === 'all' || match.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      match.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.venue.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // 통계 계산
  const totalMatches = matches.length;
  const completedMatches = matches.filter(m => m.status === 'completed').length;
  const ongoingMatches = matches.filter(m => m.status === 'ongoing').length;
  const scheduledMatches = matches.filter(m => m.status === 'scheduled').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">⚽ 풋살 매니저</h1>
          <p className="text-gray-600">경기를 생성하고 관리하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-800">{totalMatches}</div>
              <div className="text-sm text-gray-600">총 경기</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{ongoingMatches}</div>
              <div className="text-sm text-gray-600">진행 중</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{completedMatches}</div>
              <div className="text-sm text-gray-600">완료</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{scheduledMatches}</div>
              <div className="text-sm text-gray-600">예정</div>
            </CardContent>
          </Card>
        </div>

        {/* 메뉴 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setAppPhase("statistics")}>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-bold mb-2">통계</h3>
              <p className="text-gray-600">선수별 골, 어시스트 등 상세 통계</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setAppPhase("matchHistory")}>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-xl font-bold mb-2">경기 기록</h3>
              <p className="text-gray-600">과거 경기 결과 및 상세 기록</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setAppPhase("teamManagement")}>
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-xl font-bold mb-2">팀 관리</h3>
              <p className="text-gray-600">팀과 선수 등록 및 관리</p>
            </CardContent>
          </Card>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">설명 (선택사항)</label>
                <Input
                  value={newMatchDescription}
                  onChange={(e) => setNewMatchDescription(e.target.value)}
                  placeholder="예: 친선경기, 토너먼트 등"
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

        {/* 검색 및 필터 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="경기명이나 구장명으로 검색..."
                  className="w-full"
                />
              </div>
              <div className="md:w-48">
                <Select value={filterStatus} onValueChange={(value: 'all' | 'scheduled' | 'ongoing' | 'completed') => setFilterStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 상태</SelectItem>
                    <SelectItem value="scheduled">예정</SelectItem>
                    <SelectItem value="ongoing">진행 중</SelectItem>
                    <SelectItem value="completed">완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
              {filteredMatches.length === 0 
                ? searchTerm || filterStatus !== 'all' 
                  ? "검색 조건에 맞는 경기가 없습니다." 
                  : "아직 등록된 경기가 없습니다. 위에서 새 경기를 만들어보세요!"
                : `${filteredMatches.length}개의 경기가 표시됩니다 (전체 ${matches.length}개)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMatches.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚽</div>
                <p className="text-gray-500 text-lg mb-2">
                  {searchTerm || filterStatus !== 'all' ? "조건에 맞는 경기가 없습니다" : "등록된 경기가 없습니다"}
                </p>
                <p className="text-gray-400">
                  {searchTerm || filterStatus !== 'all' ? "다른 검색어나 필터를 시도해보세요" : "위에서 새 경기를 만들어 시작하세요!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches.map(match => (
                  <Card key={match.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {editingMatchId === match.id ? (
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
                          <Input
                            value={editedMatchDescription}
                            onChange={(e) => setEditedMatchDescription(e.target.value)}
                            placeholder="설명 (선택사항)"
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
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 
                                  className="font-semibold text-lg text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                                  onClick={() => startEditing(match)}
                                  title="클릭하여 수정"
                                >
                                  {match.name}
                                </h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${getMatchStatusColor(match)}`}>
                                  {getMatchStatus(match)}
                                </span>
                              </div>
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
                                {match.description && (
                                  <div className="flex items-center gap-1">
                                    <span>📝</span>
                                    {match.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 mb-3">
                            💡 경기명이나 구장명을 클릭하면 수정할 수 있습니다
                          </div>
                          
                          <div className="flex gap-2 mb-2">
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
                              onClick={() => duplicateMatch(match)}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <span className="mr-1">📋</span>
                              복사
                            </Button>
                          </div>

                          <div className="flex gap-2 mb-2">
                            <Button 
                              onClick={() => handleTeamManagement(match)}
                              variant="outline"
                              size="sm"
                              className="flex-1"
                            >
                              <span className="mr-1">👥</span>
                              팀 관리
                            </Button>
                            <Button 
                              onClick={() => handleMatchProgress(match)}
                              size="sm"
                              className="flex-1"
                            >
                              <span className="mr-1">▶️</span>
                              진행
                            </Button>
                          </div>

                          <div>
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