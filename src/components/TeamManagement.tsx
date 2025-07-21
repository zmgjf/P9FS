// components/TeamManagement.tsx

"use client";

import React, { useState } from "react";
import type { Team, Player } from "@/lib/types";

interface Props {
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  setAppPhase: (phase: string) => void;
}

export default function TeamManagement({ teams, setTeams, setAppPhase }: Props) {
  const [newTeamName, setNewTeamName] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editedTeamName, setEditedTeamName] = useState("");
  const [editedPlayerName, setEditedPlayerName] = useState("");

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const createTeam = () => {
    if (!newTeamName.trim()) return;
    const newTeam: Team = {
      id: generateId(),
      name: newTeamName,
      players: [],
      createdAt: new Date().toISOString(),
    };
    setTeams(prev => [...prev, newTeam]);
    setNewTeamName("");
  };

  const updateTeamName = (teamId: string) => {
    setTeams(prev => prev.map(team => team.id === teamId ? { ...team, name: editedTeamName } : team));
    setEditingTeamId(null);
    setEditedTeamName("");
  };

  const addPlayer = (teamId: string) => {
    if (!newPlayerName.trim()) return;
    const newPlayer: Player = {
      id: generateId(),
      name: newPlayerName,
    };
    setTeams(prev =>
      prev.map(t =>
        t.id === teamId ? { ...t, players: [...t.players, newPlayer] } : t
      )
    );
    setNewPlayerName("");
    setEditingTeamId(null);
  };

  const updatePlayerName = (teamId: string, playerId: string) => {
    setTeams(prev =>
      prev.map(team =>
        team.id === teamId
          ? {
              ...team,
              players: team.players.map(player =>
                player.id === playerId ? { ...player, name: editedPlayerName } : player
              )
            }
          : team
      )
    );
    setEditingPlayerId(null);
    setEditedPlayerName("");
  };

  const deletePlayer = (teamId: string, playerId: string) => {
    setTeams(prev =>
      prev.map(t =>
        t.id === teamId ? { ...t, players: t.players.filter(p => p.id !== playerId) } : t
      )
    );
  };

  const deleteTeam = (teamId: string) => {
    setTeams(prev => prev.filter(t => t.id !== teamId));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>👥 팀 관리</h2>

      <div>
        <input
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="팀 이름"
        />
        <button onClick={createTeam}>팀 추가</button>
      </div>

      {teams.map((team) => (
        <div key={team.id} style={{ margin: '20px 0', border: '1px solid #ccc', padding: 10 }}>
          {editingTeamId === team.id ? (
            <div>
              <input
                value={editedTeamName}
                onChange={(e) => setEditedTeamName(e.target.value)}
              />
              <button onClick={() => updateTeamName(team.id)}>저장</button>
              <button onClick={() => setEditingTeamId(null)}>취소</button>
            </div>
          ) : (
            <h3 onDoubleClick={() => {
              setEditingTeamId(team.id);
              setEditedTeamName(team.name);
            }}>{team.name}</h3>
          )}

          <button onClick={() => deleteTeam(team.id)}>팀 삭제</button>

          <div style={{ marginTop: 10 }}>
            <input
              value={editingTeamId === team.id ? newPlayerName : ""}
              onChange={(e) => {
                setNewPlayerName(e.target.value);
                setEditingTeamId(team.id);
              }}
              placeholder="선수 이름"
            />
            <button onClick={() => addPlayer(team.id)}>선수 추가</button>
          </div>

          <ul>
            {team.players.map((player) => (
              <li key={player.id}>
                {editingPlayerId === player.id ? (
                  <>
                    <input
                      value={editedPlayerName}
                      onChange={(e) => setEditedPlayerName(e.target.value)}
                    />
                    <button onClick={() => updatePlayerName(team.id, player.id)}>저장</button>
                    <button onClick={() => setEditingPlayerId(null)}>취소</button>
                  </>
                ) : (
                  <>
                    <span onDoubleClick={() => {
                      setEditingPlayerId(player.id);
                      setEditedPlayerName(player.name);
                    }}>{player.name}</span>
                    <button onClick={() => deletePlayer(team.id, player.id)}>삭제</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <button onClick={() => setAppPhase("setSetup")}>다음 단계로 → 세트 설정</button>
    </div>
  );
}
