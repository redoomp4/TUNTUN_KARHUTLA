import React, { useState, useRef } from 'react';

/**
 * Interactive 3D Smartphone Forensic X-Ray Motion Graphic
 * Features real-time 3D perspective mouse tilt, sweeping laser scanline,
 * floating parallax HUD callouts, and an exploded 3D layer inspection toggle.
 */
export default function PhoneMotionGraphic({
  activeScore = 0,
  verdictLevel = 'IDLE',
  activeTitle = 'Radar Forensik TUNTUN Aktif',
  fileReport = null,
  scanResult = null,
  onSelectPreset
}) {
  const stageRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 6, ry: -10 });
  const [exploded3D, setExploded3D] = useState(false);

  const handleMouseMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setTilt({
      rx: Number((-ny * 11).toFixed(2)),
      ry: Number((nx * 14).toFixed(2))
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 6, ry: -10 });
  };

  const statusTone = fileReport
    ? fileReport.isDangerous
      ? 'danger'
      : 'safe'
    : scanResult
      ? scanResult.verdictLevel === 'DANGER'
        ? 'danger'
        : scanResult.verdictLevel === 'WARN'
          ? 'warn'
          : 'safe'
      : 'idle';

  const topHudLabel = fileReport
    ? `Signature: ${fileReport.magicHex.slice(0, 11)}`
    : scanResult?.anatomyItems?.[0]
      ? `${scanResult.anatomyItems[0].code}`
      : '50 4B 03 04 (.APK Radar)';

  const bottomHudLabel = fileReport
    ? fileReport.detectedFormat
    : scanResult
      ? `Indeks Risiko: ${activeScore}/100`
      : 'Sanitasi NFR-05 & Lokal <1ms';

  const messagePreview = fileReport
    ? `[Lampiran Berkas] ${fileReport.fileName} (${fileReport.fileSizeKB})`
    : scanResult?.findings?.[0]
      ? `${scanResult.findings[0].title}: "${scanResult.findings[0].snippet}"`
      : 'Kurir J&T: Mohon cek foto resi Lihat_Foto_Paket.pdf.apk dan klik Izinkan Akses SMS...';

  return (
    <div
      ref={stageRef}
      className={`phone-motion-stage tone-${statusTone} ${exploded3D ? 'is-exploded' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      aria-label="Visualisasi Motion Graphic Handphone Forensik TUNTUN"
    >
      <div className="phone-stage-bar">
        <div className="phone-stage-brand">
          <span className="phone-radar-dot" aria-hidden="true" />
          <span>Visualisasi X-Ray Perangkat (Real-Time)</span>
        </div>
        <div className="phone-stage-controls">
          <button
            type="button"
            className="btn-chip"
            onClick={() => setExploded3D(prev => !prev)}
          >
            {exploded3D ? 'Tampilan Normal' : 'Mode Lapisan 3D'}
          </button>
          {onSelectPreset && (
            <button
              type="button"
              className="btn-chip"
              onClick={() => onSelectPreset('apk')}
            >
              Simulasi .APK di HP
            </button>
          )}
        </div>
      </div>

      <div className="phone-perspective-viewport">
        <div
          className="phone-chassis-3d"
          style={{
            transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
          }}
        >
          {/* Floating 3D Parallax Callout Chip Top-Left */}
          <div className="phone-hud-chip hud-top-left">
            <span className="hud-chip-caption">Inspeksi Biner / Domain</span>
            <strong className="hud-chip-code">{topHudLabel}</strong>
          </div>

          {/* Floating 3D Parallax Callout Chip Bottom-Right */}
          <div className="phone-hud-chip hud-bottom-right">
            <span className="hud-chip-caption">Status Pertahanan TUNTUN</span>
            <strong className="hud-chip-code">{bottomHudLabel}</strong>
          </div>

          {/* Smartphone Hardware Frame */}
          <div className="phone-bezel">
            {/* Dynamic Island / Speaker Notch */}
            <div className="phone-notch-bar" aria-hidden="true">
              <span className="phone-time">09:41</span>
              <div className="phone-island">
                <span className="island-camera" />
                <span className="island-sensor" />
              </div>
              <span className="phone-signal">5G • 98%</span>
            </div>

            {/* Sweeping Forensic Laser Scanline */}
            <div className="phone-laser-beam" aria-hidden="true" />

            {/* Phone Screen Content Layers */}
            <div className="phone-screen-body">
              {/* Layer 1: Incoming Suspicious Message Bubble */}
              <div className="phone-layer layer-message">
                <div className="phone-app-header">
                  <img
                    src="/logo_TUNTUN.jpeg"
                    alt=""
                    className="phone-mini-logo"
                    width="18"
                    height="18"
                  />
                  <span>TUNTUN Shield • Pemindai Aktif</span>
                </div>
                <div className="phone-msg-card">
                  <span className="phone-msg-sender">Pesan Masuk Terdeteksi</span>
                  <p className="phone-msg-text">{messagePreview}</p>
                </div>
              </div>

              {/* Layer 2: Forensic Hex & Heuristic Breakdown */}
              <div className="phone-layer layer-forensic">
                <div className="phone-xray-row">
                  <span>Skor Risiko</span>
                  <strong>{activeScore} / 100</strong>
                </div>
                <div className="phone-xray-bar">
                  <div
                    className="phone-xray-fill"
                    style={{ width: `${Math.max(8, activeScore)}%` }}
                  />
                </div>
                <p className="phone-xray-verdict">{activeTitle}</p>
              </div>
            </div>

            {/* Phone Home Indicator Bar */}
            <div className="phone-home-bar" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
