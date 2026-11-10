import React, { useState } from 'react';
import { useGuardian } from '../context/GuardianContext.jsx';
import { DETECTIVE_CASES } from '../data/detectiveCases.js';
import GuardianLanyard from './GuardianLanyard.jsx';

export default function GuardianProfileWorkspace({ hidden }) {
  const { sessionState, preparedness, resetFullSession } = useGuardian();
  const [copyFeedback, setCopyFeedback] = useState(false);

  const activeCaseKey = sessionState.detective?.activeCase || 'prize';
  const currentCase = DETECTIVE_CASES[activeCaseKey] || DETECTIVE_CASES.prize;
  const caseResultsMap = sessionState.detective?.caseResults || {};
  const completedCaseEntries = Object.values(caseResultsMap);
  const simDoneCount = Object.keys(sessionState.simulator?.completedScenarios || {}).length;
  const detDoneCount = completedCaseEntries.length;

  const targetCount = [
    currentCase.senderClue,
    ...currentCase.bodyBlocks.filter((b) => b.type === 'clue')
  ].filter((c) => c.isRisk).length;

  const totalHits = completedCaseEntries.reduce((acc, r) => acc + (r.hits || 0), 0);
  const totalTargets = completedCaseEntries.reduce((acc, r) => acc + (r.totalTargets || 0), 0);
  const totalFalsePositives = completedCaseEntries.reduce((acc, r) => acc + (r.falsePositives || 0), 0);

  let statusTitle = 'Belum Dianalisis';
  let statusDesc = 'Selesaikan minimal satu simulasi atau kasus detektif untuk melihat skor kesiapan Anda.';

  if (preparedness.hasData) {
    if (preparedness.tier === 'RESILIENT') {
      statusTitle = 'Siaga Tangguh (Sangat Baik)';
      statusDesc = 'Anda konsisten mengenali ciri penipuan dan mengambil keputusan aman.';
    } else if (preparedness.tier === 'MODERATE') {
      statusTitle = 'Cukup Waspada';
      statusDesc = 'Sebagian besar ancaman dikenali, tingkatkan lagi ketelitian pada tautan samaran.';
    } else {
      statusTitle = 'Perlu Latihan Tambahan';
      statusDesc = 'Masih ada keputusan berisiko. Pelajari kembali langkah penyelamatan di menu Panduan.';
    }
  }

  const buildAuditSummaryText = () => {
    const scoreText = preparedness.hasData ? preparedness.avgScore : '--';
    return [
      `=== RINGKASAN EVALUASI TUNTUN (${sessionState.sessionId}) ===`,
      `Skor Kesiapsiagaan : ${scoreText} / 100 (${statusTitle})`,
      `Simulasi Selesai   : ${simDoneCount} / 3 (Aman: ${sessionState.simulator?.safeDecisions || 0} | Berisiko: ${sessionState.simulator?.riskyDecisions || 0})`,
      `Detektif Selesai   : ${detDoneCount} / 3 (Tepat: ${totalHits} | Pengecoh: ${totalFalsePositives})`,
      `Pesan Dipindai     : ${(sessionState.scanHistory || []).length}`,
      `Kekuatan Utama     : ${preparedness.strengthLabel}`,
      `Fokus Latihan      : ${preparedness.weaknessLabel}`
    ].join('\n');
  };

  const handleCopySummary = () => {
    const text = buildAuditSummaryText();
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  const handleDownloadAuditReport = () => {
    const text = buildAuditSummaryText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Evaluasi-TUNTUN-${sessionState.sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="profile-view"
      className="section-field closing-field app-view-panel"
      data-view-name="profile"
      aria-labelledby="profile-view-heading"
      hidden={hidden}
    >
      <div className="site-container">
        <div className="profile-closing-grid" id="guardian-profile-card">
          {/* Left Column: Concise Session Evaluation & Breakdown */}
          <div className="profile-summary-col">
            <h2 id="profile-view-heading" className="section-title on-field">
              Evaluasi Sesi &amp; <span className="kw-on-dark">Kartu Darurat Keluarga</span>
            </h2>
            <p className="section-description on-field-secondary">
              Pantau skor latihan Anda dan sesuaikan <strong>Kartu Lanyard S.O.S.</strong> di samping untuk pegangan <strong>Remaja</strong>, <strong>Orang Tua</strong>, hingga <strong>Lansia</strong>.
            </p>

            <div className="profile-score-block">
              <div className="profile-score-figure">
                <span className="score-value" id="profile-score-num">
                  {preparedness.hasData ? preparedness.avgScore : '--'}
                </span>
                <span className="score-total">/ 100</span>
              </div>
              <div className="profile-score-copy">
                <strong className="score-status-title" id="profile-status-title">{statusTitle}</strong>
                <p className="score-status-desc" id="profile-status-desc">{statusDesc}</p>
                <span className="profile-session-meta" id="profile-session-badge">
                  ID Sesi: {sessionState.sessionId}
                </span>
              </div>
            </div>

            <div className="dark-ruled-list">
              <div className="dark-ruled-row">
                <span className="breakdown-label">Keputusan aman di Simulator</span>
                <strong className="breakdown-val" id="profile-sim-safe">
                  {sessionState.simulator?.safeDecisions || 0} tepat
                </strong>
              </div>
              <div className="dark-ruled-row">
                <span className="breakdown-label">Keputusan berisiko di Simulator</span>
                <strong className="breakdown-val" id="profile-sim-risks">
                  {sessionState.simulator?.riskyDecisions || 0} risiko
                </strong>
              </div>
              <div className="dark-ruled-row">
                <span className="breakdown-label">Bukti penipuan tepat dikenali</span>
                <strong className="breakdown-val" id="profile-hits">
                  {detDoneCount > 0 ? `${totalHits}/${totalTargets} (${detDoneCount}/3 kasus)` : `0/${targetCount}`}
                </strong>
              </div>
              <div className="dark-ruled-row">
                <span className="breakdown-label">Pengecoh aman yang tertuduh</span>
                <strong className="breakdown-val" id="profile-false-positives">
                  {detDoneCount > 0 ? `${totalFalsePositives} pengecoh` : '0'}
                </strong>
              </div>
              <div className="dark-ruled-row">
                <span className="breakdown-label">Kemampuan terkuat</span>
                <strong className="breakdown-val" id="profile-strength">
                  {preparedness.strengthLabel}
                </strong>
              </div>
              <div className="dark-ruled-row">
                <span className="breakdown-label">Saran latihan</span>
                <strong className="breakdown-val" id="profile-weakness">
                  {preparedness.weaknessLabel}
                </strong>
              </div>
            </div>

            <div className="profile-actions-row" style={{ marginTop: '20px' }}>
              <button
                id="profile-copy-btn"
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleCopySummary}
              >
                {copyFeedback ? 'Tersalin' : 'Salin Evaluasi'}
              </button>
              <button
                id="profile-download-btn"
                type="button"
                className="btn btn-secondary-dark btn-sm"
                onClick={handleDownloadAuditReport}
              >
                Unduh Laporan (.txt)
              </button>
              <button
                id="profile-full-reset-btn"
                type="button"
                className="btn btn-secondary-dark btn-sm"
                onClick={resetFullSession}
              >
                Reset Sesi
              </button>
            </div>
          </div>

          {/* Right Column: Dedicated 3D Interactive Lanyard Showcase */}
          <div className="profile-metrics-col">
            <GuardianLanyard
              sessionId={sessionState.sessionId}
              score={preparedness.hasData ? preparedness.avgScore : '--'}
              tier={preparedness.tier}
              safeDecisions={sessionState.simulator?.safeDecisions || 0}
              scanCount={(sessionState.scanHistory || []).length}
              detDoneCount={detDoneCount}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
