import React from 'react';
import { useGuardian } from '../context/GuardianContext.jsx';

const NAV_ITEMS = [
  { key: 'scanner', href: '#scanner', id: 'tab-view-scanner', label: 'Pemindai' },
  { key: 'simulator', href: '#simulator', id: 'tab-view-simulator', label: 'Scam Simulator' },
  { key: 'detective', href: '#detective', id: 'tab-view-detective', label: 'Scam Detective' },
  { key: 'guide', href: '#guide', id: 'tab-view-guide', label: 'Action Guide' },
  { key: 'profile', href: '#profile-view', id: 'tab-view-profile', label: 'Guardian Profile' }
];

export default function Navbar() {
  const { sessionState, preparedness, navigateToView, toggleViewMode } = useGuardian();
  const activeView = sessionState.activeView || 'scanner';
  const scoreDisplay = preparedness.hasData ? `Skor sesi: ${preparedness.avgScore}/100` : 'Skor sesi: --/100';

  const handleNavClick = (e, viewKey) => {
    e.preventDefault();
    navigateToView(viewKey);
  };

  return (
    <header className="site-header" role="banner">
      <div className="site-container header-inner">
        <a
          href="#scanner"
          className="brand"
          data-nav-view="scanner"
          aria-label="Digital Guardian"
          onClick={(e) => handleNavClick(e, 'scanner')}
        >
          <span className="brand-shield" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <span className="brand-name">Digital Guardian</span>
        </a>

        <nav className="site-nav" aria-label="Navigasi Utama">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              id={item.id}
              data-app-view={item.key}
              className={`nav-link ${activeView === item.key ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, item.key)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a
            href="#profile-view"
            className="session-status-link"
            title="Ringkasan sesi aktif"
            onClick={(e) => handleNavClick(e, 'profile')}
          >
            <span id="header-session-id" className="sr-only">{sessionState.sessionId}</span>
            <span id="header-session-score">{scoreDisplay}</span>
          </a>
          <button
            type="button"
            id="toggle-all-views-btn"
            className="btn btn-secondary btn-sm"
            onClick={toggleViewMode}
            title="Beralih antara mode semua bagian atau fokus satu modul"
          >
            {sessionState.showAllViews ? 'Mode fokus' : 'Semua bagian'}
          </button>
          <a
            href="#simulator"
            className="btn btn-primary btn-sm"
            onClick={(e) => handleNavClick(e, 'simulator')}
          >
            Mulai Simulasi
          </a>
        </div>
      </div>
    </header>
  );
}
