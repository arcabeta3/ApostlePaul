import React from 'react';
import { GameState } from '../types';

interface StatusPanelProps {
  state: GameState;
}

const ProgressBar: React.FC<{ value: number; label: string; colorClass: string; bgClass: string }> = ({ value, label, colorClass, bgClass }) => (
  <div className="mb-6 group">
    <div className="flex justify-between text-xs font-display tracking-widest text-dungeon-600 mb-2 font-bold uppercase">
      <span>{label}</span>
      <span>{value}/100</span>
    </div>
    <div className={`h-1.5 ${bgClass} rounded-full overflow-hidden border border-white/5`}>
      <div 
        className={`h-full transition-all duration-700 ease-out ${colorClass} opacity-80 group-hover:opacity-100 shadow-[0_0_10px_rgba(255,255,255,0.1)]`} 
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const StatusPanel: React.FC<StatusPanelProps> = ({ state }) => {
  return (
    <div className="w-full md:w-80 bg-dungeon-900 border-b md:border-b-0 md:border-l border-dungeon-800 p-6 flex flex-col md:h-full shadow-2xl z-20">
      
      <h1 className="text-2xl font-display text-dungeon-200 text-center mb-8 border-b border-dungeon-700 pb-4 tracking-wider hidden md:block">
        囚徒的見證
        <span className="block text-xs font-serif italic text-dungeon-600 mt-1">THE PRISONER'S TESTIMONY</span>
      </h1>

      <div className="space-y-8 flex-1">
        {/* Task Box - Desktop */}
        <div className="hidden md:block bg-dungeon-950/50 border border-dungeon-700 p-4 rounded-sm shadow-inner relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dungeon-900 px-2 text-[10px] font-display text-dungeon-600 tracking-widest uppercase">
             當前目標
           </div>
           <p className="text-spirit-gold font-serif font-medium text-lg leading-tight text-center pt-2">
             {state.currentTask || "觀察四周..."}
           </p>
        </div>

        <div className="hidden md:block">
           <div className="flex items-center justify-center mb-2 space-x-2 text-dungeon-700">
             <span className="h-px w-8 bg-dungeon-800"></span>
             <h3 className="font-display text-[10px] uppercase tracking-widest text-dungeon-600">Location</h3>
             <span className="h-px w-8 bg-dungeon-800"></span>
           </div>
           <p className="text-dungeon-300 font-serif text-center text-lg">{state.location || "羅馬地牢"}</p>
        </div>

        <div className="py-4 md:border-t md:border-b border-dungeon-800 md:border-dashed">
            <ProgressBar 
                value={state.spirit} 
                label="平安 (Peace)" 
                colorClass="bg-spirit-gold" 
                bgClass="bg-yellow-900/20"
            />
            
            <ProgressBar 
                value={state.health} 
                label="生命 (Health)" 
                colorClass="bg-flesh-red" 
                bgClass="bg-red-900/20"
            />
        </div>

        <div className="hidden md:block">
          <h3 className="text-dungeon-600 font-display text-[10px] uppercase mb-3 tracking-widest">持有物</h3>
          <ul className="text-sm font-serif text-dungeon-300 space-y-2 px-1">
            {state.inventory.length === 0 ? (
                <li className="text-dungeon-700 italic text-xs">一無所有</li>
            ) : (
                state.inventory.map((item, idx) => (
                    <li key={idx} className="flex items-center border-b border-dungeon-800 pb-1 last:border-0">
                        <span className="text-dungeon-600 mr-3 text-xs opacity-50">♦</span>
                        {item}
                    </li>
                ))
            )}
          </ul>
        </div>
      </div>
      
      <div className="mt-8 pt-6 border-t border-dungeon-800 hidden md:block">
        <p className="text-xs text-dungeon-600 font-serif text-center leading-relaxed italic opacity-40">
          羅馬書 8:18<br/>
          我想，現在的苦楚若比起將來要顯於我們的榮耀就不足介意了。
        </p>
      </div>
    </div>
  );
};

export default StatusPanel;