import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadSessionState, saveSessionState, createDefaultSessionState, SESSION_STORAGE_KEY } from '../state/sessionStore.js';
import { computeGuardianPreparedness } from '../engines/scoringEngine.js';

const GuardianContext = createContext(null);

export function GuardianProvider({ children }) {
  const [sessionState, setSessionState] = useState(() => loadSessionState());
  const [activeGuideId, setActiveGuideId] = useState('guide-sit-1');
  const [incidentForwardedBanner, setIncidentForwardedBanner] = useState(null);
  const [reportForm, setReportForm] = useState({
    type: 'File APK Berbahaya (Kurir / Undangan)',
    platform: 'WhatsApp',
    entity: '',
    suspect: '',
    loss: ''
  });

  useEffect(() => {
    saveSessionState(sessionState);
  }, [sessionState]);

  const navigateToView = useCallback((viewName) => {
    const normalized = viewName === 'profile-view' ? 'profile' : viewName;
    setSessionState(prev => ({
      ...prev,
      activeView: normalized
    }));

    const targetId = normalized === 'profile' ? 'profile-view' : normalized;
    requestAnimationFrame(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, []);

  const toggleViewMode = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      showAllViews: !prev.showAllViews
    }));
  }, []);

  const recordScanToHistory = useCallback((rawText, score, fileReportSnapshot = null) => {
    const snippet = rawText.replace(/\s+/g, ' ').slice(0, 65) + (rawText.length > 65 ? '...' : '');
    const entry = {
      snippet,
      rawText,
      score,
      fileReportSnapshot,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
    setSessionState(prev => ({
      ...prev,
      scanHistory: [entry, ...(prev.scanHistory || []).filter(i => i.rawText !== rawText)].slice(0, 5)
    }));
  }, []);

  const clearScanHistory = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      scanHistory: []
    }));
  }, []);

  const recordSimulatorDecision = useCallback((isRisky, completedScenarioKey = null, finalScore = null) => {
    setSessionState(prev => {
      const nextSim = {
        ...prev.simulator,
        safeDecisions: isRisky ? (prev.simulator.safeDecisions || 0) : (prev.simulator.safeDecisions || 0) + 1,
        riskyDecisions: isRisky ? (prev.simulator.riskyDecisions || 0) + 1 : (prev.simulator.riskyDecisions || 0),
        completedScenarios: { ...(prev.simulator.completedScenarios || {}) }
      };
      if (completedScenarioKey && typeof finalScore === 'number') {
        nextSim.completedScenarios[completedScenarioKey] = finalScore;
      }
      return {
        ...prev,
        simulator: nextSim
      };
    });
  }, []);

  const setSimulatorScenario = useCallback((scenarioKey) => {
    setSessionState(prev => ({
      ...prev,
      simulator: {
        ...prev.simulator,
        activeScenario: scenarioKey
      }
    }));
  }, []);

  const saveDetectiveCaseResult = useCallback((caseKey, resultObj) => {
    setSessionState(prev => ({
      ...prev,
      detective: {
        ...prev.detective,
        activeCase: caseKey,
        caseResults: {
          ...(prev.detective.caseResults || {}),
          [caseKey]: resultObj
        }
      }
    }));
  }, []);

  const resetDetectiveCaseResult = useCallback((caseKey) => {
    setSessionState(prev => {
      const nextResults = { ...(prev.detective.caseResults || {}) };
      delete nextResults[caseKey];
      return {
        ...prev,
        detective: {
          ...prev.detective,
          activeCase: caseKey,
          caseResults: nextResults
        }
      };
    });
  }, []);

  const toggleChecklistStep = useCallback((stepId, checked) => {
    setSessionState(prev => ({
      ...prev,
      checklist: {
        ...(prev.checklist || {}),
        [stepId]: checked
      }
    }));
  }, []);

  const resetChecklist = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      checklist: {}
    }));
  }, []);

  /**
   * 1-Click Cross-Module Pipeline:
   * Transfers extracted entities from the Scanner directly into the Action Guide
   * & Official Chronology Report Builder.
   */
  const forwardIncidentToToolkit = useCallback((extractedIncident, guideSitId = 'guide-sit-1') => {
    if (extractedIncident) {
      setReportForm(prev => ({
        ...prev,
        ...extractedIncident
      }));
      setIncidentForwardedBanner({
        type: extractedIncident.type,
        entity: extractedIncident.entity,
        suspect: extractedIncident.suspect,
        guideSitId
      });
    }
    setActiveGuideId(guideSitId);
    setSessionState(prev => ({
      ...prev,
      activeView: 'guide'
    }));

    requestAnimationFrame(() => {
      const detailsEl = document.getElementById(guideSitId);
      if (detailsEl && detailsEl.tagName === 'DETAILS') {
        detailsEl.open = true;
      }
      const guideEl = document.getElementById('guide');
      if (guideEl) {
        guideEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }, []);

  const resetFullSession = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    const fresh = createDefaultSessionState();
    fresh.showAllViews = true;
    setSessionState(fresh);
    setIncidentForwardedBanner(null);
  }, []);

  const preparedness = computeGuardianPreparedness(sessionState);

  return (
    <GuardianContext.Provider
      value={{
        sessionState,
        preparedness,
        activeGuideId,
        setActiveGuideId,
        incidentForwardedBanner,
        setIncidentForwardedBanner,
        reportForm,
        setReportForm,
        navigateToView,
        toggleViewMode,
        recordScanToHistory,
        clearScanHistory,
        recordSimulatorDecision,
        setSimulatorScenario,
        saveDetectiveCaseResult,
        resetDetectiveCaseResult,
        toggleChecklistStep,
        resetChecklist,
        forwardIncidentToToolkit,
        resetFullSession
      }}
    >
      {children}
    </GuardianContext.Provider>
  );
}

export function useGuardian() {
  const ctx = useContext(GuardianContext);
  if (!ctx) {
    throw new Error('useGuardian must be used within a GuardianProvider');
  }
  return ctx;
}
