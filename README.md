# 🚑 TraumaMaster-AI ETM
### *基于 XABCDE 理念的 AI 驱动创伤急救临床思维训练平台*

> An AI-powered Emergency Trauma Management (ETM) clinical simulation  
> platform built on the XABCDE framework for medical education.

---

## 🎯 项目简介

TraumaMaster-AI ETM 是一款专为急诊医学生、住院医师及
创伤救治培训（ETM Course / ATLS）设计的交互式临床思维训练平台。

平台完全还原澳大利亚 ETM（Emergency Trauma Management）课程
的核心理念，通过高仿真的 AI 驱动动态病例模拟，训练学员在
极端高压环境下的：

- ⚡ **临床优先级判断**（X > A > B > C > D > E 的 XABCDE 框架）
- 🧠 **团队资源管理**（TL 脱手指挥 / Hands-off Leadership）
- 🔄 **并行处理能力**（Parallel Processing / 同时下达多线程指令）
- 📢 **共享心智模型**（10-second Team Update / Shared Mental Model）

---

## 🏥 核心功能模块

| 模块 | 描述 |
|:---|:---|
| 🎬 **虚拟患者训练** | 6 个高仿真创伤案例，AI 动态响应学员指令 |
| 📊 **伤情评估系统** | RTS / ISS / GCS / TRISS / CRAMS / PEDS / START 自动计算 |
| 🤖 **AI 导师** | 基于 ETM 理念的实时临床决策反馈与纠错 |
| 📚 **案例库** | 多发伤、穿透伤、烧伤冲击伤等全类型案例 |
| 🏆 **竞赛/考试模式** | 计时答题与多维评分雷达图 |
| 📈 **学习分析** | 优先级判断、并行效率、领导力等维度量化报告 |

---

## 📋 已收录临床案例

| # | 案例名称 | 伤情类型 | ISS | 核心考核陷阱 |
|:--|:---|:---|:---:|:---|
| 1 | 绝命机车——失控的"X"与隐藏的"B" | 创伤性截肢 + 张力性气胸 | ~50 | X 优先 vs 气道优先 |
| 2 | 沉默的坠落——脑与血的博弈 | 重度 TBI + 开放骨盆 + 连枷胸 | ~66 | 库欣反射 vs 失血性休克 |
| 3 | 无声的绞肉机——破裂的屏障与失控的内出血 | 创伤性膈疝 + 脾破裂 + 膝关节碾压 | ~50 | 膈疝插管陷阱 / 跳过CT |
| 4 | 崩塌的底座——血与污的失控 | 开放骨盆 + 会阴撕裂 + 直肠/膀胱破裂 | ~60 | 通路选择 / 纱布填塞逻辑 |
| 5 | 尖刃的谎言——隐秘的危险三角 | 心包填塞 + 穿透性胸伤 | ~34 | CPR 无效陷阱 / 脉压差识别 |
| 6 | 寂静的倒计时——被封锁的生命通道 | 吸入性烧伤 + 爆炸冲击伤 | ~50 | 早期气管切开 / CO 中毒假SpO2 |

---

## 🧠 平台设计理念

本平台基于以下核心理念构建：

- 🏥 **ETM/ATLS 标准** — 完全遵循澳大利亚 ETM 课程与 ATLS 国际标准
- 🤖 **AI 动态响应** — 基于 Gemini API 实现真实临床对话与决策反馈
- 📐 **XABCDE 框架** — 严格还原 X-A-B-C-D-E 优先级处置逻辑
- 🎓 **教学闭环设计** — 从模拟操作到量化评分的完整学习反馈链路

---

## 🚀 快速开始

**环境要求：** Node.js
1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
