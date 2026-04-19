// Raw NHL API response types from api-web.nhle.com/v1

export type NHLGameState = "FUT" | "PRE" | "LIVE" | "CRIT" | "FINAL" | "OFF";
export type NHLGameScheduleState = "OK" | "PPD" | "SUSP" | "CNCL";
export type NHLPeriodType = "REG" | "OT" | "SO";
export type NHLStrength = "ev" | "pp" | "sh";
export type NHLBroadcastMarket = "N" | "H" | "A";

export interface NHLLocalizedString {
  default: string;
  fr?: string;
}

export interface NHLPeriodDescriptor {
  number: number;
  periodType: NHLPeriodType;
  maxRegulationPeriods: number;
}

export interface NHLBroadcast {
  id: number;
  market: NHLBroadcastMarket;
  countryCode: string;
  network: string;
  sequenceNumber: number;
}

export interface NHLOdds {
  providerId: number;
  value: string;
}

export interface NHLPlayerRef {
  playerId: number;
  name: NHLLocalizedString;
}

export interface NHLSeriesStatus {
  round: number;
  seriesAbbrev: string;
  seriesTitle: string;
  seriesLetter: string;
  neededToWin: number;
  topSeedTeamId: number;
  topSeedWins: number;
  bottomSeedTeamId: number;
  bottomSeedWins: number;
  gameNumberOfSeries: number;
}

export interface NHLScheduleTeam {
  id: number;
  commonName: NHLLocalizedString;
  placeName: NHLLocalizedString;
  placeNameWithPreposition: NHLLocalizedString;
  abbrev: string;
  logo: string;
  darkLogo: string;
  awaySplitSquad: boolean;
  score?: number;
  radioLink?: string;
  odds?: NHLOdds[];
  record?: string;
}

export interface NHLScheduleGame {
  id: number;
  season: number;
  gameType: number; // 1=preseason, 2=regular, 3=playoffs
  venue: NHLLocalizedString;
  neutralSite: boolean;
  startTimeUTC: string;
  easternUTCOffset: string;
  venueUTCOffset: string;
  venueTimezone: string;
  gameState: NHLGameState;
  gameScheduleState: NHLGameScheduleState;
  tvBroadcasts: NHLBroadcast[];
  awayTeam: NHLScheduleTeam;
  homeTeam: NHLScheduleTeam;
  periodDescriptor: NHLPeriodDescriptor;
  gameOutcome?: { lastPeriodType: NHLPeriodType };
  winningGoalie?: NHLPlayerRef;
  winningGoalScorer?: NHLPlayerRef;
  seriesStatus?: NHLSeriesStatus;
  ticketsLink?: string;
  gameCenterLink: string;
}

export interface NHLGameDay {
  date: string;
  dayAbbrev: string;
  numberOfGames: number;
  games: NHLScheduleGame[];
}

export interface NHLScheduleResponse {
  nextStartDate: string;
  previousStartDate: string;
  gameWeek: NHLGameDay[];
  oddsPartners: unknown[];
  preSeasonStartDate: string;
  regularSeasonStartDate: string;
  regularSeasonEndDate: string;
  playoffEndDate: string;
  numberOfGames: number;
}

// Score endpoint (live scores for a date)
export interface NHLScoreResponse {
  prevDate: string;
  currentDate: string;
  nextDate: string;
  gamesByDate: NHLGameDay[];
}

// Game landing (detail page)
export interface NHLLandingTeam extends NHLScheduleTeam {
  sog?: number;
  faceoffWinningPctg?: number;
  powerPlayConversion?: string;
  pim?: number;
  hits?: number;
  blocks?: number;
  goalsByPeriod?: number[];
}

export interface NHLGameVideo {
  threeMinRecap?: number;
  threeMinRecapFr?: number;
  condensedGame?: number;
  condensedGameFr?: number;
}

export interface NHLAssist {
  playerId: number;
  name: NHLLocalizedString;
  assistsToDate: number;
}

export interface NHLGoal {
  situationCode: string;
  strength: NHLStrength;
  playerId: number;
  firstName: NHLLocalizedString;
  lastName: NHLLocalizedString;
  name: NHLLocalizedString;
  teamAbbrev: NHLLocalizedString;
  headshot: string;
  highlightClipSharingUrl?: string;
  highlightClip?: number;
  highlightClipFr?: number;
  discreteClip?: number;
  goalsToDate: number;
  awayScore: number;
  homeScore: number;
  timeInPeriod: string;
  leadingTeamAbbrev?: NHLLocalizedString;
  assists: NHLAssist[];
  shotType?: string;
  goalModifier: "none" | "penalty-shot" | "awarded";
}

export interface NHLScoringPeriod {
  periodDescriptor: NHLPeriodDescriptor;
  goals: NHLGoal[];
}

export interface NHLShootoutAttempt {
  sequence: number;
  playerId: number;
  teamAbbrev: string;
  firstName: NHLLocalizedString;
  lastName: NHLLocalizedString;
  shotType: string;
  result: string;
  headshot: string;
  gameWinner: boolean;
}

export interface NHLThreeStar {
  star: 1 | 2 | 3;
  playerId: number;
  teamAbbrev: string;
  headshot: string;
  name: NHLLocalizedString;
  sweaterNo: number;
  position: string;
  goals: number;
  assists: number;
  points: number;
}

export interface NHLTeamGameStat {
  category: string;
  awayValue: string | number;
  homeValue: string | number;
}

export interface NHLSeasonSeries {
  id: number;
  season: number;
  gameType: number;
  gameDate: string;
  awayTeam: Pick<NHLScheduleTeam, "id" | "abbrev" | "logo" | "score">;
  homeTeam: Pick<NHLScheduleTeam, "id" | "abbrev" | "logo" | "score">;
  gameOutcome?: { lastPeriodType: NHLPeriodType };
}

export interface NHLGameSummary {
  scoring: NHLScoringPeriod[];
  shootout: NHLShootoutAttempt[];
  threeStars: NHLThreeStar[];
  teamGameStats: NHLTeamGameStat[];
  seasonSeries: NHLSeasonSeries[];
  referees: string[];
  linesmen: string[];
}

export interface NHLGameLanding {
  id: number;
  season: number;
  gameType: number;
  limitedScoring: boolean;
  gameDate: string;
  venue: NHLLocalizedString;
  venueLocation?: NHLLocalizedString;
  startTimeUTC: string;
  easternUTCOffset: string;
  venueUTCOffset: string;
  gameState: NHLGameState;
  gameScheduleState: NHLGameScheduleState;
  periodDescriptor?: NHLPeriodDescriptor;
  awayTeam: NHLLandingTeam;
  homeTeam: NHLLandingTeam;
  gameVideo?: NHLGameVideo;
  summary?: NHLGameSummary;
}

// Play-by-play
export interface NHLPlayDetails {
  eventOwnerTeamId?: number;
  losingPlayerId?: number;
  winningPlayerId?: number;
  scoringPlayerId?: number;
  scoringPlayerTotal?: number;
  assist1PlayerId?: number;
  assist1PlayerTotal?: number;
  assist2PlayerId?: number;
  assist2PlayerTotal?: number;
  goalieInNetId?: number;
  awaySOG?: number;
  homeSOG?: number;
  playerId?: number;
  blockingPlayerId?: number;
  hittingPlayerId?: number;
  hitteePlayerId?: number;
  reason?: string;
  descKey?: string;
  duration?: number;
  committedByPlayerId?: number;
  drawnByPlayerId?: number;
  xCoord?: number;
  yCoord?: number;
  zoneCode?: "O" | "D" | "N";
  shotType?: string;
}

export interface NHLPlay {
  eventId: number;
  periodDescriptor: NHLPeriodDescriptor;
  timeInPeriod: string;
  timeRemaining: string;
  situationCode: string;
  homeTeamDefendingSide: "left" | "right";
  typeCode: number;
  typeDescKey: string;
  sortOrder: number;
  details?: NHLPlayDetails;
  coordinates?: { x: number; y: number };
}

export interface NHLRosterSpot {
  teamId: number;
  playerId: number;
  firstName: NHLLocalizedString;
  lastName: NHLLocalizedString;
  sweaterNumber: number;
  positionCode: string;
  headshot: string;
}

export interface NHLPlayByPlay {
  id: number;
  plays: NHLPlay[];
  rosterSpots: NHLRosterSpot[];
}

// Boxscore
export interface NHLSkaterStat {
  playerId: number;
  sweaterNumber: number;
  name: NHLLocalizedString;
  position: string;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  pim: number;
  hits: number;
  powerPlayGoals: number;
  sog: number;
  faceoffWinningPctg?: number;
  toi: string;
}

export interface NHLGoalieStat {
  playerId: number;
  sweaterNumber: number;
  name: NHLLocalizedString;
  position: string;
  evenStrengthShotsAgainst: number;
  powerPlayShotsAgainst: number;
  shorthandedShotsAgainst: number;
  saveShotsAgainst: number;
  savePctg?: number;
  evenStrengthGoalsAgainst: number;
  powerPlayGoalsAgainst: number;
  shorthandedGoalsAgainst: number;
  pim: number;
  goalsAgainst: number;
  toi: string;
  starter: boolean;
  decision?: "W" | "L" | "O";
}

export interface NHLBoxscoreTeam {
  skaters: NHLSkaterStat[];
  goalies: NHLGoalieStat[];
  onIce: number[];
  onIceScratch: number[];
  scratches: number[];
  penaltyBox: unknown[];
  teamGameStats: NHLTeamGameStat[];
}

export interface NHLBoxscore {
  id: number;
  season: number;
  gameType: number;
  gameDate: string;
  venue: NHLLocalizedString;
  startTimeUTC: string;
  gameState: NHLGameState;
  periodDescriptor: NHLPeriodDescriptor;
  awayTeam: NHLLandingTeam;
  homeTeam: NHLLandingTeam;
  playerByGameStats: {
    awayTeam: NHLBoxscoreTeam;
    homeTeam: NHLBoxscoreTeam;
  };
}
