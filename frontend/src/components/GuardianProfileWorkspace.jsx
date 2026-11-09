import React, { useState } from 'react';
import { useGuardian } from '../context/GuardianContext.jsx';
import { DETECTIVE_CASES } from '../data/detectiveCases.js';

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
    ...currentCase.bodyBlocks.filter(b => b.type === 'clue')
  ].filter(c => c.isRisk).length;

  const totalHits = completedCaseEntries.reduce((acc, r) => acc + (r.hits || 0), 0);
  const totalTargets = completedCaseEntries.reduce((acc, r) => acc + (r.totalTargets || 0), 0);
  const totalFalsePositives = completedCaseEntries.reduce((acc, r) => acc + (r.falsePositives || 0), 0);

  let statusTitle = 'Belum dianalisis';
  let statusDesc = 'Selesaikan minimal satu skenario simulasi atau periksa satu kasus bukti untuk melihat evaluasi sesi Anda.';

  if (preparedness.hasData) {
    if (preparedness.tier === 'RESILIENT') {
      statusTitle = 'Digital Guardian Tangguh (Sangat Baik)';
      statusDesc = `Sesi ${sessionState.sessionId}: Anda mampu membedakan bukti berbahaya dan mengambil keputusan aman secara konsisten.`;
    } else if (preparedness.tier === 'MODERATE') {
      statusTitle = 'Tingkat Kewaspadaan Cukup Baik';
      statusDesc = `Sesi ${sessionState.sessionId}: Sebagian besar ancaman dikenali, namun perhatikan kembali indikator yang terlewat di bawah.`;
    } else {
      statusTitle = 'Rentan Terhadap Rekayasa Sosial';
      statusDesc = `Sesi ${sessionState.sessionId}: Banyak indikator kunci terlewat atau keputusan berisiko diambil. Pelajari Action Guide di atas.`;
    }
  }

  const buildAuditSummaryText = () => {
    const scoreText = preparedness.hasData ? preparedness.avgScore : '--';
    return [
      `=== RINGKASAN EVALUASI DIGITAL GUARDIAN (${sessionState.sessionId}) ===`,
      `Skor Kesiapsiagaan Sesi : ${scoreText} / 100 (${statusTitle})`,
      `Skenario Simulator      : ${simDoneCount} / 3 selesai (Aman: ${sessionState.simulator?.safeDecisions || 0} | Berisiko: ${sessionState.simulator?.riskyDecisions || 0})`,
      `Kasus Scam Detective    : ${detDoneCount} / 3 selesai (Tepat: ${totalHits} | Pengecoh: ${totalFalsePositives})`,
      `Pesan & Berkas Dipindai : ${(sessionState.scanHistory || []).length}`,
      `Area Kemampuan Terkuat  : ${preparedness.strengthLabel}`,
      `Rekomendasi Materi      : ${preparedness.weaknessLabel}`,
      `Catatan: Evaluasi ini bersifat edukatif untuk latihan deteksi penipuan digital.`
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
    a.download = `Laporan-Evaluasi-${sessionState.sessionId}.txt`;
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
          {/* Left Column: Session Score & Summary */}
          <div className="profile-summary-col">
            <h2 id="profile-view-heading" className="section-title on-field">Guardian Profile</h2>
            <p className="section-description on-field-secondary">
              Ringkasan kesiapsiagaan berdasarkan keputusan Anda di Scam Simulator dan ketelitian investigasi di Scam Detective pada sesi ini.
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

            <div className="profile-actions-row">
              <button
                id="profile-copy-btn"
                type="button"
                className="btn btn-primary"
                onClick={handleCopySummary}
              >
                {copyFeedback ? 'Ringkasan disalin' : 'Salin ringkasan evaluasi'}
              </button>
              <button
                id="profile-download-btn"
                type="button"
                className="btn btn-secondary-dark"
                onClick={handleDownloadAuditReport}
              >
                Unduh laporan sesi (.txt)
              </button>
              <button
                id="profile-full-reset-btn"
                type="button"
                className="btn btn-secondary-dark"
                onClick={resetFullSession}
              >
                Atur ulang seluruh sesi
              </button>
            </div>
          </div>

          {/* Right Column: Ruled Breakdown List */}
          <div className="profile-metrics-col">
            <div className="dark-ruled-list">
              <div className="dark-ruled-row">
                <span className="breakdown-label">Keputusan aman di Simulator</span>
                <strong className="breakdown-val" id="profile-sim-safe">
                  {sessionState.simulator?.safeDecisions || 0} keputusan
                </strong>
              </div>
              <div className="dark-ruled-row">
                <span className="breakdown-label">Keputusan berisiko di Simulator</span>
                <strong className="breakdown-val" id="profile-sim-risks">
                  {sessionState.simulator?.riskyDecisions || 0} keputusan
                </strong>
              </div>
              <div className="dark-ruled-row">
                <span className="breakdown-label">Indikator Detective tepat dikenali</span>
                <strong className="breakdown-val" id="profile-hits">
                  {detDoneCount > 0 ? `${totalHits} / ${totalTargets} (${detDoneCount}/3 kasus)` : `0 / ${targetCount}`}
                </strong>
              </div>
              <div className="dark-ruled-row">
                <span className="breakdown-label">Elemen normal yang salah dituduh</span>
                <strong className="breakdown-val" id="profile-false-positives">
                  {detDoneCount > 0 ? `${totalFalsePositives} pengecoh` : '0'}
                </strong>
              </div>
              <div className="dark-ruled-row">
                <span className="breakdown-label">Area kemampuan terkuat</span>
                <strong className="breakdown-val" id="profile-strength">
                  {preparedness.strengthLabel}
                </strong>
              </div>
              <div className="dark-ruled-row">
                <span className="breakdown-label">Rekomendasi materi latihan</span>
                <strong className="breakdown-val" id="profile-weakness">
                  {preparedness.weaknessLabel}
                </strong>
              </div>
            </div>
            <p className="profile-disclaimer">
              Catatan: Skor ini merupakan evaluasi pembelajaran sesi saat ini dan bukan jaminan deteksi seluruh bentuk penipuan digital.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
