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

function WorkspaceContent() {
  const { sessionState, navigateToView } = useGuardian();
  const showAll = Boolean(sessionState.showAllViews);
  const activeView = sessionState.activeView || 'scanner';

  const isHidden = (viewKey) => !showAll && activeView !== viewKey;

  useEffect(() => {
    const handleKeyDown = (e) => {
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
  }, [navigateToView]);

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

      <footer className="site-footer" role="contentinfo">
        <div className="site-container footer-inner">
          <div className="footer-brand-col">
            <div className="footer-brand-head">
              <img
                src="/logo_TUNTUN.jpeg"
                alt="Logo TUNTUN"
                className="footer-logo-img"
                width="28"
                height="28"
              />
              <strong className="footer-title">TUNTUN: Digital Guardian</strong>
            </div>
            <p className="footer-note">
              Seluruh skenario dan nomor bersifat fiktif untuk edukasi (NFR-06/12). Diproses 100% lokal di perangkat Anda tanpa menyimpan data pribadi (NFR-07).
            </p>
            <div className="footer-telemetry-bar" aria-label="Status Kebutuhan Non-Fungsional Sistem">
              <span>Respons &lt; 2 dtk (NFR-03)</span>
              <span>Anti-XSS (NFR-05)</span>
              <span>Pintasan: Alt+1..5</span>
            </div>
          </div>
          <div className="footer-links-col">
            <a href="#scanner" onClick={(e) => handleFooterNav(e, 'scanner')}>Pemindai</a>
            <a href="#simulator" onClick={(e) => handleFooterNav(e, 'simulator')}>Simulasi</a>
            <a href="#detective" onClick={(e) => handleFooterNav(e, 'detective')}>Detektif</a>
            <a href="#guide" onClick={(e) => handleFooterNav(e, 'guide')}>Panduan</a>
            <a href="#profile-view" onClick={(e) => handleFooterNav(e, 'profile')}>Profil &amp; ID</a>
            <a href="https://cekrekening.id" target="_blank" rel="noopener noreferrer">CekRekening.id</a>
            <a href="https://patrolisiber.id" target="_blank" rel="noopener noreferrer">Patroli Siber</a>
          </div>
        </div>
      </footer>
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
