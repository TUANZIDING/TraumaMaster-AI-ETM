export type GamePhase =
  | 'SCENARIO_SELECT'
  | 'INTRO'
  | 'PHASE_0'
  | 'PHASE_X'
  | 'UPDATE_X'
  | 'PHASE_A'
  | 'UPDATE_A'
  | 'PHASE_B'
  | 'UPDATE_B'
  | 'PHASE_C'
  | 'UPDATE_C'
  | 'PHASE_D'
  | 'UPDATE_D'
  | 'PHASE_E'
  | 'PHASE_E_PRIME'
  | 'SUMMARY'
  | 'GAME_OVER';

export interface Vitals {
  hr: number;
  bpSys: number;
  bpDia: number;
  spo2: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'busy';
  task: string | null;
  busyUntil: number; // timestamp in game time (seconds)
}

export interface GameLog {
  id: string;
  time: number; // game time
  text: string;
  sender: 'system' | 'user' | 'team' | 'ai';
}

export interface GameState {
  scenarioId: string | null;
  phase: GamePhase;
  gameTime: number; // in seconds, starts at 0
  realTime: number; // in seconds, starts at 0
  vitals: Vitals;
  team: Record<string, TeamMember>;
  logs: GameLog[];
  flags: {
    prepMtp: boolean;
    prepAirway: boolean;
    prepTourniquet: boolean;
    prepWarmer: boolean;
    prepEfast: boolean;
    
    xControlled: boolean;
    ivAccess: boolean;
    
    airwayProtected: boolean;
    cSpineProtected: boolean;
    
    bControlled: boolean;
    oxygenGiven: boolean;
    
    cControlled: boolean;
    pelvicBinderApplied: boolean;
    surgeonCalled: boolean;
    
    neuroChecked: boolean;
    glucoseChecked: boolean;
    
    exposed: boolean;
    warmed: boolean;
    logRolled: boolean;
    
    secondarySurveyDone: boolean;
    disposition: string | null;

    handsOnPenalty: boolean;
    deathReason: string | null;
    trapATriggered: boolean;
    trapATime: number | null;
    
    phaseStartTime: number;

    // Scenario 4 specific flags
    pelvicPacked: boolean;
    mdtCalled: boolean;
    antibioticsGiven: boolean;
    foleyAttempted: boolean;
    gauzeRemoved: boolean;
    lowerIvAttempted: boolean;

    // Scenario 5 specific flags
    pericardiocentesisDone: boolean;
    cprAttempted: boolean;
    showCprTrap: boolean;
    intubatedAwake: boolean;

    // Scenario 6 specific flags
    tracheostomyDone: boolean;
    cricothyrotomyDone: boolean;
    adrenalineGiven: boolean;
    succinylcholineGiven: boolean;
    parklandStarted: boolean;
    urineOutputChecked: boolean;
    warmedLrGiven: boolean;
    coOximetryDone: boolean;
    fio2Maxed: boolean;
    escharotomyDone: boolean;
    extremitiesChecked: boolean;
  };
  scores: {
    prioritization: number; // 0 or 100
    parallel: number; // 0 to 100
    leadership: number; // 0 to 100
    anticipation: number; // 0 to 100
  };
}

export type ActionType =
  | 'PREP_MTP' | 'PREP_AIRWAY' | 'PREP_TOURNIQUET' | 'PREP_WARMER' | 'PREP_EFAST'
  | 'APPLY_TOURNIQUET' | 'WOUND_PACKING' | 'MANUAL_PRESSURE' | 'START_MTP_IV'
  | 'CHECK_AIRWAY' | 'C_SPINE_SUCTION' | 'INTUBATE' | 'RSI_KETAMINE' | 'RECORD_AIRWAY'
  | 'NEEDLE_DECOMPRESSION' | 'CHEST_TUBE' | 'OXYGEN_100' | 'PEEP_VENTILATION' | 'GASTRIC_TUBE'
  | 'CONTINUE_MTP_TXA' | 'MTP_111' | 'PELVIC_BINDER' | 'EFAST_EXAM' | 'CALL_SURGEON' | 'REBOA'
  | 'CHECK_NEURO' | 'CHECK_GLUCOSE' | 'RECORD_NEURO' | 'MANNITOL_HYPERTONIC' | 'HEAD_ELEVATION' | 'MILD_HYPERVENTILATION'
  | 'EXPOSE_PATIENT' | 'WARM_PATIENT' | 'LOG_ROLL' | 'RECORD_TOURNIQUET_TIME'
  | 'SECONDARY_SURVEY' | 'CALL_NEURO_ORTHO' | 'PAN_SCAN' | 'DECISION_OR' | 'DECISION_CT' | 'DECISION_IR'
  | 'PELVIC_PACKING' | 'IV_ACCESS_UPPER' | 'IV_ACCESS_LOWER' | 'FOLEY_CATHETER' | 'ANTIBIOTICS' | 'DECISION_HYBRID_OR' | 'CALL_MDT' | 'REMOVE_GAUZE'
  | 'PERICARDIOCENTESIS' | 'ED_THORACOTOMY' | 'CPR' | 'OXYGEN_MASK'
  | 'TRACHEOSTOMY' | 'CRICOTHYROTOMY' | 'NEBULIZED_ADRENALINE' | 'RSI_SUCCINYLCHOLINE' | 'BAG_VALVE_MASK' | 'PARKLAND_FORMULA' | 'CHECK_URINE_OUTPUT' | 'WARMED_LR' | 'COLD_FLUIDS' | 'BLOOD_TRANSFUSION' | 'CO_OXIMETRY' | 'OXYGEN_100_FIO2' | 'HYPERBARIC_OXYGEN' | 'CHEST_ESCHAROTOMY' | 'CHECK_EXTREMITIES' | 'BURN_ICU'
  | 'UNKNOWN';

export interface ParsedCommand {
  action: ActionType;
  target: string | null; // 'Dr. A', 'Dr. B', 'Nurse C', 'Scribe', 'User', or null
  recognizedText: string;
}
