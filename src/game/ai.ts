import { GoogleGenAI, Type, Schema } from '@google/genai';
import { ActionType, GamePhase } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const actionSchema: Schema = {
  type: Type.ARRAY,
  description: "List of actions extracted from the user's command.",
  items: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        description: "The mapped action type.",
        enum: [
          'PREP_MTP', 'PREP_AIRWAY', 'PREP_TOURNIQUET', 'PREP_WARMER', 'PREP_EFAST',
          'APPLY_TOURNIQUET', 'WOUND_PACKING', 'MANUAL_PRESSURE', 'START_MTP_IV',
          'CHECK_AIRWAY', 'C_SPINE_SUCTION', 'INTUBATE', 'RSI_KETAMINE', 'RECORD_AIRWAY',
          'NEEDLE_DECOMPRESSION', 'CHEST_TUBE', 'OXYGEN_100', 'PEEP_VENTILATION', 'GASTRIC_TUBE',
          'CONTINUE_MTP_TXA', 'MTP_111', 'PELVIC_BINDER', 'EFAST_EXAM', 'CALL_SURGEON', 'REBOA',
          'CHECK_NEURO', 'CHECK_GLUCOSE', 'RECORD_NEURO', 'MANNITOL_HYPERTONIC', 'HEAD_ELEVATION', 'MILD_HYPERVENTILATION',
          'EXPOSE_PATIENT', 'WARM_PATIENT', 'LOG_ROLL', 'RECORD_TOURNIQUET_TIME',
          'SECONDARY_SURVEY', 'CALL_NEURO_ORTHO', 'PAN_SCAN', 'DECISION_OR', 'DECISION_CT', 'DECISION_IR',
          'PELVIC_PACKING', 'IV_ACCESS_UPPER', 'IV_ACCESS_LOWER', 'FOLEY_CATHETER', 'ANTIBIOTICS', 'DECISION_HYBRID_OR', 'CALL_MDT', 'REMOVE_GAUZE',
          'PERICARDIOCENTESIS', 'ED_THORACOTOMY', 'CPR', 'OXYGEN_MASK',
          'UNKNOWN'
        ]
      },
      target: {
        type: Type.STRING,
        description: "The team member assigned to this task, or 'User' if the user is doing it themselves.",
        enum: ['Dr. A', 'Dr. B', 'Nurse C', 'Scribe', 'User', 'null']
      },
      recognizedText: {
        type: Type.STRING,
        description: "A brief summary of what was recognized for this specific action."
      }
    },
    required: ["action", "target", "recognizedText"]
  }
};

export async function parseUserCommand(input: string, phase: GamePhase): Promise<{ action: ActionType; target: string | null; recognizedText: string }[]> {
  try {
    const prompt = `
You are the NLP engine for a trauma simulation game (TraumaMaster-AI ETM).
The user (Team Leader) entered the following command: "${input}"
Current Game Phase: ${phase}

Map their intent to one or more of the following actions, and assign them to the correct team member if specified.
Available actions:
- PREP_MTP (Prepare massive transfusion protocol)
- PREP_AIRWAY (Prepare airway equipment)
- PREP_TOURNIQUET (Prepare tourniquet/pelvic binder)
- PREP_WARMER (Prepare warming equipment)
- PREP_EFAST (Prepare ultrasound/chest tube)
- APPLY_TOURNIQUET (Apply tourniquet to stop bleeding)
- WOUND_PACKING (Pack wound with gauze and apply pressure)
- MANUAL_PRESSURE (User manually pressing on wound)
- START_MTP_IV (Start MTP, IV/IO access, draw blood)
- CHECK_AIRWAY (Assess airway/breathing)
- C_SPINE_SUCTION (C-spine neutral, suction airway)
- INTUBATE (RSI Intubation)
- RSI_KETAMINE (RSI using Ketamine/Etomidate to avoid hypotension)
- RECORD_AIRWAY (Record intubation time/meds)
- NEEDLE_DECOMPRESSION (Needle decompression)
- CHEST_TUBE (Chest tube / closed drainage)
- OXYGEN_100 (Give 100% oxygen)
- PEEP_VENTILATION (PEEP ventilation for flail chest)
- GASTRIC_TUBE (Insert gastric tube / OGT / NGT for decompression)
- CONTINUE_MTP_TXA (Continue MTP, warm, TXA)
- MTP_111 (Start MTP 1:1:1 ratio)
- PELVIC_BINDER (Apply pelvic binder)
- EFAST_EXAM (Perform eFAST exam)
- CALL_SURGEON (Call trauma surgeon/OR/IR)
- REBOA (Prepare/insert REBOA)
- CHECK_NEURO (Check GCS, pupils, motor)
- CHECK_GLUCOSE (Check glucose)
- RECORD_NEURO (Record neuro status)
- MANNITOL_HYPERTONIC (Give Mannitol or Hypertonic Saline)
- HEAD_ELEVATION (Elevate head of bed 30 degrees)
- MILD_HYPERVENTILATION (Mild hyperventilation, target ETCO2 30-35)
- EXPOSE_PATIENT (Cut clothes, expose)
- WARM_PATIENT (Active warming)
- LOG_ROLL (Log roll, check back)
- RECORD_TOURNIQUET_TIME (Record tourniquet time)
- SECONDARY_SURVEY (Head-to-toe secondary survey)
- CALL_NEURO_ORTHO (Call Neurosurgery and Orthopedics/IR)
- PAN_SCAN (Trauma Pan-Scan / CT)
- DECISION_OR (Decision to go to Operating Room)
- DECISION_CT (Decision to go to CT scanner)
- DECISION_IR (Decision to go to Interventional Radiology)
- PELVIC_PACKING (Pack pelvic/perineal wound with gauze)
- IV_ACCESS_UPPER (Establish IV/IO access in upper extremities/central line)
- IV_ACCESS_LOWER (Establish IV/IO access in lower extremities/femoral)
- FOLEY_CATHETER (Insert Foley catheter)
- ANTIBIOTICS (Administer antibiotics/tetanus)
- DECISION_HYBRID_OR (Decision to go to Hybrid OR)
- CALL_MDT (Call multiple disciplines: Ortho, Gen Surg, Uro, IR)
- REMOVE_GAUZE (Remove previously packed gauze)
- PERICARDIOCENTESIS (Pericardiocentesis / needle decompression of pericardium)
- ED_THORACOTOMY (Emergency Department Thoracotomy / open chest)
- CPR (Cardiopulmonary Resuscitation / chest compressions)
- OXYGEN_MASK (Apply oxygen mask / non-rebreather mask without intubation)
- UNKNOWN (If the command doesn't match any medical action)

Rules:
1. If the user says "I will do it" or "I press the wound", the target MUST be "User" and action "MANUAL_PRESSURE".
2. The user can assign multiple tasks in one sentence (Parallel Processing). Extract ALL of them.
3. If a target is not explicitly named but implied by the role, you can infer it, but prefer explicit mentions (@Dr. A, etc.).
4. Differentiate between upper and lower IV access if specified. If just "IV access", default to START_MTP_IV.
5. Understand nuanced medical commands and map them to multiple actions if appropriate. For example, "secure the airway and consider RSI" should map to both CHECK_AIRWAY and INTUBATE.
6. Accurately map team assignments. If a user explicitly mentions a team member (e.g., "@Dr. A", "Dr. A", "A"), assign the target to "Dr. A". Same for "Dr. B" and "Nurse C".
7. If a command implies multiple steps (e.g., "intubate with ketamine"), map to all relevant actions (e.g., INTUBATE, RSI_KETAMINE).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: actionSchema,
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const parsed = JSON.parse(text);
    return parsed.map((item: any) => ({
      ...item,
      target: item.target === 'null' ? null : item.target
    }));
  } catch (error) {
    console.error("Error parsing command with Gemini:", error);
    return [];
  }
}
