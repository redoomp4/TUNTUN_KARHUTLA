# TUNTUN: Digital Guardian — Design Direction (`DESIGN.md`)

## 1. Design Read & Three Dials (`antislop` Part 3 & `R-37`)
> Reading this as: `software` web application for Indonesian digital citizens and students ("Guardians of the Digital Space"), in a precision forensic-software visual language, dial `ENERGY 2 / RHYTHM 3 / MOTION 2`.

- **ENERGY 2 (Balanced)**: Confident typographic hierarchy (`Host Grotesk` display + `Instrument Sans` UI body) paired with high-contrast semantic status tokens and interactive 3D forensic inspection tools.
- **RHYTHM 3 (Varied)**: Each workspace uses a distinct layout structure tailored to its job:
  1. `Pemindai`: Asymmetric `1.45fr / 1fr` split workbench with a 3D Smartphone Forensic X-Ray viewer and a 3-lane pulsing pipeline diagram.
  2. `Simulasi`: Dark-field (`#16191f`) dual-column chat simulator and Free AI Sparring Chatbot with sidebar telemetry widgets.
  3. `Detektif`: Interactive forensic message canvas with clickable evidence tokens alongside a ruled accuracy scorecard.
  4. `Panduan`: 4-tab incident protocol strip, 4-card action widget grid (zero checkboxes), and an auto-filled official report generator + verified call center directory.
  5. `Profil & ID`: Session preparedness ledger paired with an interactive physics-driven 3D Lanyard ID Pass with live name/division customization and `.PNG` badge export.
- **MOTION 2 (Purposeful Transitions & Interactive Physics)**: Hero entrance (`data-enter="hero"`), 2px card elevation on hover, SVG pipeline pulses (`2.6s`), 3D smartphone layer inspection, and spring-damped Lanyard physics (all honoring `prefers-reduced-motion: reduce`).

---

## 2. Palette & Verified WCAG 2.2 AA Contrast (`antislop-human` `R-25`)
Verified using `.agents/skills/antislop-human/contrast-check.py`:
- **Primary Ink (`#16191f`) on Cool Alabaster Ground (`#fcfcfd`)**: `17.17:1` (`PASS` normal & large text).
- **Secondary Slate (`#4b5362`) on Cool Alabaster Ground (`#fcfcfd`)**: `7.55:1` (`PASS` normal & large text).
- **Primary Signal Cobalt (`#074ce0`) on Pure White (`#ffffff`)**: `6.73:1` (`PASS` normal & large text).
- **Light Ink (`#f5f7fa`) on Obsidian Field (`#16191f`)**: `16.40:1` (`PASS` normal & large text).
- **Muted On-Field (`#b0b8c5`) on Obsidian Field (`#16191f`)**: `8.81:1` (`PASS` normal & large text).

---

## 3. One-Line Architectural Decisions (`R-31`)
- **Why this palette**: Cool alabaster (`#fcfcfd`) and deep obsidian (`#16191f`) with a single cobalt accent (`#074ce0`) separate neutral reading workspaces from high-focus simulation chambers while reserving red/amber/emerald strictly for real risk verdicts (`R-29`).
- **Why this typography**: `Host Grotesk` provides geometric authority for scores and headings, while `Instrument Sans` keeps dense forensic URLs, hex bytes, and Indonesian instructions legible at every viewport width (`R-06`).
- **Why this layout**: Every screen centers on the single decision the user makes there (inspect a message/file, respond to a scammer, spot evidence clues, copy an emergency report, or export a Guardian ID pass) (`C-3`, `R-05`).
- **Why widget cards instead of checkboxes**: Emergency victims need immediate, scannable protocol cards (`LANGKAH 01..04`) and a 1-click copyable chronology draft rather than a form-like todo list (`C-1`, `R-14`).
- **Why 3D Smartphone X-Ray & Physics Lanyard**: The 3D smartphone visualizes how `.APK` malware and phishing links operate beneath a chat bubble, while the customizable Lanyard ID Pass gives students and citizens a tangible identity artifact to share (`R-19`, `R-22`).
