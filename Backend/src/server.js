/**
 * @fileoverview TUNTUN Digital Guardian — Stateless Backend API Server
 * @module backend/server
 */

import http from 'node:http';
import {
  handleScanMessage,
  handleScanBinary,
  handleBuildReport
} from './controllers/scanController.js';
import {
  handleAiSparringChat,
  handleAiMessageAnalysis
} from './controllers/aiChatController.js';

const PORT = process.env.PORT || 4000;

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 256 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      return sendJson(res, 200, {
        status: 'OK',
        service: 'TUNTUN Digital Guardian Backend API',
        version: '2.0.0',
        statelessPrivacy: true,
        rulesActive: ['R-01', 'R-02', 'R-03', 'R-04', 'R-05', 'R-06', 'R-07', 'R-08', 'R-09', 'R-10']
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/scan/message') {
      const body = await parseJsonBody(req);
      return sendJson(res, 200, handleScanMessage(body));
    }

    if (req.method === 'POST' && url.pathname === '/api/scan/binary') {
      const body = await parseJsonBody(req);
      return sendJson(res, 200, handleScanBinary(body));
    }

    if (req.method === 'POST' && url.pathname === '/api/ai/chat') {
      const body = await parseJsonBody(req);
      return sendJson(res, 200, await handleAiSparringChat(body));
    }

    if (req.method === 'POST' && url.pathname === '/api/ai/analyze') {
      const body = await parseJsonBody(req);
      return sendJson(res, 200, await handleAiMessageAnalysis(body));
    }

    if (req.method === 'POST' && url.pathname === '/api/report/build') {
      const body = await parseJsonBody(req);
      return sendJson(res, 200, handleBuildReport(body));
    }

    return sendJson(res, 404, { error: 'Endpoint tidak ditemukan' });
  } catch (err) {
    return sendJson(res, 400, { error: err.message || 'Permintaan tidak valid' });
  }
});

server.listen(PORT, () => {
  console.log(`[TUNTUN Backend] Stateless Forensic & AI Server listening on http://localhost:${PORT}`);
});
