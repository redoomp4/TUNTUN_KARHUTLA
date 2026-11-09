import React, { useState, useEffect } from 'react';
import { useGuardian } from '../context/GuardianContext.jsx';
import { DETECTIVE_CASES } from '../data/detectiveCases.js';
import { evaluateDetectiveSubmission } from '../engines/scoringEngine.js';

export default function DetectiveWorkspace({ hidden }) {
  const { sessionState, saveDetectiveCaseResult, resetDetectiveCaseResult } = useGuardian();
  const [activeCaseKey, setActiveCaseKey] = useState(sessionState.detective?.activeCase || 'prize');
  const [selectedIds, setSelectedIds] = useState([]);
  const [validationError, setValidationError] = useState(false);

  const currentCase = DETECTIVE_CASES[activeCaseKey] || DETECTIVE_CASES.prize;
  const savedResult = sessionState.detective?.caseResults?.[activeCaseKey] || null;

  const allClues = [
    currentCase.senderClue,
    ...currentCase.bodyBlocks.filter(b => b.type === 'clue')
  ];
  const targetRiskCount = allClues.filter(c => c.isRisk).length;

  useEffect(() => {
    const prev = sessionState.detective?.caseResults?.[activeCaseKey];
    setSelectedIds(prev ? prev.selectedIds : []);
    setValidationError(false);
  }, [activeCaseKey, sessionState.detective?.caseResults]);

  const toggleClue = (clueId) => {
    setValidationError(false);
    setSelectedIds(prev =>
      prev.includes(clueId) ? prev.filter(id => id !== clueId) : [...prev, clueId]
    );
  };

  const handleSubmit = () => {
    const result = evaluateDetectiveSubmission(allClues, selectedIds);
    if (!result.valid) {
      setValidationError(true);
      return;
    }
    setValidationError(false);
    saveDetectiveCaseResult(activeCaseKey, {
      ...result,
      selectedIds
    });
  };

  const handleReset = () => {
    setSelectedIds([]);
    setValidationError(false);
    resetDetectiveCaseResult(activeCaseKey);
  };

  return (
    <section
      id="detective"
      className="section-muted app-view-panel"
      data-view-name="detective"
      aria-labelledby="detective-heading"
      hidden={hidden}
    >
      <div className="site-container">
        <div className="section-intro-row">
          <div className="section-intro-copy">
            <h2 id="detective-heading" className="section-title">Scam Detective</h2>
            <p className="section-description">
              Periksa barang bukti pesan di bawah ini dan klik bagian yang menurut Anda merupakan indikator penipuan. Hati-hati, terdapat elemen normal sebagai pengecoh.
            </p>
          </div>

          <div className="case-selector-bar" role="tablist" aria-label="Pilih Kasus">
            {Object.values(DETECTIVE_CASES).map((c) => {
              const isActive = c.id === activeCaseKey;
              const isDone = sessionState.detective?.caseResults?.[c.id] !== undefined;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`case-tab-btn ${isActive ? 'active' : ''}`}
                  data-case={c.id}
                  onClick={() => setActiveCaseKey(c.id)}
                >
                  {c.tabLabel}{isDone ? ' (Selesai)' : ''}
                </button>
              );
            })}
          </div>
        </div>

        <div className="detective-layout">
          {/* Left Card: Evidence Inspection */}
          <div className="evidence-card" id="evidence-view">
            <div className="evidence-top-bar">
              <div>
                <span className="evidence-case-tag" id="detective-case-tag">{currentCase.tag}</span>
                <h3 className="evidence-title" id="detective-case-title">{currentCase.title}</h3>
              </div>
              <span className="instruction-hint">Klik bagian pesan yang mencurigakan</span>
            </div>

            <div className="suspect-message-box">
              <div className="message-meta-header">
                <div className="sender-info">
                  <span className="sender-icon" id="detective-sender-icon" aria-hidden="true">
                    {currentCase.icon}
                  </span>
                  <div id="detective-sender-slot">
                    <button
                      type="button"
                      className="evidence-clue-btn"
                      data-clue={currentCase.senderClue.id}
                      aria-pressed={selectedIds.includes(currentCase.senderClue.id)}
                      onClick={() => toggleClue(currentCase.senderClue.id)}
                    >
                      {currentCase.senderClue.label}
                    </button>
                  </div>
                </div>
                <span className="msg-timestamp" id="detective-timestamp">{currentCase.timestamp}</span>
              </div>

              <div className="message-body-content" id="detective-body-slot">
                {currentCase.bodyBlocks.map((block, idx) => (
                  <p key={idx}>
                    {block.type === 'text' ? (
                      block.content
                    ) : (
                      <button
                        type="button"
                        className="evidence-clue-btn"
                        data-clue={block.id}
                        aria-pressed={selectedIds.includes(block.id)}
                        onClick={() => toggleClue(block.id)}
                      >
                        {block.label}
                      </button>
                    )}
                  </p>
                ))}
              </div>
            </div>

            <div
              id="detective-validation-msg"
              className="validation-banner"
              hidden={!validationError}
              role="alert"
            >
              Pilih minimal satu bagian pada pesan di atas sebelum memeriksa jawaban.
            </div>

            <div className="evidence-footer">
              <div className="selected-counter">
                Indikator ditandai: <strong id="selected-clues-count">{selectedIds.length}</strong> dipilih
              </div>
              <div className="evidence-actions">
                <button
                  id="reset-detective-btn"
                  className="btn btn-secondary"
                  type="button"
                  onClick={handleReset}
                >
                  Atur ulang
                </button>
                <button
                  id="submit-report-btn"
                  className="btn btn-primary"
                  type="button"
                  onClick={handleSubmit}
                >
                  Periksa temuan
                </button>
              </div>
            </div>
          </div>

          {/* Right Card: Forensic Result Panel */}
          <div className="detective-result-card">
            <h3 className="panel-heading">Hasil evaluasi bukti</h3>
            <p className="panel-subtext">
              Rincian ketepatan analisis Anda pada kasus yang sedang dibuka.
            </p>

            <div className="ruled-metrics-list">
              <div className="ruled-metric-row">
                <span>Indikator berbahaya tepat dikenali</span>
                <strong id="detective-tp-count">
                  {savedResult ? `${savedResult.hits} / ${savedResult.totalTargets}` : `0 / ${targetRiskCount}`}
                </strong>
              </div>
              <div className="ruled-metric-row">
                <span>Elemen normal yang salah dituduh</span>
                <strong id="detective-fp-count">
                  {savedResult ? `${savedResult.falsePositives} pengecoh` : '0'}
                </strong>
              </div>
              <div className="ruled-metric-row">
                <span>Skor akurasi kasus ini</span>
                <strong id="detective-case-score">
                  {savedResult ? `${savedResult.score} / 100` : '-- / 100'}
                </strong>
              </div>
            </div>

            <div
              id="detective-feedback-list"
              className="detective-feedback-list"
              hidden={!savedResult}
            >
              {savedResult && allClues.map((clue) => {
                const isPicked = savedResult.selectedIds.includes(clue.id);
                if (!clue.isRisk && !isPicked) return null;

                if (clue.isRisk && isPicked) {
                  return (
                    <div key={clue.id} className="clue-result-item clue-result-hit">
                      <strong>Tepat dikenali: {clue.title}</strong>
                      <p>{clue.desc}</p>
                    </div>
                  );
                }
                if (clue.isRisk && !isPicked) {
                  return (
                    <div key={clue.id} className="clue-result-item clue-result-missed">
                      <strong>Indikator terlewat: {clue.title}</strong>
                      <p>{clue.desc}</p>
                    </div>
                  );
                }
                return (
                  <div key={clue.id} className="clue-result-item clue-result-fp">
                    <strong>Elemen normal (pengecoh): {clue.title}</strong>
                    <p>{clue.desc}</p>
                  </div>
                );
              })}

              {savedResult && (
                <div className="scanner-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const order = ['prize', 'hrd', 'customs'];
                      const nextIdx = (order.indexOf(activeCaseKey) + 1) % order.length;
                      setActiveCaseKey(order[nextIdx]);
                    }}
                  >
                    Lanjut ke kasus berikutnya
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
