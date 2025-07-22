"use client";

import React from "react";
import type { GameSet, AppPhase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  sets: GameSet[];
  setAppPhase: React.Dispatch<React.SetStateAction<AppPhase>>;
}

interface PlayerStats {
  name: string;
  goals: number;
  assists: number;
  ownGoals: number;
  teamName: string;
  gamesPlayed: number;
}

export default function Statistics({ sets, setAppPhase }: Props) {
  // 선수별 통계 계산
  const calculatePlayerStats = (): PlayerStats[] => {
    const statsMap = new Map<string, PlayerStats>();

    sets.forEach(set => {
      // 참여 선수들 추가
      set.teamA?.players?.forEach(player => {
        if (!statsMap.has(player.id)) {
          statsMap.set(player.id, {
            name: player.name,
            goals: 0,
            assists: 0,
            ownGoals: 0,
            teamName: set.teamA?.name || '팀A',
            gamesPlayed: 0
          });
        }
        const stats = statsMap.get(player.id)!;
        stats.gamesPlayed++;
      });

      set.teamB?.players?.forEach(player => {
        if (!statsMap.has(player.id)) {
          statsMap.set(player.id, {
            name: player.name,
            goals: 0,
            assists: 0,
            ownGoals: 0,
            teamName: set.teamB?.name || '팀B',
            gamesPlayed: 0
          });
        }
        const stats = statsMap.get(player.id)!;
        stats.gamesPlayed++;
      });

      // 이벤트에서 골과 어시스트 집계
      set.events.forEach(event => {
        const playerId = event.player.id;
        if (statsMap.has(playerId)) {
          const stats = statsMap.get(playerId)!;
          if (event.type === 'goal') {
            stats.goals++;
          } else if (event.type === 'ownGoal') {
            stats.ownGoals++;
          }
        }

        // 어시스트 집계
        if (event.assistPlayer) {
          const assistPlayerId = event.assistPlayer.id;
          if (statsMap.has(assistPlayerId)) {
            const assistStats = statsMap.get(assistPlayerId)!;
            assistStats.assists++;
          }
        }
      });
    });

    return Array.from(statsMap.values());
  };

  // 팀별 통계 계산
  const calculateTeamStats = () => {
    const teamStats = new Map<string, {
      name: string;
      wins: number;
      draws: number;
      losses: number;
      goalsFor: number;
      goalsAgainst: number;
      gamesPlayed: number;
    }>();

    sets.forEach(set => {
      const scoreA = set.events.filter(e => 
        (e.team === 'A' && e.type === 'goal') || (e.team === 'B' && e.type === 'ownGoal')
      ).length;
      
      const scoreB = set.events.filter(e => 
        (e.team === 'B' && e.type === 'goal') || (e.team === 'A' && e.type === 'ownGoal')
      ).length;

      // 팀A 통계
      const teamAName = set.teamA?.name || '팀A';
      if (!teamStats.has(teamAName)) {
        teamStats.set(teamAName, {
          name: teamAName,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          gamesPlayed: 0
        });
      }
      const teamAStats = teamStats.get(teamAName)!;
      teamAStats.gamesPlayed++;
      teamAStats.goalsFor += scoreA;
      teamAStats.goalsAgainst += scoreB;
      if (scoreA > scoreB) teamAStats.wins++;
      else if (scoreA === scoreB) teamAStats.draws++;
      else teamAStats.losses++;

      // 팀B 통계
      const teamBName = set.teamB?.name || '팀B';
      if (!teamStats.has(teamBName)) {
        teamStats.set(teamBName, {
          name: teamBName,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          gamesPlayed: 0
        });
      }
      const teamBStats = teamStats.get(teamBName)!;
      teamBStats.gamesPlayed++;
      teamBStats.goalsFor += scoreB;
      teamBStats.goalsAgainst += scoreA;
      if (scoreB > scoreA) teamBStats.wins++;
      else if (scoreA === scoreB) teamBStats.draws++;
      else teamBStats.losses++;
    });

    return Array.from(teamStats.values());
  };

  const playerStats = calculatePlayerStats();
  const teamStats = calculateTeamStats();

  // 상위 골잡이들
  const topScorers = playerStats
    .filter(player => player.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);

  // 상위 어시스트들
  const topAssisters = playerStats
    .filter(player => player.assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 5);

  // 전체 통계
  const totalGames = sets.length;
  const totalGoals = sets.reduce((sum, set) => sum + set.events.filter(e => e.type === 'goal').length, 0);
  const totalPlayers = playerStats.length;
  const avgGoalsPerGame = totalGames > 0 ? (totalGoals / totalGames).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📊 경기 통계</h1>
          <p className="text-gray-600">전체 경기의 상세 통계를 확인하세요</p>
        </div>

        {/* 전체 요약 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📈</span>
              전체 통계 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center bg-blue-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{totalGames}</div>
                <div className="text-sm text-gray-600">총 경기 수</div>
              </div>
              <div className="text-center bg-green-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{totalGoals}</div>
                <div className="text-sm text-gray-600">총 골 수</div>
              </div>
              <div className="text-center bg-purple-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{totalPlayers}</div>
                <div className="text-sm text-gray-600">참여 선수</div>
              </div>
              <div className="text-center bg-orange-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">{avgGoalsPerGame}</div>
                <div className="text-sm text-gray-600">경기당 평균 골</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 상위 득점자 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚽</span>
                상위 득점자
              </CardTitle>
              <CardDescription>
                가장 많은 골을 넣은 선수들
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topScorers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">⚽</div>
                  <p>아직 득점 기록이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topScorers.map((player, index) => (
                    <div key={player.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-amber-600' : 'bg-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-gray-600">{player.teamName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{player.goals}골</div>
                        <div className="text-sm text-gray-600">{player.gamesPlayed}경기</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 상위 도움 제공자 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🅰️</span>
                상위 어시스트
              </CardTitle>
              <CardDescription>
                가장 많은 어시스트를 기록한 선수들
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topAssisters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">🅰️</div>
                  <p>아직 어시스트 기록이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topAssisters.map((player, index) => (
                    <div key={player.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-amber-600' : 'bg-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-gray-600">{player.teamName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{player.assists}도움</div>
                        <div className="text-sm text-gray-600">{player.gamesPlayed}경기</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 팀 순위 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              팀 순위표
            </CardTitle>
            <CardDescription>
              팀별 승패 기록과 득실 현황
            </CardDescription>
          </CardHeader>
          <CardContent>
            {teamStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">🏆</div>
                <p>아직 팀 기록이 없습니다</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2">순위</th>
                      <th className="text-left py-3 px-2">팀명</th>
                      <th className="text-center py-3 px-2">경기</th>
                      <th className="text-center py-3 px-2">승</th>
                      <th className="text-center py-3 px-2">무</th>
                      <th className="text-center py-3 px-2">패</th>
                      <th className="text-center py-3 px-2">득점</th>
                      <th className="text-center py-3 px-2">실점</th>
                      <th className="text-center py-3 px-2">득실차</th>
                      <th className="text-center py-3 px-2">승점</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamStats
                      .sort((a, b) => {
                        const pointsA = a.wins * 3 + a.draws;
                        const pointsB = b.wins * 3 + b.draws;
                        if (pointsA !== pointsB) return pointsB - pointsA;
                        return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
                      })
                      .map((team, index) => {
                        const points = team.wins * 3 + team.draws;
                        const goalDiff = team.goalsFor - team.goalsAgainst;
                        return (
                          <tr key={team.name} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                index === 0 ? 'bg-yellow-500' : 
                                index === 1 ? 'bg-gray-400' : 
                                index === 2 ? 'bg-amber-600' : 'bg-gray-500'
                              }`}>
                                {index + 1}
                              </div>
                            </td>
                            <td className="py-3 px-2 font-medium">{team.name}</td>
                            <td className="py-3 px-2 text-center">{team.gamesPlayed}</td>
                            <td className="py-3 px-2 text-center text-green-600 font-medium">{team.wins}</td>
                            <td className="py-3 px-2 text-center text-gray-600">{team.draws}</td>
                            <td className="py-3 px-2 text-center text-red-600 font-medium">{team.losses}</td>
                            <td className="py-3 px-2 text-center">{team.goalsFor}</td>
                            <td className="py-3 px-2 text-center">{team.goalsAgainst}</td>
                            <td className={`py-3 px-2 text-center font-medium ${
                              goalDiff > 0 ? 'text-green-600' : 
                              goalDiff < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {goalDiff > 0 ? '+' : ''}{goalDiff}
                            </td>
                            <td className="py-3 px-2 text-center font-bold">{points}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 선수별 상세 통계 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              선수별 상세 통계
            </CardTitle>
            <CardDescription>
              모든 선수의 개인 기록
            </CardDescription>
          </CardHeader>
          <CardContent>
            {playerStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">👥</div>
                <p>아직 선수 기록이 없습니다</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2">선수명</th>
                      <th className="text-left py-3 px-2">팀</th>
                      <th className="text-center py-3 px-2">경기</th>
                      <th className="text-center py-3 px-2">골</th>
                      <th className="text-center py-3 px-2">어시스트</th>
                      <th className="text-center py-3 px-2">자책골</th>
                      <th className="text-center py-3 px-2">경기당 평균골</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerStats
                      .sort((a, b) => {
                        if (b.goals !== a.goals) return b.goals - a.goals;
                        return b.assists - a.assists;
                      })
                      .map(player => {
                        const avgGoals = player.gamesPlayed > 0 ? (player.goals / player.gamesPlayed).toFixed(2) : '0.00';
                        return (
                          <tr key={player.name} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-2 font-medium">{player.name}</td>
                            <td className="py-3 px-2 text-gray-600">{player.teamName}</td>
                            <td className="py-3 px-2 text-center">{player.gamesPlayed}</td>
                            <td className="py-3 px-2 text-center font-bold text-green-600">{player.goals}</td>
                            <td className="py-3 px-2 text-center text-blue-600">{player.assists}</td>
                            <td className="py-3 px-2 text-center text-red-600">{player.ownGoals}</td>
                            <td className="py-3 px-2 text-center text-gray-600">{avgGoals}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 하단 네비게이션 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center">
              <Button onClick={() => setAppPhase("matchManagement")} size="lg">
                <span className="mr-2">🏠</span>
                메인 화면으로 돌아가기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}