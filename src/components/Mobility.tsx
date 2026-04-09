import React from 'react';
import { Activity, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { AthleteData, MobilityItem } from '../types';
import { cn } from '../lib/utils';

interface MobilityProps {
  athleteData: AthleteData;
  isCoach: boolean;
  onAddMobility: () => void;
  onRemoveMobility: (idx: number) => void;
  onUpdateMobility: (idx: number, field: keyof MobilityItem, value: string) => void;
}

export const Mobility: React.FC<MobilityProps> = ({
  athleteData,
  isCoach,
  onAddMobility,
  onRemoveMobility,
  onUpdateMobility,
}) => {
  const { mobilityList } = athleteData;

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-6 bg-gray-900 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-800">
        <div>
          <h2 className="text-base sm:text-xl font-bold flex items-center gap-2"><Activity className="text-green-500" size={18} /> Rotina de Mobilidade</h2>
          <p className="text-[10px] sm:text-sm text-gray-400 mt-0.5 sm:mt-1">Exercícios de aquecimento e recuperação.</p>
        </div>
        {isCoach && (
          <button onClick={onAddMobility} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg sm:rounded-xl flex justify-center items-center gap-2 font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95 text-xs sm:text-base">
            <Plus size={16} /> Novo
          </button>
        )}
      </div>
      <div className="space-y-2">
        {mobilityList.length === 0 ? (
          <div className="text-gray-500 text-center py-6">Sem exercícios de mobilidade.</div>
        ) : (
          mobilityList.map((item, i) => (
            <div key={i} className={cn("bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl p-2.5 sm:p-4 mb-2 sm:mb-4 shadow-sm transition-colors", isCoach && 'hover:border-blue-900/50')}>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4">
                <div className="md:col-span-5">
                  <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1 block">Exercício</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => onUpdateMobility(i, 'name', e.target.value)}
                    className={cn("w-full p-1.5 sm:p-2.5 bg-gray-800 border border-gray-700 rounded-lg outline-none font-semibold transition-colors text-xs sm:text-base", isCoach ? 'focus:border-blue-500' : 'opacity-80 cursor-default')}
                    readOnly={!isCoach}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1 block">Séries/Duração</label>
                  <input
                    type="text"
                    value={item.sets}
                    onChange={(e) => onUpdateMobility(i, 'sets', e.target.value)}
                    className={cn("w-full p-1.5 sm:p-2.5 bg-gray-800 border border-gray-700 rounded-lg outline-none font-semibold transition-colors text-xs sm:text-base", isCoach ? 'focus:border-blue-500' : 'opacity-80 cursor-default')}
                    readOnly={!isCoach}
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 sm:mb-1 block">Link Vídeo</label>
                  <div className="flex gap-1.5 sm:gap-2">
                    <input
                      type="text"
                      value={item.link}
                      placeholder={isCoach ? 'Link...' : 'Sem link'}
                      onChange={(e) => onUpdateMobility(i, 'link', e.target.value)}
                      className={cn("flex-1 p-1.5 sm:p-2.5 bg-gray-800 border border-gray-700 rounded-lg outline-none text-[10px] sm:text-sm transition-colors min-w-0", isCoach ? 'focus:border-blue-500' : 'opacity-80 cursor-default')}
                      readOnly={!isCoach}
                    />
                    {item.link && item.link !== '#' && (
                      <a href={item.link} target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-500 px-2.5 sm:px-4 rounded-lg flex items-center justify-center transition-colors shrink-0">
                        <ExternalLink size={16} />
                      </a>
                    )}
                    {isCoach && (
                      <button onClick={() => onRemoveMobility(i)} className="bg-gray-800 hover:bg-red-900/40 text-gray-500 hover:text-red-400 px-2 sm:px-3 rounded-lg border border-gray-700 hover:border-red-800/50 flex items-center justify-center transition-all shrink-0" title="Remover exercício">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
