/**
 * @fileoverview Vercel Serverless Function Adapter for TUNTUN Backend API
 * Routes /api/* requests on Vercel to Backend controllers.
 */

import {
  handleScanMessage,
  handleScanBinary,
  handleBuildReport
} from '../Backend/src/controllers/scanController.js';
import {
  handleAiSparringChat,
  handleAiMessageAnalysis
} from '../Backend/src/controllers/aiChatController.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  try {
    if (req.method === 'GET' && pathname.endsWith('/health')) {
      return res.status(200).json({
        status: 'OK',
        service: 'TUNTUN Digital Guardian Serverless API (Vercel)',
        version: '2.0.0',
        statelessPrivacy: true,
        rulesActive: ['R-01', 'R-02', 'R-03', 'R-04', 'R-05', 'R-06', 'R-07', 'R-08', 'R-09', 'R-10']
      });
    }

    if (req.method === 'POST' && pathname.endsWith('/scan/message')) {
      return res.status(200).json(handleScanMessage(body));
    }

    if (req.method === 'POST' && pathname.endsWith('/scan/binary')) {
      return res.status(200).json(handleScanBinary(body));
    }

    if (req.method === 'POST' && pathname.endsWith('/ai/chat')) {
      return res.status(200).json(await handleAiSparringChat(body));
    }

    if (req.method === 'POST' && pathname.endsWith('/ai/analyze')) {
      return res.status(200).json(await handleAiMessageAnalysis(body));
    }

    if (req.method === 'POST' && pathname.endsWith('/report/build')) {
      return res.status(200).json(handleBuildReport(body));
    }

    return res.status(404).json({ error: 'Endpoint tidak ditemukan' });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Permintaan tidak valid' });
  }
}
