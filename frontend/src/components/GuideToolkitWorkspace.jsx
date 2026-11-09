import React, { useState, useEffect } from 'react';
import { useGuardian } from '../context/GuardianContext.jsx';
import { ACTION_GUIDE_SITUATIONS, EMERGENCY_DIRECTORY_DATA } from '../data/emergencyDirectory.js';
import { buildOfficialReportDraft, buildFamilyWarningDraft } from '../engines/reportBuilderEngine.js';

export default function GuideToolkitWorkspace({ hidden }) {
  const {
    sessionState,
    activeGuideId,
    incidentForwardedBanner,
    setIncidentForwardedBanner,
    reportForm,
    setReportForm,
    toggleChecklistStep,
    resetChecklist
  } = useGuardian();

  const [openGuides, setOpenGuides] = useState({ 'guide-sit-1': true });
  const [reportOutput, setReportOutput] = useState(() => buildOfficialReportDraft(reportForm));
  const [copyOfficialFeedback, setCopyOfficialFeedback] = useState(false);
  const [copyFamilyFeedback, setCopyFamilyFeedback] = useState(false);
  const [dirSearch, setDirSearch] = useState('');

  useEffect(() => {
    if (activeGuideId) {
      setOpenGuides(prev => ({ ...prev, [activeGuideId]: true }));
    }
  }, [activeGuideId]);

  useEffect(() => {
    setReportOutput(buildOfficialReportDraft(reportForm));
  }, [reportForm]);

  const totalSteps = ACTION_GUIDE_SITUATIONS.reduce((acc, sit) => acc + sit.steps.length, 0);
  const checkedCount = Object.values(sessionState.checklist || {}).filter(Boolean).length;
  const pct = totalSteps > 0 ? Math.round((checkedCount / totalSteps) * 100) : 0;

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
          <div className="finding-card finding-safe" style={{ marginBottom: '24px' }}>
            <div className="scan-history-header">
              <strong>Data insiden berhasil diteruskan dari Pemindai Pesan & Berkas</strong>
              <button
                type="button"
                className="btn-link-sm"
                onClick={() => setIncidentForwardedBanner(null)}
              >
                Tutup info
              </button>
            </div>
            <p>
              Prosedur penyelamatan yang sesuai telah dibuka di bawah, dan formulir{' '}
              <strong>Penyusun Kronologi Laporan Resmi</strong> telah diisi otomatis untuk modus{' '}
              <em>{incidentForwardedBanner.type}</em> ({incidentForwardedBanner.entity}).
            </p>
            <div className="scanner-actions" style={{ marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  const el = document.getElementById('emergency-tools');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Lihat draf laporan resmi siap salin
              </button>
            </div>
          </div>
        )}

        {/* Part A: Heading beside Native Disclosures (# Software Pattern) */}
        <div className="guide-split-layout">
          <div className="guide-intro-col">
            <h2 id="guide-heading" className="section-title">Action Guide</h2>
            <p className="section-description">
              Langkah penyelamatan darurat berdasarkan situasi yang Anda alami. Centang setiap tindakan yang sudah dilakukan untuk memantau progres pengamanan akun.
            </p>

            <div className="checklist-progress-card">
              <div className="checklist-progress-info">
                <span className="progress-title" id="checklist-progress-text">
                  {checkedCount} dari {totalSteps} langkah selesai
                </span>
                <strong className="progress-pct" id="checklist-progress-pct">{pct}%</strong>
              </div>
              <div
                className="checklist-bar-track"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={pct}
              >
                <div
                  className="checklist-bar-fill"
                  id="checklist-bar-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <button
                type="button"
                id="checklist-reset-btn"
                className="btn-link-sm"
                onClick={resetChecklist}
              >
                Atur ulang daftar periksa
              </button>
            </div>
          </div>

          <div className="disclosure-stack">
            {ACTION_GUIDE_SITUATIONS.map((sit) => (
              <details
                key={sit.id}
                className="disclosure-item"
                id={sit.id}
                open={Boolean(openGuides[sit.id])}
              >
                <summary
                  className="disclosure-summary"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenGuides(prev => ({ ...prev, [sit.id]: !prev[sit.id] }));
                  }}
                >
                  <span className="summary-label">{sit.title}</span>
                  <span className="summary-plus" aria-hidden="true">+</span>
                </summary>
                <div className="disclosure-body">
                  <p className="guide-lead">{sit.lead}</p>
                  <div className="interactive-steps-list">
                    {sit.steps.map((step) => (
                      <label key={step.id} className="check-step-row">
                        <input
                          type="checkbox"
                          className="guide-step-check"
                          data-step-id={step.id}
                          checked={Boolean(sessionState.checklist?.[step.id])}
                          onChange={(e) => toggleChecklistStep(step.id, e.target.checked)}
                        />
                        <span>
                          <strong>{step.bold}</strong> {step.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Part B: Practical Emergency Toolkit (Report Generator & Verified Directory) */}
        <div id="emergency-tools" className="toolkit-section">
          <div className="toolkit-grid">
            {/* Left Card: Chronology Report Builder */}
            <div className="toolkit-card">
              <h3 className="panel-heading">Penyusun kronologi laporan resmi</h3>
              <p className="panel-subtext">
                Isi data kejadian (atau teruskan otomatis dari modul Pemindai) untuk menghasilkan draf laporan siap salin bagi Call Center Bank, OJK 157, atau Kepolisian.
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
                  <label htmlFor="rep-entity" className="field-label">Nama instansi yang dicatut</label>
                  <input
                    type="text"
                    id="rep-entity"
                    className="form-input"
                    value={reportForm.entity}
                    onChange={(e) => setReportForm(prev => ({ ...prev, entity: e.target.value }))}
                    placeholder="Contoh: Bank BCA / J&T Express"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rep-suspect" className="field-label">Nomor telepon, rekening, atau URL pelaku</label>
                  <input
                    type="text"
                    id="rep-suspect"
                    className="form-input"
                    value={reportForm.suspect}
                    onChange={(e) => setReportForm(prev => ({ ...prev, suspect: e.target.value }))}
                    placeholder="Contoh: 0821-xxxx / Rek 881029xxx"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label htmlFor="rep-loss" className="field-label">Rincian kejadian atau kerugian</label>
                  <input
                    type="text"
                    id="rep-loss"
                    className="form-input"
                    value={reportForm.loss}
                    onChange={(e) => setReportForm(prev => ({ ...prev, loss: e.target.value }))}
                    placeholder="Contoh: Mengeklik tautan pada pukul 14.10 WIB, belum ada dana keluar"
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
                  Perbarui draf
                </button>
                <button
                  type="button"
                  id="rep-copy-official-btn"
                  className="btn btn-primary btn-sm"
                  onClick={handleCopyOfficial}
                >
                  {copyOfficialFeedback ? 'Laporan resmi disalin' : 'Salin laporan resmi'}
                </button>
                <button
                  type="button"
                  id="rep-copy-family-btn"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyFamily}
                >
                  {copyFamilyFeedback ? 'Peringatan keluarga disalin' : 'Salin peringatan keluarga'}
                </button>
              </div>

              <div className="report-output-wrap">
                <label htmlFor="rep-output-text" className="field-label">Hasil draf laporan</label>
                <textarea
                  id="rep-output-text"
                  className="report-output-textarea"
                  rows="6"
                  value={reportOutput}
                  readOnly
                />
              </div>
            </div>

            {/* Right Card: Verified Official Contact Directory */}
            <div className="toolkit-card">
              <h3 className="panel-heading">Direktori kontak darurat resmi</h3>
              <p className="panel-subtext">
                Gunakan hanya nomor di bawah ini untuk pemblokiran rekening dan pengaduan resmi.
              </p>

              <div className="form-group">
                <label htmlFor="dir-search-input" className="field-label">
                  Cari bank, e-wallet, atau otoritas
                </label>
                <input
                  type="search"
                  id="dir-search-input"
                  className="form-input"
                  value={dirSearch}
                  onChange={(e) => setDirSearch(e.target.value)}
                  placeholder="Ketik nama instansi (misalnya BCA, BRI, DANA, OJK)..."
                />
              </div>

              <div className="directory-list" id="directory-list" role="list">
                {filteredDirectory.length === 0 ? (
                  <p className="empty-finding-state">
                    Tidak ditemukan instansi dengan kata kunci "{dirSearch}".
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
