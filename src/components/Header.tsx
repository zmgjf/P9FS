// components/Header.tsx

"use client";

import React from "react";
import type { Match } from "@/lib/types";

interface Props {
  match: Match;
  setAppPhase: (phase: string) => void;
}

export default function Header({ match, setAppPhase }: Props) {
  return (
    <div style={{ 
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0' }}>{match.name}</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>{match.venue} | {match.date}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setAppPhase('matchManagement')}
            style={{ padding: '8px 12px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px' }}
          >경기 목록</button>
          <button 
            onClick={() => setAppPhase('teamManagement')}
            style={{ padding: '8px 12px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '4px' }}
          >팀 관리</button>
          <button 
            onClick={() => setAppPhase('setSetup')}
            style={{ padding: '8px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px' }}
          >세트 관리</button>
        </div>
      </div>
    </div>
  );
}