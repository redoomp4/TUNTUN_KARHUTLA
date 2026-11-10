import React, { useState, useEffect, useRef } from 'react';
import { useGuardian } from '../context/GuardianContext.jsx';
import { SIMULATOR_SCENARIOS } from '../data/simulatorScenarios.js';
import {
  evaluateUserDefenseResponse,
  requestHybridScammerReply
} from '../engines/hybridAiEngine.js';

export default function SimulatorWorkspace({ hidden }) {
  const {
    sessionState,
    recordSimulatorDecision,
    restartSimulatorScenario,
    setSimulatorScenario
  } = useGuardian();

  const activeKey = sessionState.simulator?.activeScenario || 'courier';
  const scenario = SIMULATOR_SCENARIOS[activeKey] || SIMULATOR_SCENARIOS.courier;

  const [stepIndex, setStepIndex] = useState(0);
  const [score, setScore] = useState(100);
  const [riskLabel, setRiskLabel] = useState(scenario.initialRisk);
  const [selectedChoice, setSelectedChoice] = useState(null);

  // Unified Chat Log state: combines scenario step messages + manual AI exchanges
  const [customExchanges, setCustomExchanges] = useState([]);
  const [manualInput, setManualInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [manualTurn, setManualTurn] = useState(0);
  const [manualEval, setManualEval] = useState(null);
  const [aiSourceLabel, setAiSourceLabel] = useState('AI Gratis Siap');

  const chatScrollRef = useRef(null);
  const currentStep = scenario.steps[stepIndex] || scenario.steps[0];

  useEffect(() => {
    setStepIndex(0);
    setScore(100);
    setRiskLabel(scenario.initialRisk);
    setSelectedChoice(null);
    setCustomExchanges([]);
    setManualInput('');
    setManualTurn(0);
    setManualEval(null);
  }, [activeKey, scenario.initialRisk]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [stepIndex, selectedChoice, customExchanges, aiLoading]);

  const handleRestart = () => {
    restartSimulatorScenario(activeKey);
    setStepIndex(0);
    setScore(100);
    setRiskLabel(scenario.initialRisk);
    setSelectedChoice(null);
    setCustomExchanges([]);
    setManualInput('');
    setManualTurn(0);
    setManualEval(null);
  };

  const handleSelectChoice = (choice) => {
    const nextScore = Math.max(0, Math.min(100, score + choice.scoreDelta));
    setScore(nextScore);
    setRiskLabel(choice.riskLevel);
    setSelectedChoice(choice);
    setManualEval(null);

    const isRisky =
      choice.consequence === 'DANGEROUS' ||
      choice.consequence === 'GAME_OVER' ||
      choice.consequence === 'ELEVATED';

    const completedKey = choice.nextStep === null ? activeKey : null;
    recordSimulatorDecision(isRisky, completedKey, nextScore, activeKey);
  };

  const handleNextStep = () => {
    if (!selectedChoice || selectedChoice.nextStep === null) {
      handleRestart();
      return;
    }
    const targetIdx = scenario.steps.findIndex((s) => s.stepNum === selectedChoice.nextStep);
    if (targetIdx !== -1) {
      setStepIndex(targetIdx);
      setSelectedChoice(null);
      setCustomExchanges([]);
      setManualEval(null);
    } else {
      handleRestart();
    }
  };

  const handleSendManualChat = async (presetReply) => {
    const textToSend = (typeof presetReply === 'string' ? presetReply : manualInput).trim();
    if (!textToSend || aiLoading) return;

    const evalRes = evaluateUserDefenseResponse(textToSend);
    const nextScore = Math.max(0, Math.min(100, score + evalRes.scoreDelta));
    setScore(nextScore);
    setRiskLabel(evalRes.badgeText);
    setManualEval(evalRes);

    const isRisky = evalRes.verdict === 'DANGEROUS';
    recordSimulatorDecision(isRisky, null, nextScore, activeKey);

    const nextExchanges = [
      ...customExchanges,
      { sender: 'user', text: textToSend, meta: 'Dikirim (Chat Manual)' }
    ];
    setCustomExchanges(nextExchanges);
    setManualInput('');
    setAiLoading(true);

    const fullHistory = [
      ...currentStep.botMessages.map((m) => ({ sender: 'scammer', text: m })),
      ...nextExchanges
    ];

    const aiReply = await requestHybridScammerReply(activeKey, manualTurn, textToSend, {
      history: fullHistory
    });

    setCustomExchanges((prev) => [
      ...prev,
      {
        sender: 'scammer',
        text: aiReply.replyText,
        meta: aiReply.source === 'AI_HYBRID' ? 'Balasan AI Gratis' : 'Balasan Simulasi Pintar'
      }
    ]);
    setAiSourceLabel(aiReply.source === 'AI_HYBRID' ? 'AI Cloud Gratis Aktif' : 'AI Kontekstual Aktif');
    setManualTurn((prev) => prev + 1);
    setAiLoading(false);
  };

  const getRiskBadgeClass = (label) => {
    const l = (label || '').toLowerCase();
    if (l.includes('bahaya') || l.includes('kritis') || l.includes('kompromi') || l.includes('kerugian') || l.includes('tinggi')) {
      return 'risk-badge risk-high';
    }
    if (l.includes('aman') || l.includes('terselamatkan') || l.includes('tepat')) {
      return 'risk-badge risk-safe';
    }
    return 'risk-badge risk-normal';
  };

  return (
    <section
      id="simulator"
      className="section-field app-view-panel"
      data-view-name="simulator"
      aria-labelledby="sim-heading"
      hidden={hidden}
    >
      <div className="site-container">
        {/* Standard Left-Aligned Header Matching Previous Pages */}
        <div className="section-intro-row sim-single-header">
          <div className="section-intro-copy sim-single-title-block">
            <h2 id="sim-heading" className="section-title on-field">
              Latihan Menghadapi <span className="kw-on-dark">Chat Penipu</span>
            </h2>
            <p className="section-description on-field-secondary">
              Uji cara Anda menolak <strong className="kw-on-dark">file .APK berbahaya</strong>, jebakan{' '}
              <strong className="kw-on-dark">kode OTP</strong>, dan tawaran{' '}
              <strong className="kw-on-dark">deposit komisi palsu</strong>. Anda bebas memilih tombol{' '}
              <strong>Pilihan Cepat</strong> atau <strong>mengetik balasan manual</strong> ke AI.
            </p>
          </div>

          <div className="scenario-nav" role="tablist" aria-label="Skenario Simulasi">
            {Object.values(SIMULATOR_SCENARIOS).map((scen) => {
              const isActive = scen.id === activeKey;
              const isCompleted = sessionState.simulator?.completedScenarios?.[scen.id] !== undefined;
              return (
                <button
                  key={scen.id}
                  role="tab"
                  aria-selected={isActive}
                  id={`tab-scen-${scen.id}`}
                  aria-controls="sim-workbench"
                  className={`tab-btn ${isActive ? 'active' : ''}`}
                  data-scenario={scen.id}
                  type="button"
                  onClick={() => setSimulatorScenario(scen.id)}
                >
                  {scen.tabLabel}{isCompleted ? ' ✓' : ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Unified Single-Column Chat Workbench */}
        <div id="sim-workbench" className="sim-single-col-wrap" role="region" aria-live="polite">
          <div className="sim-chat-area sim-unified-card">
            {/* Top Scenario Context & Status Bar inside the Single Chat Window */}
            <div className="sim-unified-top-meta">
              <div className="sim-unified-scen-info">
                <strong id="sim-scenario-title" className="sim-unified-scen-title">{scenario.title}</strong>
                <p id="sim-scenario-desc" className="sim-unified-scen-desc">{scenario.desc}</p>
              </div>
              <div className="sim-unified-metrics">
                <span id="sim-risk-badge" className={getRiskBadgeClass(riskLabel)}>
                  {riskLabel}
                </span>
                <span id="sim-step-indicator" className="sim-meta-pill">
                  Tahap {stepIndex + 1}/{scenario.steps.length}
                </span>
                <span id="sim-score-indicator" className="sim-meta-pill score-num">
                  Skor {score}/100
                </span>
              </div>
            </div>

            {/* Active Contact Bar */}
            <div className="sim-chat-header">
              <div className="chat-contact">
                <div className="contact-avatar" id="sim-contact-avatar" aria-hidden="true">
                  {scenario.contactAvatar}
                </div>
                <div>
                  <strong className="contact-name" id="sim-contact-name">{scenario.contactName}</strong>
                  <span className="contact-status" id="sim-contact-status">
                    {scenario.contactStatus} • {aiSourceLabel}
                  </span>
                </div>
              </div>
              <button
                id="sim-restart-btn"
                className="btn btn-secondary-dark btn-sm"
                type="button"
                onClick={handleRestart}
              >
                Ulangi Chat
              </button>
            </div>

            {/* Unified Conversation Log */}
            <div
              ref={chatScrollRef}
              className="sim-chat-messages"
              id="sim-messages"
              role="log"
              aria-label="Percakapan Simulasi"
            >
              {currentStep.botMessages.map((msg, idx) => (
                <div key={`bot-${idx}`} className="chat-bubble bubble-incoming">
                  <span className="bubble-text">{msg}</span>
                  <span className="bubble-meta">Pesan Masuk</span>
                </div>
              ))}

              {selectedChoice && (
                <div className="chat-bubble bubble-outgoing">
                  <span className="bubble-text">{selectedChoice.text}</span>
                  <span className="bubble-meta">Pilihan Anda</span>
                </div>
              )}

              {customExchanges.map((item, idx) => (
                <div
                  key={`custom-${idx}`}
                  className={`chat-bubble ${item.sender === 'user' ? 'bubble-outgoing' : 'bubble-incoming'}`}
                >
                  <span className="bubble-text">{item.text}</span>
                  <span className="bubble-meta">{item.meta}</span>
                </div>
              ))}

              {aiLoading && (
                <div className="chat-bubble bubble-incoming">
                  <span className="bubble-text">Lawan bicara sedang mengetik balasan...</span>
                </div>
              )}
            </div>

            {/* Evaluation Banner for Multiple-Choice Selection */}
            <div className="sim-feedback-box" id="sim-feedback-panel" hidden={!selectedChoice}>
              <div className="feedback-badge" id="sim-feedback-type">
                {selectedChoice ? `Status Keputusan: ${selectedChoice.riskLevel}` : 'Evaluasi'}
              </div>
              <h4 className="feedback-headline" id="sim-feedback-title">
                {selectedChoice ? selectedChoice.feedbackTitle : 'Penjelasan'}
              </h4>
              <p className="feedback-text" id="sim-feedback-explanation">
                {selectedChoice ? selectedChoice.feedbackText : ''}
              </p>
              <div className="feedback-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  id="sim-next-btn"
                  className="btn btn-primary btn-sm"
                  type="button"
                  onClick={handleNextStep}
                >
                  {selectedChoice && selectedChoice.nextStep === null
                    ? 'Mulai Ulang Skenario'
                    : 'Lanjut Tahap Berikutnya'}
                </button>
                {selectedChoice && selectedChoice.nextStep === null && (
                  <button
                    className="btn btn-secondary-dark btn-sm"
                    type="button"
                    onClick={() => {
                      const order = ['courier', 'bank', 'job'];
                      const nextIdx = (order.indexOf(activeKey) + 1) % order.length;
                      setSimulatorScenario(order[nextIdx]);
                    }}
                  >
                    Coba Skenario Lain
                  </button>
                )}
              </div>
            </div>

            {/* Evaluation Banner for Manual Free-Text Reply */}
            {manualEval && !selectedChoice && (
              <div className="sim-feedback-box sparring-eval-card" style={{ margin: '0 20px 16px' }}>
                <div className="feedback-badge">{manualEval.badgeText}</div>
                <h4 className="feedback-headline">{manualEval.headline}</h4>
                <p className="feedback-text" style={{ marginBottom: 0 }}>{manualEval.explanation}</p>
              </div>
            )}

            {/* Unified Bottom Composer: Option A (Multiple Choice) + Option B (Manual Chat Input) */}
            <div className="sim-actions-area" id="sim-actions-panel">
              {!selectedChoice && (
                <>
                  <span className="actions-prompt" id="sim-actions-title">
                    <strong>Opsi 1:</strong> Klik pilihan tindakan cepat di bawah ini:
                  </span>
                  <div className="sim-choices-grid" id="sim-choices-container">
                    {currentStep.choices.map((choice, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="choice-btn"
                        onClick={() => handleSelectChoice(choice)}
                      >
                        <strong className="kw-on-dark">{String.fromCharCode(65 + idx)}.</strong> {choice.text}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Manual Free-Text AI Chat Composer inside the same window */}
              <div className="sim-manual-composer">
                <div className="sim-manual-composer-head">
                  <span className="actions-prompt" style={{ marginBottom: 0 }}>
                    <strong>Opsi 2:</strong> Atau ketik sendiri balasan Anda ke <strong>AI Penipu</strong>:
                  </span>
                  <div className="sim-quick-manual-pills">
                    <button
                      type="button"
                      className="btn btn-secondary-dark btn-sm"
                      onClick={() =>
                        handleSendManualChat(
                          'Saya tidak mau buka file .APK atau kasih OTP. Saya cek langsung ke aplikasi resmi.'
                        )
                      }
                    >
                      Tolak .APK &amp; OTP
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary-dark btn-sm"
                      onClick={() =>
                        handleSendManualChat(
                          'Ayo video call sekarang untuk bukti, saya tidak mau transfer ke rekening pribadi.'
                        )
                      }
                    >
                      Tantang Video Call
                    </button>
                  </div>
                </div>

                <form
                  className="sparring-input-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendManualChat();
                  }}
                >
                  <input
                    type="text"
                    className="sparring-text-input"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Ketik balasan manual Anda di sini lalu tekan Kirim..."
                    aria-label="Ketik balasan manual ke simulator"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={aiLoading || !manualInput.trim()}
                  >
                    Kirim Chat
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
