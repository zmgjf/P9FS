// lib/types.ts

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  createdAt: string;
}

export interface GameEvent {
  id: string;
  time: string;
  realTime: number;
  type: 'goal' | 'ownGoal' | 'substitution';
  player: Player;
  assistPlayer?: Player;
  team: 'A' | 'B';
  // 교체 관련 필드
  playerOut?: Player;
  playerIn?: Player;
}

export interface PlayerPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  team: 'A' | 'B';
  isActive: boolean;
}

export interface GameSet {
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
  // 포메이션 정보
  formation?: string;
  playerPositions?: PlayerPosition[];
  teamACount?: number;
  teamBCount?: number;
}

export interface Match {
  id: string;
  name: string;
  venue: string;
  date: string;
  sets: GameSet[];
  createdAt: string;
}

export type AppPhase =
  | 'matchManagement'
  | 'teamManagement'
  | 'setSetup'
  | 'formationSetup'
  | 'gameReady'
  | 'playing'
  | 'paused'
  | 'finished';