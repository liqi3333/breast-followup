<div align="center">
  <h1>Breast Follow-up System</h1>
  <p><strong>Web + Windows desktop breast cancer follow-up system with local databases, staging helper, and separate PC/mobile web versions.</strong></p>
  <p><a href="README.zh-CN.md">简体中文</a> | <strong>English</strong></p>

  <p>
    <a href="https://github.com/liqi3333/breast-followup/releases/latest"><img alt="Latest Release" src="https://img.shields.io/github/v/release/liqi3333/breast-followup?display_name=tag&label=release" /></a>
    <a href="https://github.com/liqi3333/breast-followup/releases"><img alt="Downloads" src="https://img.shields.io/github/downloads/liqi3333/breast-followup/total?label=downloads" /></a>
    <a href="https://github.com/liqi3333/breast-followup/actions/workflows/build-html.yml"><img alt="Build HTML" src="https://github.com/liqi3333/breast-followup/actions/workflows/build-html.yml/badge.svg" /></a>
    <a href="https://github.com/liqi3333/breast-followup/actions/workflows/release.yml"><img alt="Release HTML" src="https://github.com/liqi3333/breast-followup/actions/workflows/release.yml/badge.svg" /></a>
  </p>

  <p>
    <a href="https://liqi3333.github.io/breast-followup/"><img alt="Open Online" src="https://img.shields.io/badge/Open-Online%20Page-0ea5e9?style=for-the-badge" /></a>
    <a href="https://liqi3333.github.io/breast-followup/mobile.html"><img alt="Open Mobile Web" src="https://img.shields.io/badge/Open-Mobile%20Web-f59e0b?style=for-the-badge" /></a>
    <a href="https://github.com/liqi3333/breast-followup/releases/latest"><img alt="Download HTML" src="https://img.shields.io/badge/Download-Latest%20HTML-10b981?style=for-the-badge" /></a>
  </p>
</div>

## Overview

This repository productizes a single-file HTML breast cancer follow-up system into a deliverable GitHub project:

- GitHub Pages online usage
- Windows EXE and standalone HTML download via Releases
- Automated build + release workflows
- Separate PC and mobile entry pages
- Windows desktop local databases with backup and restore

## Access

- GitHub repository: <https://github.com/liqi3333/breast-followup>
- Online PC page: <https://liqi3333.github.io/breast-followup/>
- Online mobile page: <https://liqi3333.github.io/breast-followup/mobile.html>
- Windows desktop download: <https://github.com/liqi3333/breast-followup/releases/latest>
- Latest release: <https://github.com/liqi3333/breast-followup/releases/latest>

## Login / Data storage

- The online version remains a **local-first** web app. Users and records are stored in the browser via `localStorage`.
- The Windows desktop build creates two local SQLite databases: one for user accounts and one for follow-up records.
- The desktop app supports one-click backup and restore of those databases.
- Default admin account: `admin / admin123`

## Quick Start

### Use online

Open: <https://liqi3333.github.io/breast-followup/>

### Download standalone HTML

Download the latest HTML from:

- <https://github.com/liqi3333/breast-followup/releases/latest>

Then open the HTML file directly in a browser.

### Build locally

```bash
npm install
npm run build:html
npm run build:win
```

Output:

```text
dist/Breast-Followup-System-1.1.0.exe
dist-html/Breast-Followup-System-1.1.0.html
dist-html/Breast-Followup-System-mobile-1.1.0.html
```

## Release automation

- Push to `main`: build Windows EXE + PC/mobile HTML and upload workflow artifacts
- Push tag `v*`: build and publish the Windows EXE plus standalone HTML assets to GitHub Releases

## Notes / Disclaimer

- This project is for informational and workflow reference only.
- Do **not** use it as a substitute for formal clinical decision-making.
- Do **not** store real sensitive patient data in a browser demo app.
- The desktop backup action exports `users.db`, `followups.db`, and `manifest.json`.
- The desktop restore action overwrites the current local desktop data, so back up first.
