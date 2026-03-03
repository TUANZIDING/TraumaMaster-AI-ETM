import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export function Summary({ scores, deathReason, onRestart, onReturnToMenu }: { scores: any, deathReason: string | null, onRestart: () => void, onReturnToMenu: () => void }) {
  const data = [
    { subject: '临床优先级 (Prioritization)', A: scores.prioritization, fullMark: 100 },
    { subject: '并行效率 (Parallel Efficiency)', A: scores.parallel, fullMark: 100 },
    { subject: '团队领导力 (Leadership)', A: scores.leadership, fullMark: 100 },
    { subject: '资源预判 (Anticipation)', A: scores.anticipation, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-950 text-zinc-200 p-8 overflow-y-auto">
      <h2 className="text-3xl font-bold mb-4 text-white">考核报告 (ETM Radar)</h2>
      {deathReason && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg mb-8 max-w-2xl text-center">
          <h3 className="font-bold text-lg mb-2">考核失败</h3>
          <p>{deathReason}</p>
        </div>
      )}
      {!deathReason && (
        <div className="bg-emerald-900/50 border border-emerald-500 text-emerald-200 p-4 rounded-lg mb-8 max-w-2xl text-center">
          <h3 className="font-bold text-lg mb-2">考核通过</h3>
          <p>成功控制致命伤，患者生命体征平稳转运至最终确切治疗地点。</p>
        </div>
      )}
      
      <div className="w-full max-w-lg h-80 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#3f3f46" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#52525b' }} />
            <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex gap-4 mt-8">
        <button onClick={onRestart} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors">
          重新考核本案例
        </button>
        <button onClick={onReturnToMenu} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">
          返回案例列表
        </button>
      </div>
    </div>
  );
}
