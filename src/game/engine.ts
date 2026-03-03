import { GameState, GamePhase, ActionType, GameLog, TeamMember } from './types';
import { SCENARIOS } from './scenarios';

export const INITIAL_STATE: GameState = {
  scenarioId: null,
  phase: 'SCENARIO_SELECT',
  gameTime: 0,
  realTime: 0,
  vitals: { hr: 110, bpSys: 70, bpDia: 40, spo2: 98 },
  team: {
    drA: { id: 'drA', name: 'Dr. A', role: 'Airway', status: 'idle', task: null, busyUntil: 0 },
    drB: { id: 'drB', name: 'Dr. B', role: 'Procedures', status: 'idle', task: null, busyUntil: 0 },
    nurseC: { id: 'nurseC', name: 'Nurse C', role: 'Circulation', status: 'idle', task: null, busyUntil: 0 },
    scribe: { id: 'scribe', name: 'Nurse D', role: 'Scribe', status: 'idle', task: null, busyUntil: 0 },
  },
  logs: [],
  flags: {
    prepMtp: false, prepAirway: false, prepTourniquet: false, prepWarmer: false, prepEfast: false,
    xControlled: false, ivAccess: false,
    airwayProtected: false, cSpineProtected: false,
    bControlled: false, oxygenGiven: false,
    cControlled: false, pelvicBinderApplied: false, surgeonCalled: false,
    neuroChecked: false, glucoseChecked: false,
    exposed: false, warmed: false, logRolled: false,
    secondarySurveyDone: false, disposition: null,
    handsOnPenalty: false, deathReason: null, trapATriggered: false, trapATime: null,
    phaseStartTime: 0,
    pelvicPacked: false, mdtCalled: false, antibioticsGiven: false, foleyAttempted: false, gauzeRemoved: false, lowerIvAttempted: false,
    pericardiocentesisDone: false, cprAttempted: false, showCprTrap: false, intubatedAwake: false,
    tracheostomyDone: false, cricothyrotomyDone: false, adrenalineGiven: false, succinylcholineGiven: false,
    parklandStarted: false, urineOutputChecked: false, warmedLrGiven: false, coOximetryDone: false, fio2Maxed: false,
    escharotomyDone: false, extremitiesChecked: false,
  },
  scores: {
    prioritization: 100, parallel: 100, leadership: 100, anticipation: 0,
  },
};

export type GameAction =
  | { type: 'SELECT_SCENARIO'; scenarioId: string }
  | { type: 'TICK' }
  | { type: 'START_PHASE_0' }
  | { type: 'FAST_FORWARD' }
  | { type: 'USER_COMMAND'; text: string }
  | { type: 'AI_PARSED_COMMANDS'; commands: { action: ActionType; target: string | null; recognizedText: string }[] }
  | { type: 'TEAM_UPDATE_SUBMIT'; text: string }
  | { type: 'RESTART' }
  | { type: 'RETURN_TO_MENU' }
  | { type: 'TRIGGER_CPR_TRAP' }
  | { type: 'DISMISS_CPR_TRAP' };

const createLog = (text: string, sender: GameLog['sender'], time: number): GameLog => ({
  id: Math.random().toString(36).substring(7),
  time,
  text,
  sender,
});

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'RETURN_TO_MENU':
      return { ...INITIAL_STATE };

    case 'RESTART': {
      if (!state.scenarioId) return { ...INITIAL_STATE };
      const scenario = SCENARIOS[state.scenarioId];
      return {
        ...INITIAL_STATE,
        scenarioId: state.scenarioId,
        phase: 'INTRO',
        vitals: { ...scenario.initialVitals },
      };
    }

    case 'SELECT_SCENARIO': {
      const scenario = SCENARIOS[action.scenarioId];
      if (!scenario) return state;
      return {
        ...INITIAL_STATE,
        scenarioId: action.scenarioId,
        phase: 'INTRO',
        vitals: { ...scenario.initialVitals },
      };
    }

    case 'START_PHASE_0': {
      const scenario = SCENARIOS[state.scenarioId!];
      return {
        ...state,
        phase: 'PHASE_0',
        flags: { ...state.flags, phaseStartTime: state.gameTime },
        logs: [
          ...state.logs,
          createLog(
            scenario.introLog,
            'system',
            state.gameTime
          ),
        ],
      };
    }

    case 'FAST_FORWARD':
      if (state.phase === 'PHASE_0') {
        const isScen1 = state.scenarioId === 'scenario-1';
        const isScen2 = state.scenarioId === 'scenario-2';
        const isScen3 = state.scenarioId === 'scenario-3';
        let introText = '';
        if (isScen1) {
          introText = '患者推入。移床时止血带滑脱，右大腿残端出现动脉喷射性出血！';
        } else if (isScen2) {
          introText = '患者推入。深度昏迷（GCS 4分）。会阴部及大腿根部可见一道 15cm 撕裂伤，伴有持续的暗红色静脉样涌血及动脉搏动性喷血。';
        } else if (isScen3) {
          introText = '患者推入。左下肢膝关节处皮肉剥离，骨质外露，院前止血带由于浸满泥沙有松动迹象，伤口处有鲜血持续涌出。';
        } else if (state.scenarioId === 'scenario-4') {
          introText = '患者推入。下半身衣物已被血液浸透。剪开衣物后，发现患者下腹部至会阴部存在巨大的撕裂伤，骨盆前环（耻骨联合）完全裂开，伤口内不断涌出暗红色血液（静脉丛出血）夹杂着尿液和粪便。双下肢外旋、缩短。';
        } else if (state.scenarioId === 'scenario-5') {
          introText = '患者推入。左胸前区（心脏投影区）有一处 2cm 刀刺伤，伤口处无明显活动性出血。患者极度烦躁，面色苍白，大汗淋漓。颈静脉怒张。';
        } else if (state.scenarioId === 'scenario-6') {
          introText = '患者推入。头发烧焦，面部水泡已经开始融合成片，口鼻周围大量黑色碳末沉积。患者发出明显喉鸣（像用吸管强行呼吸的声音），正在咳出黑色碳末痰液。颈部可见轻度肿胀。';
        }

        return {
          ...state,
          phase: 'PHASE_X',
          gameTime: 120, // Skip to 120s
          flags: { ...state.flags, phaseStartTime: 120 },
          scores: { ...state.scores, anticipation: Math.max(0, state.scores.anticipation - 50) }, // Penalty for not prepping
          logs: [
            ...state.logs,
            createLog('快进到患者到达。', 'system', state.gameTime),
            createLog(introText, 'system', 120),
          ],
        };
      }
      return state;

    case 'DISMISS_CPR_TRAP':
      return {
        ...state,
        flags: {
          ...state.flags,
          showCprTrap: false,
        }
      };

    case 'TRIGGER_CPR_TRAP':
      return {
        ...state,
        phase: 'GAME_OVER',
        flags: {
          ...state.flags,
          deathReason: '创伤性梗阻性休克（如心包填塞/张力性气胸）导致的 PEA，胸外按压毫无意义且浪费时间，必须立刻解除梗阻源！患者因心脏被血块卡死，按压无效死亡。',
          showCprTrap: false,
        },
        logs: [
          ...state.logs,
          createLog('你下令进行了胸外按压 (CPR)。', 'user', state.gameTime),
          createLog('系统警告：创伤性梗阻性休克导致的 PEA，胸外按压毫无意义且浪费时间，必须立刻解除梗阻源！', 'system', state.gameTime),
          createLog('患者因心脏被血块卡死，按压无效死亡。', 'system', state.gameTime),
        ],
      };

    case 'USER_COMMAND':
      return {
        ...state,
        logs: [...state.logs, createLog(action.text, 'user', state.gameTime)],
      };

    case 'AI_PARSED_COMMANDS': {
      let newState = { ...state };
      const newLogs = [...newState.logs];
      const newTeam = { ...newState.team };
      const newFlags = { ...newState.flags };
      let newScores = { ...newState.scores };

      action.commands.forEach((cmd) => {
        // Handle Hands-on Penalty
        if (cmd.action === 'MANUAL_PRESSURE' || cmd.target === 'User') {
          newFlags.handsOnPenalty = true;
          newScores.leadership = Math.max(0, newScores.leadership - 50);
          newLogs.push(
            createLog(
              '你正在双手压迫伤口，无法操作电脑下达其他指令，团队因失去指挥陷入混乱。',
              'system',
              newState.gameTime
            )
          );
          return;
        }

        // Phase 0: Preps
        if (newState.phase === 'PHASE_0') {
          if (cmd.action === 'PREP_MTP') {
            newFlags.prepMtp = true; newScores.anticipation += 20;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '准备MTP', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Nurse C: 收到，正在准备大量输血方案 (MTP)。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'PREP_AIRWAY') {
            newFlags.prepAirway = true; newScores.anticipation += 20;
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: '准备气切包', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. A: 收到，已准备气管切开包、可视喉镜及环甲膜穿刺套装备用。', 'team', newState.gameTime));
          } else if (cmd.action === 'PREP_AIRWAY') {
            newFlags.prepAirway = true; newScores.anticipation += 20;
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: '准备气道车', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. A: 收到，气道车已备好在床头。', 'team', newState.gameTime));
          } else if (cmd.action === 'PREP_TOURNIQUET') {
            newFlags.prepTourniquet = true; newScores.anticipation += 20;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '准备止血带/骨盆带', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. B: 收到，备用止血带和骨盆带已就绪。', 'team', newState.gameTime));
          } else if (cmd.action === 'PREP_WARMER') {
            newFlags.prepWarmer = true; newScores.anticipation += 20;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '准备加温设备', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Nurse C: 收到，加温设备已就绪。', 'team', newState.gameTime));
          } else if (cmd.action === 'PREP_EFAST') {
            newFlags.prepEfast = true; newScores.anticipation += 20;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '准备超声/胸管', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. B: 收到，超声和胸管包已备好。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && (cmd.action === 'CALL_MDT' || cmd.action === 'CALL_SURGEON')) {
            newFlags.mdtCalled = true; newScores.anticipation += 30;
            newTeam.scribe = { ...newTeam.scribe, status: 'busy', task: '呼叫专科', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Scribe: 收到，已紧急呼叫烧伤科、耳鼻喉科、胸外科！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-4' && cmd.action === 'CALL_MDT') {
            newFlags.mdtCalled = true; newScores.anticipation += 30;
            newTeam.scribe = { ...newTeam.scribe, status: 'busy', task: '呼叫MDT', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Scribe: 收到，已紧急呼叫骨科、普外科、泌尿外科和介入科 (IR)！', 'team', newState.gameTime));
          } else {
             newLogs.push(createLog(`系统未识别指令意图或当前阶段无效: ${cmd.recognizedText}`, 'system', newState.gameTime));
          }
        }

        // Phase X: Hemorrhage
        else if (newState.phase === 'PHASE_X') {
          if (newState.scenarioId === 'scenario-6' && (cmd.action === 'CHECK_AIRWAY' || cmd.action === 'TRACHEOSTOMY' || cmd.action === 'INTUBATE')) {
            newFlags.xControlled = true;
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: '评估气道', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. A: 收到，患者无明显活动性大出血，直接进入气道评估！', 'team', newState.gameTime));
          } else if (cmd.action === 'CHECK_AIRWAY' || cmd.action === 'INTUBATE') {
            newFlags.trapATriggered = true;
            newFlags.trapATime = newState.gameTime;
            newScores.prioritization = 0;
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: '检查气道', busyUntil: newState.gameTime + 10 };
            newLogs.push(createLog('Dr. A: 正在检查气道并给氧...', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-1' && cmd.action === 'APPLY_TOURNIQUET') {
            newFlags.xControlled = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '打止血带', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. B: 收到，立刻在右大腿根部打上第二根战术止血带！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-3' && cmd.action === 'APPLY_TOURNIQUET') {
            newFlags.xControlled = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '打止血带', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. B: 收到，立刻在原止血带上方打上第二根战术止血带，并包裹创面！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-2' && cmd.action === 'WOUND_PACKING') {
            newFlags.xControlled = true; // Simplified: just packing controls it for now, or require both
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '纱布填塞', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('Dr. B: 收到，正在会阴部进行大量纱布填塞加压！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-2' && cmd.action === 'PELVIC_BINDER') {
            newFlags.pelvicBinderApplied = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '上骨盆带', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. B: 收到，已打上骨盆带稳定骨盆环。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-4' && cmd.action === 'PELVIC_PACKING') {
            newFlags.pelvicPacked = true;
            if (newFlags.pelvicBinderApplied) newFlags.xControlled = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '会阴纱布填塞', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('Dr. B: 收到，已戴无菌手套，使用大量无菌纱布直接填塞进入会阴撕裂腔内并用力压迫！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-4' && cmd.action === 'PELVIC_BINDER') {
            newFlags.pelvicBinderApplied = true;
            if (newFlags.pelvicPacked) newFlags.xControlled = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '上骨盆带', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. B: 收到，已小心使用骨盆带固定大转子水平，避开会阴主创面。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-4' && cmd.action === 'IV_ACCESS_LOWER') {
            newFlags.lowerIvAttempted = true;
            newFlags.deathReason = '致命错误：骨盆静脉丛已破裂，下肢输液直接漏进腹腔，导致复苏失败！';
            newLogs.push(createLog('Nurse C: 收到，正在建立下肢静脉通路... 等等，液体好像全漏进骨盆了！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-4' && cmd.action === 'IV_ACCESS_UPPER') {
            newFlags.ivAccess = true;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '上肢/中心静脉通路', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('Nurse C: 收到，已建立双侧颈内/锁骨下中心静脉通路或上肢大静脉，全速推入 1:1:1 血液制品和 TXA！', 'team', newState.gameTime));
          } else if (cmd.action === 'START_MTP_IV' || cmd.action === 'CONTINUE_MTP_TXA') {
            newFlags.ivAccess = true;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '建立通路/抽血/TXA', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('Nurse C: 收到，正在建立大口径静脉通路，抽血配血，并给入 TXA。', 'team', newState.gameTime));
          } else {
            newLogs.push(createLog(`系统未识别指令意图或当前阶段无效: ${cmd.recognizedText}`, 'system', newState.gameTime));
          }
        }

        // Phase A: Airway
        else if (newState.phase === 'PHASE_A') {
          if (cmd.action === 'C_SPINE_SUCTION') {
            newFlags.cSpineProtected = true;
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: '颈椎保护/吸引', busyUntil: newState.gameTime + 6 };
            newLogs.push(createLog('Dr. A: 收到，颈椎中立位，正在吸引清理口腔血液。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-5' && cmd.action === 'OXYGEN_MASK') {
            newFlags.airwayProtected = true; // For this scenario, mask is sufficient initially
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: '面罩吸氧', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. A: 收到，已给予高流量面罩吸氧。患者目前有自主气道，暂不插管。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-5' && (cmd.action === 'INTUBATE' || cmd.action === 'RSI_KETAMINE')) {
            newFlags.intubatedAwake = true;
            newFlags.showCprTrap = true;
            newFlags.deathReason = '致命错误：在清醒的心包填塞患者身上盲目进行正压通气（插管），正压通气阻断了静脉回流，导致心跳立刻骤停！';
            newLogs.push(createLog('Dr. A: 收到，正在进行 RSI 插管... 等等，给药和正压通气后，患者心率突然消失，监护仪显示 PEA！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'RSI_SUCCINYLCHOLINE') {
            newFlags.succinylcholineGiven = true;
            newFlags.deathReason = '致命错误：烧伤患者绝对禁忌使用琥珀胆碱（Succinylcholine），导致致命性高钾血症和心搏骤停！';
            newLogs.push(createLog('Dr. A: 收到，给予琥珀胆碱... 等等，患者心率突然消失，监护仪显示宽大畸形 QRS 波后转为直线！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'NEBULIZED_ADRENALINE') {
            newFlags.adrenalineGiven = true;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '雾化肾上腺素', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Nurse C: 收到，已给予雾化吸入肾上腺素及静脉地塞米松，上气道水肿暂时收缩，争取到宝贵操作窗口！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'TRACHEOSTOMY') {
            newFlags.tracheostomyDone = true;
            newFlags.airwayProtected = true;
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: '气管切开', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('耳鼻喉科: 收到，立即在床旁进行预防性气管切开。气管切开导管送入，患者呼吸立刻改善，SpO2 升至 97%，喉鸣消失。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'CRICOTHYROTOMY') {
            newFlags.cricothyrotomyDone = true;
            newFlags.airwayProtected = true;
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: '环甲膜切开', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('Dr. A: 收到，紧急行环甲膜切开术作为桥接！气道暂时建立，SpO2 回升。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'INTUBATE') {
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: '尝试插管', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. A: 收到，尝试经口插管... 可视喉镜下声带几乎完全被水肿黏膜遮盖，第一次尝试失败。反复喉镜操作刺激加重水肿，气道完全锁死！(CI/CO 危机，必须立刻切开气道！)', 'team', newState.gameTime));
          } else if (cmd.action === 'INTUBATE') {
            newFlags.airwayProtected = true;
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: 'RSI插管', busyUntil: newState.gameTime + 12 };
            if (newState.scenarioId === 'scenario-2') {
               newScores.prioritization = Math.max(0, newScores.prioritization - 20);
               newLogs.push(createLog('Dr. A: 收到，使用常规 RSI 药物插管。(系统提示：未指定血流动力学稳定的诱导药物，可能加重休克)', 'team', newState.gameTime));
            } else if (newState.scenarioId === 'scenario-3') {
               newLogs.push(createLog('Dr. A: 收到，准备 RSI 插管。注意避免高压力正压通气！', 'team', newState.gameTime));
            } else if (newState.scenarioId === 'scenario-4') {
               newScores.prioritization = Math.max(0, newScores.prioritization - 30);
               newLogs.push(createLog('Dr. A: 收到，使用常规剂量丙泊酚诱导插管。(系统警告：患者极度休克，常规剂量诱导药导致血压进一步崩塌！)', 'team', newState.gameTime));
            } else {
               newLogs.push(createLog('Dr. A: 收到，准备 RSI 插管。', 'team', newState.gameTime));
            }
          } else if (cmd.action === 'RSI_KETAMINE') {
            newFlags.airwayProtected = true;
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: 'RSI插管(氯胺酮)', busyUntil: newState.gameTime + 12 };
            newLogs.push(createLog('Dr. A: 收到，使用氯胺酮/依托咪酯进行 RSI 插管，维持血流动力学稳定。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-3' && cmd.action === 'EFAST_EXAM') {
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: 'eFAST超声', busyUntil: newState.gameTime + 10 };
            newLogs.push(createLog('Dr. B: 收到，eFAST 提示左侧胸腔及脾肾隐窝大量暗区！高度怀疑膈疝及脾破裂！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-3' && cmd.action === 'GASTRIC_TUBE') {
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '下胃管', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('Nurse C: 收到，已置入粗胃管进行减压，引出大量气体，患者气道压下降！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-4' && cmd.action === 'EFAST_EXAM') {
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: 'eFAST超声', busyUntil: newState.gameTime + 10 };
            newLogs.push(createLog('Dr. B: 收到，eFAST 提示双侧多发肋骨骨折，但无明显气胸/血胸。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-5' && cmd.action === 'EFAST_EXAM') {
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: 'eFAST超声', busyUntil: newState.gameTime + 10 };
            newLogs.push(createLog('Dr. B: 收到，eFAST 提示心包腔内可见约2cm宽的无回声暗区，右心室在舒张期出现明显塌陷，提示心包填塞。同时，左侧胸腔可见少量积液，提示血胸。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-3' && cmd.action === 'CHEST_TUBE') {
            newFlags.deathReason = '致命错误：在未排除膈疝的情况下盲目进行左侧胸腔闭式引流，引流管穿透了疝入胸腔的胃！患者并发严重纵隔炎与败血症，抢救失败！';
            newLogs.push(createLog('Dr. B: 收到，正在进行左侧胸腔闭式引流... 等等，引流管里出来了胃内容物！', 'team', newState.gameTime));
          } else if (cmd.action === 'RECORD_AIRWAY') {
            newTeam.scribe = { ...newTeam.scribe, status: 'busy', task: '记录气道', busyUntil: newState.gameTime + 3 };
            newLogs.push(createLog('Scribe: 收到，已记录插管时间与用药。', 'team', newState.gameTime));
          } else {
             newLogs.push(createLog(`系统未识别指令意图或当前阶段无效: ${cmd.recognizedText}`, 'system', newState.gameTime));
          }
        }

        // Phase B: Breathing
        else if (newState.phase === 'PHASE_B') {
          if (newState.scenarioId === 'scenario-6' && cmd.action === 'EFAST_EXAM') {
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: 'eFAST超声', busyUntil: newState.gameTime + 10 };
            newLogs.push(createLog('Dr. B: 收到，eFAST 提示右侧胸膜滑动征消失，可见平流层征，提示右侧气胸！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'NEEDLE_DECOMPRESSION') {
            newFlags.bControlled = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '胸腔穿刺减压', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('Dr. B: 收到，立即行右侧第2肋间锁骨中线针刺减压！听到明显喷气声，气道峰压降至 26 cmH2O。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'BAG_VALVE_MASK') {
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: '手动球囊通气', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. A: 收到，已断开呼吸机，改用手动气囊轻柔通气，低压力低频率，避免加重气压伤。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'CHEST_TUBE') {
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '胸腔闭式引流', busyUntil: newState.gameTime + 10 };
            newLogs.push(createLog('Dr. B: 收到，已行右侧胸腔闭式引流，引出少量气血。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-1' && cmd.action === 'NEEDLE_DECOMPRESSION') {
            newFlags.bControlled = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '胸腔穿刺减压', busyUntil: newState.gameTime + 10 };
            newLogs.push(createLog('Dr. B: 收到，立即行右侧针刺减压/胸腔闭式引流！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-2' && (cmd.action === 'CHEST_TUBE' || cmd.action === 'EFAST_EXAM')) {
            newFlags.bControlled = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: 'eFAST/胸管', busyUntil: newState.gameTime + 10 };
            newLogs.push(createLog('Dr. B: 收到，eFAST 提示右侧胸腔可见大量无回声暗区，肺组织受压萎陷，提示大量血胸；心包腔及腹腔（肝肾隐窝、脾肾隐窝、盆腔）未见明显游离暗区。已行右侧胸腔闭式引流，立即引出 400ml 暗红色血液。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-3' && cmd.action === 'CHEST_TUBE') {
            newFlags.deathReason = '致命错误：在未排除膈疝的情况下盲目进行左侧胸腔闭式引流，引流管穿透了疝入胸腔的胃！患者并发严重纵隔炎与败血症，抢救失败！';
            newLogs.push(createLog('Dr. B: 收到，正在进行左侧胸腔闭式引流... 等等，引流管里出来了胃内容物！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-3' && (cmd.action === 'EFAST_EXAM' || cmd.action === 'GASTRIC_TUBE')) {
            newFlags.bControlled = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: 'eFAST/胃管', busyUntil: newState.gameTime + 10 };
            newLogs.push(createLog('Dr. B: 收到，eFAST 确认脾破裂及膈疝，已下胃管减压，呼吸暂时稳住。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-4' && cmd.action === 'EFAST_EXAM') {
            newFlags.bControlled = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: 'eFAST超声', busyUntil: newState.gameTime + 10 };
            newLogs.push(createLog('Dr. B: 收到，eFAST 确认无明显气胸/血胸，呼吸暂时稳定。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-5' && cmd.action === 'EFAST_EXAM') {
            newFlags.bControlled = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: 'eFAST超声', busyUntil: newState.gameTime + 10 };
            newLogs.push(createLog('Dr. B: 收到，eFAST 提示心包腔内可见约2cm宽的无回声暗区，右心室在舒张期出现明显塌陷，提示心包填塞。同时，左侧胸腔可见少量积液，提示血胸。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-5' && cmd.action === 'CHEST_TUBE') {
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '胸腔闭式引流', busyUntil: newState.gameTime + 10 };
            newLogs.push(createLog('Dr. B: 收到，已行左侧胸腔闭式引流，引出少量血液。但患者血压仍在下降！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-2' && cmd.action === 'PEEP_VENTILATION') {
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: '调整 PEEP', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. A: 收到，已调整呼吸机为 PEEP 模式，给予气道内支撑稳定连枷胸。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-3' && cmd.action === 'PEEP_VENTILATION') {
            newScores.prioritization = Math.max(0, newScores.prioritization - 30);
            newLogs.push(createLog('Dr. A: 收到，已调高 PEEP。(系统警告：高 PEEP 可能加重膈疝张力及循环衰竭！)', 'team', newState.gameTime));
          } else if (cmd.action === 'OXYGEN_100') {
            newFlags.oxygenGiven = true;
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: '调整通气/100%氧', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. A: 收到，已给予 100% 氧并调整通气策略。', 'team', newState.gameTime));
          } else {
             newLogs.push(createLog(`系统未识别指令意图或当前阶段无效: ${cmd.recognizedText}`, 'system', newState.gameTime));
          }
        }

        // Phase C: Circulation
        else if (newState.phase === 'PHASE_C') {
          if (newState.scenarioId === 'scenario-6' && cmd.action === 'PARKLAND_FORMULA') {
            newFlags.parklandStarted = true;
            if (newFlags.urineOutputChecked && newFlags.warmedLrGiven) newFlags.cControlled = true;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: 'Parkland复苏', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('Nurse C: 收到，已启动 Parkland 公式计算补液量，头 8 小时给总量一半。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'CHECK_URINE_OUTPUT') {
            newFlags.urineOutputChecked = true;
            if (newFlags.parklandStarted && newFlags.warmedLrGiven) newFlags.cControlled = true;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '插导尿管', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('Nurse C: 收到，已插入导尿管，目标尿量 0.5ml/kg/hr。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'WARMED_LR') {
            newFlags.warmedLrGiven = true;
            if (newFlags.parklandStarted && newFlags.urineOutputChecked) newFlags.cControlled = true;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '加温乳酸林格', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Nurse C: 收到，全程使用加温乳酸林格液进行复苏。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'COLD_FLUIDS') {
            newFlags.deathReason = '致命错误：给烧伤患者输注冷液体，导致致死性低体温和凝血病！';
            newLogs.push(createLog('Nurse C: 收到，正在输注常温液体... 患者体温骤降，出现严重凝血功能障碍！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'BLOOD_TRANSFUSION') {
            newFlags.deathReason = '致命错误：烧伤早期无大出血指征时大量输血，导致血液黏滞度极度增加，微循环衰竭！';
            newLogs.push(createLog('Nurse C: 收到，正在输注血液制品... 患者微循环栓塞，多脏器衰竭！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-1' && cmd.action === 'CONTINUE_MTP_TXA') {
            newFlags.cControlled = true;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '持续MTP/TXA', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('Nurse C: 收到，持续 MTP 平衡复苏，加温，已给 TXA。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-2' && cmd.action === 'MTP_111') {
            newFlags.cControlled = true;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: 'MTP 1:1:1', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('Nurse C: 收到，全速开启 MTP (1:1:1)，目标维持 SBP > 100 保障脑灌注！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-3' && cmd.action === 'MTP_111') {
            newFlags.cControlled = true;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: 'MTP 1:1:1', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('Nurse C: 收到，加压输血，1:1:1 比例持续推入！已开启液体加温仪。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-4' && cmd.action === 'PELVIC_PACKING') {
            newFlags.cControlled = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '追加填塞', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('Dr. B: 收到，没有抽出旧纱布，在旧纱布外面继续追加填塞加压！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-4' && cmd.action === 'REMOVE_GAUZE') {
            newFlags.gauzeRemoved = true;
            newFlags.deathReason = '致命错误：抽出已经填塞的纱布破坏了刚形成的凝血块，引发二次大出血致死！';
            newLogs.push(createLog('Dr. B: 收到，正在抽出旧纱布... 糟糕，大量鲜血喷涌而出！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-4' && cmd.action === 'FOLEY_CATHETER') {
            newFlags.foleyAttempted = true;
            newFlags.deathReason = '致命错误：盲目尝试插入导尿管加重了尿道撕裂，绝对禁忌！';
            newLogs.push(createLog('Nurse C: 收到，正在尝试插入 Foley 导尿管... 遇到巨大阻力，患者尿道出血加重！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-4' && cmd.action === 'ANTIBIOTICS') {
            newFlags.antibioticsGiven = true;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '抗生素/破伤风', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Nurse C: 收到，已给予破伤风和广谱抗生素（头孢曲松+甲硝唑）。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-4' && cmd.action === 'WARM_PATIENT') {
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '主动保温', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Nurse C: 收到，加温设备开到最大，Bair Hugger 热风毯覆盖上半身。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-5' && cmd.action === 'PERICARDIOCENTESIS') {
            newFlags.pericardiocentesisDone = true;
            newFlags.cControlled = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '心包穿刺', busyUntil: newState.gameTime + 15 };
            newLogs.push(createLog('Dr. B: 收到，立即在超声引导下行剑突下心包穿刺引流！抽出 50ml 不凝血！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-5' && cmd.action === 'ED_THORACOTOMY') {
            newFlags.pericardiocentesisDone = true;
            newFlags.cControlled = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '急诊室开胸', busyUntil: newState.gameTime + 20 };
            newLogs.push(createLog('Dr. B: 收到，立即进行急诊室开胸 (ED Thoracotomy)！切开心包释放积血！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-5' && cmd.action === 'CPR') {
            newFlags.cprAttempted = true;
            newFlags.deathReason = '致命错误：创伤性梗阻性休克（如心包填塞/张力性气胸）导致的 PEA，胸外按压毫无意义且浪费时间，必须立刻解除梗阻源！患者因心脏被血块卡死，按压无效死亡。';
            newLogs.push(createLog('Team: 收到，开始胸外按压 (CPR)... 等等，按压毫无效果，患者依然是 PEA！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-5' && cmd.action === 'DECISION_OR') {
            newFlags.disposition = 'OR';
            newLogs.push(createLog('Team Leader: 决定直接转运至手术室 (OR) 进行开胸修补心脏！', 'user', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-5' && cmd.action === 'DECISION_CT') {
            newFlags.deathReason = '致命错误：患者心脏有穿透伤，随时可能再次发生心包填塞，送往 CT 室导致患者在扫描机上再次填塞死亡！';
            newLogs.push(createLog('Team Leader: 决定转运至 CT 室排查。', 'user', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-3' && cmd.action === 'REBOA') {
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '准备REBOA', busyUntil: newState.gameTime + 15 };
            newLogs.push(createLog('Dr. B: 收到，正在准备 REBOA 股动脉穿刺套件。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-1' && (cmd.action === 'PELVIC_BINDER' || cmd.action === 'EFAST_EXAM')) {
            newFlags.pelvicBinderApplied = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '骨盆带/eFAST', busyUntil: newState.gameTime + 10 };
            newLogs.push(createLog('Dr. B: 收到，骨盆不稳定，已上骨盆带。eFAST 提示腹腔各间隙（肝肾隐窝、脾肾隐窝及盆腔）未见明显无回声暗区，暂无腹腔大出血征象。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-2' && cmd.action === 'EFAST_EXAM') {
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '复查 eFAST', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. B: 收到，复查 eFAST 腹腔各间隙（肝肾隐窝、脾肾隐窝及盆腔）仍未见明显游离无回声区，暂无腹腔大出血征象。骨盆带已收紧。', 'team', newState.gameTime));
          } else if (cmd.action === 'CALL_SURGEON') {
            newFlags.surgeonCalled = true;
            newTeam.scribe = { ...newTeam.scribe, status: 'busy', task: '呼叫外科', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Scribe: 收到，已呼叫创伤外科/介入，提前锁定资源。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-3' && cmd.action === 'DECISION_OR') {
            newFlags.disposition = 'OR';
            newLogs.push(createLog('Team Leader: 决定跳过 CT，直接转运至手术室 (OR) 进行紧急剖腹探查 (DCS)！', 'user', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-3' && cmd.action === 'DECISION_CT') {
            newFlags.deathReason = '致命错误：患者腹腔大出血且血流动力学极不稳定，送往 CT 室导致患者在扫描机上心跳骤停，抢救失败！';
            newLogs.push(createLog('Team Leader: 决定转运至 CT 室排查。', 'user', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-4' && cmd.action === 'DECISION_HYBRID_OR') {
            newFlags.disposition = 'HYBRID_OR';
            newLogs.push(createLog('Team Leader: 决定直接推入复合手术室 (Hybrid OR)！普外科做结肠造口，骨科做腹膜外骨盆填塞和外固定，介入科准备栓塞！', 'user', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-4' && cmd.action === 'DECISION_CT') {
            newFlags.deathReason = '致命错误：执意要去 CT 室拍骨盆三维重建，患者在 CT 室死于失血和感染性休克！';
            newLogs.push(createLog('Team Leader: 决定转运至 CT 室排查。', 'user', newState.gameTime));
          } else {
             newLogs.push(createLog(`系统未识别指令意图或当前阶段无效: ${cmd.recognizedText}`, 'system', newState.gameTime));
          }
        }

        // Phase D: Disability
        else if (newState.phase === 'PHASE_D') {
          if (newState.scenarioId === 'scenario-6' && cmd.action === 'CO_OXIMETRY') {
            newFlags.coOximetryDone = true;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '查碳氧血红蛋白', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Nurse C: 收到，动脉血气提示 COHb 达 25%！确诊一氧化碳中毒。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'OXYGEN_100_FIO2') {
            newFlags.fio2Maxed = true;
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: '给予100%纯氧', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. A: 收到，已给予 100% 纯氧，加速一氧化碳排出。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'HYPERBARIC_OXYGEN') {
            newTeam.scribe = { ...newTeam.scribe, status: 'busy', task: '联系高压氧舱', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Scribe: 收到，已联系高压氧舱准备。', 'team', newState.gameTime));
          } else if (cmd.action === 'CHECK_NEURO') {
            newFlags.neuroChecked = true;
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: '查神经系统', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. A: 收到，快速查瞳孔等大等圆，对光反射存在。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-2' && cmd.action === 'MANNITOL_HYPERTONIC') {
            newFlags.neuroChecked = true; // Use this flag to progress
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '给高渗药', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Nurse C: 收到，静推 20% 甘露醇/高渗盐水。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-2' && cmd.action === 'HEAD_ELEVATION') {
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '抬高床头', busyUntil: newState.gameTime + 3 };
            newLogs.push(createLog('Dr. B: 收到，床头已抬高 30 度。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-2' && cmd.action === 'MILD_HYPERVENTILATION') {
            newTeam.drA = { ...newTeam.drA, status: 'busy', task: '轻度过度通气', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. A: 收到，短暂轻度过度通气，目标 ETCO2 30-35 mmHg。', 'team', newState.gameTime));
          } else if (cmd.action === 'CHECK_GLUCOSE') {
            newFlags.glucoseChecked = true;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '测血糖', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Nurse C: 收到，血糖 6.5 mmol/L。', 'team', newState.gameTime));
          } else if (cmd.action === 'RECORD_NEURO') {
            newTeam.scribe = { ...newTeam.scribe, status: 'busy', task: '记录神经状态', busyUntil: newState.gameTime + 3 };
            newLogs.push(createLog('Scribe: 收到，已记录 GCS 和瞳孔状态。', 'team', newState.gameTime));
          } else {
             newLogs.push(createLog(`系统未识别指令意图或当前阶段无效: ${cmd.recognizedText}`, 'system', newState.gameTime));
          }
        }

        // Phase E: Exposure
        else if (newState.phase === 'PHASE_E') {
          if (newState.scenarioId === 'scenario-6' && cmd.action === 'CHEST_ESCHAROTOMY') {
            newFlags.escharotomyDone = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '焦痂切开', busyUntil: newState.gameTime + 10 };
            newLogs.push(createLog('Dr. B: 收到，沿双侧腋前线及肋缘下切开焦痂，胸廓瞬间弹开，气道峰压从 35 cmH2O 骤降至 20 cmH2O，通气顺畅！', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'CHECK_EXTREMITIES') {
            newFlags.extremitiesChecked = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '查四肢血运', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Dr. B: 收到，检查四肢末梢血运，目前尚可，继续密切观察骨筋膜室综合征。', 'team', newState.gameTime));
          } else if (cmd.action === 'EXPOSE_PATIENT') {
            newFlags.exposed = true;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '剪开衣物', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Nurse C: 收到，已剪开衣物完成全身暴露。', 'team', newState.gameTime));
          } else if (cmd.action === 'WARM_PATIENT') {
            newFlags.warmed = true;
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '主动保温', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Nurse C: 收到，已开启加温毯和加温输血。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-5' && cmd.action === 'LOG_ROLL') {
            newFlags.logRolled = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '背部翻身', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('Dr. B: 收到，背部翻身检查完毕，确认背部没有其他的刀伤或出口！', 'team', newState.gameTime));
          } else if (cmd.action === 'LOG_ROLL') {
            newFlags.logRolled = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '背部翻身', busyUntil: newState.gameTime + 8 };
            newLogs.push(createLog('Dr. B: 收到，背部翻身检查完毕，无明显穿透伤或脊柱压痛。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-3' && cmd.action === 'RECORD_TOURNIQUET_TIME') {
            newTeam.nurseC = { ...newTeam.nurseC, status: 'busy', task: '记录止血带', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Nurse C: 收到，已给左下肢毁损伤处做最后包裹，确认止血带时间标记清晰。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-3' && cmd.action === 'PELVIC_BINDER') {
             newFlags.pelvicBinderApplied = true;
             newTeam.drB = { ...newTeam.drB, status: 'busy', task: '查骨盆', busyUntil: newState.gameTime + 5 };
             newLogs.push(createLog('Dr. B: 收到，检查骨盆稳定性，骨盆稳定。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-5' && cmd.action === 'DECISION_OR') {
            newFlags.disposition = 'OR';
            newLogs.push(createLog('Team Leader: 绝对不去做 CT！立刻联合心胸外科，把患者带上监护仪和未输完的血，直接推入手术室 (OR) 进行开胸修补心脏！', 'user', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-5' && cmd.action === 'DECISION_CT') {
            newFlags.deathReason = '致命错误：觉得患者“稳定了”就要求推去 CT 室做个全胸腹增强 CT，患者在 CT 机里再次发生填塞死亡！';
            newLogs.push(createLog('Team Leader: 决定转运至 CT 室排查。', 'user', newState.gameTime));
          } else {
             newLogs.push(createLog(`系统未识别指令意图或当前阶段无效: ${cmd.recognizedText}`, 'system', newState.gameTime));
          }
        }

        // Phase E': Secondary Survey
        else if (newState.phase === 'PHASE_E_PRIME') {
          if (cmd.action === 'SECONDARY_SURVEY') {
            newFlags.secondarySurveyDone = true;
            newTeam.drB = { ...newTeam.drB, status: 'busy', task: '次级评估', busyUntil: newState.gameTime + 10 };
            newLogs.push(createLog('Dr. B: 收到，头到脚次级评估完成，未发现其他致命伤。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-2' && cmd.action === 'CALL_NEURO_ORTHO') {
            newTeam.scribe = { ...newTeam.scribe, status: 'busy', task: '呼叫神外/骨科', busyUntil: newState.gameTime + 5 };
            newLogs.push(createLog('Scribe: 收到，已呼叫神经外科和骨科/介入科。', 'team', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-2' && cmd.action === 'PAN_SCAN') {
            newFlags.disposition = 'PAN_SCAN';
            newLogs.push(createLog('Team Leader: 决定转运至 CT 室做 Trauma Pan-Scan，随后直奔 OR。', 'user', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-5' && cmd.action === 'DECISION_OR') {
            newFlags.disposition = 'OR';
            newLogs.push(createLog('Team Leader: 决定直接转运至手术室 (OR) 进行开胸修补心脏！', 'user', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'BURN_ICU') {
            newFlags.disposition = 'BURN_ICU';
            newLogs.push(createLog('Team Leader: 决定转运至烧伤重症监护室 (Burn ICU) 继续复苏和气道管理！', 'user', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'DECISION_OR') {
            newFlags.deathReason = '致命错误：患者目前首要问题是烧伤休克和气道，无需紧急开腹/开胸手术，转入普通 OR 导致复苏中断和感染！';
            newLogs.push(createLog('Team Leader: 决定转运至手术室 (OR)。', 'user', newState.gameTime));
          } else if (newState.scenarioId === 'scenario-6' && cmd.action === 'DECISION_CT') {
            newFlags.deathReason = '致命错误：严重烧伤休克期，患者在 CT 室死于低体温和复苏中断！';
            newLogs.push(createLog('Team Leader: 决定转运至 CT 室。', 'user', newState.gameTime));
          } else if (cmd.action === 'DECISION_OR') {
            newFlags.disposition = 'OR';
            newLogs.push(createLog('Team Leader: 决定转运至手术室 (OR) 进行外科止血。', 'user', newState.gameTime));
          } else if (cmd.action === 'DECISION_CT') {
            if (newState.scenarioId === 'scenario-3') {
               newFlags.deathReason = '致命错误：患者腹腔大出血且血流动力学极不稳定，送往 CT 室导致患者在扫描机上心跳骤停，抢救失败！';
            } else {
               newFlags.disposition = 'CT';
            }
            newLogs.push(createLog('Team Leader: 决定转运至 CT 室。', 'user', newState.gameTime));
          } else if (cmd.action === 'DECISION_IR') {
            newFlags.disposition = 'IR';
            newLogs.push(createLog('Team Leader: 决定转运至介入室 (IR)。', 'user', newState.gameTime));
          } else {
             newLogs.push(createLog(`系统未识别指令意图或当前阶段无效: ${cmd.recognizedText}`, 'system', newState.gameTime));
          }
        }
      });

      return { ...newState, logs: newLogs, team: newTeam, flags: newFlags, scores: newScores };
    }

    case 'TEAM_UPDATE_SUBMIT': {
      let newScores = { ...state.scores };
      let newLogs = [...state.logs, createLog(`[Team Update] ${action.text}`, 'user', state.gameTime)];
      
      const text = action.text.toLowerCase();
      let updateScore = 0;
      if (text.length > 10) updateScore = 100; // Simplified scoring for updates

      if (updateScore < 50) {
         newScores.leadership = Math.max(0, newScores.leadership - 10);
         newLogs.push(createLog('系统: 团队简报不完整，团队领导力扣分。', 'system', state.gameTime));
      } else {
         newLogs.push(createLog('系统: 团队简报清晰，团队目标达成一致。', 'system', state.gameTime));
      }

      // Transition to next phase based on current update phase
      let nextPhase: GamePhase = 'PHASE_A';
      if (state.phase === 'UPDATE_X') nextPhase = 'PHASE_A';
      if (state.phase === 'UPDATE_A') nextPhase = 'PHASE_B';
      if (state.phase === 'UPDATE_B') nextPhase = 'PHASE_C';
      if (state.phase === 'UPDATE_C') nextPhase = 'PHASE_D';
      if (state.phase === 'UPDATE_D') nextPhase = 'PHASE_E';

      return {
        ...state,
        phase: nextPhase,
        flags: { ...state.flags, phaseStartTime: state.gameTime },
        scores: newScores,
        logs: newLogs
      };
    }

    case 'TICK': {
      if (state.phase === 'INTRO' || state.phase === 'SUMMARY' || state.phase === 'GAME_OVER' || state.phase.startsWith('UPDATE_')) {
        return state;
      }

      let newState = { ...state, gameTime: state.gameTime + 1, realTime: state.realTime + 1 };
      const newTeam = { ...newState.team };
      const newVitals = { ...newState.vitals };
      const newFlags = { ...newState.flags };
      const newLogs = [...newState.logs];

      // Update team status
      Object.keys(newTeam).forEach((key) => {
        if (newTeam[key].status === 'busy' && newTeam[key].busyUntil <= newState.gameTime) {
          newTeam[key] = { ...newTeam[key], status: 'idle', task: null };
          
          // Trigger events when specific tasks finish
          if (key === 'drB' && newFlags.xControlled && newState.phase === 'PHASE_X') {
             newLogs.push(createLog('Dr. B 报告：止血带已收紧，动脉喷血停止。', 'team', newState.gameTime));
          }
        }
      });

        // Phase 0 -> Phase X Transition
        if (newState.phase === 'PHASE_0' && newState.gameTime >= 120) {
          newState.phase = 'PHASE_X';
          newFlags.phaseStartTime = newState.gameTime;
          let introText = '';
          if (newState.scenarioId === 'scenario-1') {
            introText = '患者推入。移床时止血带滑脱，右大腿残端出现动脉喷射性出血！';
          } else if (newState.scenarioId === 'scenario-2') {
            introText = '患者推入。深度昏迷（GCS 4分）。会阴部及大腿根部可见一道 15cm 撕裂伤，伴有持续的暗红色静脉样涌血及动脉搏动性喷血。';
          } else if (newState.scenarioId === 'scenario-3') {
            introText = '患者推入。左下肢膝关节处皮肉剥离，骨质外露，院前止血带由于浸满泥沙有松动迹象，伤口处有鲜血持续涌出。';
          } else if (newState.scenarioId === 'scenario-4') {
            introText = '患者推入。下半身衣物已被血液浸透。剪开衣物后，发现患者下腹部至会阴部存在巨大的撕裂伤，骨盆前环（耻骨联合）完全裂开，伤口内不断涌出暗红色血液（静脉丛出血）夹杂着尿液和粪便。双下肢外旋、缩短。';
          } else if (newState.scenarioId === 'scenario-5') {
            introText = '患者推入。左胸前区（心脏投影区）有一处 2cm 刀刺伤，伤口处无明显活动性出血。患者极度烦躁，面色苍白，大汗淋漓。颈静脉怒张。';
          } else if (newState.scenarioId === 'scenario-6') {
            introText = '患者推入。面部、颈部、前胸大面积深度烧伤，面目全非。眉毛、鼻毛烧焦，口鼻周围有大量黑色炭末。患者极度烦躁，呼吸急促，伴有明显的吸气性喉鸣（Stridor），声音嘶哑。无明显活动性大出血。';
          }
          newLogs.push(createLog(introText, 'system', newState.gameTime));
        }

      // Phase X Logic
      if (newState.phase === 'PHASE_X') {
        if (!newFlags.xControlled) {
          if ((newState.gameTime - newFlags.phaseStartTime) % 5 === 0) {
            if (newState.scenarioId === 'scenario-1') {
              newVitals.bpSys -= 2; newVitals.bpDia -= 1; newVitals.hr += 2;
            } else if (newState.scenarioId === 'scenario-2') {
              // Scenario 2: Cushing's reflex masked by shock
              newVitals.bpSys -= 3; newVitals.bpDia -= 1; newVitals.hr += 3;
            } else if (newState.scenarioId === 'scenario-3') {
              newVitals.bpSys -= 2; newVitals.bpDia -= 1; newVitals.hr += 2;
            } else if (newState.scenarioId === 'scenario-4') {
              newVitals.bpSys -= 3; newVitals.bpDia -= 2; newVitals.hr += 3;
            } else if (newState.scenarioId === 'scenario-5') {
              // Scenario 5: Tamponade physiology
              newVitals.bpSys -= 2; newVitals.bpDia += 1; // Narrowing pulse pressure
              newVitals.hr += 2;
            }
          }
          if (newVitals.bpSys <= 40) {
            newState.phase = 'GAME_OVER';
            newFlags.deathReason = '失血性休克 (Exsanguination)';
            newLogs.push(createLog('患者因失血性休克死亡。考核失败。', 'system', newState.gameTime));
          }
        } else if (newState.scenarioId === 'scenario-2' && newFlags.xControlled && newFlags.pelvicBinderApplied) {
           if (newVitals.bpSys < 140) newVitals.bpSys += 1; // Stabilize a bit
        } else if (newState.scenarioId === 'scenario-3' && newFlags.xControlled) {
           if (newVitals.bpSys > 75) newVitals.bpSys -= 1; // Drop to 75/40
        } else if (newState.scenarioId === 'scenario-4' && newFlags.xControlled) {
           if (newVitals.bpSys < 60) newVitals.bpSys += 1; // Stabilize a bit at 60/40
        } else if (newState.scenarioId === 'scenario-5' && newFlags.xControlled) {
           // Scenario 5: X is controlled immediately since no external bleeding
        }

        if (newFlags.trapATriggered && newFlags.trapATime) {
           if (newState.gameTime - newFlags.trapATime >= 30) {
              newState.phase = 'GAME_OVER';
              newFlags.deathReason = '心搏骤停 (PEA) - 违背 XABCDE 优先级';
              newLogs.push(createLog('患者因失血性休克发生心搏骤停 (PEA)。考核失败。', 'system', newState.gameTime));
           }
        }

        if (newFlags.xControlled && newFlags.ivAccess && newTeam.drB.status === 'idle' && newTeam.nurseC.status === 'idle') {
           if (newState.scenarioId === 'scenario-2' && !newFlags.pelvicBinderApplied) {
             // Wait for pelvic binder in scenario 2
           } else if (newState.scenarioId === 'scenario-4' && (!newFlags.pelvicBinderApplied || !newFlags.pelvicPacked)) {
             // Wait for both binder and packing in scenario 4
           } else {
             newState.phase = 'UPDATE_X';
             newLogs.push(createLog('系统强制交互：X 刚控制后，请向全团队总结目前的情况和下一步计划。', 'system', newState.gameTime));
           }
        }
      }

      // Phase A Logic
      if (newState.phase === 'PHASE_A') {
        if (newState.gameTime === newFlags.phaseStartTime) {
           let introText = '';
           if (newState.scenarioId === 'scenario-1') {
             introText = '患者极度烦躁/呻吟，口鼻有血液，存在误吸风险。';
           } else if (newState.scenarioId === 'scenario-2') {
             introText = '患者发出无意义呼噜声，口腔内有少量分泌物，呼吸费力。';
           } else if (newState.scenarioId === 'scenario-3') {
             introText = '患者意识烦躁（休克表现），呼吸急促（35次/分），面罩吸氧下 SpO2 依然只有 85%。气管右偏，左侧胸廓饱满，听诊左下肺呼吸音消失，可闻及类似肠鸣音。';
           } else if (newState.scenarioId === 'scenario-4') {
             introText = '大出血暂缓（但未完全停止）。患者因极度失血休克，GCS 降至 6 分，呼吸浅快（30次/分）。';
           } else if (newState.scenarioId === 'scenario-5') {
             introText = '患者极度烦躁，大口喘气，但气道通畅，能含糊说话。';
           } else if (newState.scenarioId === 'scenario-6') {
             introText = '患者吸气性喉鸣进行性加重，声音嘶哑，口咽部可见大量炭末及黏膜水肿。SpO2 92%（面罩吸氧）。';
           }
           newLogs.push(createLog(introText, 'system', newState.gameTime));
        }
        if (!newFlags.airwayProtected) {
           if (newState.gameTime % 5 === 0) newVitals.spo2 -= 1;
        }
        if (newFlags.airwayProtected && newFlags.cSpineProtected && newTeam.drA.status === 'idle') {
           if (newState.scenarioId === 'scenario-2' || newState.scenarioId === 'scenario-3') {
             newState.phase = 'UPDATE_A';
             newLogs.push(createLog('系统强制交互：气管插管完成后，请向全团队总结目前的情况和下一步计划。', 'system', newState.gameTime));
           } else {
             newState.phase = 'PHASE_B';
             newFlags.phaseStartTime = newState.gameTime;
           }
        }
      }

      // Phase B Logic
      if (newState.phase === 'PHASE_B') {
        if (newState.gameTime === newFlags.phaseStartTime) {
           let introText = '';
           if (newState.scenarioId === 'scenario-1') {
             introText = 'SpO2 84%，气管向左偏移、右侧呼吸音消失、颈静脉怒张。';
             newVitals.spo2 = 84;
           } else if (newState.scenarioId === 'scenario-2') {
             introText = '插管正压通气后，监护仪报警，SpO2 依然只有 88%。查体发现：右侧胸壁有一块区域随呼吸呈现反常运动（连枷胸），右肺呼吸音减弱。';
             newVitals.spo2 = 88;
           } else if (newState.scenarioId === 'scenario-3') {
             introText = '插管正压通气后，患者气道压极高，SpO2 徘徊在 88% 左右。左侧胸廓更加饱满。';
             newVitals.spo2 = 88;
           } else if (newState.scenarioId === 'scenario-4') {
             introText = '插管成功。超声提示双侧多发肋骨骨折，但无明显气胸/血胸。SpO2 95%。';
             newVitals.spo2 = 95;
           } else if (newState.scenarioId === 'scenario-5') {
             introText = '患者面罩吸氧下 SpO2 96%，但呼吸急促（35次/分）。颈静脉怒张更加明显，心音遥远。';
             newVitals.spo2 = 96;
           } else if (newState.scenarioId === 'scenario-6') {
             introText = '气道建立后，患者突发极度呼吸困难，气道峰压（PIP）报警高达 45 cmH2O！听诊右肺呼吸音完全消失，颈静脉怒张，血压骤降至 60/40 mmHg。';
             newVitals.spo2 = 85;
             newVitals.bpSys = 60;
             newVitals.bpDia = 40;
           }
           newLogs.push(createLog(introText, 'system', newState.gameTime));
        }
        if (!newFlags.bControlled) {
           if (newState.gameTime % 3 === 0) newVitals.spo2 -= 1;
           if (newVitals.spo2 <= 70) {
              newState.phase = 'GAME_OVER';
              newFlags.deathReason = '严重低氧血症致死';
              newLogs.push(createLog('患者因严重低氧和循环衰竭死亡。考核失败。', 'system', newState.gameTime));
           }
        } else {
           if (newState.gameTime % 2 === 0 && newVitals.spo2 < 96) newVitals.spo2 += 1;
        }

        if (newFlags.bControlled && newTeam.drB.status === 'idle') {
           newState.phase = 'UPDATE_B';
           newLogs.push(createLog('系统强制交互：胸部问题处理后，请向全团队总结目前的情况和下一步计划。', 'system', newState.gameTime));
        }
      }

      // Phase C Logic
      if (newState.phase === 'PHASE_C') {
        if (newState.gameTime === newFlags.phaseStartTime) {
           let introText = '';
           if (newState.scenarioId === 'scenario-1') {
             introText = '胸部问题解决后，BP 60/40、HR 150；提示仍在失血或复苏不足。';
             newVitals.bpSys = 60; newVitals.bpDia = 40; newVitals.hr = 150;
           } else if (newState.scenarioId === 'scenario-2') {
             introText = '胸管引流后，患者血压突然从 140/90 崩塌至 75/40，心率飙升至 130（休克彻底暴露，库欣反射被严重失血掩盖）。';
             newVitals.bpSys = 75; newVitals.bpDia = 40; newVitals.hr = 130;
           } else if (newState.scenarioId === 'scenario-3') {
             introText = '呼吸暂时稳住，但血压持续崩塌。复测 BP 60/30，HR 145。腹部极度膨隆。eFAST 超声结果回报：脾肾隐窝及左侧胸腔可见大量游离暗区（积液/血）。';
             newVitals.bpSys = 60; newVitals.bpDia = 30; newVitals.hr = 145;
           } else if (newState.scenarioId === 'scenario-4') {
             introText = '血压在输注 4 单位红细胞后，停留在 75/50。护士报告：“创面纱布已经完全被血液和粪便浸透了！而且体温掉到了 34.5℃。”';
             newVitals.bpSys = 75; newVitals.bpDia = 50; newVitals.hr = 135;
           } else if (newState.scenarioId === 'scenario-5') {
             introText = '患者血压突然测不出！颈动脉搏动微弱。监护仪显示窦性心动过速（HR 140），但摸不到桡动脉脉搏（典型的 PEA 濒死状态）！';
             newVitals.bpSys = 40; newVitals.bpDia = 20; newVitals.hr = 140;
           } else if (newState.scenarioId === 'scenario-6') {
             introText = '气道压力缓解后，患者血压仍仅为 80/50 mmHg，心率 130 次/分。双下肢大面积烧伤创面渗液明显，尿管引流出少量浓缩尿液（10ml）。';
             newVitals.bpSys = 80; newVitals.bpDia = 50; newVitals.hr = 130;
           }
           newLogs.push(createLog(introText, 'system', newState.gameTime));
        }
        if (!newFlags.cControlled) {
           if (newState.gameTime % 5 === 0) newVitals.bpSys -= 1;
           if (newState.scenarioId === 'scenario-5' && newVitals.bpSys <= 30) {
              newState.phase = 'GAME_OVER';
              newFlags.deathReason = '心包填塞导致无脉性电活动 (PEA) 死亡';
              newLogs.push(createLog('患者因心包填塞导致心脏停搏死亡。考核失败。', 'system', newState.gameTime));
           }
        } else {
           if (newState.gameTime % 3 === 0 && newVitals.bpSys < (newState.scenarioId === 'scenario-1' ? 90 : 95)) {
              newVitals.bpSys += 1; newVitals.bpDia += 1; newVitals.hr -= 1;
           }
           if (newState.scenarioId === 'scenario-4' && newFlags.cControlled && newVitals.bpSys < 80) {
              newVitals.bpSys += 1; // Stabilize at 80/50
           }
           if (newState.scenarioId === 'scenario-5' && newFlags.pericardiocentesisDone) {
              if (newVitals.bpSys < 90) newVitals.bpSys += 5; // Rapid improvement after decompression
           }
        }

        if (newFlags.cControlled && newTeam.nurseC.status === 'idle' && newTeam.drB.status === 'idle') {
           if (newState.scenarioId === 'scenario-4' && !newFlags.antibioticsGiven) {
             // Wait for antibiotics in scenario 4
           } else if (newState.scenarioId === 'scenario-6') {
             newState.phase = 'UPDATE_C';
             newLogs.push(createLog('系统强制交互：烧伤休克复苏启动后，请向全团队总结目前的情况和下一步计划。', 'system', newState.gameTime));
           } else {
             newState.phase = 'UPDATE_C';
             newLogs.push(createLog('系统强制交互：MTP启动后，请向全团队总结目前的情况和下一步计划。', 'system', newState.gameTime));
           }
        }
      }

      // Phase D Logic
      if (newState.phase === 'PHASE_D') {
        if (newState.gameTime === newFlags.phaseStartTime) {
           let introText = '';
           if (newState.scenarioId === 'scenario-1') {
             introText = '循环暂稳后，出现意识变化/瞳孔不等大/癫痫样抽动等提示脑损伤并存。';
           } else if (newState.scenarioId === 'scenario-2') {
             introText = '输血中，护士报告：“队长，患者右侧瞳孔散大至 5mm，对光反射消失！左侧 2mm。”';
           } else if (newState.scenarioId === 'scenario-3') {
             introText = '转运手术室前争取到的最后 1-2 分钟。';
           } else if (newState.scenarioId === 'scenario-4') {
             introText = '准备转运前，快速检查神经系统。';
           } else if (newState.scenarioId === 'scenario-5') {
             introText = '心包减压后，患者血压回升至 90/60，意识逐渐恢复，烦躁减轻。';
           } else if (newState.scenarioId === 'scenario-6') {
             introText = '补液通道建立后，患者意识逐渐模糊，对疼痛刺激仅有退缩反应（GCS 8分）。';
           }
           newLogs.push(createLog(introText, 'system', newState.gameTime));
        }
        if (newFlags.neuroChecked && newTeam.drA.status === 'idle' && newTeam.nurseC.status === 'idle') {
           if (newState.scenarioId === 'scenario-2') {
             newState.phase = 'UPDATE_D';
             newLogs.push(createLog('系统强制交互：发现瞳孔散大并处理后，请向全团队总结目前的情况和下一步计划。', 'system', newState.gameTime));
           } else if (newState.scenarioId === 'scenario-6' && newFlags.coOximetryDone) {
             newState.phase = 'PHASE_E';
             newFlags.phaseStartTime = newState.gameTime;
           } else if (newState.scenarioId !== 'scenario-6') {
             newState.phase = 'PHASE_E';
             newFlags.phaseStartTime = newState.gameTime;
           }
        }
      }

      // Phase E Logic
      if (newState.phase === 'PHASE_E') {
        if (newState.gameTime === newFlags.phaseStartTime) {
           newLogs.push(createLog('准备进入全身暴露查体。', 'system', newState.gameTime));
        }
        if (newState.scenarioId === 'scenario-3') {
          if (newFlags.exposed && newFlags.warmed && newFlags.pelvicBinderApplied && newTeam.nurseC.status === 'idle') {
             newState.phase = 'PHASE_E_PRIME';
             newFlags.phaseStartTime = newState.gameTime;
          }
        } else if (newState.scenarioId === 'scenario-4') {
          // Scenario 4 skips standard E and goes to definitive care decision
          newState.phase = 'PHASE_E_PRIME';
          newFlags.phaseStartTime = newState.gameTime;
        } else if (newState.scenarioId === 'scenario-5') {
          if (newFlags.exposed && newFlags.warmed && newFlags.logRolled && newTeam.nurseC.status === 'idle') {
             newState.phase = 'PHASE_E_PRIME';
             newFlags.phaseStartTime = newState.gameTime;
          }
        } else if (newState.scenarioId === 'scenario-6') {
          if (newFlags.exposed && newFlags.warmed && newFlags.escharotomyDone && newTeam.nurseC.status === 'idle') {
             newState.phase = 'PHASE_E_PRIME';
             newFlags.phaseStartTime = newState.gameTime;
          }
        } else {
          if (newFlags.exposed && newFlags.warmed && newFlags.logRolled && newTeam.nurseC.status === 'idle') {
             newState.phase = 'PHASE_E_PRIME';
             newFlags.phaseStartTime = newState.gameTime;
          }
        }
      }

      // Phase E' Logic
      if (newState.phase === 'PHASE_E_PRIME') {
        if (newState.gameTime === newFlags.phaseStartTime) {
           if (newState.scenarioId === 'scenario-3') {
             newLogs.push(createLog('系统提示：是否需要完成从头到脚的详细次级评估（E\'）及 X光/CT 检查？', 'system', newState.gameTime));
           } else if (newState.scenarioId === 'scenario-4') {
             newLogs.push(createLog('系统提示：A、B 稳定，C 处于极其脆弱的平衡中。骨科、普外、介入科均已到达急诊。请决定患者去向。', 'system', newState.gameTime));
           } else if (newState.scenarioId === 'scenario-5') {
             newLogs.push(createLog('系统提示：心包穿刺/开胸后，患者暂时稳定，但心脏仍有穿透伤。请决定患者去向。', 'system', newState.gameTime));
           } else if (newState.scenarioId === 'scenario-6') {
             newLogs.push(createLog('系统提示：双下肢焦痂切开后，远端血运恢复。患者目前气道压力缓解，循环部分代偿。请决定患者去向。', 'system', newState.gameTime));
           } else {
             newLogs.push(createLog('初级评估完成，请进行 E\' 次级评估并明确患者去向 (OR / CT / IR)。', 'system', newState.gameTime));
           }
        }
        if (newFlags.disposition) {
           if (newFlags.disposition === 'CT') {
              newState.phase = 'GAME_OVER';
              if (newState.scenarioId === 'scenario-3') {
                 newFlags.deathReason = '致命错误：患者腹腔大出血且血流动力学极不稳定，送往 CT 室导致患者在扫描机上心跳骤停，抢救失败！';
              } else if (newState.scenarioId === 'scenario-4') {
                 newFlags.deathReason = '致命错误：执意要去 CT 室拍骨盆三维重建，患者在 CT 室死于失血和感染性休克！';
              } else if (newState.scenarioId === 'scenario-5') {
                 newFlags.deathReason = '致命错误：患者心脏有穿透伤，随时可能再次发生心包填塞，送往 CT 室导致患者在扫描机上再次填塞死亡！';
              } else if (newState.scenarioId === 'scenario-6') {
                 newFlags.deathReason = '致命错误：重度烧伤合并吸入性损伤患者，在未彻底稳定前送往 CT 室，途中发生气道梗阻和休克加重死亡！';
              } else {
                 newFlags.deathReason = '在未达稳定条件下执意去 CT，患者在转运途中崩盘。';
              }
              newLogs.push(createLog('患者在 CT 室发生不可逆休克死亡。考核失败。', 'system', newState.gameTime));
           } else {
              newState.phase = 'SUMMARY';
              newLogs.push(createLog(`患者生命体征平稳，准备转运至 ${newFlags.disposition}。考核结束。`, 'system', newState.gameTime));
           }
        }
      }

      return { ...newState, team: newTeam, vitals: newVitals, flags: newFlags, logs: newLogs };
    }

    default:
      return state;
  }
}
