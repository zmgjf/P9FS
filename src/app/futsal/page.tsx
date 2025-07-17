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
}

interface GameSet {
  id: string;
  name: string;
  duration: number; // 분 단위
  teamA: Team;
  teamB: Team;
  isActive: boolean;
  startTime?: number;
  events: GameEvent[];
}

interface GameEvent {
  id: string;
  time: string;
  realTime: number; // 실제 경과 시간 (초)
  type: 'goal' | 'assist' | 'ownGoal';
  player: Player;
  assistPlayer?: Player;
  team: 'A' | 'B';
}

type AppPhase = 'teamManagement' | 'setSetup' | 'gameReady' | 'playing' | 'paused' | 'finished';
type ActionMode = 'none' | 'goal' | 'assist' | 'ownGoal';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export default function FutsalManager() {
  // 앱 상태
  const [appPhase, setAppPhase] = useState<AppPhase>('teamManagement');
  const [actionMode, setActionMode] = useState<ActionMode>('none');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [assistPlayer, setAssistPlayer] = useState<Player | null>(null);
  
  // 팀 관리
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  
  // 게임 세트
  const [sets, setSets] = useState<GameSet[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [gameTime, setGameTime] = useState(0); // 경과 시간 (초)
  
  // 새 세트 생성 정보
  const [newSetName, setNewSetName] = useState('');
  const [newSetDuration, setNewSetDuration] = useState(10);
  const [selectedTeamAId, setSelectedTeamAId] = useState('');
  const [selectedTeamBId, setSelectedTeamBId] = useState('');

  const currentSet = sets[currentSetIndex];

  // 게임 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (appPhase === 'playing' && currentSet) {
      interval = setInterval(() => {
        setGameTime(prev => {
          const newTime = prev + 1;
          if (newTime >= currentSet.duration * 60) {
            setAppPhase('finished');
            return currentSet.duration * 60;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [appPhase, currentSet]);

  // 팀 생성
  const createTeam = () => {
    if (!newTeamName.trim()) {
      alert('팀 이름을 입력하세요.');
      return;
    }

    const newTeam: Team = {
      id: generateId(),
      name: newTeamName,
      players: []
    };

    setTeams(prev => [...prev, newTeam]);
    setNewTeamName('');
  };

  // 선수 추가
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

  // 팀 삭제
  const deleteTeam = (teamId: string) => {
    if (confirm('정말 이 팀을 삭제하시겠습니까?')) {
      setTeams(prev => prev.filter(team => team.id !== teamId));
    }
  };

  // 선수 삭제
  const deletePlayer = (teamId: string, playerId: string) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? { ...team, players: team.players.filter(p => p.id !== playerId) }
        : team
    ));
  };

  // 세트 생성
  const createSet = () => {
    if (!newSetName || !selectedTeamAId || !selectedTeamBId) {
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

    setSets(prev => [...prev, newSet]);
    setCurrentSetIndex(sets.length);
    
    // 초기화
    setNewSetName('');
    setSelectedTeamAId('');
    setSelectedTeamBId('');
    setAppPhase('gameReady');
  };

  // 게임 시작
  const startGame = () => {
    if (!currentSet) return;
    
    setSets(prev => prev.map((set, idx) => 
      idx === currentSetIndex 
        ? { ...set, isActive: true, startTime: Date.now() }
        : set
    ));
    setGameTime(0);
    setAppPhase('playing');
  };

  // 게임 일시정지/재개
  const togglePause = () => {
    setAppPhase(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  // 플레이어 클릭 처리
  const handlePlayerClick = (player: Player, team: 'A' | 'B') => {
    if (appPhase !== 'playing') return;

    if (actionMode === 'goal' || actionMode === 'ownGoal') {
      if (!selectedPlayer) {
        setSelectedPlayer(player);
        if (actionMode === 'ownGoal') {
          recordEvent(actionMode, player, team);
        }
      }
    } else if (actionMode === 'assist') {
      if (selectedPlayer && !assistPlayer) {
        setAssistPlayer(player);
        recordEvent('goal', selectedPlayer, team, player);
      }
    }
  };

  // 이벤트 기록
  const recordEvent = (type: 'goal' | 'ownGoal', scorer: Player, team: 'A' | 'B', assist?: Player) => {
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

    setSets(prev => prev.map((set, idx) => 
      idx === currentSetIndex 
        ? { ...set, events: [...set.events, event] }
        : set
    ));

    // 초기화
    setActionMode('none');
    setSelectedPlayer(null);
    setAssistPlayer(null);
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

  // 팀 관리 화면
  if (appPhase === 'teamManagement') {
    return (
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>⚽ 팀 관리</h1>
          <button 
            onClick={() => setAppPhase('setSetup')}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#27ae60', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              fontSize: '16px'
            }}
          >
            세트 만들기
          </button>
        </div>
        
        {/* 새 팀 생성 */}
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

        {/* 팀 목록 */}
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
              
              {/* 선수 추가 */}
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
              
              {/* 선수 목록 */}
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

        {teams.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#999',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            아직 팀이 없습니다. 위에서 새 팀을 만들어보세요!
          </div>
        )}
      </div>
    );
  }

  // 세트 설정 화면
  if (appPhase === 'setSetup') {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1>⚽ 새 세트 만들기</h1>
          <button 
            onClick={() => setAppPhase('teamManagement')}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#95a5a6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px' 
            }}
          >
            팀 관리로 돌아가기
          </button>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #ddd' }}>
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

  // 게임 화면 (기존과 동일하되 currentSet이 있을 때만 렌더링)
  if (!currentSet) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>세트가 선택되지 않았습니다.</h2>
        <button onClick={() => setAppPhase('setSetup')}>세트 만들기</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '10px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        backgroundColor: '#2c3e50',
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
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setAppPhase('teamManagement')}
            style={{ 
              padding: '8px 12px', 
              backgroundColor: '#95a5a6', 
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
            새 세트
          </button>
        </div>
      </div>

      {/* 스코어보드 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#34495e',
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
            onClick={() => setActionMode('assist')}
            style={{ 
              padding: '10px 15px', 
              backgroundColor: actionMode === 'assist' ? '#e74c3c' : '#95a5a6',
              color: 'white', 
              border: 'none', 
              borderRadius: '5px' 
            }}
          >
            🅰️ 어시스트
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
              setAssistPlayer(null);
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
      {actionMode !== 'none' && appPhase === 'playing' && (
        <div style={{ 
          textAlign: 'center', 
          padding: '10px', 
          backgroundColor: '#f39c12', 
          color: 'white', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {actionMode === 'goal' && !selectedPlayer && '득점한 선수를 클릭하세요'}
          {actionMode === 'goal' && selectedPlayer && '어시스트한 선수를 클릭하거나 취소를 누르세요'}
          {actionMode === 'assist' && '어시스트한 선수를 클릭하세요'}
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
              justifyContent: 'space-between'
            }}>
              <span>
                <strong>{event.time}</strong> - 
                {event.type === 'goal' && ' ⚽ '}
                {event.type === 'ownGoal' && ' ⚫ '}
                <strong>{event.player.name}</strong>
                {event.type === 'goal' && ' 골'}
                {event.type === 'ownGoal' && ' 자책골'}
                {event.assistPlayer && ` | 어시스트: ${event.assistPlayer.name}`}
              </span>
              <span style={{ 
                color: event.team === 'A' ? '#e74c3c' : '#3498db',
                fontWeight: 'bold'
              }}>
                {event.team === 'A' ? currentSet.teamA.name : currentSet.teamB.name}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}