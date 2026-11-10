import React, { useState, useEffect, useRef, useCallback } from 'react';

const AGE_PROFILES = {
  remaja: {
    id: 'remaja',
    label: 'Remaja',
    badge: 'MODE REMAJA',
    defaultRole: 'Anti Phishing Game & Kerja VIP',
    goldenRules: [
      'Jangan pernah top-up deposit untuk komisi kerja paruh waktu atau hadiah game.',
      'Jangan bagikan kode OTP atau login akun di situs yang dikirim lewat chat.',
      'Tanyakan ke orang tua dulu sebelum mentransfer uang ke siapa pun.'
    ]
  },
  dewasa: {
    id: 'dewasa',
    label: 'Orang Tua',
    badge: 'PERISAI KELUARGA',
    defaultRole: 'Anti File .APK Kurir & Phishing Bank',
    goldenRules: [
      'Kurir paket & undangan resmi TIDAK PERNAH mengirim file berakhiran .APK.',
      'Jika telanjur klik file .APK, segera nyalakan MODE PESAWAT di HP Anda.',
      'Telepon langsung nomor anak/keluarga jika ada yang meminta uang darurat.'
    ]
  },
  lansia: {
    id: 'lansia',
    label: 'Lansia (A+)',
    badge: 'MODE LANSIA (TEKS BESAR)',
    defaultRole: 'Panduan Jelas Ramah Lansia',
    goldenRules: [
      'JANGAN KLIK file paket atau undangan di WhatsApp.',
      'JANGAN SEBUTKAN 6 angka SMS (OTP) atau PIN ke penelepon.',
      'TEKAN tombol Tanya Wali di kartu ini sebelum kirim uang.'
    ]
  }
};

const BANK_HOTLINES = {
  bri: { id: 'bri', name: 'BRI', phone: '14017', tel: 'tel:14017' },
  bca: { id: 'bca', name: 'BCA', phone: '1500888', tel: 'tel:1500888' },
  mandiri: { id: 'mandiri', name: 'Mandiri', phone: '14000', tel: 'tel:14000' },
  bni: { id: 'bni', name: 'BNI', phone: '1500046', tel: 'tel:1500046' },
  bsi: { id: 'bsi', name: 'BSI', phone: '14040', tel: 'tel:14040' },
  ewallet: { id: 'ewallet', name: 'DANA/OJK', phone: '157', tel: 'tel:157' }
};

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
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
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

  const [holderName, setHolderName] = useState('KELUARGA INDONESIA');
  const [ageKey, setAgeKey] = useState('dewasa');
  const [bankKey, setBankKey] = useState('bri');
  const [guardianPhone, setGuardianPhone] = useState('0812-3456-7890');
  const [flipped, setFlipped] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const activeAge = AGE_PROFILES[ageKey] || AGE_PROFILES.dewasa;
  const activeBank = BANK_HOTLINES[bankKey] || BANK_HOTLINES.bri;
  const isSeniorMode = ageKey === 'lansia';

  const physRef = useRef({
    x: 0,
    y: 0,
    vx: 24,
    vy: 6,
    midX: 0,
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

  const triggerImpulse = useCallback((vxImpulse = 38, vyImpulse = 14) => {
    physRef.current.vx += vxImpulse;
    physRef.current.vy += vyImpulse;
    physRef.current.midVx += vxImpulse * 0.65;
    playTactileClick(210);
  }, []);

  useEffect(() => {
    triggerImpulse(24, 10);
  }, [score, tier, ageKey, triggerImpulse]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let rafId;
    const stiffness = 0.085;
    const damping = 0.89;

    const stepPhysics = () => {
      const p = physRef.current;
      if (!draggingRef.current) {
        const ax = -stiffness * p.x;
        const ay = -stiffness * p.y;

        p.vx = (p.vx + ax) * damping;
        p.vy = (p.vy + ay) * damping;
        p.x += p.vx;
        p.y += p.vy;

        const targetMidX = p.x * 0.54 - p.vx * 0.9;
        p.midVx = (p.midVx + (targetMidX - p.midX) * 0.18) * 0.84;
        p.midX += p.midVx;

        p.rotZ = p.x * 0.15 + p.vx * 0.22;
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
    if (e.target.closest('button, input, select, a')) return;
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
        // Ignore capture error
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
      physRef.current.glareX = Math.max(8, Math.min(92, 50 + relX * 38));
      physRef.current.glareY = Math.max(8, Math.min(92, 40 + relY * 38));
      return;
    }

    const rawDx = e.clientX - dragStartRef.current.x;
    const rawDy = e.clientY - dragStartRef.current.y;
    const clampedX = Math.max(-115, Math.min(115, rawDx));
    const clampedY = Math.max(-30, Math.min(95, rawDy));

    physRef.current.vx = (clampedX - physRef.current.x) * 0.38;
    physRef.current.vy = (clampedY - physRef.current.y) * 0.38;
    physRef.current.x = clampedX;
    physRef.current.y = clampedY;
    physRef.current.midX = clampedX * 0.42;
    physRef.current.rotZ = clampedX * 0.16;
  };

  const handlePointerUp = () => {
    if (draggingRef.current) {
      playTactileClick(250);
    }
    draggingRef.current = false;
  };

  const handleSpeakEmergencyGuide = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const speechText = [
      `Kartu Darurat TUNTUN milik ${holderName || 'Keluarga'}.`,
      `Satu: ${activeAge.goldenRules[0]}`,
      `Dua: ${activeAge.goldenRules[1]}`,
      `Tiga: ${activeAge.goldenRules[2]}`,
      `Hubungi ${activeBank.name} di ${activeBank.phone.split('').join(' ')} atau OJK 1 5 7.`
    ].join(' ');

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'id-ID';
    utterance.rate = isSeniorMode ? 0.88 : 0.96;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleShareWhatsApp = () => {
    const cleanGuardian = (guardianPhone || '').replace(/[^0-9]/g, '');
    const waPhone = cleanGuardian.startsWith('0')
      ? `62${cleanGuardian.slice(1)}`
      : cleanGuardian;

    const text = [
      `*KARTU DARURAT ANTI-PENIPUAN TUNTUN*`,
      `Pemegang: *${holderName || 'Keluarga'}* (${activeAge.label})`,
      `Hotline Blokir ${activeBank.name}: *${activeBank.phone}* | OJK: *157*`,
      `Kontak Wali Keluarga: *${guardianPhone || '-'}*`,
      ``,
      `*3 Aturan Penting:*`,
      `1. ${activeAge.goldenRules[0]}`,
      `2. ${activeAge.goldenRules[1]}`,
      `3. ${activeAge.goldenRules[2]}`
    ].join('\n');

    navigator.clipboard?.writeText(text);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);

    const url = waPhone.length >= 9
      ? `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadBadgePng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 680;
    canvas.height = 960;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 680, 960);
    grad.addColorStop(0, '#181c24');
    grad.addColorStop(1, '#0f1218');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 680, 960);

    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 32, 616, 896);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('TUNTUN • KARTU S.O.S. KELUARGA', 60, 95);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    ctx.fillText(`${activeAge.badge} • ID: ${sessionId}`, 60, 130);

    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(60, 160, 560, 120);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText((holderName || 'KELUARGA INDONESIA').toUpperCase().slice(0, 24), 84, 212);
    ctx.fillStyle = '#93c5fd';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Skor Kesiapan: ${score}/100 | ${activeAge.defaultRole}`, 84, 250);

    ctx.fillStyle = 'rgba(7, 76, 224, 0.18)';
    ctx.fillRect(60, 305, 560, 140);
    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('NOMOR RESMI BLOKIR REKENING & WALI DARURAT:', 84, 345);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`Bank ${activeBank.name}: ${activeBank.phone}  |  OJK: 157`, 84, 390);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '22px sans-serif';
    ctx.fillText(`Wali Keluarga: ${guardianPhone || '-'}`, 84, 425);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('3 LANGKAH PENYELAMATAN CEPAT:', 60, 505);

    activeAge.goldenRules.forEach((rule, idx) => {
      const yBase = 555 + idx * 90;
      ctx.fillStyle = '#60a5fa';
      ctx.font = 'bold 21px sans-serif';
      ctx.fillText(`0${idx + 1}.`, 60, yBase);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '20px sans-serif';
      ctx.fillText(rule.slice(0, 54), 100, yBase);
      if (rule.length > 54) {
        ctx.fillText(rule.slice(54, 110), 100, yBase + 28);
      }
    });

    ctx.fillStyle = '#64748b';
    ctx.font = '16px monospace';
    ctx.fillText(`TUNTUN DIGITAL GUARDIAN • ${sessionId}`, 60, 895);

    const link = document.createElement('a');
    link.download = `Kartu-SOS-TUNTUN-${sessionId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const tierLabel =
    tier === 'RESILIENT'
      ? 'Tangguh'
      : tier === 'MODERATE'
        ? 'Waspada'
        : tier === 'VULNERABLE'
          ? 'Latihan'
          : 'Aktif';

  const anchorX = 150;
  const claspX = Math.max(36, Math.min(264, 150 + renderPos.x * 0.65));
  const claspY = Math.max(48, Math.min(98, 74 + renderPos.y * 0.35));
  const ctrlX = Math.max(36, Math.min(264, 150 + renderPos.midX * 0.82));

  return (
    <div
      ref={containerRef}
      className={`lanyard-stage ${isSeniorMode ? 'lanyard-senior-mode' : ''}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerUp}
      aria-label="Kartu Lanyard Interaktif TUNTUN"
    >
      {/* Compact Top Control Bar */}
      <div className="lanyard-compact-controls">
        <div className="lanyard-age-selector" role="group" aria-label="Pilih Usia">
          {Object.values(AGE_PROFILES).map((prof) => (
            <button
              key={prof.id}
              type="button"
              className={`lanyard-age-pill ${ageKey === prof.id ? 'active' : ''}`}
              onClick={() => {
                setAgeKey(prof.id);
                triggerImpulse(22, 8);
              }}
            >
              {prof.label}
            </button>
          ))}
        </div>

        <div className="lanyard-inputs-inline">
          <input
            type="text"
            className="lanyard-name-input"
            maxLength={20}
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            placeholder="Nama pemegang..."
            aria-label="Nama pemegang"
          />
          <select
            className="lanyard-select-input"
            value={bankKey}
            onChange={(e) => setBankKey(e.target.value)}
            aria-label="Pilih Bank"
          >
            {Object.values(BANK_HOTLINES).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.phone})
              </option>
            ))}
          </select>
          <input
            type="text"
            className="lanyard-name-input"
            maxLength={16}
            value={guardianPhone}
            onChange={(e) => setGuardianPhone(e.target.value)}
            placeholder="No. WA Wali..."
            aria-label="Nomor Wali Keluarga"
          />
        </div>
      </div>

      {/* Sleek 3D Woven Lanyard Strap + Brushed Metal Clasp */}
      <svg className="lanyard-strap-svg" viewBox="0 0 300 100" aria-hidden="true">
        <defs>
          <linearGradient id="cleanStrapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#074ce0" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <rect x={anchorX - 26} y="0" width="52" height="6" rx="3" fill="#475569" />
        <path
          d={`M ${anchorX - 18} 4 Q ${ctrlX - 12} 40 ${claspX - 6} ${claspY}`}
          fill="none"
          stroke="url(#cleanStrapGrad)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d={`M ${anchorX + 18} 4 Q ${ctrlX + 12} 40 ${claspX + 6} ${claspY}`}
          fill="none"
          stroke="url(#cleanStrapGrad)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <rect
          x={claspX - 14}
          y={claspY - 5}
          width="28"
          height="9"
          rx="2.5"
          fill="#cbd5e1"
          stroke="#334155"
          strokeWidth="1.2"
        />
        <rect
          x={claspX - 5}
          y={claspY + 3}
          width="10"
          height="11"
          rx="2"
          fill="#94a3b8"
        />
      </svg>

      {/* Physics-Driven 3D ID Card */}
      <div
        className={`lanyard-card-rig ${renderPos.isDragging ? 'is-dragging' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translate3d(${renderPos.x}px, ${renderPos.y}px, 0) rotateZ(${renderPos.rotZ}deg) rotateX(${renderPos.rotX}deg) rotateY(${renderPos.rotY + (flipped ? 180 : 0)}deg)`
        }}
      >
        <div className="lanyard-punch-slot" aria-hidden="true" />

        <div
          className="lanyard-holo-glare"
          aria-hidden="true"
          style={{
            background: `radial-gradient(circle at ${renderPos.glareX}% ${renderPos.glareY}%, rgba(255, 255, 255, 0.22), rgba(96, 165, 250, 0.14) 40%, rgba(244, 114, 182, 0.08) 60%, transparent 75%)`
          }}
        />
        <div
          className="lanyard-holo-foil"
          aria-hidden="true"
          style={{
            background: `linear-gradient(${120 + renderPos.rotY * 4}deg, rgba(255, 255, 255, 0.04) 0%, rgba(96, 165, 250, 0.12) 35%, rgba(236, 72, 153, 0.08) 65%, transparent 100%)`
          }}
        />

        {!flipped ? (
          <div className="lanyard-card-face lanyard-card-front">
            <div className="lanyard-card-top">
              <div className="lanyard-brand-row">
                <img
                  src="/logo_TUNTUN.jpeg?v=2"
                  alt="Logo TUNTUN"
                  className="lanyard-logo"
                  width="28"
                  height="28"
                  draggable="false"
                />
                <div>
                  <strong className="lanyard-brand-title">TUNTUN PASS</strong>
                  <span className="lanyard-brand-sub">{activeAge.badge}</span>
                </div>
              </div>
              <span className="lanyard-tier-tag lanyard-status-normal">
                {tierLabel} • {score}/100
              </span>
            </div>

            <div className="lanyard-agent-strip">
              <div className="lanyard-agent-info">
                <strong className="lanyard-agent-name">
                  {holderName.trim() || 'KELUARGA INDONESIA'}
                </strong>
                <span className="lanyard-agent-role">{activeAge.defaultRole}</span>
              </div>
              <svg className="lanyard-emv-chip" width="32" height="24" viewBox="0 0 38 28" aria-hidden="true">
                <rect x="1" y="1" width="36" height="26" rx="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="13" y1="1" x2="13" y2="27" stroke="#64748b" strokeWidth="1" />
                <line x1="25" y1="1" x2="25" y2="27" stroke="#64748b" strokeWidth="1" />
                <line x1="1" y1="14" x2="37" y2="14" stroke="#64748b" strokeWidth="1" />
              </svg>
            </div>

            {/* Clean Quick-Dial Emergency Hotline Box */}
            <div className="lanyard-sos-hotline-box">
              <div className="lanyard-sos-row">
                <div>
                  <span className="lanyard-sos-label">CALL CENTER {activeBank.name}</span>
                  <strong className="lanyard-sos-number">{activeBank.phone} / OJK 157</strong>
                </div>
                <a href={activeBank.tel} className="lanyard-sos-call-btn">
                  Panggil Bank
                </a>
              </div>
              <div className="lanyard-sos-row lanyard-sos-family">
                <div>
                  <span className="lanyard-sos-label">WALI KELUARGA DARURAT</span>
                  <strong className="lanyard-sos-guardian">{guardianPhone || '-'}</strong>
                </div>
                <a
                  href={`tel:${(guardianPhone || '').replace(/[^0-9+]/g, '')}`}
                  className="lanyard-sos-call-btn family-btn"
                >
                  Tanya Wali
                </a>
              </div>
            </div>

            <div className="lanyard-barcode-footer">
              <span className="lanyard-barcode-id">
                ID: {sessionId} • Scan: {scanCount} • Aman: {safeDecisions} • Detektif: {detDoneCount}/3
              </span>
            </div>
          </div>
        ) : (
          <div
            className="lanyard-card-face lanyard-card-back"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className="lanyard-card-top">
              <strong className="lanyard-brand-title">3 Aturan Darurat ({activeAge.label})</strong>
              <span className="lanyard-tier-tag lanyard-status-safe">S.O.S.</span>
            </div>

            <ol className="lanyard-back-list">
              {activeAge.goldenRules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
            </ol>

            <div className="lanyard-barcode-footer">
              <span className="lanyard-barcode-id">
                Blokir {activeBank.name}: {activeBank.phone} • OJK: 157
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Compact Action Footer */}
      <div className="lanyard-export-bar">
        <button
          type="button"
          className="btn btn-secondary-dark btn-sm"
          onClick={() => {
            setFlipped((prev) => !prev);
            triggerImpulse(26, 8);
          }}
        >
          {flipped ? 'Lihat Depan' : 'Balik Kartu'}
        </button>
        <button
          type="button"
          className={`btn btn-secondary-dark btn-sm ${speaking ? 'lanyard-speaking-active' : ''}`}
          onClick={handleSpeakEmergencyGuide}
        >
          {speaking ? 'Hentikan Suara' : 'Baca Suara (Lansia)'}
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleDownloadBadgePng}
        >
          Unduh .PNG
        </button>
        <button
          type="button"
          className="btn btn-secondary-dark btn-sm"
          onClick={handleShareWhatsApp}
        >
          {shareCopied ? 'Tersalin' : 'Bagikan WA'}
        </button>
      </div>
    </div>
  );
}
