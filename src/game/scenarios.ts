import { GameState } from './types';

export interface ScenarioDef {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  objectives: string[];
  initialVitals: GameState['vitals'];
  introLog: string;
}

export const SCENARIOS: Record<string, ScenarioDef> = {
  'scenario-1': {
    id: 'scenario-1',
    title: '绝命机车——失控的“X”与隐藏的“B”',
    subtitle: 'Motorcycle crash with amputation and tension pneumothorax',
    description: '25岁男性，摩托车祸，右大腿离断，现场已绑止血带，目前血压 70/40。',
    objectives: [
      '优先级判断 (Clinical Prioritization: X > A)',
      '并行资源分配 (Parallel Processing)',
      '团队沟通 (10-second update)',
      '作为 Team Leader，请勿亲自执行操作 (Hands-off rule)'
    ],
    initialVitals: { hr: 110, bpSys: 70, bpDia: 40, spo2: 98 },
    introLog: '急救车通讯：2分钟后到达。25岁男性，摩托车祸，右大腿离断，现场已绑止血带，目前血压 70/40。'
  },
  'scenario-2': {
    id: 'scenario-2',
    title: '沉默的坠落——脑与血的博弈',
    subtitle: 'Fall from height with severe TBI and pelvic fracture',
    description: '45岁男性，建筑工人，从 4 楼（约 12 米）脚手架坠落。重度颅脑损伤 + 开放性骨盆骨折 + 多发肋骨骨折伴连枷胸。',
    objectives: [
      '识别“高压缓脉”提示的严重 TBI（脑外伤）',
      '预警开放性骨盆骨折',
      '库欣反射与失血性休克的病理生理冲突',
      '隐匿性出血源的快速排查'
    ],
    initialVitals: { hr: 55, bpSys: 180, bpDia: 100, spo2: 90 },
    introLog: '120 呼叫：“患者坠落伤，昏迷，目前生命体征：BP 180/100, HR 55, SpO2 90%。右侧大腿和会阴部有大量血迹。预计 3 分钟后到达。”'
  },
  'scenario-3': {
    id: 'scenario-3',
    title: '无声的绞肉机——破裂的屏障与失控的内出血',
    subtitle: 'Crush injury with diaphragmatic rupture and splenic laceration',
    description: '32岁女性，行人在十字路口被重型渣土车卷入车底碾压。左下肢毁损，极度呼吸困难，严重休克。',
    objectives: [
      '预判复杂的胸腹联合伤（碾压机制极易导致膈肌破裂）',
      '识别膈疝的经典体征，避免致命的“插管陷阱”',
      '识别并处理持续的腹腔大出血',
      '出色的损害控制外科（DCS）理念，直接去 OR'
    ],
    initialVitals: { hr: 125, bpSys: 85, bpDia: 50, spo2: 89 },
    introLog: '120 呼叫：“患者被渣土车碾压，左下肢血肉模糊，现场交警已用止血带控制左腿出血。患者诉左胸及左上腹剧痛，呼吸极度困难。目前 BP 85/50，HR 125，SpO2 89%。预计 2 分钟后到达。”'
  },
  'scenario-4': {
    id: 'scenario-4',
    title: '崩塌的底座——血与污的失控',
    subtitle: 'Open Pelvic Fracture with perineal avulsion and visceral rupture',
    description: '32岁女性，重型车辆碾压。骨盆极其不稳定伴会阴完全撕脱（直肠/膀胱破裂）。面对深渊般的喷血与污染，你必须在极限状态下做出正确的通路选择与填塞决策。',
    objectives: [
      '识别并处理极其惨烈的开放性骨盆骨折',
      '正确选择静脉通路（避开下肢/股静脉陷阱）',
      '掌握极限止血控制（Damage Control）的纱布填塞技巧',
      '协调多学科团队（MDT）直接进入复合手术室（Hybrid OR）'
    ],
    initialVitals: { hr: 140, bpSys: 40, bpDia: 20, spo2: 92 },
    introLog: '120 呼叫（警报声急促）：“急诊注意，接收一名 32 岁女性车祸碾压伤。现场极其惨烈，患者会阴部完全撕脱，骨盆严重变形，现场失血极多。目前患者意识模糊，血压测不出（触不到桡动脉），颈动脉搏动微弱（140次/分）。距离到达还有 1 分钟！”'
  },
  'scenario-5': {
    id: 'scenario-5',
    title: '尖刃的谎言——隐秘的“危险三角”',
    subtitle: 'Penetrating chest trauma with cardiac tamponade and tension hemothorax',
    description: '28岁男性，胸前区穿透伤，表面出血已停。脉压差缩小，极度烦躁。看似平静的伤口下，心脏正在被不断涌出的鲜血慢慢绞杀。你必须在心跳停止前揪出真凶。',
    objectives: [
      '识别“危险三角区”穿透伤及心包填塞早期征象（脉压差缩小）',
      '避免在清醒心包填塞患者身上盲目进行正压通气（插管）',
      '快速使用 eFAST 确诊心包填塞',
      '发生 PEA 时，识别为梗阻性休克，避免无效的 CPR，立即行心包穿刺/开胸',
      '避免 CT，直接转运至手术室（OR）'
    ],
    initialVitals: { hr: 130, bpSys: 90, bpDia: 70, spo2: 92 },
    introLog: '120 呼叫：“接收一名 28 岁男性，斗殴刺伤。伤口在左侧胸前区，目前已经不出血了。患者极度烦躁，大汗淋漓。生命体征：BP 90/70，HR 130，SpO2 92%。预计 3 分钟到达。”'
  },
  'scenario-6': {
    id: 'scenario-6',
    title: '寂静的倒计时——被封锁的生命通道',
    subtitle: 'Blast injury with inhalation burns & tracheostomy',
    description: '35岁男性，密闭空间粉尘爆炸。面部熏黑，声音极度嘶哑，SpO2 显示"正常"，但患者意识越来越差。气道正在以肉眼可见的速度肿胀锁死，而爆炸的冲击波已在肺里埋下了无形的炸弹。你只有一次机会，做出正确的气道决策。',
    objectives: [
      '早期预防性气管切开 vs RSI插管的决策',
      '识别 CO 中毒的 SpO2 假象',
      '识别并处理正压通气诱发的张力性气胸',
      '精准执行 Parkland 烧伤复苏公式',
      '识别并处理胸部环形焦痂造成的限制通气障碍'
    ],
    initialVitals: { hr: 118, bpSys: 115, bpDia: 75, spo2: 93 },
    introLog: '120 呼叫："化工厂密闭空间粉尘爆炸伤。35岁男性，面部熏黑，头发烧焦，体表烧伤面积约 25%。患者目前清醒，能回答问题，但声音极度嘶哑，出现间歇性喉鸣音（Stridor）。自诉胸痛剧烈。生命体征：BP 115/75，HR 118，SpO2 93%（面罩吸氧中）。距离到达 5 分钟。"'
  }
};
