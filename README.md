# 🚑 TraumaMaster-AI ETM
### *基于 XABCDE 理念的 AI 驱动创伤急救临床思维训练平台*
### *AI-Powered Emergency Trauma Management Clinical Simulation Platform*

[![GitHub stars](https://img.shields.io/github/stars/TUANZIDING/TraumaMaster-AI-ETM?style=social)](https://github.com/TUANZIDING/TraumaMaster-AI-ETM/stargazers)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Language](https://img.shields.io/badge/language-中文%20%7C%20English-brightgreen)](#)

> 🇨🇳 一款基于 XABCDE 框架的 AI 驱动急诊创伤管理临床模拟训练平台，专为医学教育设计。  
> 🌐 An AI-powered Emergency Trauma Management (ETM) clinical simulation platform built on the XABCDE framework for medical education.

---

## 🎯 项目简介 | About

**🇨🇳 中文**

TraumaMaster-AI ETM 是一款专为急诊医学生、住院医师及创伤救治培训（ETM Course / ATLS）设计的交互式临床思维训练平台。平台完全还原澳大利亚 ETM（Emergency Trauma Management）课程的核心理念，通过高仿真的 AI 驱动动态病例模拟，训练学员在极端高压环境下的：

- ⚡ **临床优先级判断**（X > A > B > C > D > E 的 XABCDE 框架）
- 🧠 **团队资源管理**（TL 脱手指挥 / Hands-off Leadership）
- 🔄 **并行处理能力**（Parallel Processing / 同时下达多线程指令）
- 📢 **共享心智模型**（10-second Team Update / Shared Mental Model）

**🌐 English**

TraumaMaster-AI ETM is an interactive clinical reasoning training platform designed for emergency medicine students, residents, and trauma care trainees (ETM Course / ATLS). The platform fully replicates the core philosophy of the Australian ETM course, using high-fidelity AI-driven dynamic case simulations to train learners under extreme pressure in:

- ⚡ **Clinical prioritization** (XABCDE framework: X > A > B > C > D > E)
- 🧠 **Team resource management** (Hands-off Leadership)
- 🔄 **Parallel processing** (simultaneous multi-task command delivery)
- 📢 **Shared mental model** (10-second Team Update)

---

## 🏥 核心功能 | Key Features

| 模块 / Module | 描述 / Description |
|:---|:---|
| 🎬 **虚拟患者训练 / Virtual Patient** | 6 个高仿真创伤案例，AI 动态响应 / 6 high-fidelity trauma cases with AI dynamic response |
| 📊 **伤情评估 / Trauma Scoring** | RTS · ISS · GCS · TRISS · CRAMS · PEDS · START 自动计算 / Auto-calculated |
| 🤖 **AI 导师 / AI Tutor** | 基于 ETM 理念的实时反馈与纠错 / Real-time ETM-based feedback & correction |
| 📚 **案例库 / Case Library** | 多发伤、穿透伤、烧伤冲击伤等 / Polytrauma, penetrating, blast & burn injuries |
| 🏆 **竞赛模式 / Exam Mode** | 计时答题与多维评分雷达图 / Timed quiz with multi-dimensional radar scoring |
| 📈 **学习分析 / Learning Analytics** | 优先级、并行效率、领导力量化报告 / Quantified priority, parallel efficiency & leadership report |

---

## 📋 临床案例库 | Clinical Case Library

| # | 案例 / Case | 伤情 / Injury | ISS | 核心陷阱 / Key Trap |
|:--|:---|:---|:---:|:---|
| 1 | 绝命机车 / Fatal Ride | 创伤性截肢 + 张力性气胸 / Traumatic amputation + Tension pneumothorax | ~50 | X 优先 vs 气道优先 / X vs Airway first |
| 2 | 沉默的坠落 / Silent Fall | 重度 TBI + 开放骨盆 + 连枷胸 / Severe TBI + Open pelvis + Flail chest | ~66 | 库欣反射 vs 失血性休克 / Cushing reflex vs Hemorrhagic shock |
| 3 | 无声的绞肉机 / Silent Grinder | 创伤性膈疝 + 脾破裂 / Traumatic diaphragmatic hernia + Splenic rupture | ~50 | 膈疝插管陷阱 / Diaphragmatic hernia intubation trap |
| 4 | 崩塌的底座 / Collapsing Base | 开放骨盆 + 会阴撕裂 / Open pelvis + Perineal laceration | ~60 | 通路选择 / Access & packing logic |
| 5 | 尖刃的谎言 / Blade of Lies | 心包填塞 + 穿透性胸伤 / Cardiac tamponade + Penetrating chest | ~34 | CPR 无效陷阱 / CPR inefficacy trap |
| 6 | 寂静的倒计时 / Silent Countdown | 吸入性烧伤 + 爆炸冲击伤 / Inhalation burn + Blast injury | ~50 | CO 中毒假 SpO2 / False SpO2 in CO poisoning |

---

## 🧠 设计理念 | Design Philosophy

🇨🇳 本平台基于以下核心理念构建：  
🌐 The platform is built on the following core principles:

- 🏥 **ETM/ATLS 标准** — 完全遵循澳大利亚 ETM 课程与 ATLS 国际标准 / Full compliance with Australian ETM & ATLS standards
- 🤖 **AI 动态响应** — 基于 Gemini API 的真实临床对话 / Real clinical dialogue powered by Gemini API
- 📐 **XABCDE 框架** — 严格还原优先级处置逻辑 / Strict replication of XABCDE priority logic
- 🎓 **教学闭环** — 从模拟操作到量化评分的完整反馈链路 / Complete feedback loop from simulation to scoring

---

## 🛠️ 技术栈 | Tech Stack

| 层级 / Layer | 技术 / Technology |
|:---|:---|
| **Frontend** | HTML / CSS / JavaScript · Tailwind CSS |
| **AI Engine** | Gemini API（Google AI Studio）|
| **Case Logic** | State Machine — 状态机驱动动态病例分支 / State-machine-driven dynamic case branching |
| **Scoring Engine** | RTS · ISS · GCS · TRISS · CRAMS · PEDS · START |
| **Runtime** | Node.js |

---

## 🚀 快速开始 | Quick Start

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
