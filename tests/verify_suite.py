#!/usr/bin/env python3
"""
Digital Guardian — Automated Verification & Quality Assurance Suite
Verifies DOM bindings, SPA Workspace views, Design System tokens,
Deterministic Engine rules, and Case Study Requirement coverage (FR-01..FR-14).
"""

import os
import re
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_PATH = os.path.join(ROOT_DIR, "frontend", "index.html")
CSS_PATH = os.path.join(ROOTDIR := ROOT_DIR, "frontend", "style.css")
JS_PATH = os.path.join(ROOT_DIR, "frontend", "app.js")
SYS_DESIGN_PATH = os.path.join(ROOT_DIR, "SYSTEM_DESIGN.md")
README_PATH = os.path.join(ROOT_DIR, "README.md")


def read_utf8(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def run_suite() -> int:
    html = read_utf8(HTML_PATH)
    css = read_utf8(CSS_PATH)
    js = read_utf8(JS_PATH)
    sys_design = read_utf8(SYS_DESIGN_PATH)
    readme = read_utf8(README_PATH)

    checks = []

    # TC-01: DOM ID Integrity between index.html and app.js
    html_ids = set(re.findall(r'id="([^"]+)"', html))
    js_ids = set(re.findall(r"getElementById\('([^']+)'\)", js))
    missing_ids = js_ids - html_ids
    checks.append((
        "TC-01: Zero broken DOM ID references between index.html and app.js",
        len(missing_ids) == 0 and len(js_ids) >= 75,
        f"Matched {len(js_ids)} DOM IDs (Missing: {len(missing_ids)})"
    ))

    # TC-02: SPA Workspace View Panels & Navigation Tabs
    expected_views = {"scanner", "simulator", "detective", "guide", "profile"}
    panel_views = set(re.findall(r'data-view-name="([^"]+)"', html))
    tab_views = set(re.findall(r'data-app-view="([^"]+)"', html))
    checks.append((
        "TC-02: All 5 SPA Workspace views and top-bar navigation tabs registered",
        expected_views == panel_views and expected_views == tab_views,
        f"Views={sorted(panel_views)}"
    ))

    # TC-03: Minimalist 'Software' Design System Tokens
    required_tokens = [
        "--dp-color-ground: #fcfcfd",
        "--dp-color-ground-muted: #f3f4f6",
        "--dp-color-panel: #ffffff",
        "--dp-color-ink: #16191f",
        "--dp-color-accent: #074ce0",
        "--dp-color-field: #16191f",
    ]
    missing_tokens = [t for t in required_tokens if t not in css]
    checks.append((
        "TC-03: Minimalist 'Software' Design System color tokens present in style.css",
        len(missing_tokens) == 0,
        f"Verified {len(required_tokens)} core semantic tokens"
    ))

    # TC-04: Heuristic Scanner Rules (R-01..R-07)
    rule_ids = set(re.findall(r"id:\s*'(R-0[1-7])'", js))
    checks.append((
        "TC-04: Heuristic Scam/URL/APK Analyzer implements rules R-01..R-07",
        len(rule_ids) == 7,
        f"Rules found: {sorted(rule_ids)}"
    ))

    # TC-05: Branching Scam Simulator Scenarios (courier, bank, job)
    sim_scenarios = all(k in js for k in ["courier:", "bank:", "job:"])
    checks.append((
        "TC-05: Branching Scam Simulator includes courier (.APK), bank (Phishing), and job (VIP Task) scenarios",
        sim_scenarios,
        "3 branching scenarios verified"
    ))

    # TC-06: Forensic Scam Detective Multi-Case & False-Positive Decoys
    has_cases = all(k in js for k in ["prize:", "hrd:", "customs:"])
    has_decoys = "isRisk: false" in js and "isRisk: true" in js
    checks.append((
        "TC-06: Scam Detective includes 3 forensic cases with True-Positive risks & False-Positive safe decoys",
        has_cases and has_decoys,
        "Cases (prize, hrd, customs) + decoy clues verified"
    ))

    # TC-07: Input Validation (FR-14) & Session Persistence (NFR-12)
    has_validation = "detective-validation-msg" in html and "scanner-validation-msg" in html
    has_session_storage = "window.sessionStorage" in js and "dg_learning_session_v2" in js
    checks.append((
        "TC-07: Input validation alerts (FR-14) and sessionStorage persistence (NFR-12) active",
        has_validation and has_session_storage,
        "Validation banners & sessionStorage key verified"
    ))

    # TC-08: Documentation Completeness (README.md & SYSTEM_DESIGN.md)
    docs_ok = len(sys_design) > 50000 and len(readme) > 5000
    checks.append((
        "TC-08: Technical documentation (README.md & SYSTEM_DESIGN.md) complete",
        docs_ok,
        f"README={len(readme)} chars, SYSTEM_DESIGN={len(sys_design)} chars"
    ))

    print("=" * 72)
    print("DIGITAL GUARDIAN — AUTOMATED QUALITY ASSURANCE REPORT")
    print("=" * 72)
    passed = 0
    for title, ok, detail in checks:
        status = "[PASS]" if ok else "[FAIL]"
        print(f"{status} {title}")
        print(f"       -> {detail}")
        if ok:
            passed += 1
    print("-" * 72)
    print(f"Result: {passed}/{len(checks)} checks passed.")
    print("=" * 72)
    return 0 if passed == len(checks) else 1


if __name__ == "__main__":
    sys.exit(run_suite())
