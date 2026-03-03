import React from 'react';
import { TeamMember } from '../game/types';
import { User, Activity, Syringe, Stethoscope, PenTool } from 'lucide-react';
import { clsx } from 'clsx';

export function TeamRoster({ team, gameTime }: { team: Record<string, TeamMember>, gameTime: number }) {
  const getIcon = (role: string) => {
    switch (role) {
      case 'Airway': return <Stethoscope className="w-5 h-5" />;
      case 'Procedures': return <Activity className="w-5 h-5" />;
      case 'Circulation': return <Syringe className="w-5 h-5" />;
      case 'Scribe': return <PenTool className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3 w-full max-w-sm">
      <h3 className="text-zinc-400 text-sm uppercase tracking-widest font-semibold border-b border-zinc-800 pb-2">Team Roster</h3>
      <div className="flex flex-col gap-3">
        {Object.values(team).map((member) => {
          const isBusy = member.status === 'busy' && member.busyUntil > gameTime;
          const timeLeft = isBusy ? member.busyUntil - gameTime : 0;

          return (
            <div key={member.id} className={clsx(
              "flex items-center gap-3 p-3 rounded-lg border transition-colors",
              isBusy ? "bg-zinc-800/50 border-zinc-700" : "bg-zinc-950 border-zinc-800"
            )}>
              <div className={clsx(
                "p-2 rounded-full",
                isBusy ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-400"
              )}>
                {getIcon(member.role)}
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-200 font-medium text-sm">{member.name}</span>
                  <span className={clsx(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
                    isBusy ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                  )}>
                    {isBusy ? 'Busy' : 'Idle'}
                  </span>
                </div>
                <span className="text-zinc-500 text-xs">{member.role}</span>
                {isBusy && (
                  <div className="mt-1 text-xs text-amber-300/80 flex justify-between">
                    <span className="truncate max-w-[120px]">{member.task}</span>
                    <span>{timeLeft}s</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
