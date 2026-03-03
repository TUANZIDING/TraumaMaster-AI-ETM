import React, { useReducer, useEffect, useState, useRef } from 'react';
import { gameReducer, INITIAL_STATE } from './game/engine';
import { parseUserCommand } from './game/ai';
import { Monitor } from './components/Monitor';
import { TeamRoster } from './components/TeamRoster';
import { CommandBox } from './components/CommandBox';
import { Summary } from './components/Summary';
import { clsx } from 'clsx';
import { Activity, AlertTriangle, FastForward, ChevronRight } from 'lucide-react';
import { audio } from './game/audio';
import { SCENARIOS } from './game/scenarios';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [isProcessing, setIsProcessing] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Game Loop
  useEffect(() => {
    if (state.phase !== 'SCENARIO_SELECT' && state.phase !== 'INTRO' && state.phase !== 'SUMMARY' && state.phase !== 'GAME_OVER' && !state.phase.startsWith('UPDATE_')) {
      timerRef.current = window.setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.phase]);

  const handleCommand = async (text: string) => {
    if (state.phase.startsWith('UPDATE_')) {
      dispatch({ type: 'TEAM_UPDATE_SUBMIT', text });
      return;
    }

    dispatch({ type: 'USER_COMMAND', text });
    setIsProcessing(true);
    try {
      const commands = await parseUserCommand(text, state.phase);
      dispatch({ type: 'AI_PARSED_COMMANDS', commands });
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startGame = () => {
    audio.init();
    dispatch({ type: 'START_PHASE_0' });
  };

  if (state.phase === 'SCENARIO_SELECT') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-200 font-sans">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full mb-2">
              <Activity className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">TraumaMaster-AI ETM</h1>
            <p className="text-xl text-zinc-400">选择一个临床案例开始模拟</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {Object.values(SCENARIOS).map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => dispatch({ type: 'SELECT_SCENARIO', scenarioId: scenario.id })}
                className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 p-6 rounded-2xl text-left transition-all hover:bg-zinc-800/50 group flex flex-col h-full"
              >
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{scenario.title}</h3>
                <p className="text-sm text-zinc-500 mb-4 font-mono">{scenario.subtitle}</p>
                <p className="text-zinc-400 text-sm flex-1">{scenario.description}</p>
                <div className="mt-6 flex items-center text-indigo-500 text-sm font-medium">
                  进入案例 <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state.phase === 'INTRO') {
    const scenario = SCENARIOS[state.scenarioId!];
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 text-zinc-200 font-sans">
        <div className="max-w-2xl text-center space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-full mb-4">
            <Activity className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">{scenario.title}</h1>
          <p className="text-xl text-zinc-400">{scenario.subtitle}</p>
          
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-left space-y-4 mt-8">
            <h3 className="font-semibold text-lg text-white border-b border-zinc-800 pb-2">考核核心 (Core Objectives)</h3>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              {scenario.objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4 justify-center mt-8">
            <button 
              onClick={() => dispatch({ type: 'RETURN_TO_MENU' })}
              className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-lg transition-colors"
            >
              返回主界面
            </button>
            <button 
              onClick={startGame}
              className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-red-600/20"
            >
              开始接诊 (Start Scenario)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state.phase === 'SUMMARY' || state.phase === 'GAME_OVER') {
    return <Summary scores={state.scores} deathReason={state.flags.deathReason} onRestart={() => dispatch({ type: 'RESTART' })} onReturnToMenu={() => dispatch({ type: 'RETURN_TO_MENU' })} />;
  }

  return (
    <div className="h-[100dvh] bg-zinc-950 text-zinc-200 font-sans flex flex-col overflow-hidden relative">
      {/* Hands-on Penalty Overlay (Tunnel Vision) */}
      {state.flags.handsOnPenalty && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center" style={{
          background: 'radial-gradient(circle at center, transparent 10%, rgba(0,0,0,0.95) 60%)'
        }}>
          <div className="bg-red-900/80 border border-red-500 text-white px-6 py-3 rounded-lg font-bold animate-pulse flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            你正在双手压迫伤口，失去全局视野！
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-red-500" />
          <h1 className="font-bold text-lg tracking-tight">TraumaMaster-AI</h1>
          <span className="px-2 py-1 bg-zinc-800 rounded text-xs font-mono text-zinc-400">
            T+{state.gameTime}s
          </span>
        </div>
        <div className="flex items-center gap-3">
          {state.phase === 'PHASE_0' && (
            <button 
              onClick={() => dispatch({ type: 'FAST_FORWARD' })}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm transition-colors"
            >
              <FastForward className="w-4 h-4" />
              快进到患者到达
            </button>
          )}
          <button 
            onClick={() => {
              if (window.confirm('确定要放弃当前考核并返回主界面吗？')) {
                dispatch({ type: 'RETURN_TO_MENU' });
              }
            }}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-sm transition-colors"
          >
            返回主界面
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row p-4 gap-4 overflow-hidden z-10 min-h-0">
        {/* Left Column: Monitor & Team */}
        <div className="w-full md:w-80 flex flex-col gap-4 shrink-0 overflow-y-auto custom-scrollbar pb-2 max-h-[40vh] md:max-h-none">
          <Monitor vitals={state.vitals} isActive={state.phase !== 'INTRO' && state.phase !== 'SUMMARY' && state.phase !== 'GAME_OVER'} />
          <TeamRoster team={state.team} gameTime={state.gameTime} />
        </div>

        {/* Right Column: Command Box */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative h-full">
          {state.flags.showCprTrap && (
            <div className="absolute inset-0 z-30 bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-4 rounded-xl">
              <div className="bg-red-950 border border-red-500 p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center space-y-6">
                <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">患者突发 PEA！</h3>
                <p className="text-red-200 text-lg">
                  监护仪显示无脉性电活动 (PEA)。患者刚刚经历了胸部穿透伤，目前极度怀疑心包填塞。
                </p>
                <div className="flex flex-col gap-4 mt-8">
                  <button
                    onClick={() => dispatch({ type: 'TRIGGER_CPR_TRAP' })}
                    className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold text-lg transition-colors border border-zinc-700"
                  >
                    立即开始胸外按压 (CPR)
                  </button>
                  <button
                    onClick={() => {
                      dispatch({ type: 'USER_COMMAND', text: '立即行心包穿刺/开胸解除梗阻！' });
                      dispatch({ type: 'AI_PARSED_COMMANDS', commands: [{ action: 'ED_THORACOTOMY', target: 'Dr. B', recognizedText: '开胸' }] });
                      dispatch({ type: 'DISMISS_CPR_TRAP' });
                    }}
                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-red-600/20"
                  >
                    解除梗阻源 (心包穿刺 / 急诊室开胸)
                  </button>
                </div>
              </div>
            </div>
          )}

          {state.phase.startsWith('UPDATE_') && !state.flags.showCprTrap && (
            <div className="absolute inset-0 z-20 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 rounded-xl">
              <div className="bg-zinc-900 border border-indigo-500/50 p-6 rounded-xl shadow-2xl max-w-lg w-full text-center space-y-4">
                <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">10-Second Update</h3>
                <p className="text-zinc-400 text-sm">作为 Team Leader，请向全团队总结目前的情况和下一步计划。</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const input = (e.target as any).elements.update.value;
                  if (input.trim()) handleCommand(input);
                }} className="flex flex-col gap-3 mt-4">
                  <textarea 
                    name="update"
                    rows={3}
                    placeholder={
                      state.phase === 'UPDATE_X' ? "例如：X已止住，转入A/B/C并行..." :
                      state.phase === 'UPDATE_A' ? "例如：A已解决。但X仍需警惕，立刻排查胸部问题..." :
                      state.phase === 'UPDATE_B' ? "例如：B已缓解，但休克仍在，优先C找出血源..." :
                      state.phase === 'UPDATE_C' ? "例如：休克暴露。必须用血液制品把血压拉起来保脑灌注..." :
                      state.phase === 'UPDATE_D' ? "例如：脑疝发生。稳住血压的同时给高渗药，准备转运..." :
                      "例如：转运路径 OR/IR/CT 与触发条件..."
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                    autoFocus
                  />
                  <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg font-medium transition-colors">
                    提交简报
                  </button>
                </form>
              </div>
            </div>
          )}
          
          <CommandBox 
            logs={state.logs} 
            onCommand={handleCommand} 
            disabled={isProcessing || state.phase.startsWith('UPDATE_')} 
            placeholder={state.phase === 'PHASE_0' ? "分配预案 (例如: @Nurse C 准备大量输血方案)" : "输入指令 (例如: @Dr. B 准备止血带)"}
          />
        </div>
      </main>
    </div>
  );
}
