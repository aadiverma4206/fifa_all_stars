/**
 * Elo Rating calculation for FIFA All Stars match outcomes.
 * @param {number} currentElo 
 * @param {number} opponentAvgElo 
 * @param {number} outcome 1 for Win, 0.5 for Draw, 0 for Loss
 * @param {number} kFactor default 32
 * @returns {number} updated Elo score
 */
export const calculateNewElo = (currentElo, opponentAvgElo, outcome, kFactor = 32) => {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentAvgElo - currentElo) / 400));
  const newElo = Math.round(currentElo + kFactor * (outcome - expectedScore));
  return Math.max(800, newElo);
};

export const getEloBadgeInfo = (elo) => {
  if (elo >= 1900) return { title: 'Master Division', color: 'from-amber-400 to-amber-600', icon: '🏆' };
  if (elo >= 1750) return { title: 'Diamond Division', color: 'from-cyan-400 to-blue-600', icon: '💎' };
  if (elo >= 1600) return { title: 'Gold Division', color: 'from-yellow-400 to-yellow-600', icon: '🥇' };
  if (elo >= 1400) return { title: 'Silver Division', color: 'from-slate-300 to-slate-500', icon: '🥈' };
  return { title: 'Bronze Division', color: 'from-amber-700 to-amber-900', icon: '🥉' };
};
