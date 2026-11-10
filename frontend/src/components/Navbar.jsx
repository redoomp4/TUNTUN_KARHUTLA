import React, { useState, useEffect } from 'react';
import { useGuardian } from '../context/GuardianContext.jsx';

const NAV_ITEMS = [
  {
    key: 'scanner',
    num: '01',
    href: '#scanner',
    id: 'tab-view-scanner',
    label: 'Pemindai',
    desc: 'Bedah SMS, WA, Tautan & File .APK',
    shortcut: 'Alt+1'
  },
  {
    key: 'simulator',
    num: '02',
    href: '#simulator',
    id: 'tab-view-simulator',
    label: 'Simulasi',
    desc: 'Interogasi Chat vs AI Scammer',
    shortcut: 'Alt+2'
  },
  {
    key: 'detective',
    num: '03',
    href: '#detective',
    id: 'tab-view-detective',
    label: 'Detektif',
    desc: 'Otopsi Bukti & Frasa Manipulatif',
    shortcut: 'Alt+3'
  },
  {
    key: 'guide',
    num: '04',
    href: '#guide',
    id: 'tab-view-guide',
    label: 'Panduan',
    desc: 'Protokol Tanggap & Generator Laporan',
    shortcut: 'Alt+4'
  },
  {
    key: 'profile',
    num: '05',
    href: '#profile-view',
    id: 'tab-view-profile',
    label: 'Lanyard ID',
    desc: 'Kartu Identitas & Skor Kesiapan',
    shortcut: 'Alt+5'
  }
];

export default function Navbar() {
  const { sessionState, preparedness, navigateToView, toggleViewMode } = useGuardian();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeView = sessionState.activeView || 'scanner';
  const scoreDisplay = preparedness.hasData ? `${preparedness.avgScore}/100` : '--/100';

  const scanCount = (sessionState.scanHistory || []).length;
  const simDoneCount = Object.keys(sessionState.simulator?.completedScenarios || {}).length;
  const detDoneCount = Object.keys(sessionState.detective?.caseResults || {}).length;

  const getTabMetric = (key) => {
    if (key === 'scanner' && scanCount > 0) return `${scanCount}`;
    if (key === 'simulator' && simDoneCount > 0) return `${simDoneCount}/3`;
    if (key === 'detective' && detDoneCount > 0) return `${detDoneCount}/3`;
    if (key === 'profile' && preparedness.hasData) return `${preparedness.avgScore}`;
    return null;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth > 980 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (e, viewKey) => {
    e.preventDefault();
    navigateToView(viewKey);
    setMobileMenuOpen(false);
  };

  const handleToggleViewMode = () => {
    toggleViewMode();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="site-header" role="banner">
        <div className="site-container header-inner">
          {/* Brand Emblem */}
          <a
            href="#scanner"
            className="brand"
            data-nav-view="scanner"
            aria-label="TUNTUN Beranda Pemindai"
            onClick={(e) => handleNavClick(e, 'scanner')}
          >
            <img
              src="/logo_TUNTUN.jpeg?v=2"
              alt="Logo TUNTUN"
              className="brand-logo-img"
              width="36"
              height="36"
              fetchPriority="high"
            />
            <div className="brand-text-group">
              <span className="brand-name">
                TUNTUN <span className="live-radar-dot" title="Sistem Forensik Aktif" aria-hidden="true" />
              </span>
              <span className="brand-sub">Perisai Forensik Digital</span>
            </div>
          </a>

          {/* Desktop Center: Tactile Anodized Keycap Dock */}
          <nav className="site-nav tactile-dock" aria-label="Navigasi Utama">
            {NAV_ITEMS.map((item) => {
              const metric = getTabMetric(item.key);
              const isActive = activeView === item.key;
              return (
                <a
                  key={item.key}
                  href={item.href}
                  id={item.id}
                  data-app-view={item.key}
                  title={`${item.label} (${item.shortcut})`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`nav-link keycap-tab ${isActive ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, item.key)}
                >
                  <span className="keycap-num">{item.num}</span>
                  <span className="keycap-label">{item.label}</span>
                  {metric !== null && (
                    <span className={`nav-metric-pill ${isActive ? 'active' : ''}`}>
                      {metric}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Actions + Mobile Hamburger Trigger */}
          <div className="header-actions">
            <a
              href="#profile-view"
              className="session-status-link ticket-stub-badge"
              title="Buka Kartu Lanyard & Skor Sesi"
              onClick={(e) => handleNavClick(e, 'profile')}
            >
              <span id="header-session-id" className="stub-code">{sessionState.sessionId}</span>
              <span className="stub-divider" aria-hidden="true" />
              <span id="header-session-score" className="stub-score">Skor {scoreDisplay}</span>
            </a>

            <button
              type="button"
              id="toggle-all-views-btn"
              className="btn btn-secondary btn-sm desktop-only-btn"
              onClick={toggleViewMode}
              title="Ubah mode tampilan layar"
            >
              {sessionState.showAllViews ? 'Mode Fokus' : 'Semua Layar'}
            </button>

            <a
              href="#simulator"
              className="btn btn-primary btn-sm desktop-only-btn"
              onClick={(e) => handleNavClick(e, 'simulator')}
            >
              Uji Simulasi
            </a>

            {/* Mobile Hamburger Button (Visible on <= 980px) */}
            <button
              type="button"
              id="mobile-menu-trigger"
              className={`mobile-hamburger-btn ${mobileMenuOpen ? 'is-open' : ''}`}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-sidebar-drawer"
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <span className="hamburger-box" aria-hidden="true">
                <span className="hamburger-line line-1" />
                <span className="hamburger-line line-2" />
                <span className="hamburger-line line-3" />
              </span>
              <span className="hamburger-text">{mobileMenuOpen ? 'Tutup' : 'Menu'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Sidebar Backdrop & Drawer */}
      <div
        className={`mobile-drawer-backdrop ${mobileMenuOpen ? 'is-open' : ''}`}
        aria-hidden="true"
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        id="mobile-sidebar-drawer"
        className={`mobile-sidebar-drawer ${mobileMenuOpen ? 'is-open' : ''}`}
        aria-label="Menu Samping Mobile"
        aria-hidden={!mobileMenuOpen}
      >
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <img
              src="/logo_TUNTUN.jpeg?v=2"
              alt="Logo TUNTUN"
              className="brand-logo-img"
              width="34"
              height="34"
            />
            <div>
              <strong className="mobile-drawer-title">TUNTUN</strong>
              <span className="mobile-drawer-sub">DOSSIER NAVIGASI UTAMA</span>
            </div>
          </div>
          <button
            type="button"
            className="mobile-drawer-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Tutup sidebar"
          >
            ✕ Tutup
          </button>
        </div>

        {/* Live Session Status Card inside Mobile Drawer */}
        <div className="mobile-drawer-session-card">
          <div className="mobile-session-row">
            <div>
              <span className="mobile-session-kicker">KODE SESI AKTIF</span>
              <strong className="mobile-session-id">{sessionState.sessionId}</strong>
            </div>
            <div className="mobile-session-score-box">
              <span className="mobile-session-kicker">SKOR KESIAPAN</span>
              <strong className="mobile-session-score">{scoreDisplay}</strong>
            </div>
          </div>
          <div className="mobile-session-stats">
            <span>Scan: <strong>{scanCount}</strong></span>
            <span>Simulasi: <strong>{simDoneCount}/3</strong></span>
            <span>Detektif: <strong>{detDoneCount}/3</strong></span>
          </div>
        </div>

        {/* 5-Module Vertical Navigation List */}
        <nav className="mobile-drawer-nav" aria-label="Daftar Modul TUNTUN">
          <span className="mobile-nav-section-label">PILIH MODUL KERJA (01 - 05)</span>
          {NAV_ITEMS.map((item) => {
            const metric = getTabMetric(item.key);
            const isActive = activeView === item.key;
            return (
              <a
                key={item.key}
                href={item.href}
                className={`mobile-nav-card ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => handleNavClick(e, item.key)}
              >
                <span className="mobile-nav-num">{item.num}</span>
                <div className="mobile-nav-copy">
                  <div className="mobile-nav-title-row">
                    <strong>{item.label}</strong>
                    {metric !== null && (
                      <span className="mobile-nav-badge">{metric}</span>
                    )}
                  </div>
                  <span className="mobile-nav-desc">{item.desc}</span>
                </div>
              </a>
            );
          })}
        </nav>

        {/* Drawer Footer Controls & Emergency Hotlines */}
        <div className="mobile-drawer-footer">
          <div className="mobile-drawer-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm btn-block"
              onClick={handleToggleViewMode}
            >
              {sessionState.showAllViews ? 'Aktifkan Mode Fokus (1 Layar)' : 'Tampilkan Semua Layar Sekaligus'}
            </button>
            <a
              href="#simulator"
              className="btn btn-primary btn-sm btn-block"
              onClick={(e) => handleNavClick(e, 'simulator')}
            >
              Mulai Uji Simulasi Interaktif
            </a>
          </div>

          <div className="mobile-emergency-strip">
            <span className="mobile-nav-section-label">PANGGILAN DARURAT RESMI</span>
            <div className="mobile-hotline-chips">
              <a href="tel:157" className="mobile-hotline-pill">OJK 157</a>
              <a href="tel:1500888" className="mobile-hotline-pill">BCA 1500888</a>
              <a href="tel:14017" className="mobile-hotline-pill">BRI 14017</a>
              <a href="tel:14000" className="mobile-hotline-pill">Mandiri 14000</a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
