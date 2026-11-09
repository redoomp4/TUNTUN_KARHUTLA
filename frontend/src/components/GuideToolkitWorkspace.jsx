import React, { useState, useEffect } from 'react';
import { useGuardian } from '../context/GuardianContext.jsx';
import { ACTION_GUIDE_SITUATIONS, EMERGENCY_DIRECTORY_DATA } from '../data/emergencyDirectory.js';
import { buildOfficialReportDraft, buildFamilyWarningDraft } from '../engines/reportBuilderEngine.js';

const SITUATION_STRIP_LABELS = {
  'guide-sit-1': '01. Pesan / File Mencurigakan',
  'guide-sit-2': '02. Terlanjur Klik / Instal .APK',
  'guide-sit-3': '03. Bocor Kode OTP / PIN',
  'guide-sit-4': '04. Sudah Transfer Dana'
};

const STEP_PRIORITY_TAGS = [
  'Prioritas 1 • Instan',
  'Prioritas 2 • Verifikasi',
  'Prioritas 3 • Proteksi',
  'Prioritas 4 • Mitigasi'
];

export default function GuideToolkitWorkspace({ hidden }) {
  const {
    activeGuideId,
    incidentForwardedBanner,
    setIncidentForwardedBanner,
    reportForm,
    setReportForm,
    navigateToView
  } = useGuardian();

  const [selectedSitId, setSelectedSitId] = useState('guide-sit-1');
  const [reportOutput, setReportOutput] = useState(() => buildOfficialReportDraft(reportForm));
  const [copyOfficialFeedback, setCopyOfficialFeedback] = useState(false);
  const [copyFamilyFeedback, setCopyFamilyFeedback] = useState(false);
  const [dirSearch, setDirSearch] = useState('');

  useEffect(() => {
    if (activeGuideId) {
      setSelectedSitId(activeGuideId);
    }
  }, [activeGuideId]);

  useEffect(() => {
    setReportOutput(buildOfficialReportDraft(reportForm));
  }, [reportForm]);

  const activeSituation =
    ACTION_GUIDE_SITUATIONS.find(s => s.id === selectedSitId) || ACTION_GUIDE_SITUATIONS[0];
  const sitIndex = ACTION_GUIDE_SITUATIONS.findIndex(s => s.id === activeSituation.id);

  const handleCopyOfficial = () => {
    const draft = buildOfficialReportDraft(reportForm);
    setReportOutput(draft);
    navigator.clipboard.writeText(draft).then(() => {
      setCopyOfficialFeedback(true);
      setTimeout(() => setCopyOfficialFeedback(false), 2000);
    });
  };

  const handleCopyFamily = () => {
    const warning = buildFamilyWarningDraft(reportForm);
    setReportOutput(warning);
    navigator.clipboard.writeText(warning).then(() => {
      setCopyFamilyFeedback(true);
      setTimeout(() => setCopyFamilyFeedback(false), 2000);
    });
  };

  const filteredDirectory = EMERGENCY_DIRECTORY_DATA.filter((item) => {
    const q = dirSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.contact.toLowerCase().includes(q)
    );
  });

  return (
    <section
      id="guide"
      className="section-ground app-view-panel"
      data-view-name="guide"
      aria-labelledby="guide-heading"
      hidden={hidden}
    >
      <div className="site-container">
        {/* Top Creative Hotline & Lanyard Strip */}
        <div className="creative-strip-bar">
          <div className="strip-item">
            <span className="strip-dot dot-red" />
            <span>Darurat 24 Jam: <strong>BCA 1500888</strong> • <strong>BRI 14017</strong> • <strong>Mandiri 14000</strong> • <strong>OJK 157</strong></span>
          </div>
          <div className="strip-item">
            <span>Protokol Aktif: <strong>{SITUATION_STRIP_LABELS[activeSituation.id]}</strong></span>
          </div>
          <button
            type="button"
            className="strip-lanyard-pill light-pill"
            onClick={() => navigateToView('profile')}
          >
            Buka Lanyard ID
          </button>
        </div>

        {incidentForwardedBanner && (
          <div className="finding-card finding-safe" style={{ marginBottom: '20px' }}>
            <div className="scan-history-header">
              <strong>Data insiden diteruskan otomatis dari Pemindai</strong>
              <button
                type="button"
                className="btn-link-sm"
                onClick={() => setIncidentForwardedBanner(null)}
              >
                Tutup
              </button>
            </div>
            <p>
              Widget protokol penyelamatan dan draf laporan resmi di bawah telah disesuaikan untuk{' '}
              <strong>{incidentForwardedBanner.type}</strong>.
            </p>
          </div>
        )}

        {/* Section Header + Situation Strip Tabs */}
        <div className="section-intro-row" style={{ marginBottom: '20px' }}>
          <div className="section-intro-copy">
            <h2 id="guide-heading" className="section-title">Widget Protokol Darurat</h2>
            <p className="section-description">
              Pilih kondisi yang dialami untuk melihat 4 kartu informasi penyelamatan instan.
            </p>
          </div>

          <div className="case-selector-bar" role="tablist" aria-label="Pilih Kondisi Insiden">
            {ACTION_GUIDE_SITUATIONS.map((sit) => {
              const isSelected = sit.id === activeSituation.id;
              return (
                <button
                  key={sit.id}
                  id={sit.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`case-tab-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedSitId(sit.id)}
                >
                  {SITUATION_STRIP_LABELS[sit.id] || sit.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Information Widget Dashboard (Replaces Checkboxes) */}
        <div className="protocol-widget-board">
          <div className="protocol-summary-banner">
            <div className="protocol-summary-left">
              <span className="protocol-stage-badge" id="checklist-progress-text">
                Protokol 0{sitIndex + 1} / 04
              </span>
              <div>
                <h3 className="protocol-banner-title">{activeSituation.title}</h3>
                <p className="protocol-banner-lead">{activeSituation.lead}</p>
              </div>
            </div>
            <div className="protocol-summary-right">
              <span className="protocol-stat-pill" id="checklist-progress-pct">4 Langkah Inti</span>
              <button
                type="button"
                id="checklist-reset-btn"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const nextIdx = (sitIndex + 1) % ACTION_GUIDE_SITUATIONS.length;
                  setSelectedSitId(ACTION_GUIDE_SITUATIONS[nextIdx].id);
                }}
              >
                Protokol Berikutnya
              </button>
            </div>
            <div id="checklist-bar-fill" hidden />
          </div>

          {/* 4-Card Bento Grid of Information Widgets (Zero Checkboxes) */}
          <div className="info-widget-grid">
            {activeSituation.steps.map((step, idx) => (
              <article key={step.id} className="info-widget-card">
                <div className="info-widget-top">
                  <span className="info-step-num">LANGKAH 0{idx + 1}</span>
                  <span className="info-step-tag">{STEP_PRIORITY_TAGS[idx] || 'Protokol'}</span>
                </div>
                <h4 className="info-widget-title">{step.bold.replace(':', '')}</h4>
                <p className="info-widget-desc">{step.text}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Part B: Practical Emergency Toolkit (Report Generator & Verified Directory Widgets) */}
        <div id="emergency-tools" className="toolkit-section" style={{ marginTop: '28px' }}>
          <div className="toolkit-grid">
            {/* Left Widget: Chronology Report Builder */}
            <div className="toolkit-card">
              <div className="widget-head-row">
                <h3 className="panel-heading" style={{ marginBottom: 0 }}>Widget Generator Laporan Resmi</h3>
                <span className="verdict-tag verdict-safe">Siap Salin</span>
              </div>
              <p className="panel-subtext">
                Susun kronologi singkat untuk Call Center Bank, OJK 157, atau Kepolisian.
              </p>

              <div className="report-form-grid">
                <div className="form-group">
                  <label htmlFor="rep-type" className="field-label">Jenis modus</label>
                  <select
                    id="rep-type"
                    className="form-input"
                    value={reportForm.type}
                    onChange={(e) => setReportForm(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="File APK Berbahaya (Kurir / Undangan)">File .APK berbahaya (kurir / undangan)</option>
                    <option value="Tautan Phishing Perbankan / OTP">Tautan phishing perbankan / OTP</option>
                    <option value="Penipuan Tugas Paruh Waktu / Deposit">Penipuan kerja paruh waktu / deposit</option>
                    <option value="Undian Berhadiah / Pajak Palsu">Undian berhadiah / pajak palsu</option>
                    <option value="Tagihan Bea Cukai / Ekspedisi Palsu">Tagihan bea cukai / ekspedisi palsu</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="rep-platform" className="field-label">Kanal komunikasi</label>
                  <select
                    id="rep-platform"
                    className="form-input"
                    value={reportForm.platform}
                    onChange={(e) => setReportForm(prev => ({ ...prev, platform: e.target.value }))}
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="SMS / Telepon Seluler">SMS / Telepon</option>
                    <option value="Telegram">Telegram</option>
                    <option value="Instagram / Facebook / TikTok">Media sosial</option>
                    <option value="Email">Email</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="rep-entity" className="field-label">Instansi dicatut</label>
                  <input
                    type="text"
                    id="rep-entity"
                    className="form-input"
                    value={reportForm.entity}
                    onChange={(e) => setReportForm(prev => ({ ...prev, entity: e.target.value }))}
                    placeholder="Contoh: Bank BCA / J&T"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rep-suspect" className="field-label">Nomor / Rekening / URL pelaku</label>
                  <input
                    type="text"
                    id="rep-suspect"
                    className="form-input"
                    value={reportForm.suspect}
                    onChange={(e) => setReportForm(prev => ({ ...prev, suspect: e.target.value }))}
                    placeholder="Contoh: 0821-xxxx / Rek 8810xxx"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label htmlFor="rep-loss" className="field-label">Ringkasan kejadian</label>
                  <input
                    type="text"
                    id="rep-loss"
                    className="form-input"
                    value={reportForm.loss}
                    onChange={(e) => setReportForm(prev => ({ ...prev, loss: e.target.value }))}
                    placeholder="Contoh: Mengeklik tautan pukul 14.10 WIB, belum ada dana keluar"
                  />
                </div>
              </div>

              <div className="report-actions-bar">
                <button
                  type="button"
                  id="rep-generate-btn"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setReportOutput(buildOfficialReportDraft(reportForm))}
                >
                  Segarkan
                </button>
                <button
                  type="button"
                  id="rep-copy-official-btn"
                  className="btn btn-primary btn-sm"
                  onClick={handleCopyOfficial}
                >
                  {copyOfficialFeedback ? 'Tersalin' : 'Salin Laporan Resmi'}
                </button>
                <button
                  type="button"
                  id="rep-copy-family-btn"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyFamily}
                >
                  {copyFamilyFeedback ? 'Tersalin' : 'Salin Info Keluarga'}
                </button>
              </div>

              <div className="report-output-wrap">
                <label htmlFor="rep-output-text" className="field-label">Pratinjau draf</label>
                <textarea
                  id="rep-output-text"
                  className="report-output-textarea"
                  rows="5"
                  value={reportOutput}
                  readOnly
                />
              </div>
            </div>

            {/* Right Widget: Verified Official Contact Directory */}
            <div className="toolkit-card">
              <div className="widget-head-row">
                <h3 className="panel-heading" style={{ marginBottom: 0 }}>Widget Kontak Darurat Resmi</h3>
                <span className="verdict-tag verdict-neutral">Terverifikasi</span>
              </div>
              <p className="panel-subtext">
                Hubungi langsung nomor resmi berikut untuk pemblokiran cepat.
              </p>

              <div className="form-group">
                <label htmlFor="dir-search-input" className="field-label">
                  Filter instansi
                </label>
                <input
                  type="search"
                  id="dir-search-input"
                  className="form-input"
                  value={dirSearch}
                  onChange={(e) => setDirSearch(e.target.value)}
                  placeholder="Ketik BCA, BRI, Mandiri, DANA, OJK..."
                />
              </div>

              <div className="directory-list" id="directory-list" role="list">
                {filteredDirectory.length === 0 ? (
                  <p className="empty-finding-state">
                    Tidak ditemukan "{dirSearch}".
                  </p>
                ) : (
                  filteredDirectory.map((item, idx) => {
                    const isExternalWeb = item.href.startsWith('http');
                    return (
                      <div key={idx} className="dir-item" role="listitem">
                        <div className="dir-info">
                          <strong className="dir-name">{item.name}</strong>
                          <span className="dir-meta">{item.category}</span>
                        </div>
                        <a
                          href={item.href}
                          className="dir-call-badge"
                          target={isExternalWeb ? '_blank' : undefined}
                          rel={isExternalWeb ? 'noopener noreferrer' : undefined}
                        >
                          {item.contact}
                        </a>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
