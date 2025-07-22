// components/MatchHistory.tsx

"use client";

import React from "react";
import type { GameSet, AppPhase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  sets: GameSet[];
  setAppPhase: React.Dispatch<React.SetStateAction<AppPhase>>;
}

export default function MatchHistory({ sets, setAppPhase }: Props) {
  const getScore = (set: GameSet) => {
    const scoreA = set.events.filter(e => 
      (e.team === 'A' && e.type === 'goal') || (e.team === 'B' && e.type === 'ownGoal')
    ).length;
    
    const scoreB = set.events.filter(e => 
      (e.team === 'B' && e.type === 'goal') || (e.team === 'A' && e.type === 'ownGoal')
    ).length;
    
    return { scoreA, scoreB };
  };

  const getTotalScore = () => {
    let totalA = 0;
    let totalB = 0;
    
    sets.forEach(set => {
      const { scoreA, scoreB } = getScore(set);
      totalA += scoreA;
      totalB += scoreB;
    });
    
    return { totalA, totalB };
  };

  const getWinner = (scoreA: number, scoreB: number) => {
    if (scoreA > scoreB) return 'A';
    if (scoreB > scoreA) return 'B';
    return 'draw';
  };

  const { totalA, totalB } = getTotalScore();
  const overallWinner = getWinner(totalA, totalB);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 경기 기록</h1>
          <p className="text-gray-600">완료된 경기의 상세 기록을 확인하세요</p>
        </div>

        {/* 전체 결과 */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-slate-700 text-white p-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">최종 결과</h2>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-2 ${
                  overallWinner === 'A' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {overallWinner === 'A' ? '👑' : 'A'}
                </div>
                <div className="text-xl font-bold">
                  {sets[0]?.teamA?.name || '팀A'}
                </div>
              </div>

              <div className="text-center">
                <div className="text-6xl font-bold mb-2">
                  {totalA} : {totalB}
                </div>
                <div className="text-lg">
                  {overallWinner === 'A' && '🏆 팀A 승리!'}
                  {overallWinner === 'B' && '🏆 팀B 승리!'}
                  {overallWinner === 'draw' && '🤝 무승부!'}
                </div>
              </div>

              <div className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mb-2 ${
                  overallWinner === 'B' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}>
                  {overallWinner === 'B' ? '👑' : 'B'}
                </div>
                <div className="text-xl font-bold">
                  {sets[0]?.teamB?.name || '팀B'}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 세트별 기록 */}
        <div className="space-y-6">
          {sets.map((set) => {
            const { scoreA, scoreB } = getScore(set);
            const winner = getWinner(scoreA, scoreB);
            
            return (
              <Card key={set.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {set.name}
                        {winner === 'A' && <span className="text-red-600">🏆</span>}
                        {winner === 'B' && <span className="text-blue-600">🏆</span>}
                        {winner === 'draw' && <span className="text-gray-600">🤝</span>}
                      </CardTitle>
                      <CardDescription>
                        {set.duration}분 경기 | {set.events.length}개 이벤트
                      </CardDescription>
                    </div>
                    <div className="text-3xl font-bold">
                      <span className={scoreA > scoreB ? 'text-red-600' : 'text-gray-600'}>
                        {scoreA}
                      </span>
                      <span className="text-gray-400 mx-2">:</span>
                      <span className={scoreB > scoreA ? 'text-blue-600' : 'text-gray-600'}>
                        {scoreB}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
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
                    <h4 className="font-semibold mb-3">⚽ 경기 기록</h4>
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
                                  <span className="font-medium">{event.player.name}</span>
                                  <span className="ml-2">
                                    {event.type === 'ownGoal' ? '⚫ 자책골' : '⚽ 골'}
                                  </span>
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

        {/* 하단 버튼 */}
        <Card className="mt-8">
          <CardContent className="p-6 text-center">
            <Button onClick={() => setAppPhase("matchManagement")} size="lg">
              <span className="mr-2">🏠</span>
              메인 화면으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}