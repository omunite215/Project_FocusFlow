/**
 * XP / Level progression system for FocusFlow.
 *
 * XP sources:
 *  - Each completed 15-minute focus block = 25 XP base
 *  - Focus quality bonus: avg_focus >= 4 → +10 XP per block
 *  - Streak bonus: consecutive sessions → +15 XP per session
 *  - Completion bonus: finishing all planned blocks → +50 XP per session
 *
 * Leveling curve: XP required per level = 100 * level^1.5 (RPG-style scaling)
 * Level 1: 100 XP, Level 2: 283 XP cumulative, Level 5: 1118 XP cumulative...
 */

const XP_PER_BLOCK = 25;
const FOCUS_BONUS = 10;       // per block when avg focus >= 4
const COMPLETION_BONUS = 50;  // per session when all blocks done

/**
 * Calculate total XP from dashboard data.
 * @param {object} dashData — DashboardResponse from backend
 * @returns {{ totalXP: number, level: number, currentLevelXP: number, nextLevelXP: number, progress: number, title: string }}
 */
export function calculateXP(dashData) {
  if (!dashData) {
    return { totalXP: 0, level: 1, currentLevelXP: 0, nextLevelXP: 100, progress: 0, title: "Novice Scholar" };
  }

  const totalMinutes = dashData.total_study_minutes || 0;
  const totalSessions = dashData.total_sessions || 0;
  const avgFocus = dashData.avg_focus || 0;

  // Base XP: one block = 15 min of study
  const blocksCompleted = Math.floor(totalMinutes / 15);
  let totalXP = blocksCompleted * XP_PER_BLOCK;

  // Focus quality bonus
  if (avgFocus >= 4) {
    totalXP += blocksCompleted * FOCUS_BONUS;
  }

  // Completion bonus — approximate from total sessions
  totalXP += totalSessions * COMPLETION_BONUS;

  // Derive level from total XP
  const { level, currentLevelXP, nextLevelXP } = getLevelFromXP(totalXP);
  const progress = nextLevelXP > 0 ? currentLevelXP / nextLevelXP : 1;
  const title = getLevelTitle(level);

  return { totalXP, level, currentLevelXP, nextLevelXP, progress, title };
}

/**
 * XP thresholds per level: 100 * level^1.5
 */
function xpForLevel(level) {
  return Math.round(100 * Math.pow(level, 1.5));
}

function getLevelFromXP(totalXP) {
  let level = 1;
  let cumulativeXP = 0;

  while (true) {
    const needed = xpForLevel(level);
    if (cumulativeXP + needed > totalXP) {
      return {
        level,
        currentLevelXP: totalXP - cumulativeXP,
        nextLevelXP: needed,
      };
    }
    cumulativeXP += needed;
    level++;
  }
}

function getLevelTitle(level) {
  if (level <= 1) return "Novice Scholar";
  if (level <= 3) return "Apprentice Learner";
  if (level <= 5) return "Focus Adept";
  if (level <= 8) return "Study Knight";
  if (level <= 12) return "Knowledge Mage";
  if (level <= 16) return "Focus Master";
  if (level <= 20) return "Grand Scholar";
  return "Legendary Mind";
}
