import { calculateFootballElo, calculatePlayerOVR } from './footballLogic.js';

/**
 * Football Rating calculation for FIFA All Stars match outcomes.
 * Uses FIFA World Ranking adapted goal difference scaling for football matches.
 * @param {number} currentElo 
 * @param {number} opponentAvgElo 
 * @param {number} outcome 1 for Win, 0.5 for Draw, 0 for Loss
 * @param {number} kFactor default 32
 * @param {number} goalDifference absolute goal difference (default 0)
 * @returns {number} updated rating score
 */
export const calculateNewElo = (currentElo, opponentAvgElo, outcome, kFactor = 32, goalDifference = 0) => {
  return calculateFootballElo(currentElo, opponentAvgElo, outcome, kFactor, goalDifference);
};

export const getEloBadgeInfo = (elo) => {
  if (elo >= 1900) return { title: 'World Class', category: 'Legendary', color: 'from-amber-400 to-amber-600', icon: '🏆' };
  if (elo >= 1750) return { title: 'Elite Player', category: 'Elite', color: 'from-cyan-400 to-blue-600', icon: '⚡' };
  if (elo >= 1600) return { title: 'Pro Footballer', category: 'Pro', color: 'from-yellow-400 to-yellow-600', icon: '🥇' };
  if (elo >= 1400) return { title: 'First Team', category: 'Senior', color: 'from-slate-300 to-slate-500', icon: '⚽' };
  return { title: 'Rising Star', category: 'Grassroots', color: 'from-emerald-500 to-teal-700', icon: '🌱' };
};

export const getPlayerTierInfo = getEloBadgeInfo;
export { calculatePlayerOVR };
