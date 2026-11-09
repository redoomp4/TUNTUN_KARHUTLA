import assert from 'node:assert/strict';
import { SCANNER_PRESETS } from '../frontend/src/data/officialDomains.js';
import { SIMULATOR_SCENARIOS } from '../frontend/src/data/simulatorScenarios.js';
import { DETECTIVE_CASES } from '../frontend/src/data/detectiveCases.js';
import { ACTION_GUIDE_SITUATIONS, EMERGENCY_DIRECTORY_DATA } from '../frontend/src/data/emergencyDirectory.js';
import { evaluateMessageHeuristics } from '../frontend/src/engines/heuristicEngine.js';
import { analyzeFileBinarySignature, SIMULATED_BINARY_SAMPLES } from '../frontend/src/engines/fileSignatureEngine.js';
import { evaluateDetectiveSubmission, computeGuardianPreparedness } from '../frontend/src/engines/scoringEngine.js';
import { buildOfficialReportDraft, buildFamilyWarningDraft } from '../frontend/src/engines/reportBuilderEngine.js';
import {
  evaluateUserDefenseResponse,
  requestHybridScammerReply,
  generateSafeVerificationReplies
} from '../frontend/src/engines/hybridAiEngine.js';

console.log('========================================================================');
console.log('DIGITAL GUARDIAN — REACT ENGINE & INTEGRATION RUNTIME TEST SUITE');
console.log('========================================================================');

// 1. Test Heuristic Message & URL Scanner across all 4 presets
const apkRes = evaluateMessageHeuristics(SCANNER_PRESETS.apk.text);
assert(apkRes.score >= 60 && apkRes.verdictLevel === 'DANGER', 'APK preset must trigger DANGER');
assert(apkRes.extractedIncident.type.includes('APK'), 'APK preset must extract APK incident type');
console.log(`[PASS] Engine 1A: Heuristic APK Scanner -> Score ${apkRes.score}/100 (${apkRes.verdictBadgeText})`);

const phishRes = evaluateMessageHeuristics(SCANNER_PRESETS.phish.text);
assert(phishRes.score >= 60 && phishRes.verdictLevel === 'DANGER', 'Phishing preset must trigger DANGER');
assert(phishRes.anatomyItems.length >= 2, 'Phishing URL must produce URL anatomy breakdown');
console.log(`[PASS] Engine 1B: Heuristic Phishing & URL Deconstructor -> Score ${phishRes.score}/100, Anatomy items=${phishRes.anatomyItems.length}`);

const safeRes = evaluateMessageHeuristics(SCANNER_PRESETS.safe.text);
assert(safeRes.score < 25 && safeRes.verdictLevel === 'SAFE', 'Safe OTP warning preset must be graded SAFE');
console.log(`[PASS] Engine 1C: Safe Official Reminder Detection -> Score ${safeRes.score}/100 (${safeRes.verdictBadgeText})`);

// 2. Test Client-Side Binary Magic-Bytes File Inspector
const fakePdfSample = SIMULATED_BINARY_SAMPLES.renamedApkAsPdf;
const fakePdfRes = analyzeFileBinarySignature(fakePdfSample.fileName, fakePdfSample.fileSize, fakePdfSample.bytes);
assert(fakePdfRes.isDangerous === true && fakePdfRes.score >= 95, 'Renamed APK as PDF must be flagged as critical danger');
assert(fakePdfRes.magicHex.startsWith('50 4B 03 04'), 'Magic hex must detect PK.. 50 4B 03 04');
console.log(`[PASS] Engine 2A: Magic-Bytes Inspector (APK disguised as .PDF) -> ${fakePdfRes.magicHex} | Score ${fakePdfRes.score}/100`);

const realPdfSample = SIMULATED_BINARY_SAMPLES.genuinePdf;
const realPdfRes = analyzeFileBinarySignature(realPdfSample.fileName, realPdfSample.fileSize, realPdfSample.bytes);
assert(realPdfRes.isDangerous === false && realPdfRes.score <= 15, 'Genuine PDF must be verified safe');
assert(realPdfRes.magicHex.startsWith('25 50 44 46'), 'Magic hex must detect %PDF 25 50 44 46');
console.log(`[PASS] Engine 2B: Magic-Bytes Inspector (Genuine .PDF) -> ${realPdfRes.magicHex} | Score ${realPdfRes.score}/100`);

// 3. Test Branching Simulator State Machine Integrity
for (const [key, scen] of Object.entries(SIMULATOR_SCENARIOS)) {
  assert(scen.steps.length >= 2, `Scenario ${key} must have branching steps`);
  for (const step of scen.steps) {
    assert(step.choices.length >= 2, `Scenario ${key} step ${step.stepNum} must have choices`);
  }
}
console.log(`[PASS] Engine 3: Branching Simulator State Machine -> ${Object.keys(SIMULATOR_SCENARIOS).length} scenarios verified`);

// 4. Test Hybrid AI Guardrail Evaluator & NFR-09 Offline Fallback
const evalDanger = evaluateUserDefenseResponse('Ini kode OTP saya 482910 tolong jangan blokir');
assert(evalDanger.verdict === 'DANGEROUS' && evalDanger.scoreDelta < 0, 'Leaking 6-digit OTP must trigger DANGEROUS guardrail');
const evalStrong = evaluateUserDefenseResponse('Ayo kita video call dulu, saya cek di aplikasi resmi dan tidak transfer ke rekening beda nama');
assert(evalStrong.verdict === 'STRONG_DEFENSE' && evalStrong.scoreDelta > 0, 'Video call & official verification must trigger STRONG_DEFENSE');
const fallbackReply = await requestHybridScammerReply('hackedFriend', 0, 'Ayo video call sekarang', { forceOffline: true });
assert(fallbackReply.source === 'LOCAL_FALLBACK' && fallbackReply.replyText.length > 15, 'NFR-09 offline fallback must return contextual reply');
console.log(`[PASS] Engine 4: Hybrid AI Guardrail & NFR-09 Fallback -> Guardrail=(${evalDanger.verdict}, ${evalStrong.verdict}), Fallback=${fallbackReply.source}`);

// 5. Test Scam Detective Forensic Scoring Engine (True Positives vs False Positives)
const prizeCase = DETECTIVE_CASES.prize;
const prizeClues = [prizeCase.senderClue, ...prizeCase.bodyBlocks.filter(b => b.type === 'clue')];
const riskIds = prizeClues.filter(c => c.isRisk).map(c => c.id);
const decoyId = prizeClues.find(c => !c.isRisk).id;

const perfectEval = evaluateDetectiveSubmission(prizeClues, riskIds);
assert(perfectEval.score === 100 && perfectEval.falsePositives === 0, 'Selecting only true risks must yield 100/100');
const penalizedEval = evaluateDetectiveSubmission(prizeClues, [...riskIds, decoyId]);
assert(penalizedEval.score === 85 && penalizedEval.falsePositives === 1, 'Selecting 1 safe decoy must apply -15 penalty');
console.log(`[PASS] Engine 5: Scam Detective Scoring -> Perfect=100/100, With Decoy Penalty=${penalizedEval.score}/100`);

// 6. Test Official Report Builder & Safe Verification Replies
const draft = buildOfficialReportDraft(phishRes.extractedIncident);
const famWarn = buildFamilyWarningDraft(phishRes.extractedIncident);
const safeReplies = generateSafeVerificationReplies(SCANNER_PRESETS.phish.text);
assert(draft.includes('LAPORAN KRONOLOGI INSIDEN') && famWarn.includes('PERINGATAN'), 'Report builder must generate formatted drafts');
assert(safeReplies.length === 3, 'Safe verification reply generator must produce 3 templates');
console.log(`[PASS] Engine 6: Report Builder & Safe Reply Templates -> Generated ${safeReplies.length} reply templates`);

// 7. Test Guardian Profile Aggregation
const mockSession = {
  simulator: { safeDecisions: 4, riskyDecisions: 0, completedScenarios: { courier: 100, bank: 100 } },
  detective: { caseResults: { prize: perfectEval } }
};
const profile = computeGuardianPreparedness(mockSession);
assert(profile.hasData === true && profile.avgScore === 100 && profile.tier === 'RESILIENT', 'Profile aggregation must compute 100 RESILIENT');
console.log(`[PASS] Engine 7: Guardian Profile Aggregation -> AvgScore=${profile.avgScore}/100 (${profile.tier})`);
console.log('------------------------------------------------------------------------');
console.log('ALL 7 RUNTIME ENGINE SUITES PASSED SUCCESSFULLY.');
console.log('========================================================================');
