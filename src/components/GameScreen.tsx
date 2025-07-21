// components/GameScreen.tsx

"use client";

import React, { useState } from "react";
import type { GameSet, Team, GameEvent, AppPhase, Player } from "@/lib/types";
import EventTimeline from "@/components/EventTimeline";
import Scoreboard from "@/components/Scoreboard";

interface Props {
  currentSet: GameSet;
  setCurrentSet: (newSet: GameSet) => void;
  setAppPhase: React.Dispatch<React.SetStateAction<AppPhase>>;
}

export default function GameScreen({ currentSet, setCurrentSet, setAppPhase }: Props) {
  const [time, setTime] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A');
  const [eventType, setEventType] = useState<'goal' | 'ownGoal'>('goal');
  const [assistPlayer, setAssistPlayer] = useState("");

  // 점수 계산
  const scoreA = currentSet.events.filter(e => 
    (e.team === 'A' && e.type === 'goal') || (e.team === 'B' && e.type === 'ownGoal')
  ).length;
  
  const scoreB = currentSet.events.filter(e => 
    (e.team === 'B' && e.type === 'goal') || (e.team === 'A' && e.type === 'ownGoal')
  ).length;

  const handleAddEvent = () => {
    if (!time.trim() || !selectedPlayer.trim()) {
      alert("시간과 선수를 입력하세요.");
      return;
    }

    const newEvent: GameEvent = {
      id: Date.now().toString(36),
      time,
      realTime: Date.now(),
      type: eventType,
      player: { id: selectedPlayer, name: selectedPlayer },
      team: selectedTeam,
      assistPlayer: assistPlayer ? { id: assistPlayer, name: assistPlayer } : undefined,
    };

    setCurrentSet({
      ...currentSet,
      events: [...currentSet.events, newEvent].sort((a, b) => {
        // 시간 순으로 정렬 (간단한 문자열 비교)
        return a.time.localeCompare(b.time);
      })
    });

    // 입력 필드 초기화
    setTime("");
    setSelectedPlayer("");
    setAssistPlayer("");
  };

  const handleDeleteEvent = (eventId: string) => {
    setCurrentSet({
      ...currentSet,
      events: currentSet.events.filter(event => event.id !== eventId)
    });
  };

  const handleEditEvent = (eventId: string, newPlayerName: string) => {
    setCurrentSet({
      ...currentSet,
      events: currentSet.events.map(event =>
        event.id === eventId
          ? { ...event, player: { ...event.player, name: newPlayerName } }
          : event
      )
    });
  };

  const containerStyle = {
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  };

  const inputStyle = {
    padding: '8px 12px',
    margin: '5px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  };

  const buttonStyle = {
    padding: '10px 20px',
    margin: '5px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  };

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 10px 0' }}>⚽ {currentSet.name}</h2>
        <p style={{ color: '#666', margin: 0 }}>{currentSet.duration}분 경기</p>
      </div>

      <Scoreboard
        teamAName={currentSet.teamA?.name || '팀A'}
        teamBName={currentSet.teamB?.name || '팀B'}
        scoreA={scoreA}
        scoreB={scoreB}
      />

      {/* 이벤트 추가 패널 */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #ddd'
      }}>
        <h3 style={{ marginTop: 0 }}>📝 이벤트 기록</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '15px' }}>
          <input
            style={inputStyle}
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="시간 (예: 15:30)"
          />
          
          <select 
            style={inputStyle}
            value={selectedTeam} 
            onChange={(e) => setSelectedTeam(e.target.value as 'A' | 'B')}
          >
            <option value="A">{currentSet.teamA?.name || '팀A'}</option>
            <option value="B">{currentSet.teamB?.name || '팀B'}</option>
          </select>

          <select 
            style={inputStyle}
            value={eventType} 
            onChange={(e) => setEventType(e.target.value as 'goal' | 'ownGoal')}
          >
            <option value="goal">⚽ 골</option>
            <option value="ownGoal">⚫ 자책골</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
          <input
            style={inputStyle}
            value={selectedPlayer}
            onChange={(e) => setSelectedPlayer(e.target.value)}
            placeholder="득점 선수"
          />
          
          <input
            style={inputStyle}
            value={assistPlayer}
            onChange={(e) => setAssistPlayer(e.target.value)}
            placeholder="어시스트 (선택사항)"
          />
        </div>

        <button 
          style={{
            ...buttonStyle,
            backgroundColor: '#28a745',
            color: 'white',
            width: '100%'
          }} 
          onClick={handleAddEvent}
        >
          기록 추가
        </button>
      </div>

      <EventTimeline
        currentSet={currentSet}
        onDeleteEvent={handleDeleteEvent}
        onEditEvent={handleEditEvent}
      />

      {/* 경기 제어 버튼들 */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        justifyContent: 'center', 
        marginTop: '20px',
        flexWrap: 'wrap'
      }}>
        <button 
          style={{
            ...buttonStyle,
            backgroundColor: '#ffc107',
            color: '#000'
          }} 
          onClick={() => setAppPhase("setSetup")}
        >
          ⚙️ 세트 관리
        </button>
        
        <button 
          style={{
            ...buttonStyle,
            backgroundColor: '#dc3545',
            color: 'white'
          }} 
          onClick={() => {
            if (confirm('경기를 종료하시겠습니까?')) {
              setAppPhase("setSetup");
            }
          }}
        >
          🏁 경기 종료
        </button>
      </div>
    </div>
  );
}