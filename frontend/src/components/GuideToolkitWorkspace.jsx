import React, { useState, useEffect } from 'react';
import { useGuardian } from '../context/GuardianContext.jsx';
import { ACTION_GUIDE_SITUATIONS, EMERGENCY_DIRECTORY_DATA } from '../data/emergencyDirectory.js';
import { buildOfficialReportDraft, buildFamilyWarningDraft } from '../engines/reportBuilderEngine.js';

const SITUATION_STRIP_LABELS = {
  'guide-sit-1': '1. Terima Pesan Aneh',
  'guide-sit-2': '2. Terlanjur Klik .APK',
  'guide-sit-3': '3. Bocor OTP / PIN',
  'guide-sit-4': '4. Sudah Transfer'
};

export default function GuideToolkitWorkspace({ hidden }) {
  const {
    activeGuideId,
    incidentForwardedBanner,
    setIncidentForwardedBanner,
    reportForm,
    setReportForm
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
    ACTION_GUIDE_SITUATIONS.find((s) => s.id === selectedSitId) || ACTION_GUIDE_SITUATIONS[0];
  const sitIndex = ACTION_GUIDE_SITUATIONS.findIndex((s) => s.id === activeSituation.id);

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
        {incidentForwardedBanner && (
          <div className="finding-card finding-safe" style={{ marginBottom: '16px' }}>
            <div className="scan-history-header">
              <strong>Data insiden diteruskan dari Pemindai ({incidentForwardedBanner.type})</strong>
              <button
                type="button"
                className="btn-link-sm"
                onClick={() => setIncidentForwardedBanner(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Compact Header + Situation Selector Bar */}
        <div className="section-intro-row" style={{ marginBottom: '18px' }}>
          <div className="section-intro-copy">
            <span id="checklist-progress-text" className="sr-only">Kasus 0{sitIndex + 1}</span>
            <span id="checklist-progress-pct" className="sr-only">100%</span>
            <span id="checklist-bar-fill" hidden />
            <button id="checklist-reset-btn" type="button" hidden />
            <h2 id="guide-heading" className="section-title">
              Panduan <span className="kw-safe">Penyelamatan Cepat</span> &amp; Laporan
            </h2>
            <p className="section-description">
              Pilih kondisi darurat di samping untuk melihat <strong>4 langkah pertolongan pertama</strong>.
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

        {/* Compact 4-Column Horizontal Step Cards (Fits in ~120px height) */}
        <div className="compact-guide-board">
          <div className="compact-guide-summary-bar">
            <strong>{activeSituation.title}:</strong> <span>{activeSituation.lead}</span>
          </div>
          <div className="info-widget-grid">
            {activeSituation.steps.map((step, idx) => (
              <article key={step.id} className="info-widget-card">
                <div className="info-widget-top">
                  <span className="info-step-num">LANGKAH 0{idx + 1}</span>
                  {idx === 0 && <span className="info-step-tag">UTAMA</span>}
                </div>
                <h3 className="info-widget-title">{step.bold.replace(':', '')}</h3>
                <p className="info-widget-desc">{step.text}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Compact 2-Column Toolkit: Report Generator + Official Contacts */}
        <div id="emergency-tools" className="toolkit-section" style={{ marginTop: '24px', paddingTop: '24px' }}>
          <div className="toolkit-grid">
            {/* Left: Concise Report Generator */}
            <div className="toolkit-card">
              <h3 className="panel-heading">Pembuat Draf Laporan Resmi</h3>
              <p className="panel-subtext">
                Isi data singkat untuk membuat laporan siap kirim ke <strong>Bank / OJK 157</strong>.
              </p>

              <div className="report-form-grid">
                <div className="form-group">
                  <label htmlFor="rep-type" className="field-label">Modus penipuan</label>
                  <select
                    id="rep-type"
                    className="form-input"
                    value={reportForm.type}
                    onChange={(e) => setReportForm((prev) => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="File APK Berbahaya (Kurir / Undangan)">File .APK berbahaya</option>
                    <option value="Tautan Phishing Perbankan / OTP">Tautan phishing / OTP</option>
                    <option value="Penipuan Tugas Paruh Waktu / Deposit">Kerja paruh waktu / deposit</option>
                    <option value="Undian Berhadiah / Pajak Palsu">Undian berhadiah palsu</option>
                    <option value="Tagihan Bea Cukai / Ekspedisi Palsu">Bea cukai / ekspedisi palsu</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="rep-platform" className="field-label">Aplikasi</label>
                  <select
                    id="rep-platform"
                    className="form-input"
                    value={reportForm.platform}
                    onChange={(e) => setReportForm((prev) => ({ ...prev, platform: e.target.value }))}
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
                    onChange={(e) => setReportForm((prev) => ({ ...prev, entity: e.target.value }))}
                    placeholder="Misal: BCA / J&T"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rep-suspect" className="field-label">Nomor / Rekening pelaku</label>
                  <input
                    type="text"
                    id="rep-suspect"
                    className="form-input"
                    value={reportForm.suspect}
                    onChange={(e) => setReportForm((prev) => ({ ...prev, suspect: e.target.value }))}
                    placeholder="Misal: 0821-xxxx"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label htmlFor="rep-loss" className="field-label">Kronologi singkat</label>
                  <input
                    type="text"
                    id="rep-loss"
                    className="form-input"
                    value={reportForm.loss}
                    onChange={(e) => setReportForm((prev) => ({ ...prev, loss: e.target.value }))}
                    placeholder="Misal: Klik link pukul 14.00, belum ada saldo terpotong"
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
                  Perbarui
                </button>
                <button
                  type="button"
                  id="rep-copy-official-btn"
                  className="btn btn-primary btn-sm"
                  onClick={handleCopyOfficial}
                >
                  {copyOfficialFeedback ? 'Tersalin' : 'Salin Laporan Bank'}
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
                <label htmlFor="rep-output-text" className="sr-only">Naskah Laporan</label>
                <textarea
                  id="rep-output-text"
                  className="report-output-textarea"
                  rows="3"
                  value={reportOutput}
                  readOnly
                />
              </div>
            </div>

            {/* Right: Compact Official Hotline Directory */}
            <div className="toolkit-card">
              <h3 className="panel-heading">Kontak Blokir Rekening Resmi</h3>
              <p className="panel-subtext">
                Hubungi <strong>Call Center resmi</strong> di bawah untuk memblokir rekening darurat.
              </p>

              <div className="form-group">
                <label htmlFor="dir-search-input" className="sr-only">Cari bank</label>
                <input
                  type="search"
                  id="dir-search-input"
                  className="form-input"
                  value={dirSearch}
                  onChange={(e) => setDirSearch(e.target.value)}
                  placeholder="Cari BCA, BRI, Mandiri, DANA, OJK..."
                />
              </div>

              <div className="directory-list compact-directory-list" id="directory-list" role="list">
                {filteredDirectory.map((item, idx) => {
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
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
