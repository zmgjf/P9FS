// components/Scoreboard.tsx

"use client";

import React from "react";

interface Props {
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
}

export default function Scoreboard({ teamAName, teamBName, scoreA, scoreB }: Props) {
  return (
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
        <div style={{ width: '60px', height: '60px', backgroundColor: '#e74c3c', borderRadius: '50%' }}></div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{teamAName}</div>
        </div>
      </div>

      <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
        {scoreA} : {scoreB}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{teamBName}</div>
        </div>
        <div style={{ width: '60px', height: '60px', backgroundColor: '#3498db', borderRadius: '50%' }}></div>
      </div>
    </div>
  );
}