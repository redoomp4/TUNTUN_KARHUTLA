/**
 * @fileoverview Scan & Report Controller for TUNTUN Backend
 * @module backend/controllers/scanController
 */

import {
  evaluateMessageHeuristics,
  analyzeFileBinarySignature,
  generateSafeVerificationReplies,
  buildOfficialReportDraft,
  buildFamilyWarningDraft
} from '../services/engineBridge.js';

export function handleScanMessage(body) {
  const text = String(body?.text || '');
  const result = evaluateMessageHeuristics(text);
  const safeReplies = generateSafeVerificationReplies(text);
  return { ...result, safeReplies };
}

export function handleScanBinary(body) {
  const bytes = Array.isArray(body?.bytes) ? new Uint8Array(body.bytes) : new Uint8Array(0);
  return analyzeFileBinarySignature(
    String(body?.fileName || 'unknown.bin'),
    Number(body?.fileSize || bytes.length),
    bytes
  );
}

export function handleBuildReport(body) {
  return {
    officialDraft: buildOfficialReportDraft(body || {}),
    familyWarning: buildFamilyWarningDraft(body || {})
  };
}
