<div align="center">
  <h1>Breast Follow-up System</h1>
  <p><strong>乳腺癌随访系统，支持 Web + Windows 桌面版，包含本地数据库、随访记录管理与分期辅助。</strong></p>
  <p><strong>简体中文</strong> | <a href="README.md">English</a></p>

  <p>
    <a href="https://github.com/liqi3333/breast-followup/releases/latest"><img alt="最新版本" src="https://img.shields.io/github/v/release/liqi3333/breast-followup?display_name=tag&label=release" /></a>
    <a href="https://github.com/liqi3333/breast-followup/releases"><img alt="下载次数" src="https://img.shields.io/github/downloads/liqi3333/breast-followup/total?label=downloads" /></a>
    <a href="https://github.com/liqi3333/breast-followup/actions/workflows/build-html.yml"><img alt="构建 HTML" src="https://github.com/liqi3333/breast-followup/actions/workflows/build-html.yml/badge.svg" /></a>
    <a href="https://github.com/liqi3333/breast-followup/actions/workflows/release.yml"><img alt="发布 HTML" src="https://github.com/liqi3333/breast-followup/actions/workflows/release.yml/badge.svg" /></a>
  </p>

  <p>
    <a href="https://liqi3333.github.io/breast-followup/"><img alt="在线打开" src="https://img.shields.io/badge/在线打开-网页-0ea5e9?style=for-the-badge" /></a>
    <a href="https://liqi3333.github.io/breast-followup/mobile.html"><img alt="打开手机版网页" src="https://img.shields.io/badge/打开-手机版网页-f59e0b?style=for-the-badge" /></a>
    <a href="https://github.com/liqi3333/breast-followup/releases/latest"><img alt="下载 HTML" src="https://img.shields.io/badge/下载-最新%20HTML-10b981?style=for-the-badge" /></a>
  </p>
</div>

## 项目简介

这个仓库把单文件 HTML 的「乳腺癌随访系统」整理成可公开交付的 GitHub 项目：

- GitHub Pages 在线使用
- Releases 提供 Windows EXE 与独立 HTML 下载
- 自动构建与自动发布工作流
- 提供独立 PC 页面和手机版页面
- Windows 桌面版本地数据库、备份与恢复

## 入口

- GitHub 仓库：<https://github.com/liqi3333/breast-followup>
- 在线 PC 页面：<https://liqi3333.github.io/breast-followup/>
- 在线手机版页面：<https://liqi3333.github.io/breast-followup/mobile.html>
- Windows 桌面版下载：<https://github.com/liqi3333/breast-followup/releases/latest>
- 最新 Release：<https://github.com/liqi3333/breast-followup/releases/latest>

## 登录 / 数据存储说明

- 在线版仍是 **本地优先（local-first）** 的网页应用，用户与随访记录保存在浏览器 `localStorage`。
- Windows 桌面版会在本机创建两个 SQLite 数据库：一个存用户账号，一个存随访记录。
- 桌面版支持一键备份 / 恢复数据库。
- 默认管理员账号：`admin / admin123`

## 快速开始

### 直接在线使用

打开：<https://liqi3333.github.io/breast-followup/>

### 下载独立 HTML

从这里下载最新 HTML：

- <https://github.com/liqi3333/breast-followup/releases/latest>

下载后，用浏览器直接打开 HTML 文件即可。

### 本地构建

```bash
npm install
npm run build:html
npm run build:win
```

产物：

```text
dist/Breast-Followup-System-1.1.0.exe
dist-html/Breast-Followup-System-1.1.0.html
dist-html/Breast-Followup-System-mobile-1.1.0.html
```

## 自动发布流程

- 推送到 `main`：自动构建 Windows EXE + PC / 手机版 HTML，并上传 workflow artifact
- 推送 `v*` 标签：自动生成 Windows EXE、PC / 手机版 HTML 并发布到 GitHub Releases

## 说明 / 免责声明

- 本项目仅供信息参考与流程示例，不替代正式临床决策。
- 不建议在浏览器 demo 应用中存放真实敏感患者数据。
- 桌面版“备份数据库”会导出 `users.db`、`followups.db` 和 `manifest.json`。
- 桌面版“恢复数据库”会覆盖当前本机桌面版数据，请先备份。
