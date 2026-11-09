/**
 * @fileoverview Shared Deterministic & Hybrid AI Engine Bridge for Backend
 * @module backend/services/engineBridge
 */

export { evaluateMessageHeuristics, normalizeObfuscatedText } from '../../../frontend/src/engines/heuristicEngine.js';
export { analyzeFileBinarySignature, SIMULATED_BINARY_SAMPLES } from '../../../frontend/src/engines/fileSignatureEngine.js';
export {
  SPARRING_PERSONAS,
  evaluateUserDefenseResponse,
  buildSmartContextualScammerReply,
  requestHybridScammerReply,
  requestHybridMessageAnalysis,
  generateSafeVerificationReplies,
  buildDeterministicContextualSummary
} from '../../../frontend/src/engines/hybridAiEngine.js';
export {
  evaluateDetectiveSubmission,
  computeGuardianPreparedness
} from '../../../frontend/src/engines/scoringEngine.js';
export {
  buildOfficialReportDraft,
  buildFamilyWarningDraft
} from '../../../frontend/src/engines/reportBuilderEngine.js';
