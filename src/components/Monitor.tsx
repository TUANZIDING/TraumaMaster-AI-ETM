import React, { useEffect, useRef } from 'react';
import { Vitals } from '../game/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { audio } from '../game/audio';

export function Monitor({ vitals, isActive }: { vitals: Vitals, isActive: boolean }) {
  const lastBeepTime = useRef<number>(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!isActive) return;

    const loop = (time: number) => {
      const hrInterval = 60000 / vitals.hr; // ms between beats
      if (time - lastBeepTime.current >= hrInterval) {
        lastBeepTime.current = time;
        const isCritical = vitals.hr > 120 || vitals.hr < 50 || vitals.bpSys < 90 || vitals.bpSys > 160 || vitals.spo2 < 90;
        audio.playHeartbeat(isCritical);
        
        // Play extra alarm if very critical
        if (vitals.bpSys < 70 || vitals.bpSys > 180 || vitals.spo2 < 85) {
           setTimeout(() => audio.playAlarm(), 300);
        }
      }
      animationRef.current = requestAnimationFrame(loop);
    };
    
    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [vitals.hr, vitals.bpSys, vitals.spo2, isActive]);

  return (
    <div className="bg-black border-2 border-gray-800 rounded-xl p-4 flex flex-col gap-4 font-mono w-full max-w-md shadow-2xl">
      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
        <span className="text-gray-400 text-sm uppercase tracking-widest">Dynamic Monitor</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* HR */}
        <div className="flex flex-col">
          <span className="text-green-500 text-xs font-bold mb-1">HR (bpm)</span>
          <div className="flex items-baseline gap-2">
            <span className={twMerge("text-5xl font-bold text-green-400", vitals.hr > 120 || vitals.hr < 50 ? "animate-pulse text-green-300" : "")}>
              {Math.round(vitals.hr)}
            </span>
            <span className="text-green-700 text-sm">♥</span>
          </div>
        </div>

        {/* BP */}
        <div className="flex flex-col">
          <span className="text-red-500 text-xs font-bold mb-1">NIBP (mmHg)</span>
          <div className="flex items-baseline gap-1">
            <span className={twMerge("text-4xl font-bold text-red-400", (vitals.bpSys < 90 || vitals.bpSys > 160) ? "animate-pulse text-red-300" : "")}>
              {Math.round(vitals.bpSys)}
            </span>
            <span className="text-red-500 text-2xl">/</span>
            <span className="text-3xl font-bold text-red-400">
              {Math.round(vitals.bpDia)}
            </span>
          </div>
        </div>

        {/* SpO2 */}
        <div className="flex flex-col">
          <span className="text-cyan-500 text-xs font-bold mb-1">SpO2 (%)</span>
          <div className="flex items-baseline gap-2">
            <span className={twMerge("text-5xl font-bold text-cyan-400", vitals.spo2 < 90 ? "animate-pulse text-cyan-300" : "")}>
              {Math.round(vitals.spo2)}
            </span>
            <span className="text-cyan-700 text-sm">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
