// Normalized internal types used throughout the app

export type GameState = "scheduled" | "live" | "critical" | "final" | "postponed" | "cancelled";
export type GameType = "preseason" | "regular" | "playoffs";
export type PeriodType = "REG" | "OT" | "SO";

export interface NormalizedTeamScore {
  id: number;
  name: string; // "Boston Bruins"
  shortName: string; // "Bruins"
  abbrev: string; // "BOS"
  logo: string;
  darkLogo: string;
  score?: number;
  record?: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface NormalizedGame {
  id: number;
  date: string; // YYYY-MM-DD
  startTimeUTC: string;
  gameState: GameState;
  gameType: GameType;
  isPlayoffs: boolean;
  venue: string;
  awayTeam: NormalizedTeamScore;
  homeTeam: NormalizedTeamScore;
  broadcasts: string[];
  period?: number;
  periodType?: PeriodType;
  timeRemaining?: string;
  gameOutcome?: PeriodType;
  seriesStatus?: string;
  gameCenterLink: string;
}

export interface VideoClip {
  milestoneId: number;
  title: string;
  url?: string;
  embedUrl?: string;
}

export interface GoalClip {
  eventId: string; // period-time-scorer composite key
  scorer: string;
  scorerPlayerId: number;
  scorerHeadshot: string;
  assists: string[];
  teamAbbrev: string;
  timeInPeriod: string;
  period: number;
  periodType: PeriodType;
  awayScore: number;
  homeScore: number;
  strength: "ev" | "pp" | "sh";
  milestoneId?: number;
  highlightClipSharingUrl?: string;
}

export interface GameDetail {
  id: number;
  date: string;
  startTimeUTC: string;
  gameState: GameState;
  gameType: GameType;
  venue: string;
  awayTeam: NormalizedTeamScore & {
    sog?: number;
    hits?: number;
    pim?: number;
    blocks?: number;
  };
  homeTeam: NormalizedTeamScore & {
    sog?: number;
    hits?: number;
    pim?: number;
    blocks?: number;
  };
  period?: number;
  periodType?: PeriodType;
  threeMinRecap?: VideoClip;
  condensedGame?: VideoClip;
  goals: GoalClip[];
  shootout: ShootoutAttempt[];
  threeStars: ThreeStar[];
  teamStats: TeamStat[];
}

export interface ShootoutAttempt {
  sequence: number;
  playerId: number;
  teamAbbrev: string;
  firstName: string;
  lastName: string;
  result: string;
  headshot: string;
  gameWinner: boolean;
}

export interface ThreeStar {
  star: 1 | 2 | 3;
  playerId: number;
  teamAbbrev: string;
  headshot: string;
  name: string;
  sweaterNo: number;
  position: string;
  goals: number;
  assists: number;
  points: number;
}

export interface TeamStat {
  category: string;
  awayValue: string | number;
  homeValue: string | number;
}

export interface Team {
  id: number;
  abbrev: string;
  fullName: string;
  shortName: string;
  city: string;
  conference: "Eastern" | "Western";
  division: "Atlantic" | "Metropolitan" | "Central" | "Pacific";
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  darkLogoUrl: string;
}
