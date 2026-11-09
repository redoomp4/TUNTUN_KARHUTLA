/**
 * @fileoverview Free Hybrid AI Chat & Contextual Analysis Controller
 * @module backend/controllers/aiChatController
 */

import {
  evaluateMessageHeuristics,
  evaluateUserDefenseResponse,
  requestHybridScammerReply,
  requestHybridMessageAnalysis
} from '../services/engineBridge.js';

export async function handleAiSparringChat(body) {
  const personaKey = String(body?.personaKey || 'hackedFriend');
  const turnIndex = Number(body?.turnIndex || 0);
  const userMessage = String(body?.userMessage || '');
  const history = Array.isArray(body?.history) ? body.history : [];

  const guardrail = evaluateUserDefenseResponse(userMessage);
  const aiReply = await requestHybridScammerReply(personaKey, turnIndex, userMessage, {
    history,
    forceOffline: Boolean(body?.forceOffline)
  });

  return {
    guardrail,
    aiReply
  };
}

export async function handleAiMessageAnalysis(body) {
  const rawText = String(body?.text || '');
  const heuristicResult = body?.heuristicResult || evaluateMessageHeuristics(rawText);
  return requestHybridMessageAnalysis(rawText, heuristicResult);
}
