import React, { useState, useEffect, useRef } from 'react';
import { useGuardian } from '../context/GuardianContext.jsx';
import { SIMULATOR_SCENARIOS } from '../data/simulatorScenarios.js';
import {
  SPARRING_PERSONAS,
  evaluateUserDefenseResponse,
  requestHybridScammerReply
} from '../engines/hybridAiEngine.js';

export default function SimulatorWorkspace({ hidden }) {
  const {
    sessionState,
    recordSimulatorDecision,
    restartSimulatorScenario,
    setSimulatorScenario,
    navigateToView
  } = useGuardian();
  const activeKey = sessionState.simulator?.activeScenario || 'courier';
  const scenario = SIMULATOR_SCENARIOS[activeKey] || SIMULATOR_SCENARIOS.courier;

  const [stepIndex, setStepIndex] = useState(0);
  const [score, setScore] = useState(100);
  const [attemptNum, setAttemptNum] = useState(1);
  const [riskLabel, setRiskLabel] = useState(scenario.initialRisk);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const chatScrollRef = useRef(null);
  const sparringScrollRef = useRef(null);

  // Free Hybrid AI Dynamic Sparring State
  const [personaKey, setPersonaKey] = useState('hackedFriend');
  const activePersona = SPARRING_PERSONAS[personaKey] || SPARRING_PERSONAS.hackedFriend;
  const [sparringMessages, setSparringMessages] = useState([
    { sender: 'scammer', text: SPARRING_PERSONAS.hackedFriend.openingMessage, source: 'INITIAL' }
  ]);
  const [sparringInput, setSparringInput] = useState('');
  const [sparringTurn, setSparringTurn] = useState(0);
  const [sparringScore, setSparringScore] = useState(100);
  const [sparringLoading, setSparringLoading] = useState(false);
  const [lastGuardrailEval, setLastGuardrailEval] = useState(null);
  const [lastEngineSource, setLastEngineSource] = useState('Pollinations OpenAI Gratis (Siap)');

  const handleSelectPersona = (key) => {
    const p = SPARRING_PERSONAS[key] || SPARRING_PERSONAS.hackedFriend;
    setPersonaKey(key);
    setSparringMessages([{ sender: 'scammer', text: p.openingMessage, source: 'INITIAL' }]);
    setSparringInput('');
    setSparringTurn(0);
    setSparringScore(100);
    setLastGuardrailEval(null);
    setLastEngineSource('Pollinations OpenAI Gratis (Siap)');
  };

  const handleSendSparringReply = async (customText) => {
    const textToSend = (typeof customText === 'string' ? customText : sparringInput).trim();
    if (!textToSend || sparringLoading) return;

    // 1. Deterministic Guardrail Evaluation (Sole authority for scoring per prompt.MD)
    const evalResult = evaluateUserDefenseResponse(textToSend);
    setLastGuardrailEval(evalResult);
    setSparringScore(prev => Math.max(0, Math.min(100, prev + evalResult.scoreDelta)));
    recordSimulatorDecision(evalResult.verdict === 'DANGEROUS' || evalResult.verdict === 'RISKY', null, null);

    const updatedHistory = [...sparringMessages, { sender: 'user', text: textToSend }];
    setSparringMessages(updatedHistory);
    setSparringInput('');
    setSparringLoading(true);

    // 2. Free Cloud AI Dynamic Response (https://text.pollinations.ai/openai) + Contextual Fallback
    const aiReply = await requestHybridScammerReply(personaKey, sparringTurn, textToSend, {
      history: updatedHistory
    });
    setSparringMessages(prev => [
      ...prev,
      { sender: 'scammer', text: aiReply.replyText, source: aiReply.source }
    ]);
    setLastEngineSource(
      aiReply.source === 'AI_HYBRID'
        ? 'Cloud AI Gratis Aktif (OpenAI)'
        : 'Mesin Kontekstual Pintar (NFR-09)'
    );
    setSparringTurn(prev => prev + 1);
    setSparringLoading(false);
  };

  useEffect(() => {
    if (sparringScrollRef.current) {
      sparringScrollRef.current.scrollTop = sparringScrollRef.current.scrollHeight;
    }
  }, [sparringMessages, sparringLoading]);

  const currentStep = scenario.steps[stepIndex] || scenario.steps[0];

  useEffect(() => {
    setStepIndex(0);
    setScore(100);
    setRiskLabel(scenario.initialRisk);
    setSelectedChoice(null);
  }, [activeKey, scenario.initialRisk]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [stepIndex, selectedChoice]);

  const handleRestart = () => {
    restartSimulatorScenario(activeKey);
    setStepIndex(0);
    setScore(100);
    setAttemptNum(prev => prev + 1);
    setRiskLabel(scenario.initialRisk);
    setSelectedChoice(null);
  };

  const handleSelectChoice = (choice) => {
    const nextScore = Math.max(0, Math.min(100, score + choice.scoreDelta));
    setScore(nextScore);
    setRiskLabel(choice.riskLevel);
    setSelectedChoice(choice);

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
    const targetIdx = scenario.steps.findIndex(s => s.stepNum === selectedChoice.nextStep);
    if (targetIdx !== -1) {
      setStepIndex(targetIdx);
      setSelectedChoice(null);
    } else {
      handleRestart();
    }
  };

  const getRiskBadgeClass = (label) => {
    const l = (label || '').toLowerCase();
    if (l.includes('bahaya') || l.includes('kritis') || l.includes('kompromi') || l.includes('kerugian')) {
      return 'risk-badge risk-high';
    }
    if (l.includes('aman') || l.includes('terselamatkan')) {
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
        {/* Top Creative Telemetry Strip */}
        <div className="creative-strip-bar dark-strip">
          <div className="strip-item">
            <span className="strip-dot dot-green" />
            <span>Mode: <strong>Simulasi Interaktif &amp; Chatbot AI Gratis</strong></span>
          </div>
          <div className="strip-item">
            <span>Skor Skenario: <strong>{score}/100</strong></span>
          </div>
          <div className="strip-item">
            <span>Skor Chatbot AI: <strong>{sparringScore}/100</strong></span>
          </div>
          <button
            type="button"
            className="strip-lanyard-pill"
            onClick={() => navigateToView('profile')}
          >
            Lihat Lanyard ID Sesi
          </button>
        </div>

        <div className="section-intro-row">
          <div className="section-intro-copy">
            <h2 id="sim-heading" className="section-title on-field">Simulasi Keputusan</h2>
            <p className="section-description on-field-secondary">
              Pilih skenario dan uji keputusan Anda menghadapi modus penipuan populer.
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

        <div id="sim-workbench" className="sim-container" role="region" aria-live="polite">
          {/* Left Sidebar: Compact Info Widgets */}
          <div className="sim-sidebar">
            <div className="dark-info-widget">
              <div className="widget-head-row">
                <span className="meta-label">Skenario Aktif</span>
                <span className="widget-mini-tag">Sesi #{attemptNum}</span>
              </div>
              <h3 id="sim-scenario-title" className="meta-value">{scenario.title}</h3>
              <p id="sim-scenario-desc" className="meta-desc">{scenario.desc}</p>
            </div>

            <div className="sim-status-box">
              <div className="status-row">
                <span>Risiko</span>
                <span id="sim-risk-badge" className={getRiskBadgeClass(riskLabel)}>
                  {riskLabel}
                </span>
              </div>
              <div className="status-row">
                <span>Tahap</span>
                <span id="sim-step-indicator">
                  Langkah {stepIndex + 1} / {scenario.steps.length}
                </span>
              </div>
              <div className="status-row">
                <span>Skor</span>
                <span id="sim-score-indicator" className="score-num">
                  {score} / 100
                </span>
              </div>
            </div>

            <div className="sim-sidebar-actions">
              <button
                id="sim-restart-btn"
                className="btn btn-secondary-dark btn-block"
                type="button"
                onClick={handleRestart}
              >
                Ulangi skenario
              </button>
            </div>
          </div>

          {/* Right Area: Conversation Thread & Decision Controls */}
          <div className="sim-chat-area">
            <div className="sim-chat-header">
              <div className="chat-contact">
                <div className="contact-avatar" id="sim-contact-avatar" aria-hidden="true">
                  {scenario.contactAvatar}
                </div>
                <div>
                  <strong className="contact-name" id="sim-contact-name">{scenario.contactName}</strong>
                  <span className="contact-status" id="sim-contact-status">{scenario.contactStatus}</span>
                </div>
              </div>
              <span className="secure-tag">Simulasi Fiktif</span>
            </div>

            <div
              ref={chatScrollRef}
              className="sim-chat-messages"
              id="sim-messages"
              role="log"
              aria-label="Percakapan Simulasi"
            >
              {currentStep.botMessages.map((msg, idx) => (
                <div key={idx} className="chat-bubble bubble-incoming">
                  <span className="bubble-text">{msg}</span>
                  <span className="bubble-meta">Diterima</span>
                </div>
              ))}

              {selectedChoice && (
                <div className="chat-bubble bubble-outgoing">
                  <span className="bubble-text">{selectedChoice.text}</span>
                  <span className="bubble-meta">Dikirim</span>
                </div>
              )}
            </div>

            <div className="sim-actions-area" id="sim-actions-panel" hidden={Boolean(selectedChoice)}>
              <span className="actions-prompt" id="sim-actions-title">Pilih tindakan Anda:</span>
              <div className="sim-choices-grid" id="sim-choices-container">
                {currentStep.choices.map((choice, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="choice-btn"
                    onClick={() => handleSelectChoice(choice)}
                  >
                    <strong>{String.fromCharCode(65 + idx)}.</strong> {choice.text}
                  </button>
                ))}
              </div>
            </div>

            <div className="sim-feedback-box" id="sim-feedback-panel" hidden={!selectedChoice}>
              <div className="feedback-badge" id="sim-feedback-type">
                {selectedChoice ? `Evaluasi: ${selectedChoice.riskLevel}` : 'Evaluasi keputusan'}
              </div>
              <h4 className="feedback-headline" id="sim-feedback-title">
                {selectedChoice ? selectedChoice.feedbackTitle : 'Penjelasan'}
              </h4>
              <p className="feedback-text" id="sim-feedback-explanation">
                {selectedChoice ? selectedChoice.feedbackText : ''}
              </p>
              <div className="feedback-actions">
                <button
                  id="sim-next-btn"
                  className="btn btn-primary"
                  type="button"
                  onClick={handleNextStep}
                >
                  {selectedChoice && selectedChoice.nextStep === null
                    ? 'Ulangi skenario'
                    : 'Lanjutkan'}
                </button>
                {selectedChoice && selectedChoice.nextStep === null && (
                  <button
                    className="btn btn-secondary-dark"
                    type="button"
                    onClick={() => {
                      const order = ['courier', 'bank', 'job'];
                      const nextIdx = (order.indexOf(activeKey) + 1) % order.length;
                      setSimulatorScenario(order[nextIdx]);
                    }}
                  >
                    Skenario berikutnya
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Free AI Chatbot Sparring Lab (No Checkboxes — Pure Information Widgets) */}
        <div className="sparring-lab-wrap">
          <div className="section-intro-row sparring-header-row">
            <div className="section-intro-copy">
              <h3 className="section-title on-field sparring-title">
                Chatbot Latihan Pertahanan (AI Gratis)
              </h3>
              <p className="section-description on-field-secondary">
                Ketik balasan Anda secara bebas untuk menguji ketahanan menghadapi penipu AI.
              </p>
            </div>

            <div className="scenario-nav" role="tablist" aria-label="Pilih Lawan Chatbot AI">
              {Object.values(SPARRING_PERSONAS).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="tab"
                  aria-selected={personaKey === p.id}
                  className={`tab-btn ${personaKey === p.id ? 'active' : ''}`}
                  onClick={() => handleSelectPersona(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sim-container">
            {/* Left Sidebar: Pure Information Widgets (Zero Checkboxes) */}
            <div className="sim-sidebar">
              <div className="dark-info-widget">
                <div className="widget-head-row">
                  <span className="meta-label">Target Latihan</span>
                  <span className="widget-mini-tag">{activePersona.shortTag}</span>
                </div>
                <h4 className="meta-value">{activePersona.contactName}</h4>
                <p className="meta-desc">
                  Tolak permintaan transfer darurat, file .APK, atau kode OTP dengan kalimat Anda sendiri.
                </p>
              </div>

              {/* Information Widget: AI Engine & Guardrail Telemetry */}
              <div className="dark-info-widget">
                <div className="widget-head-row">
                  <span className="meta-label">Info Mesin Chatbot</span>
                  <span className="strip-dot dot-green" />
                </div>
                <div className="sim-status-box" style={{ border: 'none', padding: 0 }}>
                  <div className="status-row">
                    <span>API AI Gratis</span>
                    <span className="risk-badge risk-safe">{lastEngineSource}</span>
                  </div>
                  <div className="status-row">
                    <span>Skor Pertahanan</span>
                    <span className="score-num">{sparringScore} / 100</span>
                  </div>
                  <div className="status-row">
                    <span>Penentu Skor</span>
                    <span className="score-num">Guardrail Deterministik</span>
                  </div>
                </div>
              </div>

              {lastGuardrailEval ? (
                <div className="sim-feedback-box sparring-eval-card">
                  <div className="feedback-badge">{lastGuardrailEval.badgeText}</div>
                  <h4 className="feedback-headline">{lastGuardrailEval.headline}</h4>
                  <p className="feedback-text">{lastGuardrailEval.explanation}</p>
                </div>
              ) : (
                <div className="dark-info-widget">
                  <span className="meta-label">Tips Pertahanan Cepat</span>
                  <p className="meta-desc">
                    Minta verifikasi <strong>video call</strong>, alihkan ke <strong>Call Center resmi</strong>, dan tolak mentah-mentah file <strong>.APK</strong> maupun <strong>OTP</strong>.
                  </p>
                </div>
              )}
            </div>

            <div className="sim-chat-area">
              <div className="sim-chat-header">
                <div className="chat-contact">
                  <div className="contact-avatar" aria-hidden="true">{activePersona.contactAvatar}</div>
                  <div>
                    <strong className="contact-name">{activePersona.contactName}</strong>
                    <span className="contact-status">Chatbot AI Gratis • Aktif</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary-dark btn-sm"
                  onClick={() => handleSelectPersona(personaKey)}
                >
                  Reset Chat
                </button>
              </div>

              <div ref={sparringScrollRef} className="sim-chat-messages" role="log" aria-label="Dialog Sparring AI">
                {sparringMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`chat-bubble ${m.sender === 'user' ? 'bubble-outgoing' : 'bubble-incoming'}`}
                  >
                    <span className="bubble-text">{m.text}</span>
                    <span className="bubble-meta">
                      {m.sender === 'user'
                        ? 'Anda'
                        : m.source === 'AI_HYBRID'
                          ? 'AI Gratis (OpenAI)'
                          : 'Chatbot Simulasi'}
                    </span>
                  </div>
                ))}
                {sparringLoading && (
                  <div className="chat-bubble bubble-incoming">
                    <span className="bubble-text">AI sedang mengetik balasan...</span>
                  </div>
                )}
              </div>

              <div className="sim-actions-area">
                <div className="preset-buttons sparring-quick-Chips">
                  <button
                    type="button"
                    className="btn btn-secondary-dark btn-sm"
                    onClick={() =>
                      handleSendSparringReply(
                        'Ayo video call 10 detik sekarang untuk bukti, saya tidak transfer ke rekening beda nama.'
                      )
                    }
                  >
                    Tantang Video Call
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary-dark btn-sm"
                    onClick={() =>
                      handleSendSparringReply(
                        'Saya tidak mau buka file .APK atau kasih kode OTP. Saya cek langsung ke Call Center resmi.'
                      )
                    }
                  >
                    Tolak APK/OTP &amp; Cek Resmi
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary-dark btn-sm"
                    onClick={() =>
                      handleSendSparringReply(
                        'Ini kode OTP saya 482910, tolong segera dibatalkan transaksinya.'
                      )
                    }
                  >
                    Simulasi Bocor OTP
                  </button>
                </div>

                <form
                  className="sparring-input-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendSparringReply();
                  }}
                >
                  <input
                    type="text"
                    className="sparring-text-input"
                    value={sparringInput}
                    onChange={(e) => setSparringInput(e.target.value)}
                    placeholder="Ketik balasan Anda (misal: Ayo video call dulu / Rekening siapa itu?)..."
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={sparringLoading || !sparringInput.trim()}
                  >
                    Kirim
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
