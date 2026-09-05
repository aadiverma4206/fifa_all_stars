/**
 * Football Domain Rules & Logic Engine for FIFA ALL STARS
 * Implements official IFAB / FIFA rules for grassroots and turf football.
 */

// Official Football / Turf Match Formats & Capacity Specifications
export const FOOTBALL_FORMATS = {
  '1v1': { label: '1v1 Panna / Street Football', slots: 2, teamSlots: 1, durationMinutes: 15, ballSize: 4 },
  '2v2': { label: '2v2 Street Football', slots: 4, teamSlots: 2, durationMinutes: 20, ballSize: 4 },
  '3v3': { label: '3v3 Cage Football', slots: 6, teamSlots: 3, durationMinutes: 25, ballSize: 4 },
  '4v4': { label: '4v4 Small-Sided Football', slots: 8, teamSlots: 4, durationMinutes: 30, ballSize: 4 },
  '5v5': { label: '5v5 Futsal / Box Turf', slots: 10, teamSlots: 5, durationMinutes: 45, ballSize: 4 },
  '6v6': { label: '6v6 Turf Football', slots: 12, teamSlots: 6, durationMinutes: 60, ballSize: 5 },
  '7v7': { label: '7v7 Mini Football', slots: 14, teamSlots: 7, durationMinutes: 60, ballSize: 5 },
  '8v8': { label: '8v8 Turf Football', slots: 16, teamSlots: 8, durationMinutes: 70, ballSize: 5 },
  '9v9': { label: '9v9 Academy Football', slots: 18, teamSlots: 9, durationMinutes: 80, ballSize: 5 },
  '11v11': { label: '11v11 Association Football', slots: 22, teamSlots: 11, durationMinutes: 90, ballSize: 5 }
};

// Standard Football Positions
export const FOOTBALL_POSITIONS = {
  // Goalkeeper
  GK: { code: 'GK', title: 'Goalkeeper', category: 'Goalkeeper' },
  
  // Defenders
  CB: { code: 'CB', title: 'Center Back', category: 'Defender' },
  LB: { code: 'LB', title: 'Left Back', category: 'Defender' },
  RB: { code: 'RB', title: 'Right Back', category: 'Defender' },
  LWB: { code: 'LWB', title: 'Left Wing Back', category: 'Defender' },
  RWB: { code: 'RWB', title: 'Right Wing Back', category: 'Defender' },
  DEF: { code: 'DEF', title: 'Defender', category: 'Defender' },

  // Midfielders
  CDM: { code: 'CDM', title: 'Defensive Midfielder', category: 'Midfielder' },
  CM: { code: 'CM', title: 'Central Midfielder', category: 'Midfielder' },
  CAM: { code: 'CAM', title: 'Attacking Midfielder', category: 'Midfielder' },
  LM: { code: 'LM', title: 'Left Midfielder', category: 'Midfielder' },
  RM: { code: 'RM', title: 'Right Midfielder', category: 'Midfielder' },
  MID: { code: 'MID', title: 'Midfielder', category: 'Midfielder' },

  // Forwards / Attackers
  ST: { code: 'ST', title: 'Striker', category: 'Forward' },
  CF: { code: 'CF', title: 'Center Forward', category: 'Forward' },
  LW: { code: 'LW', title: 'Left Winger', category: 'Forward' },
  RW: { code: 'RW', title: 'Right Winger', category: 'Forward' },
  FWD: { code: 'FWD', title: 'Forward', category: 'Forward' },
  WING: { code: 'WING', title: 'Winger', category: 'Forward' }
};

// Official Football Points System (Standard FIFA League System)
export const FOOTBALL_POINTS = {
  WIN: 3,
  DRAW: 1,
  LOSS: 0
};

/**
 * Normalizes any position string into standard football position
 */
export const normalizeFootballPosition = (posStr) => {
  if (!posStr) return 'MID';
  const clean = posStr.trim().toUpperCase();
  if (FOOTBALL_POSITIONS[clean]) return clean;

  if (clean.includes('GOAL') || clean.includes('KEEPER')) return 'GK';
  if (clean.includes('STRIKER') || clean.includes('ATTACK')) return 'ST';
  if (clean.includes('WING')) return 'LW';
  if (clean.includes('DEFEND') || clean.includes('BACK')) return 'CB';
  if (clean.includes('MID') || clean.includes('PLAYMAKER')) return 'CM';

  return 'MID';
};

/**
 * Get category of football position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward'
 */
export const getPositionCategory = (posCode) => {
  const norm = normalizeFootballPosition(posCode);
  return FOOTBALL_POSITIONS[norm]?.category || 'Midfielder';
};

/**
 * Calculates official football match outcome and player impact
 * @param {number} teamAScore 
 * @param {number} teamBScore 
 * @param {'TEAM_A'|'TEAM_B'} playerTeam 
 */
export const calculateFootballMatchResult = (teamAScore, teamBScore, playerTeam) => {
  const isDraw = teamAScore === teamBScore;
  const teamAWon = teamAScore > teamBScore;
  const isTeamA = playerTeam === 'TEAM_A';

  const goalsFor = isTeamA ? teamAScore : teamBScore;
  const goalsAgainst = isTeamA ? teamBScore : teamAScore;
  const goalDiff = goalsFor - goalsAgainst;

  let result = 'DRAW';
  let pointsEarned = FOOTBALL_POINTS.DRAW;
  let isWin = false;
  let isLoss = false;

  if (!isDraw) {
    const won = (isTeamA && teamAWon) || (!isTeamA && !teamAWon);
    if (won) {
      result = 'WON';
      pointsEarned = FOOTBALL_POINTS.WIN;
      isWin = true;
    } else {
      result = 'LOST';
      pointsEarned = FOOTBALL_POINTS.LOSS;
      isLoss = true;
    }
  }

  // Clean sheet achieved when conceding zero goals
  const cleanSheet = goalsAgainst === 0;

  return {
    result, // 'WON' | 'DRAW' | 'LOST'
    outcomeCode: isWin ? 'W' : (isDraw ? 'D' : 'L'),
    pointsEarned, // 3 for Win, 1 for Draw, 0 for Loss
    isWin,
    isDraw,
    isLoss,
    goalsFor,
    goalsAgainst,
    goalDiff,
    cleanSheet
  };
};

/**
 * Football Elo Rating Calculation (FIFA Men's World Ranking formula adapted for match scores)
 * @param {number} currentElo 
 * @param {number} opponentAvgElo 
 * @param {number} outcome 1 for Win, 0.5 for Draw, 0 for Loss
 * @param {number} kFactor default 32
 * @param {number} goalDifference absolute difference in goals
 * @returns {number} updated Elo
 */
export const calculateFootballElo = (currentElo, opponentAvgElo, outcome, kFactor = 32, goalDifference = 0) => {
  // Expected win probability (We)
  const dr = opponentAvgElo - currentElo;
  const expectedScore = 1 / (1 + Math.pow(10, dr / 400));

  // Football Goal Difference Multiplier (FIFA/Elo standard G factor)
  let goalMultiplier = 1.0;
  const absDiff = Math.abs(goalDifference || 0);

  if (absDiff === 2) {
    goalMultiplier = 1.5;
  } else if (absDiff === 3) {
    goalMultiplier = 1.75;
  } else if (absDiff >= 4) {
    goalMultiplier = (11 + absDiff) / 8;
  }

  const delta = Math.round(kFactor * goalMultiplier * (outcome - expectedScore));
  const newElo = currentElo + delta;

  // Floor at 800 Elo rating
  return Math.max(800, newElo);
};

/**
 * Calculates FIFA-style player Overall Rating (OVR: 40 - 99) from Elo rating
 */
export const calculatePlayerOVR = (eloRating = 1500) => {
  if (eloRating >= 2300) return 96;
  if (eloRating >= 2100) return 91;
  if (eloRating >= 1950) return 88;
  if (eloRating >= 1800) return 84;
  if (eloRating >= 1650) return 80;
  if (eloRating >= 1500) return 76;
  if (eloRating >= 1350) return 72;
  if (eloRating >= 1200) return 68;
  return Math.max(50, Math.round(50 + (eloRating - 800) * 0.04));
};
