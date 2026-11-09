import React from 'react';
import { GuardianProvider, useGuardian } from './context/GuardianContext.jsx';
import Navbar from './components/Navbar.jsx';
import ScannerWorkspace from './components/ScannerWorkspace.jsx';
import SimulatorWorkspace from './components/SimulatorWorkspace.jsx';
import DetectiveWorkspace from './components/DetectiveWorkspace.jsx';
import GuideToolkitWorkspace from './components/GuideToolkitWorkspace.jsx';
import GuardianProfileWorkspace from './components/GuardianProfileWorkspace.jsx';

function WorkspaceContent() {
  const { sessionState, navigateToView } = useGuardian();
  const showAll = Boolean(sessionState.showAllViews);
  const activeView = sessionState.activeView || 'scanner';

  const isHidden = (viewKey) => !showAll && activeView !== viewKey;

  const handleFooterNav = (e, viewKey) => {
    e.preventDefault();
    navigateToView(viewKey);
  };

  return (
    <>
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
            <strong className="footer-title">Digital Guardian</strong>
            <p className="footer-note">
              Seluruh skenario percakapan, nomor telepon, dan rekening pada platform ini bersifat fiktif untuk tujuan simulasi edukasi.
            </p>
          </div>
          <div className="footer-links-col">
            <a href="#scanner" onClick={(e) => handleFooterNav(e, 'scanner')}>Pemindai</a>
            <a href="#simulator" onClick={(e) => handleFooterNav(e, 'simulator')}>Scam Simulator</a>
            <a href="#detective" onClick={(e) => handleFooterNav(e, 'detective')}>Scam Detective</a>
            <a href="#guide" onClick={(e) => handleFooterNav(e, 'guide')}>Action Guide</a>
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
