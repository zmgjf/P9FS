// src/components/MatchHistory.tsx - Collapsible 없는 버전
"use client";

import React, { useState } from "react";
import type { GameSet, AppPhase, Match } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  matches: Match[];
  sets: GameSet[];
  setAppPhase: React.Dispatch<React.SetStateAction<AppPhase>>;
}

export default function MatchHistory({ matches, sets, setAppPhase }: Props) {
  const [expandedMatches, setExpandedMatches] = useState<Set<string>>(new Set());

  const getScore = (set: GameSet) => {
    const scoreA = set.events.filter(e => 
      (e.team === 'A' && e.type === 'goal') || (e.team === 'B' && e.type === 'ownGoal')
    ).length;
    
    const scoreB = set.events.filter(e => 
      (e.team === 'B' && e.type === 'goal') || (e.team === 'A' && e.type === 'ownGoal')
    ).length;
    
    return { scoreA, scoreB };
  };

  const toggleMatchExpanded = (matchId: string) => {
    const newExpanded = new Set(expandedMatches);
    if (newExpanded.has(matchId)) {
      newExpanded.delete(matchId);
    } else {
      newExpanded.add(matchId);
    }
    setExpandedMatches(newExpanded);
  };

  // 진행된 경기만 필터링
  const completedMatches = matches.filter(match => 
    match.sets.some(set => set.events.length > 0)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* 요약 통계 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              전체 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center bg-blue-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{completedMatches.length}</div>
                <div className="text-sm text-gray-600">진행된 경기</div>
              </div>
              <div className="text-center bg-green-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {sets.filter(set => set.events.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">완료된 세트</div>
              </div>
              <div className="text-center bg-purple-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {sets.reduce((sum, set) => sum + set.events.filter(e => e.type === 'goal').length, 0)}
                </div>
                <div className="text-sm text-gray-600">총 골 수</div>
              </div>
              <div className="text-center bg-orange-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">
                  {matches.filter(m => m.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">완료된 경기</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 경기 목록 */}
        {completedMatches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 text-lg mb-2">아직 진행된 경기가 없습니다</p>
              <p className="text-gray-400">경기를 생성하고 세트를 진행해보세요!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {completedMatches.map((match) => {
              const isExpanded = expandedMatches.has(match.id);
              const teamAName = match.sets[0]?.teamA?.name || '팀A';
              const teamBName = match.sets[0]?.teamB?.name || '팀B';

              // 경기 총합 점수 계산
              let totalScoreA = 0;
              let totalScoreB = 0;
              match.sets.forEach(set => {
                const { scoreA, scoreB } = getScore(set);
                totalScoreA += scoreA;
                totalScoreB += scoreB;
              });

              const winner = totalScoreA > totalScoreB ? 'A' : totalScoreB > totalScoreA ? 'B' : 'draw';

              return (
                <Card key={match.id} className="overflow-hidden">
                  {/* 경기 헤더 - 항상 표시 */}
                  <CardHeader 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleMatchExpanded(match.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{isExpanded ? '⬇️' : '➡️'}</span>
                        <div className="text-left">
                          <CardTitle className="text-xl">{match.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <span>📍 {match.venue}</span>
                            <span>📅 {match.date}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              match.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {match.status === 'completed' ? '완료' : '진행중'}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-3xl font-bold mb-2">
                          <span className={winner === 'A' ? 'text-red-600' : 'text-gray-600'}>
                            {totalScoreA}
                          </span>
                          <span className="text-gray-400 mx-2">:</span>
                          <span className={winner === 'B' ? 'text-blue-600' : 'text-gray-600'}>
                            {totalScoreB}
                          </span>
                        </div>
                        <div className="text-sm">
                          {winner === 'A' && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              🏆 {teamAName} 승리
                            </span>
                          )}
                          {winner === 'B' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              🏆 {teamBName} 승리
                            </span>
                          )}
                          {winner === 'draw' && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                              🤝 무승부
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 경기 요약 정보 */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span>🏟️ {teamAName} vs {teamBName}</span>
                        <span>⚽ {totalScoreA + totalScoreB}골</span>
                        <span>📊 {match.sets.filter(s => s.events.length > 0).length}/{match.sets.length} 세트</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        클릭하여 세트별 상세 기록 보기
                      </div>
                    </div>
                  </CardHeader>

                  {/* 확장된 내용 - 조건부 렌더링 */}
                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {match.sets
                          .filter(set => set.events.length > 0)
                          .map((set) => {
                            const { scoreA, scoreB } = getScore(set);
                            const setWinner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'draw';

                            return (
                              <Card key={set.id} className="border-l-4 border-l-blue-200">
                                <CardHeader className="py-4">
                                  <div className="flex items-center justify-between">
                                    <div className="text-left">
                                      <div className="font-semibold flex items-center gap-2">
                                        {set.name}
                                        {setWinner === 'A' && <span className="text-red-600">🏆</span>}
                                        {setWinner === 'B' && <span className="text-blue-600">🏆</span>}
                                        {setWinner === 'draw' && <span className="text-gray-600">🤝</span>}
                                      </div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        {set.duration}분 경기 | {set.events.length}개 이벤트
                                      </div>
                                    </div>
                                    
                                    <div className="text-right">
                                      <div className="text-2xl font-bold">
                                        <span className={scoreA > scoreB ? 'text-red-600' : 'text-gray-600'}>
                                          {scoreA}
                                        </span>
                                        <span className="text-gray-400 mx-2">:</span>
                                        <span className={scoreB > scoreA ? 'text-blue-600' : 'text-gray-600'}>
                                          {scoreB}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>

                                <CardContent className="pt-0">
                                  {/* 참여 선수 */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                      <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                                        <span className="w-4 h-4 bg-red-500 rounded-full"></span>
                                        {set.teamA?.name || '팀A'} 라인업
                                      </h4>
                                      <div className="grid grid-cols-2 gap-2">
                                        {set.teamA?.players?.slice(0, set.teamACount || 3).map((player, idx) => (
                                          <div key={player.id} className="bg-red-50 p-2 rounded text-sm font-medium">
                                            {idx + 1}. {player.name}
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                                        <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                                        {set.teamB?.name || '팀B'} 라인업
                                      </h4>
                                      <div className="grid grid-cols-2 gap-2">
                                        {set.teamB?.players?.slice(0, set.teamBCount || 3).map((player, idx) => (
                                          <div key={player.id} className="bg-blue-50 p-2 rounded text-sm font-medium">
                                            {idx + 1}. {player.name}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* 경기 이벤트 */}
                                  <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                      ⚽ 경기 기록
                                      <span className="text-sm font-normal text-gray-500">
                                        (시간순 정렬)
                                      </span>
                                    </h4>
                                    {set.events.length === 0 ? (
                                      <div className="text-center py-8 text-gray-500">
                                        <div className="text-3xl mb-2">⚽</div>
                                        <p>무득점 경기</p>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {set.events.map(event => {
                                          const isTeamA = event.team === 'A';
                                          return (
                                            <div 
                                              key={event.id}
                                              className={`p-3 rounded-lg border-l-4 ${
                                                isTeamA 
                                                  ? 'bg-red-50 border-red-500' 
                                                  : 'bg-blue-50 border-blue-500'
                                              }`}
                                            >
                                              <div className="flex items-center gap-3">
                                                <div className="font-bold text-lg min-w-[60px]">
                                                  {event.time}
                                                </div>
                                                <div className={`font-medium ${isTeamA ? 'text-red-600' : 'text-blue-600'}`}>
                                                  {isTeamA ? set.teamA?.name || '팀A' : set.teamB?.name || '팀B'}
                                                </div>
                                                <div className="flex-1">
                                                  <div className="flex items-center gap-2">
                                                    <span className="font-medium">{event.player.name}</span>
                                                    <span className="text-lg">
                                                      {event.type === 'ownGoal' ? '⚫' : '⚽'}
                                                    </span>
                                                    <span className="text-sm">
                                                      {event.type === 'ownGoal' ? '자책골' : '골'}
                                                    </span>
                                                  </div>
                                                  {event.assistPlayer && (
                                                    <div className="text-sm text-gray-600 mt-1">
                                                      🅰️ 어시스트: {event.assistPlayer.name}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* 하단 버튼 */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center gap-4">
              <Button onClick={() => setAppPhase("statistics")} variant="outline" size="lg">
                <span className="mr-2">📊</span>
                통계 보기
              </Button>
              <Button onClick={() => setAppPhase("matchManagement")} size="lg">
                <span className="mr-2">🏠</span>
                메인 화면으로
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}