// components/EventTimeline.tsx

"use client";

import React, { useState } from "react";
import type { GameEvent, GameSet } from "@/lib/types";

interface Props {
  currentSet: GameSet;
  onDeleteEvent?: (eventId: string) => void;
  disabled?: boolean;
  onEditEvent?: (eventId: string, newPlayerName: string) => void;
}

export default function EventTimeline({ currentSet, onDeleteEvent, disabled = false, onEditEvent }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedPlayer, setEditedPlayer] = useState<string>('');

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto' }}>
      <h3>경기 기록</h3>
      {currentSet.events.length === 0 ? (
        <p style={{ color: '#7f8c8d', textAlign: 'center' }}>아직 기록된 이벤트가 없습니다.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {currentSet.events.map(event => {
            const isTeamA = event.team === 'A';
            const color = isTeamA ? '#ef4444' : '#3b82f6';
            const background = isTeamA ? '#fee2e2' : '#dbeafe';
            return (
              <li key={event.id} style={{
                backgroundColor: background,
                border: `2px solid ${color}`,
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{event.time}</strong> –
                  {editingId === event.id ? (
                    <input
                      value={editedPlayer}
                      onChange={(e) => setEditedPlayer(e.target.value)}
                      onBlur={() => {
                        if (onEditEvent) onEditEvent(event.id, editedPlayer);
                        setEditingId(null);
                      }}
                      autoFocus
                    />
                  ) : (
                    <span onDoubleClick={() => {
                      setEditingId(event.id);
                      setEditedPlayer(event.player.name);
                    }}>
                      {event.player.name}
                    </span>
                  )}
                  {event.type === 'ownGoal' ? ' ⚫ 자책골' : ' ⚽ 골'}
                  {event.assistPlayer && (
                    <div style={{ fontSize: '12px', color: '#555' }}>🅰️ {event.assistPlayer.name}</div>
                  )}
                </div>
                {!disabled && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {onEditEvent && editingId !== event.id && (
                      <button onClick={() => {
                        setEditingId(event.id);
                        setEditedPlayer(event.player.name);
                      }} style={{ fontSize: '12px' }}>✏️</button>
                    )}
                    {onDeleteEvent && (
                      <button onClick={() => onDeleteEvent(event.id)} style={{ fontSize: '12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px' }}>
                        삭제
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
