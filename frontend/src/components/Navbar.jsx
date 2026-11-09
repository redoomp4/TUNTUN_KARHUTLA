import React from 'react';
import { useGuardian } from '../context/GuardianContext.jsx';
import { ACTION_GUIDE_SITUATIONS } from '../data/emergencyDirectory.js';

const NAV_ITEMS = [
  { key: 'scanner', href: '#scanner', id: 'tab-view-scanner', label: 'Pemindai', shortcut: 'Alt+1' },
  { key: 'simulator', href: '#simulator', id: 'tab-view-simulator', label: 'Simulasi', shortcut: 'Alt+2' },
  { key: 'detective', href: '#detective', id: 'tab-view-detective', label: 'Detektif', shortcut: 'Alt+3' },
  { key: 'guide', href: '#guide', id: 'tab-view-guide', label: 'Panduan', shortcut: 'Alt+4' },
  { key: 'profile', href: '#profile-view', id: 'tab-view-profile', label: 'Profil & ID', shortcut: 'Alt+5' }
];

export default function Navbar() {
  const { sessionState, preparedness, navigateToView, toggleViewMode } = useGuardian();
  const activeView = sessionState.activeView || 'scanner';
  const scoreDisplay = preparedness.hasData ? `Skor ${preparedness.avgScore}` : 'Skor --';

  const scanCount = (sessionState.scanHistory || []).length;
  const simDoneCount = Object.keys(sessionState.simulator?.completedScenarios || {}).length;
  const detDoneCount = Object.keys(sessionState.detective?.caseResults || {}).length;
  const totalSteps = ACTION_GUIDE_SITUATIONS.reduce((acc, sit) => acc + sit.steps.length, 0);
  const checkedCount = Object.values(sessionState.checklist || {}).filter(Boolean).length;
  const guidePct = totalSteps > 0 ? Math.round((checkedCount / totalSteps) * 100) : 0;

  const getTabMetric = (key) => {
    if (key === 'scanner' && scanCount > 0) return `${scanCount}`;
    if (key === 'simulator') return `${simDoneCount}/3`;
    if (key === 'detective') return `${detDoneCount}/3`;
    if (key === 'guide' && guidePct > 0) return `${guidePct}%`;
    if (key === 'profile' && preparedness.hasData) return `${preparedness.avgScore}`;
    return null;
  };

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
          aria-label="TUNTUN"
          onClick={(e) => handleNavClick(e, 'scanner')}
        >
          <img
            src="/logo_TUNTUN.jpeg"
            alt="Logo TUNTUN"
            className="brand-logo-img"
            width="32"
            height="32"
            fetchPriority="high"
          />
          <span className="brand-name">TUNTUN</span>
        </a>

        <nav className="site-nav" aria-label="Navigasi Utama">
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
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, item.key)}
              >
                <span>{item.label}</span>
                {metric !== null && (
                  <span className={`nav-metric-pill ${isActive ? 'active' : ''}`}>
                    {metric}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        <div className="header-actions">
          <a
            href="#profile-view"
            className="session-status-link"
            title="Buka Kartu Lanyard & Skor Sesi"
            onClick={(e) => handleNavClick(e, 'profile')}
          >
            <span className="session-live-dot" aria-hidden="true" />
            <span id="header-session-id" className="sr-only">{sessionState.sessionId}</span>
            <span id="header-session-score">{scoreDisplay}</span>
          </a>
          <button
            type="button"
            id="toggle-all-views-btn"
            className="btn btn-secondary btn-sm"
            onClick={toggleViewMode}
            title="Ubah tampilan halaman"
          >
            {sessionState.showAllViews ? 'Fokus' : 'Semua'}
          </button>
          <a
            href="#simulator"
            className="btn btn-primary btn-sm"
            onClick={(e) => handleNavClick(e, 'simulator')}
          >
            Mulai
          </a>
        </div>
      </div>
    </header>
  );
}
