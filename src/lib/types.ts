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
  type: 'goal' | 'ownGoal' | 'yellowCard' | 'redCard' | 'substitution';
  player: Player;
  assistPlayer?: Player;
  team: 'A' | 'B';
  // 추가 정보 (카드, 교체 등)
  details?: string;
  playerOut?: Player; // 교체 시 나가는 선수
  playerIn?: Player;  // 교체 시 들어오는 선수
}

export interface PlayerPosition {
  id: string;
  name: string;
  x: number;
  y: number;
  team: 'A' | 'B';
  isActive: boolean;
  position?: 'goalkeeper' | 'defender' | 'midfielder' | 'forward';
}

export interface GameSet {
  id: string;
  name: string;
  duration: number; // 분
  teamA: Team;
  teamB: Team;
  isActive: boolean;
  startTime?: number;
  pausedTime?: number; // 일시정지된 시간 (초)
  events: GameEvent[];
  finalScore?: { teamA: number; teamB: number };
  completedAt?: string;
  // 포메이션 정보
  formation?: string;
  playerPositions?: PlayerPosition[];
  teamACount?: number;
  teamBCount?: number;
  // 추가 통계
  possession?: { teamA: number; teamB: number }; // 점유율
  shots?: { teamA: number; teamB: number }; // 슛 횟수
  corners?: { teamA: number; teamB: number }; // 코너킥
  fouls?: { teamA: number; teamB: number }; // 파울
}

export interface Match {
  id: string;
  name: string;
  venue: string;
  date: string;
  sets: GameSet[];
  createdAt: string;
  description?: string; // 경기 설명
  weather?: string; // 날씨
  temperature?: number; // 온도
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  matches: Match[];
  teams: Team[];
  rules?: {
    setDuration: number; // 기본 세트 시간
    maxPlayers: number; // 최대 선수 수
    substitutions: number; // 교체 횟수
  };
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  teamName: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  ownGoals: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  // 계산된 통계
  goalsPerGame: number;
  assistsPerGame: number;
}

export interface TeamStats {
  teamId: string;
  teamName: string;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  // 추가 통계
  cleanSheets: number; // 무실점 경기
  averageGoalsPerGame: number;
  winPercentage: number;
}

export type AppPhase =
  | 'matchManagement'
  | 'teamManagement'
  | 'setSetup'
  | 'formationSetup'
  | 'gameReady'
  | 'playing'
  | 'paused'
  | 'finished'
  | 'matchHistory'
  | 'statistics'
  | 'tournament'
  | 'playerProfile'
  | 'settings';

export type FormationType = 
  | '2v2'
  | '3v3' 
  | '4v4' 
  | '5v5' 
  | '6v6'
  | 'custom';

export interface Formation {
  type: FormationType;
  name: string;
  positions: {
    teamA: Array<{ x: number; y: number; position?: string }>;
    teamB: Array<{ x: number; y: number; position?: string }>;
  };
}

export interface AppSettings {
  defaultGameDuration: number;
  defaultFormation: FormationType;
  autoSave: boolean;
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
}

// 유틸리티 타입들
export type EventType = GameEvent['type'];
export type TeamSide = 'A' | 'B';
export type MatchStatus = Match['status'];

// API 응답 타입들 (향후 확장용)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}