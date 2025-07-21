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
  type: 'goal' | 'ownGoal';
  player: Player;
  assistPlayer?: Player;
  team: 'A' | 'B';
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
  | 'gameReady'
  | 'playing'
  | 'paused'
  | 'finished';
