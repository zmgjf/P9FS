"use client";

import React, { useState, useMemo } from "react";
import type { GameSet, AppPhase } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  goalsPerGame: number;
  totalContribution: number; // 골 + 어시스트
}

interface TeamStats {
  name: string;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  gamesPlayed: number;
  points: number;
  goalDifference: number;
  winPercentage: number;
  averageGoalsPerGame: number;
}

type PlayerSortField = 'name' | 'goals' | 'assists' | 'gamesPlayed' | 'goalsPerGame' | 'totalContribution';
type TeamSortField = 'name' | 'points' | 'wins' | 'goalDifference' | 'goalsFor' | 'winPercentage';
type SortOrder = 'asc' | 'desc';

export default function Statistics({ sets, setAppPhase }: Props) {
  const [playerSortField, setPlayerSortField] = useState<PlayerSortField>('goals');
  const [playerSortOrder, setPlayerSortOrder] = useState<SortOrder>('desc');
  const [teamSortField, setTeamSortField] = useState<TeamSortField>('points');
  const [teamSortOrder, setTeamSortOrder] = useState<SortOrder>('desc');
  const [showTopPlayersOnly, setShowTopPlayersOnly] = useState(false);

  // 선수별 통계 계산
  const playerStats = useMemo((): PlayerStats[] => {
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
            gamesPlayed: 0,
            goalsPerGame: 0,
            totalContribution: 0
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
            gamesPlayed: 0,
            goalsPerGame: 0,
            totalContribution: 0
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

    // 계산된 통계 추가
    return Array.from(statsMap.values()).map(player => ({
      ...player,
      goalsPerGame: player.gamesPlayed > 0 ? player.goals / player.gamesPlayed : 0,
      totalContribution: player.goals + player.assists
    }));
  }, [sets]);

  // 팀별 통계 계산
  const teamStats = useMemo((): TeamStats[] => {
    const teamStatsMap = new Map<string, TeamStats>();

    sets.forEach(set => {
      const scoreA = set.events.filter(e => 
        (e.team === 'A' && e.type === 'goal') || (e.team === 'B' && e.type === 'ownGoal')
      ).length;
      
      const scoreB = set.events.filter(e => 
        (e.team === 'B' && e.type === 'goal') || (e.team === 'A' && e.type === 'ownGoal')
      ).length;

      // 팀A 통계
      const teamAName = set.teamA?.name || '팀A';
      if (!teamStatsMap.has(teamAName)) {
        teamStatsMap.set(teamAName, {
          name: teamAName,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          gamesPlayed: 0,
          points: 0,
          goalDifference: 0,
          winPercentage: 0,
          averageGoalsPerGame: 0
        });
      }
      const teamAStats = teamStatsMap.get(teamAName)!;
      teamAStats.gamesPlayed++;
      teamAStats.goalsFor += scoreA;
      teamAStats.goalsAgainst += scoreB;
      if (scoreA > scoreB) {
        teamAStats.wins++;
        teamAStats.points += 3;
      } else if (scoreA === scoreB) {
        teamAStats.draws++;
        teamAStats.points += 1;
      } else {
        teamAStats.losses++;
      }

      // 팀B 통계
      const teamBName = set.teamB?.name || '팀B';
      if (!teamStatsMap.has(teamBName)) {
        teamStatsMap.set(teamBName, {
          name: teamBName,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          gamesPlayed: 0,
          points: 0,
          goalDifference: 0,
          winPercentage: 0,
          averageGoalsPerGame: 0
        });
      }
      const teamBStats = teamStatsMap.get(teamBName)!;
      teamBStats.gamesPlayed++;
      teamBStats.goalsFor += scoreB;
      teamBStats.goalsAgainst += scoreA;
      if (scoreB > scoreA) {
        teamBStats.wins++;
        teamBStats.points += 3;
      } else if (scoreA === scoreB) {
        teamBStats.draws++;
        teamBStats.points += 1;
      } else {
        teamBStats.losses++;
      }
    });

    // 계산된 통계 추가
    return Array.from(teamStatsMap.values()).map(team => ({
      ...team,
      goalDifference: team.goalsFor - team.goalsAgainst,
      winPercentage: team.gamesPlayed > 0 ? (team.wins / team.gamesPlayed) * 100 : 0,
      averageGoalsPerGame: team.gamesPlayed > 0 ? team.goalsFor / team.gamesPlayed : 0
    }));
  }, [sets]);

  // 정렬된 선수 통계
  const sortedPlayerStats = useMemo(() => {
    const filteredStats = showTopPlayersOnly 
      ? playerStats.filter(p => p.goals > 0 || p.assists > 0)
      : playerStats;

    return [...filteredStats].sort((a, b) => {
      const aValue = a[playerSortField];
      const bValue = b[playerSortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return playerSortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return playerSortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [playerStats, playerSortField, playerSortOrder, showTopPlayersOnly]);

  // 정렬된 팀 통계
  const sortedTeamStats = useMemo(() => {
    return [...teamStats].sort((a, b) => {
      const aValue = a[teamSortField];
      const bValue = b[teamSortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return teamSortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return teamSortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [teamStats, teamSortField, teamSortOrder]);

  // 전체 통계
  const totalGames = sets.length;
  const totalGoals = sets.reduce((sum, set) => sum + set.events.filter(e => e.type === 'goal').length, 0);
  const totalPlayers = playerStats.length;
  const avgGoalsPerGame = totalGames > 0 ? (totalGoals / totalGames).toFixed(1) : '0';

  // 상위 선수들
  const topScorers = playerStats
    .filter(player => player.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 3);

  const topAssisters = playerStats
    .filter(player => player.assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 3);

  const handlePlayerSort = (field: PlayerSortField) => {
    if (field === playerSortField) {
      setPlayerSortOrder(playerSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setPlayerSortField(field);
      setPlayerSortOrder('desc');
    }
  };

  const handleTeamSort = (field: TeamSortField) => {
    if (field === teamSortField) {
      setTeamSortOrder(teamSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setTeamSortField(field);
      setTeamSortOrder('desc');
    }
  };

  const getSortIcon = (field: string, currentField: string, currentOrder: SortOrder) => {
    if (field !== currentField) return '↕️';
    return currentOrder === 'asc' ? '⬆️' : '⬇️';
  };

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

        {/* 상위 선수 요약 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚽</span>
                상위 득점자
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topScorers.length === 0 ? (
                <div className="text-center py-4 text-gray-500">득점 기록이 없습니다</div>
              ) : (
                <div className="space-y-2">
                  {topScorers.map((player, index) => (
                    <div key={player.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      <span className="font-bold">{player.goals}골</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🅰️</span>
                상위 어시스트
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topAssisters.length === 0 ? (
                <div className="text-center py-4 text-gray-500">어시스트 기록이 없습니다</div>
              ) : (
                <div className="space-y-2">
                  {topAssisters.map((player, index) => (
                    <div key={player.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      <span className="font-bold">{player.assists}도움</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 팀 순위표 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              팀 순위표
            </CardTitle>
            <CardDescription>
              팀별 승패 기록 (클릭하여 정렬)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex gap-4 items-center">
              <Select value={teamSortField} onValueChange={(value: TeamSortField) => setTeamSortField(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">승점순</SelectItem>
                  <SelectItem value="wins">승수순</SelectItem>
                  <SelectItem value="goalDifference">득실차순</SelectItem>
                  <SelectItem value="goalsFor">득점순</SelectItem>
                  <SelectItem value="winPercentage">승률순</SelectItem>
                  <SelectItem value="name">팀명순</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => setTeamSortOrder(teamSortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {teamSortOrder === 'asc' ? '⬆️ 오름차순' : '⬇️ 내림차순'}
              </Button>
            </div>

            {sortedTeamStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">팀 기록이 없습니다</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2">순위</th>
                      <th 
                        className="text-left py-3 px-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleTeamSort('name')}
                      >
                        팀명 {getSortIcon('name', teamSortField, teamSortOrder)}
                      </th>
                      <th className="text-center py-3 px-2">경기</th>
                      <th 
                        className="text-center py-3 px-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleTeamSort('wins')}
                      >
                        승 {getSortIcon('wins', teamSortField, teamSortOrder)}
                      </th>
                      <th className="text-center py-3 px-2">무</th>
                      <th className="text-center py-3 px-2">패</th>
                      <th 
                        className="text-center py-3 px-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleTeamSort('goalsFor')}
                      >
                        득점 {getSortIcon('goalsFor', teamSortField, teamSortOrder)}
                      </th>
                      <th className="text-center py-3 px-2">실점</th>
                      <th 
                        className="text-center py-3 px-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleTeamSort('goalDifference')}
                      >
                        득실차 {getSortIcon('goalDifference', teamSortField, teamSortOrder)}
                      </th>
                      <th 
                        className="text-center py-3 px-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleTeamSort('points')}
                      >
                        승점 {getSortIcon('points', teamSortField, teamSortOrder)}
                      </th>
                      <th 
                        className="text-center py-3 px-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleTeamSort('winPercentage')}
                      >
                        승률 {getSortIcon('winPercentage', teamSortField, teamSortOrder)}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTeamStats.map((team, index) => (
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
                          team.goalDifference > 0 ? 'text-green-600' : 
                          team.goalDifference < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                        </td>
                        <td className="py-3 px-2 text-center font-bold">{team.points}</td>
                        <td className="py-3 px-2 text-center">{team.winPercentage.toFixed(1)}%</td>
                      </tr>
                    ))}
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
              모든 선수의 개인 기록 (클릭하여 정렬)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-4 items-center">
              <Select value={playerSortField} onValueChange={(value: PlayerSortField) => setPlayerSortField(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goals">골 수</SelectItem>
                  <SelectItem value="assists">어시스트</SelectItem>
                  <SelectItem value="totalContribution">총 공헌도</SelectItem>
                  <SelectItem value="goalsPerGame">경기당 골</SelectItem>
                  <SelectItem value="gamesPlayed">출장 횟수</SelectItem>
                  <SelectItem value="name">이름순</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => setPlayerSortOrder(playerSortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {playerSortOrder === 'asc' ? '⬆️ 오름차순' : '⬇️ 내림차순'}
              </Button>
              <Button 
                variant={showTopPlayersOnly ? "default" : "outline"}
                onClick={() => setShowTopPlayersOnly(!showTopPlayersOnly)}
              >
                {showTopPlayersOnly ? '전체 선수 보기' : '활약 선수만 보기'}
              </Button>
            </div>

            {sortedPlayerStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">선수 기록이 없습니다</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th 
                        className="text-left py-3 px-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handlePlayerSort('name')}
                      >
                        선수명 {getSortIcon('name', playerSortField, playerSortOrder)}
                      </th>
                      <th className="text-left py-3 px-2">팀</th>
                      <th 
                        className="text-center py-3 px-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handlePlayerSort('gamesPlayed')}
                      >
                        경기 {getSortIcon('gamesPlayed', playerSortField, playerSortOrder)}
                      </th>
                      <th 
                        className="text-center py-3 px-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handlePlayerSort('goals')}
                      >
                        골 {getSortIcon('goals', playerSortField, playerSortOrder)}
                      </th>
                      <th 
                        className="text-center py-3 px-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handlePlayerSort('assists')}
                      >
                        도움 {getSortIcon('assists', playerSortField, playerSortOrder)}
                      </th>
                      <th 
                        className="text-center py-3 px-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handlePlayerSort('totalContribution')}
                      >
                        총기여 {getSortIcon('totalContribution', playerSortField, playerSortOrder)}
                      </th>
                      <th className="text-center py-3 px-2">자책골</th>
                      <th 
                        className="text-center py-3 px-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => handlePlayerSort('goalsPerGame')}
                      >
                        경기당골 {getSortIcon('goalsPerGame', playerSortField, playerSortOrder)}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPlayerStats.map(player => (
                      <tr key={player.name} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">{player.name}</td>
                        <td className="py-3 px-2 text-gray-600">{player.teamName}</td>
                        <td className="py-3 px-2 text-center">{player.gamesPlayed}</td>
                        <td className="py-3 px-2 text-center font-bold text-green-600">{player.goals}</td>
                        <td className="py-3 px-2 text-center text-blue-600">{player.assists}</td>
                        <td className="py-3 px-2 text-center font-bold text-purple-600">{player.totalContribution}</td>
                        <td className="py-3 px-2 text-center text-red-600">{player.ownGoals}</td>
                        <td className="py-3 px-2 text-center text-gray-600">{player.goalsPerGame.toFixed(2)}</td>
                      </tr>
                    ))}
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