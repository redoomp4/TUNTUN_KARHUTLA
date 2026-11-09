import React, { useState, useEffect, useRef, useCallback } from 'react';

const CARD_THEMES = {
  obsidian: { id: 'obsidian', label: 'Obsidian', accent: '#074ce0' },
  cobalt: { id: 'cobalt', label: 'Cobalt', accent: '#3b82f6' },
  emerald: { id: 'emerald', label: 'Emerald', accent: '#10b981' }
};

const ROLES = [
  'Forensik Berkas .APK',
  'Pemburu Tautan Phishing',
  'Pertahanan Kredensial OTP'
];

function playTactileClick(freq = 180) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.045);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
    setTimeout(() => ctx.close(), 80);
  } catch {
    // Ignore audio context restrictions
  }
}

/**
 * Interactive Physics-Driven Lanyard ID Card ("TUNTUN Digital Guardian Pass")
 * Features multi-node flexible ribbon curve, holographic foil glare, live callsign/theme
 * customization, and 1-click high-DPI PNG badge export.
 */
export default function GuardianLanyard({
  sessionId = 'SES-0000',
  score = '--',
  tier = 'UNGRADED',
  safeDecisions = 0,
  scanCount = 0,
  detDoneCount = 0
}) {
  const containerRef = useRef(null);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const [agentName, setAgentName] = useState('PENJAGA RUANG DIGITAL');
  const [roleIdx, setRoleIdx] = useState(0);
  const [themeKey, setThemeKey] = useState('obsidian');
  const [flipped, setFlipped] = useState(false);

  const physRef = useRef({
    x: 0,
    y: 0,
    vx: 22,
    vy: 0,
    midX: 0,     // intermediate rope node for realistic whip/curve
    midVx: 0,
    rotZ: 5,
    rotX: 0,
    rotY: 0,
    glareX: 50,
    glareY: 30
  });

  const [renderPos, setRenderPos] = useState({
    x: 0,
    y: 0,
    midX: 0,
    rotZ: 0,
    rotX: 0,
    rotY: 0,
    glareX: 50,
    glareY: 30,
    isDragging: false
  });

  const triggerImpulse = useCallback((vxImpulse = 38, vyImpulse = 16) => {
    physRef.current.vx += vxImpulse;
    physRef.current.vy += vyImpulse;
    physRef.current.midVx += vxImpulse * 0.65;
    playTactileClick(220);
  }, []);

  useEffect(() => {
    triggerImpulse(26, 10);
  }, [score, tier, triggerImpulse]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let rafId;
    const stiffness = 0.082;
    const damping = 0.885;

    const stepPhysics = () => {
      const p = physRef.current;
      if (!draggingRef.current) {
        const ax = -stiffness * p.x;
        const ay = -stiffness * p.y;

        p.vx = (p.vx + ax) * damping;
        p.vy = (p.vy + ay) * damping;
        p.x += p.vx;
        p.y += p.vy;

        // Secondary rope midpoint lags slightly behind card for realistic whip wave
        const targetMidX = p.x * 0.52 - p.vx * 0.9;
        p.midVx = (p.midVx + (targetMidX - p.midX) * 0.18) * 0.82;
        p.midX += p.midVx;

        p.rotZ = p.x * 0.15 + p.vx * 0.24;
        p.rotY = p.x * 0.2;
        p.rotX = -p.y * 0.14;
        p.glareX = Math.max(10, Math.min(90, 50 + p.rotY * 2.2));
        p.glareY = Math.max(10, Math.min(90, 35 - p.rotX * 2.2));
      }

      setRenderPos({
        x: Number(p.x.toFixed(2)),
        y: Number(p.y.toFixed(2)),
        midX: Number(p.midX.toFixed(2)),
        rotZ: Number(p.rotZ.toFixed(2)),
        rotX: Number(p.rotX.toFixed(2)),
        rotY: Number(p.rotY.toFixed(2)),
        glareX: Math.round(p.glareX),
        glareY: Math.round(p.glareY),
        isDragging: draggingRef.current
      });

      rafId = requestAnimationFrame(stepPhysics);
    };

    rafId = requestAnimationFrame(stepPhysics);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handlePointerDown = (e) => {
    if (e.target.closest('button, input')) return;
    draggingRef.current = true;
    playTactileClick(150);
    dragStartRef.current = {
      x: e.clientX - physRef.current.x,
      y: e.clientY - physRef.current.y
    };
    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      physRef.current.rotY = Math.max(-16, Math.min(16, relX * 12));
      physRef.current.rotX = Math.max(-14, Math.min(14, -relY * 10));
      physRef.current.glareX = Math.max(5, Math.min(95, 50 + relX * 40));
      physRef.current.glareY = Math.max(5, Math.min(95, 40 + relY * 40));
      return;
    }

    const rawDx = e.clientX - dragStartRef.current.x;
    const rawDy = e.clientY - dragStartRef.current.y;
    const clampedX = Math.max(-125, Math.min(125, rawDx));
    const clampedY = Math.max(-35, Math.min(105, rawDy));

    physRef.current.vx = (clampedX - physRef.current.x) * 0.38;
    physRef.current.vy = (clampedY - physRef.current.y) * 0.38;
    physRef.current.x = clampedX;
    physRef.current.y = clampedY;
    physRef.current.midX = clampedX * 0.42;
    physRef.current.rotZ = clampedX * 0.17;
  };

  const handlePointerUp = () => {
    if (draggingRef.current) {
      playTactileClick(260);
    }
    draggingRef.current = false;
  };

  const tierLabel =
    tier === 'RESILIENT'
      ? 'Guardian Tangguh'
      : tier === 'MODERATE'
        ? 'Waspada Aktif'
        : tier === 'VULNERABLE'
          ? 'Perlu Latihan'
          : 'Lisensi Sesi';

  const tierStatusClass =
    tier === 'RESILIENT'
      ? 'lanyard-status-safe'
      : tier === 'VULNERABLE'
        ? 'lanyard-status-danger'
        : 'lanyard-status-normal';

  const handleDownloadBadgePng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background Card
    const grad = ctx.createLinearGradient(0, 0, 640, 920);
    if (themeKey === 'cobalt') {
      grad.addColorStop(0, '#0f2557');
      grad.addColorStop(1, '#09132c');
    } else if (themeKey === 'emerald') {
      grad.addColorStop(0, '#0c3b2e');
      grad.addColorStop(1, '#071f18');
    } else {
      grad.addColorStop(0, '#1f242d');
      grad.addColorStop(1, '#12151b');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 920);

    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, 604, 884);

    // Header text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('TUNTUN: DIGITAL GUARDIAN', 48, 92);
    ctx.fillStyle = '#9ea6b5';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Status: ${tierLabel} • ID: ${sessionId}`, 48, 130);

    // Agent Name & Role
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText((agentName || 'PENJAGA SIBER').toUpperCase().slice(0, 24), 48, 220);
    ctx.fillStyle = '#60a5fa';
    ctx.font = '22px sans-serif';
    ctx.fillText(`Divisi: ${ROLES[roleIdx]}`, 48, 258);

    // Score Box
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(48, 310, 544, 210);
    ctx.fillStyle = '#9ea6b5';
    ctx.font = '22px sans-serif';
    ctx.fillText('INDEKS KESIAPSIAGAAN KEAMANAN SIBER', 80, 365);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 86px sans-serif';
    ctx.fillText(`${score} / 100`, 80, 470);

    // Telemetry
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#d0d5dd';
    ctx.fillText(`Keputusan Aman Simulator : ${safeDecisions}`, 48, 600);
    ctx.fillText(`Pesan & Berkas Dipindai  : ${scanCount}`, 48, 650);
    ctx.fillText(`Investigasi Kasus Bukti  : ${detDoneCount} / 3`, 48, 700);

    // Footer barcode
    ctx.fillStyle = '#9ea6b5';
    ctx.font = '18px monospace';
    ctx.fillText(`VERIFIED PASS • TUNTUN-${sessionId}`, 48, 845);

    const link = document.createElement('a');
    link.download = `Kartu-TUNTUN-${sessionId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const anchorX = 150;
  const claspX = Math.max(30, Math.min(270, 150 + renderPos.x * 0.68));
  const claspY = Math.max(54, Math.min(118, 86 + renderPos.y * 0.38));
  const ctrlX = Math.max(30, Math.min(270, 150 + renderPos.midX * 0.85));

  return (
    <div
      ref={containerRef}
      className="lanyard-stage"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerUp}
      aria-label="Kartu Lanyard Interaktif TUNTUN"
    >
      {/* Interactive Customizer & Controls Bar */}
      <div className="lanyard-stage-toolbar">
        <div className="lanyard-customizer-row">
          <input
            type="text"
            className="lanyard-name-input"
            maxLength={22}
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            placeholder="Ketik nama Anda di kartu..."
            aria-label="Nama pada kartu Lanyard"
          />
          <button
            type="button"
            className="btn btn-secondary-dark btn-sm"
            onClick={() => {
              setRoleIdx((prev) => (prev + 1) % ROLES.length);
              triggerImpulse(20, 8);
            }}
            title="Ganti divisi keahlian pada kartu"
          >
            Divisi: {ROLES[roleIdx].split(' ')[0]}
          </button>
          <button
            type="button"
            className="btn btn-secondary-dark btn-sm"
            onClick={() => {
              const keys = Object.keys(CARD_THEMES);
              const next = keys[(keys.indexOf(themeKey) + 1) % keys.length];
              setThemeKey(next);
              playTactileClick(240);
            }}
          >
            Tema: {CARD_THEMES[themeKey].label}
          </button>
        </div>

        <div className="lanyard-toolbar-btns">
          <button
            type="button"
            className="btn btn-secondary-dark btn-sm"
            onClick={() => triggerImpulse(46, 20)}
          >
            Ayunkan
          </button>
          <button
            type="button"
            className="btn btn-secondary-dark btn-sm"
            onClick={() => {
              setFlipped(prev => !prev);
              playTactileClick(200);
            }}
          >
            {flipped ? 'Depan' : 'Balik'}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleDownloadBadgePng}
          >
            Unduh Kartu (.PNG)
          </button>
        </div>
      </div>

      {/* Multi-Node Flexible Woven Lanyard Ribbon */}
      <svg
        className="lanyard-strap-svg"
        viewBox="0 0 300 118"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="tuntunStrapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6a11cb" />
            <stop offset="55%" stopColor="#074ce0" />
            <stop offset="100%" stopColor="#1d2939" />
          </linearGradient>
        </defs>

        {/* Top Mount Anchor */}
        <rect x={anchorX - 24} y="0" width="48" height="7" rx="3" fill="#475467" />

        {/* Left & Right Flexible Straps with Whip Midpoint Control */}
        <path
          d={`M ${anchorX - 18} 4 Q ${ctrlX - 14} 48 ${claspX - 8} ${claspY}`}
          fill="none"
          stroke="url(#tuntunStrapGrad)"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <path
          d={`M ${anchorX + 18} 4 Q ${ctrlX + 14} 48 ${claspX + 8} ${claspY}`}
          fill="none"
          stroke="url(#tuntunStrapGrad)"
          strokeWidth="13"
          strokeLinecap="round"
        />

        {/* Metallic Stitch Accent on Strap */}
        <path
          d={`M ${claspX - 11} ${claspY - 6} L ${claspX + 11} ${claspY - 6}`}
          stroke="#98a2b3"
          strokeWidth="2"
          strokeDasharray="3 2"
        />

        {/* Metallic Swivel Clasp */}
        <rect
          x={claspX - 15}
          y={claspY - 4}
          width="30"
          height="10"
          rx="3"
          fill="#e4e7ec"
          stroke="#475467"
          strokeWidth="1.5"
        />
        <rect
          x={claspX - 5}
          y={claspY + 5}
          width="10"
          height="13"
          rx="2.5"
          fill="#98a2b3"
        />
      </svg>

      {/* Physics-Driven 3D ID Pass Card */}
      <div
        className={`lanyard-card-rig theme-${themeKey} ${renderPos.isDragging ? 'is-dragging' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translate3d(${renderPos.x}px, ${renderPos.y}px, 0) rotateZ(${renderPos.rotZ}deg) rotateX(${renderPos.rotX}deg) rotateY(${renderPos.rotY + (flipped ? 180 : 0)}deg)`
        }}
      >
        <div className="lanyard-punch-slot" aria-hidden="true" />

        {/* Dynamic Holographic Foil Glare Overlay */}
        <div
          className="lanyard-holo-glare"
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle at ${renderPos.glareX}% ${renderPos.glareY}%, rgba(255, 255, 255, 0.18), rgba(7, 76, 224, 0.08) 42%, transparent 70%)`
          }}
        />

        {!flipped ? (
          <div className="lanyard-card-face lanyard-card-front">
            <div className="lanyard-card-top">
              <div className="lanyard-brand-row">
                <img
                  src="/logo_TUNTUN.jpeg"
                  alt="Logo TUNTUN"
                  className="lanyard-logo"
                  width="30"
                  height="30"
                  draggable="false"
                />
                <div>
                  <strong className="lanyard-brand-title">TUNTUN</strong>
                  <span className="lanyard-brand-sub">Guardian ID Pass</span>
                </div>
              </div>
              <span className={`lanyard-tier-tag ${tierStatusClass}`}>
                {tierLabel}
              </span>
            </div>

            {/* Personalized Agent Identity Strip */}
            <div className="lanyard-agent-strip">
              <div className="lanyard-agent-info">
                <strong className="lanyard-agent-name">
                  {agentName.trim() || 'PENJAGA SIBER'}
                </strong>
                <span className="lanyard-agent-role">{ROLES[roleIdx]}</span>
              </div>
              <span className="lanyard-holo-chip" aria-hidden="true">CHIP</span>
            </div>

            <div className="lanyard-score-center">
              <span className="lanyard-score-caption">Skor Kesiapsiagaan</span>
              <div className="lanyard-score-giant">
                <span>{score}</span>
                <small>/ 100</small>
              </div>
            </div>

            <div className="lanyard-telemetry-grid">
              <div className="lanyard-tel-cell">
                <span>ID Sesi</span>
                <strong>{sessionId}</strong>
              </div>
              <div className="lanyard-tel-cell">
                <span>Respon Aman</span>
                <strong>{safeDecisions}</strong>
              </div>
              <div className="lanyard-tel-cell">
                <span>Dipindai</span>
                <strong>{scanCount}</strong>
              </div>
              <div className="lanyard-tel-cell">
                <span>Detektif</span>
                <strong>{detDoneCount}/3</strong>
              </div>
            </div>

            <div className="lanyard-barcode-footer" aria-hidden="true">
              <svg width="100%" height="20" viewBox="0 0 220 20" preserveAspectRatio="none">
                {[4, 12, 18, 28, 34, 46, 52, 60, 72, 78, 88, 96, 108, 114, 124, 136, 142, 152, 164, 172, 180, 192, 200, 210].map((x, idx) => (
                  <rect
                    key={idx}
                    x={x}
                    y="2"
                    width={idx % 3 === 0 ? '4' : '2'}
                    height="16"
                    fill="rgba(245, 247, 250, 0.7)"
                  />
                ))}
              </svg>
              <span className="lanyard-barcode-id">TUNTUN-{sessionId} • TARIK KARTU UNTUK AYUNAN</span>
            </div>
          </div>
        ) : (
          <div
            className="lanyard-card-face lanyard-card-back"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="lanyard-card-top">
              <strong className="lanyard-brand-title">Protokol Cepat TUNTUN</strong>
              <span className="lanyard-tier-tag lanyard-status-normal">OJK 157</span>
            </div>
            <ul className="lanyard-back-list">
              <li>1. Tolak semua file .APK dari kurir/undangan WA.</li>
              <li>2. Aktifkan Mode Pesawat jika .APK terlanjur terpasang.</li>
              <li>3. Jangan pernah sebutkan OTP, PIN, atau CVV.</li>
              <li>4. Hubungi Call Center bank resmi / OJK 157.</li>
            </ul>
            <div className="lanyard-barcode-footer">
              <span className="lanyard-barcode-id">100% Lokal Tanpa Pengumpulan Data (NFR-07)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
