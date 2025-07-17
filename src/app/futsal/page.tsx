"use client";

import React, { useState } from "react";

interface Member {
  id: string;
  name: string;
  number: number;
}

interface Team {
  id: string;
  name: string;
  members: Member[];
}

interface SetInfo {
  name: string;
  teamA: Team;
  teamB: Team;
}

type EventType = "goal" | "assist" | "ownGoal";

// UUID 생성 함수
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 기본 플레이어 데이터
const createDefaultTeams = (): { teamA: Team; teamB: Team } => ({
  teamA: {
    id: generateId(),
    name: "팀 A",
    members: [
      { id: generateId(), name: "선수1", number: 1 },
      { id: generateId(), name: "선수2", number: 2 },
      { id: generateId(), name: "선수3", number: 3 },
      { id: generateId(), name: "선수4", number: 4 },
      { id: generateId(), name: "선수5", number: 5 },
    ],
  },
  teamB: {
    id: generateId(),
    name: "팀 B",
    members: [
      { id: generateId(), name: "선수6", number: 6 },
      { id: generateId(), name: "선수7", number: 7 },
      { id: generateId(), name: "선수8", number: 8 },
      { id: generateId(), name: "선수9", number: 9 },
      { id: generateId(), name: "선수10", number: 10 },
    ],
  },
});

export default function MatchTimeline() {
  // 기본 세트 생성
  const [sets, setSets] = useState<SetInfo[]>(() => {
    const { teamA, teamB } = createDefaultTeams();
    return [
      {
        name: "세트 1",
        teamA,
        teamB,
      },
    ];
  });

  const [selectedSetIndex, setSelectedSetIndex] = useState(0);
  const [timeline, setTimeline] = useState<string[][]>([[]]);
  const [selectedScorer, setSelectedScorer] = useState<string>("");
  const [selectedAssist, setSelectedAssist] = useState<string>("");
  const [eventType, setEventType] = useState<EventType>("goal");

  const selectedSet = sets[selectedSetIndex];
  const allPlayers = selectedSet ? [...selectedSet.teamA.members, ...selectedSet.teamB.members] : [];

  const handleRecord = () => {
    // 유효성 검사
    if (!selectedScorer) {
      alert("득점자를 선택해주세요.");
      return;
    }

    const scorer = allPlayers.find((p) => p.id === selectedScorer);
    const assist = selectedAssist ? allPlayers.find((p) => p.id === selectedAssist) : null;
    
    if (!scorer) {
      alert("선택된 득점자가 유효하지 않습니다.");
      return;
    }

    const time = new Date().toLocaleTimeString();

    let text = "";
    if (eventType === "goal") {
      text = `${scorer.name} (${scorer.number}) 골!${assist ? ` 도움: ${assist.name} (${assist.number})` : ""}`;
    } else if (eventType === "assist") {
      if (!assist) {
        alert("어시스트 선수를 선택해주세요.");
        return;
      }
      text = `${assist.name} (${assist.number}) 어시스트 기록`;
    } else {
      text = `${scorer.name} (${scorer.number}) 자책골`;
    }

    setTimeline((prev) => {
      const newTimeline = [...prev];
      if (!newTimeline[selectedSetIndex]) {
        newTimeline[selectedSetIndex] = [];
      }
      newTimeline[selectedSetIndex] = [...newTimeline[selectedSetIndex], `${time} - ${text}`];
      return newTimeline;
    });

    // 입력 필드 초기화
    setSelectedScorer("");
    setSelectedAssist("");
  };

  const handleAddSet = () => {
    const { teamA, teamB } = createDefaultTeams();
    const newSet: SetInfo = {
      name: `세트 ${sets.length + 1}`,
      teamA,
      teamB,
    };
    setSets((prev) => [...prev, newSet]);
    setTimeline((prev) => [...prev, []]);
    setSelectedSetIndex(sets.length);
  };

  const selectStyle = {
    width: '200px',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    cursor: 'pointer'
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  };

  const cardStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '900px', 
      margin: '0 auto',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        fontSize: '28px', 
        fontWeight: 'bold', 
        marginBottom: '30px',
        textAlign: 'center',
        color: '#111827'
      }}>
        ⚽ 풋살 경기 타임라인
      </h1>

      {/* 세트 선택 */}
      <div style={cardStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#374151' }}>
            세트 선택
          </h2>
          <button 
            onClick={handleAddSet}
            style={buttonStyle}
          >
            + 세트 추가
          </button>
        </div>
        <select 
          value={selectedSetIndex} 
          onChange={(e) => setSelectedSetIndex(Number(e.target.value))}
          style={{ ...selectStyle, width: '300px' }}
        >
          {sets.map((s, idx) => (
            <option key={idx} value={idx}>
              {`${idx + 1}세트: ${s.teamA.name} vs ${s.teamB.name}`}
            </option>
          ))}
        </select>
      </div>

      {/* 이벤트 기록 */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>
          경기 이벤트 기록
        </h2>
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
              이벤트 종류
            </label>
            <select 
              value={eventType} 
              onChange={(e) => setEventType(e.target.value as EventType)}
              style={{ ...selectStyle, width: '120px' }}
            >
              <option value="goal">골</option>
              <option value="assist">어시스트</option>
              <option value="ownGoal">자책골</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
              득점자
            </label>
            <select 
              value={selectedScorer} 
              onChange={(e) => setSelectedScorer(e.target.value)}
              style={selectStyle}
            >
              <option value="">선택하세요</option>
              {allPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {`${p.number}번 ${p.name}`}
                </option>
              ))}
            </select>
          </div>

          {(eventType === "goal" || eventType === "assist") && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280' }}>
                {eventType === "goal" ? "어시스트 (선택)" : "어시스트 선수"}
              </label>
              <select 
                value={selectedAssist} 
                onChange={(e) => setSelectedAssist(e.target.value)}
                style={selectStyle}
              >
                <option value="">
                  {eventType === "goal" ? "없음" : "선택하세요"}
                </option>
                {allPlayers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {`${p.number}번 ${p.name}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'end', height: '100%' }}>
            <button 
              onClick={handleRecord} 
              disabled={!selectedScorer}
              style={{
                ...buttonStyle,
                backgroundColor: selectedScorer ? '#3b82f6' : '#9ca3af',
                cursor: selectedScorer ? 'pointer' : 'not-allowed',
                marginTop: '20px'
              }}
            >
              📝 기록
            </button>
          </div>
        </div>
      </div>

      {/* 타임라인 */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#374151' }}>
          📋 타임라인 - {selectedSet?.name || ""}
        </h2>
        <div style={{ 
          maxHeight: '400px', 
          overflowY: 'auto',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          backgroundColor: '#f9fafb'
        }}>
          {timeline[selectedSetIndex]?.length ? (
            timeline[selectedSetIndex].map((line, idx) => (
              <div 
                key={idx} 
                style={{ 
                  padding: '12px 16px',
                  borderBottom: idx < timeline[selectedSetIndex].length - 1 ? '1px solid #e5e7eb' : 'none',
                  fontSize: '14px',
                  backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb'
                }}
              >
                {line}
              </div>
            ))
          ) : (
            <div style={{ 
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              아직 기록된 이벤트가 없습니다.
              <br />
              위에서 득점자를 선택하고 기록 버튼을 눌러보세요!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}