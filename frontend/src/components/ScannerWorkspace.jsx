import React, { useState, useRef } from 'react';
import { useGuardian } from '../context/GuardianContext.jsx';
import { SCANNER_PRESETS } from '../data/officialDomains.js';
import { evaluateMessageHeuristics } from '../engines/heuristicEngine.js';
import { analyzeFileBinarySignature, SIMULATED_BINARY_SAMPLES } from '../engines/fileSignatureEngine.js';
import { generateSafeVerificationReplies } from '../engines/hybridAiEngine.js';

export default function ScannerWorkspace({ hidden }) {
  const {
    sessionState,
    recordScanToHistory,
    clearScanHistory,
    navigateToView,
    forwardIncidentToToolkit
  } = useGuardian();

  const [inputText, setInputText] = useState('');
  const [validationError, setValidationError] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [fileReport, setFileReport] = useState(null);
  const [copiedReplyIdx, setCopiedReplyIdx] = useState(null);
  const fileInputRef = useRef(null);

  const simDoneCount = Object.keys(sessionState.simulator?.completedScenarios || {}).length;
  const detDoneCount = Object.keys(sessionState.detective?.caseResults || {}).length;
  const scanCount = (sessionState.scanHistory || []).length;

  const runMessageScan = (rawText) => {
    const trimmed = (rawText || '').trim();
    if (!trimmed) {
      setValidationError(true);
      return;
    }
    setValidationError(false);
    setFileReport(null);
    const evaluated = evaluateMessageHeuristics(trimmed);
    setScanResult(evaluated);
    recordScanToHistory(trimmed, evaluated.score);
  };

  const handlePresetClick = (presetKey) => {
    const preset = SCANNER_PRESETS[presetKey];
    if (!preset) return;
    setInputText(preset.text);
    runMessageScan(preset.text);
  };

  const handleClear = () => {
    setInputText('');
    setValidationError(false);
    setScanResult(null);
    setFileReport(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const arrayBuf = ev.target?.result;
      if (!arrayBuf) return;
      const bytes = new Uint8Array(arrayBuf);
      const binRes = analyzeFileBinarySignature(file.name, file.size, bytes);
      setScanResult(null);
      setFileReport(binRes);
      setValidationError(false);
      recordScanToHistory(`[Berkas] ${binRes.fileName} (${binRes.magicHex})`, binRes.score, binRes);
    };
    reader.readAsArrayBuffer(file.slice(0, 4096));
  };

  const handleSimulatedBinarySample = (sampleKey) => {
    const sample = SIMULATED_BINARY_SAMPLES[sampleKey];
    if (!sample) return;
    const binRes = analyzeFileBinarySignature(sample.fileName, sample.fileSize, sample.bytes);
    setScanResult(null);
    setFileReport(binRes);
    setValidationError(false);
    recordScanToHistory(`[Berkas] ${binRes.fileName} (${binRes.magicHex})`, binRes.score, binRes);
  };

  const activeScore = fileReport ? fileReport.score : (scanResult ? scanResult.score : 0);
  const activeBadgeClass = fileReport
    ? (fileReport.isDangerous ? 'verdict-danger' : 'verdict-safe')
    : scanResult
      ? (scanResult.verdictLevel === 'DANGER' ? 'verdict-danger' : scanResult.verdictLevel === 'WARN' ? 'verdict-warn' : 'verdict-safe')
      : 'verdict-neutral';

  const activeBadgeText = fileReport
    ? (fileReport.isDangerous ? 'Berkas berbahaya' : 'Berkas terverifikasi')
    : scanResult
      ? scanResult.verdictBadgeText
      : 'Menunggu input';

  const activeTitle = fileReport
    ? fileReport.verdictTitle
    : scanResult
      ? scanResult.verdictTitle
      : 'Siap memeriksa konten';

  const activeDesc = fileReport
    ? fileReport.verdictDesc
    : scanResult
      ? scanResult.verdictDesc
      : 'Tempelkan isi pesan atau periksa berkas lampiran di samping untuk membedah domain tujuan, header biner .APK tersembunyi, dan pola rekayasa sosial.';

  const redFlagsCount = scanResult
    ? scanResult.findings.filter(f => f.severity !== 'safe').length
    : (fileReport && fileReport.isDangerous ? 1 : 0);

  return (
    <section
      id="scanner"
      className="section-ground hero-opening app-view-panel"
      data-view-name="scanner"
      aria-labelledby="scanner-heading"
      hidden={hidden}
    >
      <div className="site-container">
        <div className="opening-split">
          {/* Left Column (1.45fr): Intro & Input Workbench */}
          <div className="opening-copy-col">
            <h1 id="scanner-heading" className="display-title">
              Kenali manipulasi penipuan digital sebelum mengambil keputusan.
            </h1>
            <p className="lead-paragraph">
              Periksa pesan mencurigakan, bedah header biner berkas .APK tersembunyi, uji keputusan di simulasi interaktif, dan susun laporan darurat resmi.
            </p>

            <div className="scanner-input-group">
              <div className="scanner-presets-bar">
                <span className="preset-label">Contoh pesan uji:</span>
                <div className="preset-buttons">
                  {Object.entries(SCANNER_PRESETS).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      className="btn-chip"
                      data-scan-preset={key}
                      onClick={() => handlePresetClick(key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <label htmlFor="scanner-textarea" className="field-label">
                Periksa teks pesan, tautan URL, atau nama berkas
              </label>
              <textarea
                id="scanner-textarea"
                className="scanner-textarea"
                rows="5"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  if (validationError) setValidationError(false);
                }}
                placeholder="Tempelkan isi pesan WhatsApp atau SMS, alamat tautan (misalnya http://bca-tarif-layanan2026.vip/batal), atau nama berkas lampiran..."
              />

              <div
                id="scanner-validation-msg"
                className="validation-banner"
                hidden={!validationError}
                role="alert"
              >
                Masukkan teks pesan, URL, atau pilih berkas terlebih dahulu untuk dianalisis.
              </div>

              <div className="scanner-actions">
                <button
                  id="scanner-run-btn"
                  type="button"
                  className="btn btn-primary"
                  onClick={() => runMessageScan(inputText)}
                >
                  Periksa Pesan
                </button>
                <button
                  id="scanner-clear-btn"
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClear}
                >
                  Bersihkan
                </button>
              </div>

              {/* Client-Side Binary Magic-Bytes File Inspector */}
              <div className="file-inspector-bar">
                <div className="file-inspector-head">
                  <span className="field-label">Inspektur header biner berkas (.APK menyamar .PDF)</span>
                  <span className="preset-label">100% diproses di memori lokal tanpa unggah server</span>
                </div>
                <div className="file-inspector-controls">
                  <input
                    ref={fileInputRef}
                    id="file-inspector-input"
                    type="file"
                    className="sr-only"
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Pilih berkas dari perangkat
                  </button>
                  <button
                    type="button"
                    className="btn-chip"
                    onClick={() => handleSimulatedBinarySample('renamedApkAsPdf')}
                  >
                    Uji sampel APK menyamar .PDF
                  </button>
                  <button
                    type="button"
                    className="btn-chip"
                    onClick={() => handleSimulatedBinarySample('genuinePdf')}
                  >
                    Uji sampel .PDF asli
                  </button>
                </div>
              </div>

              {/* Session Scan History */}
              <div
                className="scan-history-box"
                id="scan-history-box"
                hidden={!sessionState.scanHistory || sessionState.scanHistory.length === 0}
              >
                <div className="scan-history-header">
                  <span className="field-label">Riwayat pemeriksaan sesi ini</span>
                  <button
                    type="button"
                    id="scan-history-clear-btn"
                    className="btn-link-sm"
                    onClick={clearScanHistory}
                  >
                    Hapus riwayat
                  </button>
                </div>
                <div id="scan-history-list" className="scan-history-list">
                  {(sessionState.scanHistory || []).map((item, idx) => {
                    const bClass = item.score >= 60 ? 'verdict-danger' : item.score >= 25 ? 'verdict-warn' : 'verdict-safe';
                    return (
                      <button
                        key={idx}
                        type="button"
                        className="history-row"
                        onClick={() => {
                          if (item.fileReportSnapshot) {
                            setScanResult(null);
                            setFileReport(item.fileReportSnapshot);
                          } else if (item.rawText.startsWith('[Berkas]')) {
                            if (item.rawText.includes('50 4B 03 04')) {
                              handleSimulatedBinarySample('renamedApkAsPdf');
                            } else {
                              handleSimulatedBinarySample('genuinePdf');
                            }
                          } else {
                            setInputText(item.rawText);
                            runMessageScan(item.rawText);
                          }
                        }}
                      >
                        <span className="history-snippet">{item.snippet}</span>
                        <span className={`verdict-tag ${bClass}`}>Skor {item.score}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1fr): Compact Product Inspection Diagram / Output Panel */}
          <div className="opening-diagram-col" id="scanner-result-panel" aria-live="polite">
            <div className="inspection-card">
              <div className="inspection-header">
                <div className="inspection-score-block">
                  <span className="inspection-label">Indeks risiko temuan</span>
                  <div className="inspection-score-line">
                    <span className="inspection-score-val" id="scanner-score-val">{activeScore}</span>
                    <span className="inspection-score-max">/ 100</span>
                  </div>
                </div>
                <span className={`verdict-tag ${activeBadgeClass}`} id="scanner-verdict-badge">
                  {activeBadgeText}
                </span>
              </div>

              <div className="inspection-summary">
                <h2 className="inspection-title" id="scanner-verdict-title">{activeTitle}</h2>
                <p className="inspection-desc" id="scanner-verdict-desc">{activeDesc}</p>
              </div>

              {/* Binary File Magic Bytes Anatomy */}
              {fileReport && (
                <div className="scanner-anatomy-box">
                  <span className="inspection-label">Forensik signature biner (Magic Bytes)</span>
                  <div className="anatomy-grid">
                    <div className="anatomy-item">
                      <span className="anatomy-item-label">Nama berkas & ukuran</span>
                      <span className="anatomy-item-code">{fileReport.fileName} ({fileReport.fileSizeKB})</span>
                    </div>
                    <div className="anatomy-item">
                      <span className="anatomy-item-label">Hex signature header (8 byte pertama)</span>
                      <span className="anatomy-item-code">{fileReport.magicHex}</span>
                    </div>
                    <div className="anatomy-item">
                      <span className="anatomy-item-label">Format biner terdeteksi vs ekstensi</span>
                      <span>{fileReport.detectedFormat} (ekstensi tertulis: {fileReport.claimedExtension})</span>
                    </div>
                  </div>
                </div>
              )}

              {/* URL & File Anatomy Box */}
              <div
                id="scanner-anatomy-box"
                className="scanner-anatomy-box"
                hidden={!scanResult || scanResult.anatomyItems.length === 0}
              >
                <span className="inspection-label">Anatomi tautan dan berkas</span>
                <div id="scanner-anatomy-content" className="anatomy-grid">
                  {(scanResult?.anatomyItems || []).map((item, idx) => (
                    <div key={idx} className="anatomy-item">
                      <span className="anatomy-item-label">
                        {item.label}: <span className="anatomy-item-code">{item.code}</span>
                      </span>
                      <span>{item.note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Findings List */}
              <div className="scanner-findings-wrap">
                <span className="inspection-label" id="scanner-findings-heading">
                  Temuan indikator ({redFlagsCount})
                </span>
                <div id="scanner-findings-list" className="scanner-findings-list">
                  {!scanResult && !fileReport && (
                    <p className="empty-finding-state">
                      Pemeriksaan mencakup deteksi berkas aplikasi .APK, signature biner heksadesimal, tautan tiruan, permintaan kode OTP atau PIN, desakan waktu, dan nomor pengirim pribadi.
                    </p>
                  )}

                  {scanResult && scanResult.findings.map((f, idx) => (
                    <div key={idx} className={`finding-card finding-${f.severity}`}>
                      <strong>{f.title}</strong>
                      <span className="finding-snippet">{f.snippet}</span>
                      <p>{f.desc}</p>
                    </div>
                  ))}

                  {fileReport && (
                    <div className={`finding-card ${fileReport.isDangerous ? 'finding-high' : 'finding-safe'}`}>
                      <strong>{fileReport.detectedFormat}</strong>
                      <span className="finding-snippet">Header: {fileReport.magicHex}</span>
                      <p>{fileReport.verdictDesc}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Safe Verification Reply Templates */}
              {(scanResult || fileReport) && (
                <div className="scanner-anatomy-box">
                  <span className="inspection-label">Draf balasan verifikasi aman (siap salin)</span>
                  <div className="anatomy-grid">
                    {generateSafeVerificationReplies(fileReport ? fileReport.fileName : inputText).map((item, idx) => (
                      <div key={idx} className="anatomy-item">
                        <div className="scan-history-header">
                          <span className="anatomy-item-label">{item.label}</span>
                          <button
                            type="button"
                            className="btn-link-sm"
                            onClick={() => {
                              navigator.clipboard.writeText(item.reply);
                              setCopiedReplyIdx(idx);
                              setTimeout(() => setCopiedReplyIdx(null), 1800);
                            }}
                          >
                            {copiedReplyIdx === idx ? 'Tersalin' : 'Salin balasan'}
                          </button>
                        </div>
                        <p>{item.reply}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cross-Module Action Pipeline Footer */}
              <div
                id="scanner-action-footer"
                className="scanner-action-footer"
                hidden={!scanResult && !fileReport}
              >
                <button
                  type="button"
                  id="scanner-autofill-report-btn"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (fileReport) {
                      forwardIncidentToToolkit({
                        type: 'File APK Berbahaya (Kurir / Undangan)',
                        platform: 'WhatsApp',
                        entity: 'Pengirim berkas .APK samaran',
                        suspect: `${fileReport.fileName} [Header: ${fileReport.magicHex}]`,
                        loss: `Menerima berkas ${fileReport.detectedFormat}`
                      }, fileReport.recommendedGuideId);
                    } else if (scanResult) {
                      forwardIncidentToToolkit(scanResult.extractedIncident, scanResult.recommendedGuideId);
                    }
                  }}
                >
                  Teruskan ke laporan darurat
                </button>
                <a
                  id="scanner-guide-link"
                  href="#guide"
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToView('guide');
                  }}
                >
                  Lihat langkah penanganan
                </a>
                <a
                  id="scanner-Sim-btn"
                  href="#simulator"
                  className="btn btn-secondary btn-sm"
                  data-goto-view="simulator"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateToView('simulator');
                  }}
                >
                  Coba di Simulator
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Ruled Facts Strip (# Software Layout Specification) */}
        <div className="ruled-facts-strip" aria-label="Ringkasan Aktivitas Sesi">
          <div className="fact-cell">
            <span className="fact-value" id="stat-scan-count">{scanCount}</span>
            <span className="fact-label">Pesan dan berkas diperiksa pada sesi ini</span>
          </div>
          <div className="fact-cell">
            <span className="fact-value" id="stat-sim-done">{simDoneCount} / 3</span>
            <span className="fact-label">Skenario simulasi diselesaikan</span>
          </div>
          <div className="fact-cell">
            <span className="fact-value" id="stat-det-done">{detDoneCount} / 3</span>
            <span className="fact-label">Kasus bukti diinvestigasi</span>
          </div>
          <div className="fact-cell">
            <span className="fact-value">100% Lokal</span>
            <span className="fact-label">Tanpa akun dan tanpa pengumpulan data pribadi</span>
          </div>
        </div>
      </div>
    </section>
  );
}
