/**
 * @fileoverview Deterministic Scoring & Preparedness Evaluation Engine
 * @module engines/scoringEngine
 *
 * Implements FR-10, FR-11, FR-12, FR-13, and FR-14:
 * - Forensic Scam Detective evaluation (True Positives vs False Positives penalty)
 * - Unified Guardian Profile preparedness score aggregation (0-100)
 * - Strength & Vulnerability category mapping
 */

/**
 * Evaluates a user's selected evidence clues against a forensic detective case.
 * @param {Array<{id: string, isRisk: boolean, title: string, category: string, desc: string}>} allClues
 * @param {string[]} selectedIds
 * @returns {{
 *   valid: boolean,
 *   error?: string,
 *   score: number,
 *   hits: number,
 *   totalTargets: number,
 *   falsePositives: number,
 *   missedTitles: string[],
 *   hitCategories: string[]
 * }}
 */
export function evaluateDetectiveSubmission(allClues, selectedIds) {
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return {
      valid: false,
      error: 'Pilih minimal 1 indikator mencurigakan terlebih dahulu sebelum mengirim laporan.',
      score: 0,
      hits: 0,
      totalTargets: 0,
      falsePositives: 0,
      missedTitles: [],
      hitCategories: []
    };
  }

  const targetRiskClues = allClues.filter(c => c.isRisk);
  const totalTargets = targetRiskClues.length;

  let hits = 0;
  let falsePositives = 0;
  const missedTitles = [];
  const hitCategories = [];

  allClues.forEach(clue => {
    const isSelected = selectedIds.includes(clue.id);
    if (clue.isRisk && isSelected) {
      hits++;
      hitCategories.push(clue.category);
    } else if (clue.isRisk && !isSelected) {
      missedTitles.push(clue.title);
    } else if (!clue.isRisk && isSelected) {
      falsePositives++;
    }
  });

  const rawRatio = totalTargets > 0 ? (hits / totalTargets) * 100 : 0;
  const penalty = falsePositives * 15;
  const caseScore = Math.max(0, Math.round(rawRatio - penalty));

  return {
    valid: true,
    score: caseScore,
    hits,
    totalTargets,
    falsePositives,
    missedTitles,
    hitCategories
  };
}

/**
 * Computes the overall Guardian Preparedness Profile from session state.
 * @param {object} sessionState
 * @returns {{
 *   hasData: boolean,
 *   avgScore: number|null,
 *   tier: 'UNANALYZED'|'RESILIENT'|'MODERATE'|'VULNERABLE',
 *   strengthLabel: string,
 *   weaknessLabel: string
 * }}
 */
export function computeGuardianPreparedness(sessionState) {
  const simScores = Object.values(sessionState?.simulator?.completedScenarios || {});
  const detResults = Object.values(sessionState?.detective?.caseResults || {});
  const allScores = [...simScores, ...detResults.map(r => r.score)];

  if (allScores.length === 0) {
    return {
      hasData: false,
      avgScore: null,
      tier: 'UNANALYZED',
      strengthLabel: '-',
      weaknessLabel: '-'
    };
  }

  const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  const allMissed = [];
  const allStrengths = new Set();

  detResults.forEach(r => {
    (r.missedTitles || []).forEach(m => allMissed.push(m));
    (r.hitCategories || []).forEach(c => allStrengths.add(c));
  });

  if (simScores.some(s => s >= 80)) {
    allStrengths.add('Refleks Tolak APK & Verifikasi Resmi');
  }

  const strengthLabel = allStrengths.size > 0
    ? Array.from(allStrengths).slice(0, 2).join(', ')
    : 'Perlu Latihan Dasar';

  let weaknessLabel = 'Pertahankan Kewaspadaan Kanal Resmi';
  if (allMissed.length > 0) {
    weaknessLabel = `Pelajari: ${allMissed[0]}`;
  } else if ((sessionState?.simulator?.riskyDecisions || 0) > 0) {
    weaknessLabel = 'Waspadai Taktik Urgensi & APK di Simulator';
  }

  let tier = 'VULNERABLE';
  if (avgScore >= 85) tier = 'RESILIENT';
  else if (avgScore >= 55) tier = 'MODERATE';

  return {
    hasData: true,
    avgScore,
    tier,
    strengthLabel,
    weaknessLabel
  };
}
