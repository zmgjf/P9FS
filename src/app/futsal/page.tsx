"use client";

import React, { useState, useEffect } from "react";

interface Player {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  players: Player[];
  createdAt: string;
}

interface GameEvent {
  id: string;
  time: string;
  realTime: number;
  type: 'goal' | 'ownGoal';
  player: Player;
  assistPlayer?: Player;
  team: 'A' | 'B';
}

interface GameSet {
  id: string;
  name: string;
  duration: number;
  teamA: Team;
  teamB: Team;
  isActive: boolean;
  startTime?: number;
  events: GameEvent[];
  finalScore?: { teamA: number; teamB: number };
  completedAt?: string;
}

interface Match {
  id: string;
  name: string;
  venue: string;
  date: string;
  sets: GameSet[];
  createdAt: string;
}

type AppPhase = 'matchManagement' | 'teamManagement' | 'setSetup' | 'gameReady' | 'playing' | 'paused' | 'finished';
type ActionMode = 'none' | 'goal' | 'ownGoal';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export default function FutsalManager() {
  // 앱 상태
  const [appPhase, setAppPhase] = useState<AppPhase>('matchManagement');
  const [actionMode, setActionMode] = useState<ActionMode>('none');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  // 데이터 관리
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  
  // 매치 생성
  const [newMatchName, setNewMatchName] = useState('');
  const [newMatchVenue, setNewMatchVenue] = useState('');
  
  // 팀 관리
  const [newTeamName, setNewTeamName] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  
  // 세트 생성
  const [newSetName, setNewSetName] = useState('');
  const [newSetDuration, setNewSetDuration] = useState(10);
  const [selectedTeamAId, setSelectedTeamAId] = useState('');
  const [selectedTeamBId, setSelectedTeamBId] = useState('');

  const currentSet = currentMatch?.sets[currentSetIndex];

  // 로컬 스토리지 저장/로드
  useEffect(() => {
    // 데이터 로드
    const savedTeams = localStorage.getItem('futsal_teams');
    const savedMatches = localStorage.getItem('futsal_matches');
    const savedCurrentMatch = localStorage.getItem('futsal_current_match');

    if (savedTeams) setTeams(JSON.parse(savedTeams));
    if (savedMatches) setMatches(JSON.parse(savedMatches));
    if (savedCurrentMatch) {
      setCurrentMatch(JSON.parse(savedCurrentMatch));
      setAppPhase('setSetup');
    }
  }, []);

  // 데이터 변경시 자동 저장
  useEffect(() => {
    localStorage.setItem('futsal_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('futsal_matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    if (currentMatch) {
      localStorage.setItem('futsal_current_match', JSON.stringify(currentMatch));
    }
  }, [currentMatch]);

  // 게임 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (appPhase === 'playing' && currentSet) {
      interval = setInterval(() => {
        setGameTime(prev => {
          const newTime = prev + 1;
          if (newTime >= currentSet.duration * 60) {
            finishSet();
            return currentSet.duration * 60;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [appPhase, currentSet]);

  // 매치 생성
  const createMatch = () => {
    if (!newMatchName.trim() || !newMatchVenue.trim()) {
      alert('경기명과 구장명을 입력하세요.');
      return;
    }

    const newMatch: Match = {
      id: generateId(),
      name: newMatchName,
      venue: newMatchVenue,
      date: new Date().toLocaleDateString('ko-KR'),
      sets: [],
      createdAt: new Date().toISOString()
    // 데이터 가져오기
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {

    setCurrentMatch(newMatch);
    setMatches(prev => [...prev, newMatch]);
    setNewMatchName('');
    setNewMatchVenue('');
    setAppPhase('teamManagement');
  };

  // 팀 관리
  const createTeam = () => {
    if (!newTeamName.trim()) {
      alert('팀 이름을 입력하세요.');
      return;
    }

    const newTeam: Team = {
      id: generateId(),
      name: newTeamName,
      players: [],
      createdAt: new Date().toISOString()
    };

    setTeams(prev => [...prev, newTeam]);
    setNewTeamName('');
  };

  const addPlayer = (teamId: string) => {
    if (!newPlayerName.trim()) {
      alert('선수 이름을 입력하세요.');
      return;
    }

    const newPlayer: Player = {
      id: generateId(),
      name: newPlayerName
    };

    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, players: [...team.players, newPlayer] }
        : team
    ));
    setNewPlayerName('');
  };

  const deleteTeam = (teamId: string) => {
    if (confirm('정말 이 팀을 삭제하시겠습니까?')) {
      setTeams(prev => prev.filter(team => team.id !== teamId));
    }
  };

  const deletePlayer = (teamId: string, playerId: string) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, players: team.players.filter(p => p.id !== playerId) }
        : team
    ));
  };

  // 세트 관리
  const createSet = () => {
    if (!currentMatch || !newSetName || !selectedTeamAId || !selectedTeamBId) {
      alert('모든 정보를 입력하세요.');
      return;
    }

    if (selectedTeamAId === selectedTeamBId) {
      alert('같은 팀을 선택할 수 없습니다.');
      return;
    }

    const teamA = teams.find(t => t.id === selectedTeamAId);
    const teamB = teams.find(t => t.id === selectedTeamBId);

    if (!teamA || !teamB) {
      alert('팀을 찾을 수 없습니다.');
      return;
    }

    const newSet: GameSet = {
      id: generateId(),
      name: newSetName,
      duration: newSetDuration,
      teamA,
      teamB,
      isActive: false,
      events: []
    };

    const updatedMatch = {
      ...currentMatch,
      sets: [...currentMatch.sets, newSet]
    };

    setCurrentMatch(updatedMatch);
    setMatches(prev => prev.map(m => m.id === currentMatch.id ? updatedMatch : m));
    setCurrentSetIndex(currentMatch.sets.length);
    
    setNewSetName('');
    setSelectedTeamAId('');
    setSelectedTeamBId('');
    setAppPhase('gameReady');
  };

  // 게임 관리
  const startGame = () => {
    if (!currentSet || !currentMatch) return;
    
    const updatedSets = currentMatch.sets.map((set, idx) => 
      idx === currentSetIndex 
        ? { ...set, isActive: true, startTime: Date.now() }
        : set
    );

    const updatedMatch = { ...currentMatch, sets: updatedSets };
    setCurrentMatch(updatedMatch);
    setMatches(prev => prev.map(m => m.id === currentMatch.id ? updatedMatch : m));
    
    setGameTime(0);
    setAppPhase('playing');
  };

  const togglePause = () => {
    setAppPhase(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  const finishSet = () => {
    if (!currentSet || !currentMatch) return;

    const scoreA = getScore('A');
    const scoreB = getScore('B');

    const updatedSets = currentMatch.sets.map((set, idx) => 
      idx === currentSetIndex 
        ? { 
            ...set, 
            isActive: false, 
            finalScore: { teamA: scoreA, teamB: scoreB },
            completedAt: new Date().toISOString()
          }
        : set
    );

    const updatedMatch = { ...currentMatch, sets: updatedSets };
    setCurrentMatch(updatedMatch);
    setMatches(prev => prev.map(m => m.id === currentMatch.id ? updatedMatch : m));
    
    setAppPhase('finished');
  };

  // 이벤트 처리
  const handlePlayerClick = (player: Player, team: 'A' | 'B') => {
    if (appPhase !== 'playing') return;

    if (actionMode === 'goal') {
      setSelectedPlayer(player);
    } else if (actionMode === 'ownGoal') {
      recordEvent('ownGoal', player, team);
    }
  };

  const recordGoalOnly = () => {
    if (!selectedPlayer || !currentSet) return;
    
    const isTeamA = currentSet.teamA.players.some(p => p.id === selectedPlayer.id);
    const team = isTeamA ? 'A' : 'B';
    
    recordEvent('goal', selectedPlayer, team);
  };

  const recordGoalWithAssist = (assistPlayer: Player) => {
    if (!selectedPlayer || !currentSet) return;
    
    const isTeamA = currentSet.teamA.players.some(p => p.id === selectedPlayer.id);
    const team = isTeamA ? 'A' : 'B';
    
    recordEvent('goal', selectedPlayer, team, assistPlayer);
  };

  const recordEvent = (type: 'goal' | 'ownGoal', scorer: Player, team: 'A' | 'B', assist?: Player) => {
    if (!currentMatch || !currentSet) return;

    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const event: GameEvent = {
      id: generateId(),
      time: timeString,
      realTime: gameTime,
      type,
      player: scorer,
      assistPlayer: assist,
      team
    };

    const updatedSets = currentMatch.sets.map((set, idx) => 
      idx === currentSetIndex 
        ? { ...set, events: [...set.events, event] }
        : set
    );

    const updatedMatch = { ...currentMatch, sets: updatedSets };
    setCurrentMatch(updatedMatch);
    setMatches(prev => prev.map(m => m.id === currentMatch.id ? updatedMatch : m));

    setActionMode('none');
    setSelectedPlayer(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScore = (team: 'A' | 'B') => {
    if (!currentSet) return 0;
    return currentSet.events.filter(event => 
      event.type === 'goal' && event.team === team
    ).length;
  };

  const exportData = () => {
    const data = {
      teams,
      matches,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `futsal_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 세트 삭제
  const deleteSet = (setIndex: number) => {
    if (!currentMatch) return;
    
    if (confirm('정말 이 세트를 삭제하시겠습니까? 모든 경기 기록이 함께 삭제됩니다.')) {
      const updatedSets = currentMatch.sets.filter((_, idx) => idx !== setIndex);
      const updatedMatch = { ...currentMatch, sets: updatedSets };
      
      setCurrentMatch(updatedMatch);
      setMatches(prev => prev.map(m => m.id === currentMatch.id ? updatedMatch : m));
      
      // 현재 세트 인덱스 조정
      if (setIndex === currentSetIndex && updatedSets.length > 0) {
        setCurrentSetIndex(Math.max(0, setIndex - 1));
      } else if (updatedSets.length === 0) {
        setCurrentSetIndex(0);
        setAppPhase('setSetup');
      }
    }
  };

  // 경기 기록 삭제
  const deleteEvent = (eventId: string) => {
    if (!currentMatch || !currentSet) return;
    
    if (confirm('이 기록을 삭제하시겠습니까?')) {
      const updatedSets = currentMatch.sets.map((set, idx) => 
        idx === currentSetIndex 
          ? { ...set, events: set.events.filter(event => event.id !== eventId) }
          : set
      );

      const updatedMatch = { ...currentMatch, sets: updatedSets };
      setCurrentMatch(updatedMatch);
      setMatches(prev => prev.map(m => m.id === currentMatch.id ? updatedMatch : m));
    }
  };

  // 매치 삭제
  const deleteMatch = (matchId: string) => {
    if (confirm('정말 이 경기를 삭제하시겠습니까? 모든 세트와 기록이 함께 삭제됩니다.')) {
      setMatches(prev => prev.filter(m => m.id !== matchId));
      
      // 현재 매치가 삭제된 경우
      if (currentMatch?.id === matchId) {
        setCurrentMatch(null);
        localStorage.removeItem('futsal_current_match');
        setAppPhase('matchManagement');
      }
    }
  };
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (importedData.teams && importedData.matches) {
          // 기존 데이터와 병합할지 물어보기
          const shouldMerge = confirm(
            '데이터를 가져오는 방법을 선택하세요:\n' +
            'OK = 기존 데이터와 병합\n' + 
            '취소 = 기존 데이터 삭제 후 교체'
          );

          if (shouldMerge) {
            // 병합 (중복 체크)
            const newTeams = [...teams];
            const newMatches = [...matches];

            importedData.teams.forEach((importedTeam: Team) => {
              const exists = newTeams.some(team => team.name === importedTeam.name);
              if (!exists) {
                newTeams.push({
                  ...importedTeam,
                  id: generateId(), // 새 ID 생성
                  createdAt: new Date().toISOString()
                });
              }
            });

            importedData.matches.forEach((importedMatch: Match) => {
              const exists = newMatches.some(match => 
                match.name === importedMatch.name && match.venue === importedMatch.venue
              );
              if (!exists) {
                newMatches.push({
                  ...importedMatch,
                  id: generateId(), // 새 ID 생성
                  createdAt: new Date().toISOString()
                });
              }
            });

            setTeams(newTeams);
            setMatches(newMatches);
          } else {
            // 교체
            setTeams(importedData.teams);
            setMatches(importedData.matches);
            setCurrentMatch(null);
          }

          alert('데이터를 성공적으로 가져왔습니다!');
        } else {
          alert('올바르지 않은 데이터 형식입니다.');
        }
      } catch (error) {
        alert('파일을 읽는 중 오류가 발생했습니다.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
    
    // 파일 input 초기화
    event.target.value = '';
  };

  // 헤더 컴포넌트
  const renderHeader = () => currentMatch && (
    <div style={{ 
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0' }}>{currentMatch.name}</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>{currentMatch.venue} | {currentMatch.date}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setAppPhase('matchManagement')}
            style={{ 
              padding: '8px 12px', 
              backgroundColor: '#95a5a6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px' 
            }}
          >
            경기 목록
          </button>
          <button 
            onClick={() => setAppPhase('teamManagement')}
            style={{ 
              padding: '8px 12px', 
              backgroundColor: '#e67e22', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px' 
            }}
          >
            팀 관리
          </button>
          <button 
            onClick={() => setAppPhase('setSetup')}
            style={{ 
              padding: '8px 12px', 
              backgroundColor: '#3498db', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px' 
            }}
          >
            세트 관리
          </button>
        </div>
      </div>
    </div>
  );

  // 매치 관리 화면
  if (appPhase === 'matchManagement') {
    return (
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>⚽ 풋살 매니저</h1>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '8px', 
          marginBottom: '30px',
          border: '2px solid #3498db'
        }}>
          <h2 style={{ marginBottom: '20px' }}>새 경기 만들기</h2>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>경기명:</label>
            <input 
              type="text" 
              value={newMatchName}
              onChange={(e) => setNewMatchName(e.target.value)}
              placeholder="예: 2024 신년 풋살 대회"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>구장명:</label>
            <input 
              type="text" 
              value={newMatchVenue}
              onChange={(e) => setNewMatchVenue(e.target.value)}
              placeholder="예: 강남 풋살파크"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
          </div>
          <button 
            onClick={createMatch}
            style={{ 
              width: '100%',
              padding: '15px', 
              backgroundColor: '#3498db', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            경기 만들기
          </button>
        </div>

                  <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>경기 기록</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                style={{ display: 'none' }}
                id="import-file"
              />
              <label
                htmlFor="import-file"
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#3498db', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📁 데이터 가져오기
              </label>
              <button 
                onClick={exportData}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: '#27ae60', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px' 
                }}
              >
                📥 데이터 내보내기
              </button>
            </div>
          </div>
          
          {matches.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              color: '#666'
            }}>
              아직 경기 기록이 없습니다.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {matches.map(match => (
                <div key={match.id} style={{ 
                  backgroundColor: 'white', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div 
                      style={{ flex: 1, cursor: 'pointer' }}
                      onClick={() => {
                        setCurrentMatch(match);
                        setAppPhase('setSetup');
                      }}
                    >
                      <h3 style={{ margin: '0 0 5px 0' }}>{match.name}</h3>
                      <p style={{ margin: '0', color: '#666' }}>{match.venue} | {match.date}</p>
                      <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#999' }}>
                        {match.sets.length}개 세트
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ fontSize: '20px' }}>⚽</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMatch(match.id);
                        }}
                        style={{ 
                          padding: '4px 8px', 
                          backgroundColor: '#e74c3c', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!currentMatch) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>경기가 선택되지 않았습니다.</h2>
        <button onClick={() => setAppPhase('matchManagement')}>경기 관리로 이동</button>
      </div>
    );
  }

  // 팀 관리 화면
  if (appPhase === 'teamManagement') {
    return (
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        {renderHeader()}
        
        <h1>👥 팀 관리</h1>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          border: '1px solid #ddd'
        }}>
          <h3>새 팀 만들기</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="text" 
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="팀 이름을 입력하세요"
              style={{ 
                padding: '8px 12px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                flex: 1
              }}
            />
            <button 
              onClick={createTeam}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#3498db', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px' 
              }}
            >
              팀 생성
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {teams.map(team => (
            <div key={team.id} style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>{team.name}</h3>
                <button 
                  onClick={() => deleteTeam(team.id)}
                  style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#e74c3c', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  팀 삭제
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                <input 
                  type="text" 
                  value={editingTeamId === team.id ? newPlayerName : ''}
                  onChange={(e) => {
                    setNewPlayerName(e.target.value);
                    setEditingTeamId(team.id);
                  }}
                  placeholder="선수 이름"
                  style={{ 
                    padding: '4px 8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    flex: 1,
                    fontSize: '14px'
                  }}
                />
                <button 
                  onClick={() => {
                    addPlayer(team.id);
                    setEditingTeamId(null);
                  }}
                  style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#2ecc71', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  추가
                </button>
              </div>
              
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {team.players.length === 0 ? (
                  <p style={{ color: '#999', fontSize: '14px', textAlign: 'center' }}>
                    선수를 추가해주세요
                  </p>
                ) : (
                  team.players.map(player => (
                    <div key={player.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '5px 10px', 
                      backgroundColor: '#f8f9fa', 
                      margin: '2px 0',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      <span>{player.name}</span>
                      <button 
                        onClick={() => deletePlayer(team.id, player.id)}
                        style={{ 
                          padding: '2px 6px', 
                          backgroundColor: '#e74c3c', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '3px',
                          fontSize: '10px'
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  ))
                )}
              </div>
              
              <div style={{ 
                marginTop: '10px', 
                fontSize: '12px', 
                color: '#666', 
                textAlign: 'center' 
              }}>
                총 {team.players.length}명
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 세트 설정 화면
  if (appPhase === 'setSetup') {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        {renderHeader()}
        
        <h1>⚽ 세트 관리</h1>
        
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px' }}>
          <h3>새 세트 만들기</h3>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>세트 이름:</label>
            <input 
              type="text" 
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              placeholder="예: 1세트"
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>경기 시간:</label>
            <select 
              value={newSetDuration}
              onChange={(e) => setNewSetDuration(parseInt(e.target.value))}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            >
              <option value={5}>5분</option>
              <option value={10}>10분</option>
              <option value={15}>15분</option>
              <option value={20}>20분</option>
              <option value={25}>25분</option>
              <option value={30}>30분</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>팀 A:</label>
            <select 
              value={selectedTeamAId}
              onChange={(e) => setSelectedTeamAId(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            >
              <option value="">팀을 선택하세요</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.players.length}명)
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>팀 B:</label>
            <select 
              value={selectedTeamBId}
              onChange={(e) => setSelectedTeamBId(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            >
              <option value="">팀을 선택하세요</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.players.length}명)
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={createSet}
            disabled={!newSetName || !selectedTeamAId || !selectedTeamBId}
            style={{ 
              width: '100%',
              padding: '15px', 
              backgroundColor: (!newSetName || !selectedTeamAId || !selectedTeamBId) ? '#bdc3c7' : '#27ae60', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: (!newSetName || !selectedTeamAId || !selectedTeamBId) ? 'not-allowed' : 'pointer'
            }}
          >
            세트 만들기
          </button>
        </div>

        {/* 기존 세트 목록 */}
        {currentMatch.sets.length > 0 && (
          <div>
            <h3>세트 목록</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {currentMatch.sets.map((set, idx) => (
                <div key={set.id} style={{ 
                  backgroundColor: 'white', 
                  padding: '15px', 
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div 
                      style={{ flex: 1, cursor: 'pointer' }}
                      onClick={() => {
                        setCurrentSetIndex(idx);
                        setAppPhase('gameReady');
                      }}
                    >
                      <h4 style={{ margin: '0 0 5px 0' }}>{set.name}</h4>
                      <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                        {set.teamA.name} vs {set.teamB.name} | {set.duration}분
                      </p>
                      {set.finalScore && (
                        <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>
                          최종 스코어: {set.finalScore.teamA} - {set.finalScore.teamB}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ fontSize: '16px' }}>
                        {set.completedAt ? '✅' : (set.isActive ? '🔄' : '⏸️')}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSet(idx);
                        }}
                        style={{ 
                          padding: '4px 8px', 
                          backgroundColor: '#e74c3c', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {teams.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px', 
            color: '#e74c3c',
            backgroundColor: '#ffeaa7',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            팀이 없습니다. 먼저 팀을 만들어주세요!
          </div>
        )}
      </div>
    );
  }

  // 게임 화면
  if (!currentSet) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>세트가 선택되지 않았습니다.</h2>
        <button onClick={() => setAppPhase('setSetup')}>세트 관리로 이동</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px', maxWidth: '1200px', margin: '0 auto' }}>
      {renderHeader()}

      {/* 게임 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        backgroundColor: '#34495e',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          {currentSet.name}
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {formatTime(gameTime)} / {formatTime(currentSet.duration * 60)}
        </div>
        <div style={{ fontSize: '18px' }}>
          {appPhase === 'finished' ? '경기 종료' : 
           appPhase === 'paused' ? '일시 정지' :
           appPhase === 'playing' ? '경기 중' : '대기 중'}
        </div>
      </div>

      {/* 스코어보드 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            backgroundColor: '#e74c3c', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}></div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{currentSet.teamA.name}</div>
          </div>
        </div>
        
        <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
          {getScore('A')} : {getScore('B')}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{currentSet.teamB.name}</div>
          </div>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            backgroundColor: '#3498db', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}></div>
        </div>
      </div>

      {/* 게임 컨트롤 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginBottom: '20px' 
      }}>
        {appPhase === 'gameReady' && (
          <button 
            onClick={startGame}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#27ae60', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px' 
            }}
          >
            게임 시작
          </button>
        )}
        {(appPhase === 'playing' || appPhase === 'paused') && (
          <>
            <button 
              onClick={togglePause}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: appPhase === 'playing' ? '#f39c12' : '#27ae60', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px' 
              }}
            >
              {appPhase === 'playing' ? '일시정지' : '재개'}
            </button>
            <button 
              onClick={finishSet}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#e74c3c', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px' 
              }}
            >
              경기 종료
            </button>
          </>
        )}
      </div>

      {/* 액션 버튼들 */}
      {appPhase === 'playing' && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px', 
          marginBottom: '20px' 
        }}>
          <button 
            onClick={() => setActionMode('goal')}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: actionMode === 'goal' ? '#e74c3c' : '#95a5a6',
              color: 'white', 
              border: 'none', 
              borderRadius: '5px' 
            }}
          >
            ⚽ 골
          </button>
          <button 
            onClick={() => setActionMode('ownGoal')}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: actionMode === 'ownGoal' ? '#e74c3c' : '#95a5a6',
              color: 'white', 
              border: 'none', 
              borderRadius: '5px' 
            }}
          >
            ⚫ 자책골
          </button>
          <button 
            onClick={() => {
              setActionMode('none');
              setSelectedPlayer(null);
            }}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: '#7f8c8d',
              color: 'white', 
              border: 'none', 
              borderRadius: '5px' 
            }}
          >
            취소
          </button>
        </div>
      )}

      {/* 골 기록 확인 버튼들 (골 선택자가 선택된 경우) */}
      {selectedPlayer && actionMode === 'goal' && appPhase === 'playing' && (
        <div style={{ 
          backgroundColor: '#f39c12', 
          color: 'white', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 10px 0' }}>
            <strong>{selectedPlayer.name}</strong>이(가) 득점했습니다.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button 
              onClick={recordGoalOnly}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#27ae60', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px' 
              }}
            >
              골만 기록
            </button>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {currentSet.teamA.players.concat(currentSet.teamB.players)
                .filter(p => p.id !== selectedPlayer.id)
                .map(player => (
                <button 
                  key={player.id}
                  onClick={() => recordGoalWithAssist(player)}
                  style={{ 
                    padding: '6px 12px', 
                    backgroundColor: '#3498db', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  {player.name} 어시스트
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 풋살장 */}
      <div style={{
        backgroundColor: '#27ae60',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '20px',
        position: 'relative',
        minHeight: '400px',
        border: '3px solid white'
      }}>
        {/* 중앙선 */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '0',
          bottom: '0',
          width: '3px',
          backgroundColor: 'white',
          transform: 'translateX(-50%)'
        }}></div>
        
        {/* 중앙 원 */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '100px',
          height: '100px',
          border: '3px solid white',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)'
        }}></div>

        {/* 팀 A 선수들 (왼쪽) */}
        <div style={{ position: 'absolute', left: '10%', top: '20%', width: '30%', height: '60%' }}>
          {currentSet.teamA.players.map((player, idx) => (
            <div
              key={player.id}
              onClick={() => handlePlayerClick(player, 'A')}
              style={{
                position: 'absolute',
                left: `${(idx % 3) * 40}%`,
                top: `${Math.floor(idx / 3) * 50}%`,
                width: '60px',
                height: '60px',
                backgroundColor: selectedPlayer?.id === player.id ? '#f39c12' : '#e74c3c',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: appPhase === 'playing' ? 'pointer' : 'default',
                fontSize: '11px',
                fontWeight: 'bold',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                textAlign: 'center',
                lineHeight: '1.1'
              }}
            >
              {player.name}
            </div>
          ))}
        </div>

        {/* 팀 B 선수들 (오른쪽) */}
        <div style={{ position: 'absolute', right: '10%', top: '20%', width: '30%', height: '60%' }}>
          {currentSet.teamB.players.map((player, idx) => (
            <div
              key={player.id}
              onClick={() => handlePlayerClick(player, 'B')}
              style={{
                position: 'absolute',
                right: `${(idx % 3) * 40}%`,
                top: `${Math.floor(idx / 3) * 50}%`,
                width: '60px',
                height: '60px',
                backgroundColor: selectedPlayer?.id === player.id ? '#f39c12' : '#3498db',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: appPhase === 'playing' ? 'pointer' : 'default',
                fontSize: '11px',
                fontWeight: 'bold',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                textAlign: 'center',
                lineHeight: '1.1'
              }}
            >
              {player.name}
            </div>
          ))}
        </div>
      </div>

      {/* 액션 안내 */}
      {actionMode !== 'none' && !selectedPlayer && appPhase === 'playing' && (
        <div style={{ 
          textAlign: 'center', 
          padding: '10px', 
          backgroundColor: '#3498db', 
          color: 'white', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {actionMode === 'goal' && '득점한 선수를 클릭하세요'}
          {actionMode === 'ownGoal' && '자책골한 선수를 클릭하세요'}
        </div>
      )}

      {/* 이벤트 타임라인 */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        <h3>경기 기록</h3>
        {currentSet.events.length === 0 ? (
          <p style={{ color: '#7f8c8d' }}>아직 기록된 이벤트가 없습니다.</p>
        ) : (
          currentSet.events.map(event => (
            <div key={event.id} style={{ 
              padding: '8px', 
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ flex: 1 }}>
                <strong>{event.time}</strong> - 
                {event.type === 'goal' && ' ⚽ '}
                {event.type === 'ownGoal' && ' ⚫ '}
                <strong>{event.player.name}</strong>
                {event.type === 'goal' && ' 골'}
                {event.type === 'ownGoal' && ' 자책골'}
                {event.assistPlayer && ` | 어시스트: ${event.assistPlayer.name}`}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  color: event.team === 'A' ? '#e74c3c' : '#3498db',
                  fontWeight: 'bold',
                  minWidth: '80px',
                  textAlign: 'right'
                }}>
                  {event.team === 'A' ? currentSet.teamA.name : currentSet.teamB.name}
                </span>
                {appPhase !== 'finished' && (
                  <button
                    onClick={() => deleteEvent(event.id)}
                    style={{ 
                      padding: '2px 6px', 
                      backgroundColor: '#e74c3c', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '3px',
                      fontSize: '10px'
                    }}
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}