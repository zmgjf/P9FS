// components/SetSetup.tsx

"use client";

import React, { useState } from "react";
import type { GameSet, Team, AppPhase } from "@/lib/types";

interface Props {
  sets: GameSet[];
  setSets: React.Dispatch<React.SetStateAction<GameSet[]>>;
  teams: Team[];
  setAppPhase: React.Dispatch<React.SetStateAction<AppPhase>>;
  setCurrentSetIndex: (index: number) => void;
}

export default function SetSetup({ sets, setSets, teams, setAppPhase, setCurrentSetIndex }: Props) {
  const [newSetName, setNewSetName] = useState("");
  const [duration, setDuration] = useState(10);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editedSetName, setEditedSetName] = useState("");
  const [editedDuration, setEditedDuration] = useState<number>(10);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const createSet = () => {
    if (!newSetName.trim()) {
      alert("세트 이름을 입력하세요.");
      return;
    }
    
    if (teams.length < 2) {
      alert("먼저 팀을 2개 이상 만들어주세요.");
      return;
    }

    const newSet: GameSet = {
      id: generateId(),
      name: newSetName,
      duration,
      teamA: teams[0],
      teamB: teams[1],
      isActive: false,
      events: [],
    };
    setSets(prev => [...prev, newSet]);
    setNewSetName("");
    setDuration(10);
  };

  const updateSet = (setId: string) => {
    setSets(prev => prev.map(set => set.id === setId ? {
      ...set,
      name: editedSetName,
      duration: editedDuration
    } : set));
    setEditingSetId(null);
  };

  const deleteSet = (setId: string) => {
    setSets(prev => prev.filter(set => set.id !== setId));
  };

  const containerStyle = {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto'
  };

  const inputStyle = {
    padding: '8px 12px',
    margin: '5px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  };

  const buttonStyle = {
    padding: '8px 16px',
    margin: '5px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px'
  };

  return (
    <div style={containerStyle}>
      <h2>🛠 세트 설정</h2>

      {teams.length < 2 && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          ⚠️ 팀이 부족합니다. 먼저 팀 관리에서 팀을 추가해주세요.
          <button 
            style={{...buttonStyle, backgroundColor: '#ffc107', color: '#000', marginLeft: '10px'}}
            onClick={() => setAppPhase("teamManagement")}
          >
            팀 관리로 이동
          </button>
        </div>
      )}

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h4>새 세트 추가</h4>
        <input
          style={inputStyle}
          value={newSetName}
          onChange={(e) => setNewSetName(e.target.value)}
          placeholder="세트 이름"
        />
        <input
          style={inputStyle}
          type="number"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value) || 10)}
          placeholder="진행 시간 (분)"
          min="1"
        />
        <button style={buttonStyle} onClick={createSet}>세트 추가</button>
      </div>

      {sets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>아직 생성된 세트가 없습니다.</p>
          <p>위에서 새 세트를 추가해보세요!</p>
        </div>
      ) : (
        sets.map((set, index) => (
          <div key={set.id} style={{ 
            margin: '20px 0', 
            border: '1px solid #ddd', 
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '8px'
          }}>
            {editingSetId === set.id ? (
              <div>
                <input
                  style={inputStyle}
                  value={editedSetName}
                  onChange={(e) => setEditedSetName(e.target.value)}
                />
                <input
                  style={inputStyle}
                  type="number"
                  value={editedDuration}
                  onChange={(e) => setEditedDuration(parseInt(e.target.value) || 10)}
                  min="1"
                />
                <button style={{...buttonStyle, backgroundColor: '#28a745'}} onClick={() => updateSet(set.id)}>저장</button>
                <button style={{...buttonStyle, backgroundColor: '#6c757d'}} onClick={() => setEditingSetId(null)}>취소</button>
              </div>
            ) : (
              <div>
                <h3 style={{ margin: '0 0 10px 0', cursor: 'pointer' }} onDoubleClick={() => {
                  setEditingSetId(set.id);
                  setEditedSetName(set.name);
                  setEditedDuration(set.duration);
                }}>
                  {set.name} – {set.duration}분
                </h3>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                  {set.teamA?.name || '팀A'} vs {set.teamB?.name || '팀B'}
                </p>
                <small style={{ color: '#999' }}>💡 더블클릭하면 수정할 수 있습니다</small>
              </div>
            )}

            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button 
                style={{...buttonStyle, backgroundColor: '#dc3545'}} 
                onClick={() => deleteSet(set.id)}
              >
                세트 삭제
              </button>
              <button 
                style={{...buttonStyle, backgroundColor: '#28a745'}} 
                onClick={() => {
                  setCurrentSetIndex(index);
                  setAppPhase("playing");
                }}
              >
                이 세트로 시작
              </button>
            </div>
          </div>
        ))
      )}

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button 
          style={{...buttonStyle, backgroundColor: '#6c757d'}} 
          onClick={() => setAppPhase("teamManagement")}
        >
          ← 팀 관리로 돌아가기
        </button>
      </div>
    </div>
  );
}