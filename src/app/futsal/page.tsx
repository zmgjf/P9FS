"use client";

import React, { useState, useEffect } from "react";

interface Player {
  id: string;
  name: string;
  number: number;
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

type GamePhase = 'setup' | 'teamSetup' | 'playing' | 'paused' | 'finished';
type ActionMode = 'none' | 'goal' | 'assist' | 'ownGoal';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export default function FutsalManager() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  const [actionMode, setActionMode] = useState<ActionMode>('none');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [assistPlayer, setAssistPlayer] = useState<Player | null>(null);
  
  const [sets, setSets] = useState<GameSet[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [gameTime, setGameTime] = useState(0); // 경과 시간 (초)
  
  // 새 세트 생성
  const [newSetName, setNewSetName] = useState('');
  const [newSetDuration, setNewSetDuration] = useState(10);
  const [teamAName, setTeamAName] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [teamAPlayers, setTeamAPlayers] = useState<Player[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<Player[]>([]);

  const currentSet = sets[currentSetIndex];

  // 게임 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gamePhase === 'playing' && currentSet) {
      interval = setInterval(() => {
        setGameTime(prev => {
          const newTime = prev + 1;
          if (newTime >= currentSet.duration * 60) {
            setGamePhase('finished');
            return currentSet.duration * 60;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gamePhase, currentSet]);

  // 플레이어 추가
  const addPlayer = (team: 'A' | 'B') => {
    const name = prompt(`${team === 'A' ? teamAName : teamBName} 선수 이름을 입력하세요:`);
    if (!name) return;
    
    const number = parseInt(prompt('등번호를 입력하세요:') || '0');
    if (!number) return;

    const newPlayer: Player = {
      id: generateId(),
      name,
      number
    };

    if (team === 'A') {
      setTeamAPlayers(prev => [...prev, newPlayer]);
    } else {
      setTeamBPlayers(prev => [...prev, newPlayer]);
    }
  };

  // 세트 생성
  const createSet = () => {
    if (!newSetName || !teamAName || !teamBName || teamAPlayers.length === 0 || teamBPlayers.length === 0) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    const newSet: GameSet = {
      id: generateId(),
      name: newSetName,
      duration: newSetDuration,
      teamA: {
        id: generateId(),
        name: teamAName,
        players: teamAPlayers
      },
      teamB: {
        id: generateId(),
        name: teamBName,
        players: teamBPlayers
      },
      isActive: false,
      events: []
    };

    setSets(prev => [...prev, newSet]);
    
    // 초기화
    setNewSetName('');
    setTeamAName('');
    setTeamBName('');
    setTeamAPlayers([]);
    setTeamBPlayers([]);
    setGamePhase('setup');
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
    setGamePhase('playing');
  };

  // 게임 일시정지/재개
  const togglePause = () => {
    setGamePhase(prev => prev === 'playing' ? 'paused' : 'playing');
  };

  // 플레이어 클릭 처리
  const handlePlayerClick = (player: Player, team: 'A' | 'B') => {
    if (gamePhase !== 'playing') return;

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

  if (gamePhase === 'teamSetup' || (gamePhase === 'setup' && sets.length === 0)) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>⚽ 새 세트 만들기</h1>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3>세트 정보</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>세트 이름: </label>
            <input 
              type="text" 
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              placeholder="예: 1세트"
              style={{ marginLeft: '10px', padding: '5px' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label>경기 시간: </label>
            <input 
              type="number" 
              value={newSetDuration}
              onChange={(e) => setNewSetDuration(parseInt(e.target.value))}
              style={{ marginLeft: '10px', padding: '5px', width: '60px' }}
            />
            <span> 분</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          {/* 팀 A */}
          <div style={{ flex: 1, backgroundColor: '#fee', padding: '20px', borderRadius: '8px' }}>
            <h3>팀 A</h3>
            <input 
              type="text" 
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              placeholder="팀 이름"
              style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
            />
            <button onClick={() => addPlayer('A')} style={{ marginBottom: '10px' }}>
              + 선수 추가
            </button>
            <div>
              {teamAPlayers.map(player => (
                <div key={player.id} style={{ padding: '5px', border: '1px solid #ccc', margin: '2px' }}>
                  {player.number}번 {player.name}
                </div>
              ))}
            </div>
          </div>

          {/* 팀 B */}
          <div style={{ flex: 1, backgroundColor: '#eef', padding: '20px', borderRadius: '8px' }}>
            <h3>팀 B</h3>
            <input 
              type="text" 
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
              placeholder="팀 이름"
              style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
            />
            <button onClick={() => addPlayer('B')} style={{ marginBottom: '10px' }}>
              + 선수 추가
            </button>
            <div>
              {teamBPlayers.map(player => (
                <div key={player.id} style={{ padding: '5px', border: '1px solid #ccc', margin: '2px' }}>
                  {player.number}번 {player.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={createSet}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#4CAF50', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              fontSize: '16px'
            }}
          >
            세트 생성
          </button>
        </div>
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
          {currentSet?.name || '세트 선택'}
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {formatTime(gameTime)} / {currentSet ? formatTime(currentSet.duration * 60) : '00:00'}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setGamePhase('teamSetup')}>새 세트</button>
          {sets.length > 0 && (
            <select 
              value={currentSetIndex} 
              onChange={(e) => setCurrentSetIndex(parseInt(e.target.value))}
            >
              {sets.map((set, idx) => (
                <option key={set.id} value={idx}>{set.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {currentSet && (
        <>
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
            {gamePhase === 'setup' && (
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
            {(gamePhase === 'playing' || gamePhase === 'paused') && (
              <button 
                onClick={togglePause}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: gamePhase === 'playing' ? '#f39c12' : '#27ae60', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px' 
                }}
              >
                {gamePhase === 'playing' ? '일시정지' : '재개'}
              </button>
            )}
          </div>

          {/* 액션 버튼들 */}
          {gamePhase === 'playing' && (
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: gamePhase === 'playing' ? 'pointer' : 'default',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  <div>{player.number}</div>
                  <div style={{ fontSize: '8px' }}>{player.name}</div>
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: gamePhase === 'playing' ? 'pointer' : 'default',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  <div>{player.number}</div>
                  <div style={{ fontSize: '8px' }}>{player.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 액션 안내 */}
          {actionMode !== 'none' && gamePhase === 'playing' && (
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
                    <strong>{event.player.name} ({event.player.number})</strong>
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
        </>
      )}
    </div>
  );
}