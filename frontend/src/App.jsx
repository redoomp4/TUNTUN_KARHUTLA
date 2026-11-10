import React, { useEffect, useRef, useState } from 'react';
import { GuardianProvider, useGuardian } from './context/GuardianContext.jsx';
import Navbar from './components/Navbar.jsx';
import ScannerWorkspace from './components/ScannerWorkspace.jsx';
import SimulatorWorkspace from './components/SimulatorWorkspace.jsx';
import DetectiveWorkspace from './components/DetectiveWorkspace.jsx';
import GuideToolkitWorkspace from './components/GuideToolkitWorkspace.jsx';
import GuardianProfileWorkspace from './components/GuardianProfileWorkspace.jsx';

function PrecisionCursor() {
  const ringRef = useRef(null);
  const [hoveredType, setHoveredType] = useState('default');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFinePointer || prefersReducedMotion) return;

    const handleMouseMove = (e) => {
      if (!visible) setVisible(true);
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;

      if (target.closest('button:disabled, input:disabled')) {
        setHoveredType('disabled');
      } else if (target.closest('input[type="text"], input[type="search"], textarea')) {
        setHoveredType('text');
      } else if (
        target.closest(
          'a, button, summary, select, [role="tab"], label.check-step-row, .evidence-clue-btn, .choice-btn, .history-row'
        )
      ) {
        setHoveredType('interactive');
      } else {
        setHoveredType('default');
      }
    };

    const handleMouseLeave = () => setVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={ringRef}
      aria-hidden="true"
      className={`tuntun-cursor-ring cursor-${hoveredType}`}
    />
  );
}

const EMERGENCY_HOTLINES = [
  { name: 'Halo BCA', phone: '1500888', desc: 'Blokir M-Banking & Rekening', tag: '24 Jam' },
  { name: 'Call BRI', phone: '14017', desc: 'Pengamanan Saldo & Kartu ATM', tag: '24 Jam' },
  { name: 'Mandiri Call', phone: '14000', desc: 'Layanan Pengaduan Nasabah', tag: '24 Jam' },
  { name: 'BNI Call', phone: '1500046', desc: 'Blokir Transaksi Mencurigakan', tag: '24 Jam' },
  { name: 'Satgas PASTI OJK', phone: '157', desc: 'Satgas Waspada Investasi & Pinjol Ilegal', tag: 'Hari Kerja' },
  { name: 'Patroli Siber Polri', phone: '110', desc: 'Layanan Laporan Kejahatan Siber', tag: 'Resmi' }
];

function WorkspaceContent() {
  const { sessionState, navigateToView, toggleViewMode } = useGuardian();
  const showAll = Boolean(sessionState.showAllViews);
  const activeView = sessionState.activeView || 'scanner';
  const [showHotlineModal, setShowHotlineModal] = useState(false);
  const [copiedHotline, setCopiedHotline] = useState('');

  const isHidden = (viewKey) => !showAll && activeView !== viewKey;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showHotlineModal) {
        setShowHotlineModal(false);
        return;
      }
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const keyMap = {
          '1': 'scanner',
          '2': 'simulator',
          '3': 'detective',
          '4': 'guide',
          '5': 'profile'
        };
        if (keyMap[e.key]) {
          e.preventDefault();
          navigateToView(keyMap[e.key]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateToView, showHotlineModal]);

  const handleFooterNav = (e, viewKey) => {
    e.preventDefault();
    navigateToView(viewKey);
  };

  return (
    <>
      <PrecisionCursor />
      <Navbar />
      <main id="main-content">
        <ScannerWorkspace hidden={isHidden('scanner')} />
        <SimulatorWorkspace hidden={isHidden('simulator')} />
        <DetectiveWorkspace hidden={isHidden('detective')} />
        <GuideToolkitWorkspace hidden={isHidden('guide')} />
        <GuardianProfileWorkspace hidden={isHidden('profile')} />
      </main>

      {/* Streamlined Modern Footer with Creative Action Hub */}
      <footer className="site-footer" role="contentinfo">
        <div className="site-container">
          <div className="footer-compact-row">
            {/* Brand Lockup & Concise Mission */}
            <div className="footer-brand-lockup">
              <img
                src="/logo_TUNTUN.jpeg?v=2"
                alt="Logo TUNTUN Digital Guardian"
                className="footer-logo-img"
                width="32"
                height="32"
              />
              <div className="footer-brand-info">
                <strong className="footer-title">
                  TUNTUN <span className="footer-title-sub">Digital Guardian</span>
                </strong>
                <p className="footer-tagline-sm">
                  Perisai literasi penipuan digital keluarga Indonesia • Pemrosesan 100% lokal di peramban.
                </p>
              </div>
            </div>

            {/* Creative Action Hub Buttons */}
            <div className="footer-actions-cluster">
              <button
                type="button"
                className="footer-action-btn"
                onClick={() => setShowHotlineModal(true)}
                title="Buka daftar kontak darurat bank & OJK resmi"
              >
                <span>Kontak Darurat Perbankan</span>
              </button>

              <button
                type="button"
                className="footer-action-btn"
                onClick={toggleViewMode}
                title="Ganti tampilan fokus 1 modul atau semua modul sekaligus"
              >
                <span>{showAll ? 'Mode Fokus' : 'Semua Modul'}</span>
              </button>

              <button
                type="button"
                className="footer-action-btn"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                title="Kembali ke bagian atas halaman"
              >
                <span>Kembali ke Atas</span>
              </button>
            </div>
          </div>

          {/* Clean Horizontal Navigation & Verified Links */}
          <div className="footer-nav-strip">
            <div className="footer-pills-group" aria-label="Navigasi Cepat Modul">
              <a href="#scanner" onClick={(e) => handleFooterNav(e, 'scanner')} className="footer-nav-pill">
                <span className="pill-num">01</span> Pemindai
              </a>
              <a href="#simulator" onClick={(e) => handleFooterNav(e, 'simulator')} className="footer-nav-pill">
                <span className="pill-num">02</span> Simulasi
              </a>
              <a href="#detective" onClick={(e) => handleFooterNav(e, 'detective')} className="footer-nav-pill">
                <span className="pill-num">03</span> Detektif
              </a>
              <a href="#guide" onClick={(e) => handleFooterNav(e, 'guide')} className="footer-nav-pill">
                <span className="pill-num">04</span> Panduan
              </a>
              <a href="#profile-view" onClick={(e) => handleFooterNav(e, 'profile')} className="footer-nav-pill">
                <span className="pill-num">05</span> Lanyard ID
              </a>
            </div>

            <div className="footer-external-links" aria-label="Portal Verifikasi & Laporan Resmi">
              <a href="https://cekrekening.id" target="_blank" rel="noopener noreferrer" className="footer-ext-chip">
                CekRekening.id ↗
              </a>
              <a href="https://patrolisiber.id" target="_blank" rel="noopener noreferrer" className="footer-ext-chip">
                Patroli Siber ↗
              </a>
              <a href="https://konsumen.ojk.go.id" target="_blank" rel="noopener noreferrer" className="footer-ext-chip">
                Satgas Pasti 157 ↗
              </a>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Shortcuts */}
          <div className="footer-bottom-bar">
            <span>
              &copy; 2026 TUNTUN: Digital Guardian. Bebas biaya, tanpa simpan data pribadi, seluruh skenario fiktif edukatif.
            </span>
            <span className="footer-shortcut-hint">
              Pintasan Keyboard: <strong>Alt + 1..5</strong>
            </span>
          </div>
        </div>
      </footer>

      {/* Interactive Emergency Hotline Modal */}
      {showHotlineModal && (
        <div
          className="hotline-modal-backdrop"
          onClick={() => setShowHotlineModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="hotline-modal-title"
        >
          <div className="hotline-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="hotline-modal-head">
              <div>
                <h3 id="hotline-modal-title" className="hotline-modal-title">
                  Pusat Kontak Darurat Perbankan &amp; OJK
                </h3>
                <p className="hotline-modal-desc">
                  Segera hubungi jika Anda terlanjur klik file .APK atau terancam transaksi mencurigakan.
                </p>
              </div>
              <button
                type="button"
                className="hotline-modal-close"
                onClick={() => setShowHotlineModal(false)}
                aria-label="Tutup modal"
              >
                ✕
              </button>
            </div>

            <div className="hotline-modal-grid">
              {EMERGENCY_HOTLINES.map((h) => (
                <div key={h.name} className="hotline-card-item">
                  <div className="hotline-info">
                    <strong className="hotline-name">
                      {h.name} <span className="hotline-tag">{h.tag}</span>
                    </strong>
                    <span className="hotline-desc">{h.desc}</span>
                    <strong className="hotline-number">{h.phone}</strong>
                  </div>
                  <div className="hotline-card-actions">
                    <a href={`tel:${h.phone}`} className="btn-call-link">
                      Panggil
                    </a>
                    <button
                      type="button"
                      className="btn-copy-link"
                      onClick={() => {
                        navigator.clipboard.writeText(h.phone);
                        setCopiedHotline(h.name);
                        setTimeout(() => setCopiedHotline(''), 2000);
                      }}
                    >
                      {copiedHotline === h.name ? 'Tersalin' : 'Salin'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hotline-modal-foot">
              <span className="hotline-foot-tip">
                Petunjuk: Siapkan nomor rekening dan waktu insiden saat melapor ke pihak bank.
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowHotlineModal(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <GuardianProvider>
      <WorkspaceContent />
    </GuardianProvider>
  );
}
