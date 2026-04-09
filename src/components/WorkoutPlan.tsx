import React from 'react';
import { 
  Calendar, Copy, RefreshCw, MinusCircle, PlusCircle, Check, Trash2, 
  PlayCircle, ChevronUp, ChevronDown, Plus, Info, Edit3, Link as LinkIcon,
  Layout, List, Settings2, Target, Zap, Activity, ShieldCheck, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AthleteData, WorkoutDay, Exercise, Maxes } from '../types';
import { calculateWeight, parseSets, cn } from '../lib/utils';
import { ExerciseAutocomplete } from './ExerciseAutocomplete';

interface WorkoutPlanProps {
  athleteData: AthleteData;
  isCoach: boolean;
  onSwitchWeek: (idx: number) => void;
  onToggleSet: (weekIdx: number, dayId: number, exIdx: number, setIdx: number) => void;
  onUpdateExerciseNote: (weekIdx: number, dayId: number, exIdx: number, note: string) => void;
  onToggleDay: (weekIdx: number, dayId: number) => void;
  onUpdateWorkoutDayInfo: (dayId: number, field: keyof WorkoutDay, value: string) => void;
  onUpdateExercise: (dayId: number, exIdx: number, field: keyof Exercise, value: string | number) => void;
  onAddExercise: (dayId: number) => void;
  onRemoveExercise: (dayId: number, exIdx: number) => void;
  onDeleteWorkoutDay: (dayId: number) => void;
  onAddWorkoutDay: () => void;
  onDuplicateWeek: () => void;
  onResetWeek: () => void;
  onDeleteWeek: () => void;
  onAddWeek: () => void;
  onResetAll: () => void;
}

export const WorkoutPlan: React.FC<WorkoutPlanProps> = ({
  athleteData,
  isCoach,
  onSwitchWeek,
  onToggleSet,
  onUpdateExerciseNote,
  onToggleDay,
  onUpdateWorkoutDayInfo,
  onUpdateExercise,
  onAddExercise,
  onRemoveExercise,
  onDeleteWorkoutDay,
  onAddWorkoutDay,
  onDuplicateWeek,
  onResetWeek,
  onDeleteWeek,
  onAddWeek,
  onResetAll,
}) => {
  const { activeWeek, numWeeks, workoutData, expandedDays, completedSets, exerciseNotes, maxes } = athleteData;
  const [isCompact, setIsCompact] = React.useState(false);

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-8">
      {/* Header & Week Navigation */}
      <div className="bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-800 shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3 tracking-tight">
              <Calendar className="text-blue-500" size={24} /> 
              PLANEAMENTO <span className="text-blue-500">SEMANAL</span>
            </h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">Gestão de Ciclos e Periodização</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full md:w-auto">
            <button 
              onClick={() => setIsCompact(!isCompact)}
              className={cn(
                "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all border",
                isCompact ? "bg-blue-600 border-blue-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200"
              )}
            >
              <Layout size={12} /> {isCompact ? 'Vista Normal' : 'Vista Compacta'}
            </button>

            {isCoach ? (
              <div className="flex flex-wrap gap-2">
                <button onClick={onDuplicateWeek} className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-gray-700" title="Duplicar estrutura">
                  <Copy size={12} /> Duplicar
                </button>
                <button onClick={onResetWeek} className="bg-gray-800 hover:bg-yellow-900/20 text-yellow-500 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-gray-700 hover:border-yellow-900/50" title="Resetar checklists">
                  <RefreshCw size={12} /> Reset
                </button>
                <button onClick={onDeleteWeek} className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-red-500/20 hover:border-red-600 shadow-lg active:scale-95 group/del">
                  <MinusCircle size={12} className="group-hover/del:rotate-90 transition-transform" /> Apagar
                </button>
                <button onClick={onAddWeek} className="bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95">
                  <PlusCircle size={14} /> Nova Semana
                </button>
              </div>
            ) : (
              <div className="bg-blue-900/20 border border-blue-900/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl flex items-center gap-2">
                <Info size={12} className="text-blue-400" />
                <span className="text-[9px] sm:text-[10px] text-blue-300 font-black uppercase tracking-widest">Modo Visualização</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex overflow-x-auto p-2 gap-2 bg-gray-950/50 no-scrollbar">
          {Array.from({ length: numWeeks }).map((_, i) => (
            <button
              key={i}
              onClick={() => onSwitchWeek(i)}
              className={cn(
                "whitespace-nowrap px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative group",
                i === activeWeek 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
              )}
            >
              Semana {i + 1}
              {i === activeWeek && (
                <motion.div layoutId="activeTab" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Workout Days List */}
      <div className="space-y-6">
        {workoutData.map((workout) => {
          const isExpanded = expandedDays[`${activeWeek}-${workout.id}`] !== false;
          let totalSetsDay = 0;
          let completedSetsDay = 0;

          workout.exercises.forEach((ex, exIdx) => {
            const numSets = parseSets(ex.setsReps);
            totalSetsDay += numSets;
            for (let s = 0; s < numSets; s++) {
              if (completedSets[`w${activeWeek}-d${workout.id}-e${exIdx}-s${s}`]) completedSetsDay++;
            }
          });

          const progressPct = totalSetsDay > 0 ? Math.round((completedSetsDay / totalSetsDay) * 100) : 0;
          const isDayComplete = progressPct === 100 && totalSetsDay > 0;

          return (
            <div key={workout.id} className={cn(
              "bg-gray-900 border rounded-[2.5rem] overflow-hidden shadow-xl transition-all duration-500",
              isDayComplete ? 'border-green-600/30' : 'border-gray-800',
              isExpanded ? 'ring-1 ring-blue-500/20' : ''
            )}>
              {/* Day Header */}
              <div
                onClick={() => onToggleDay(activeWeek, workout.id)}
                className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative group"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center w-full md:w-auto">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-inner",
                      isDayComplete ? 'bg-green-600 text-white' : 'bg-gray-800 text-blue-500'
                    )}>
                      {isDayComplete ? <Check size={28} strokeWidth={3} /> : <Zap size={28} />}
                    </div>
                    <input
                      type="text"
                      value={workout.day}
                      onChange={(e) => onUpdateWorkoutDayInfo(workout.id, 'day', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "font-black text-2xl bg-transparent outline-none border-b-2 border-transparent transition-all tracking-tighter w-40",
                        isDayComplete ? 'text-green-400' : 'text-white',
                        isCoach ? 'focus:border-blue-500' : 'cursor-pointer'
                      )}
                      readOnly={!isCoach}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 bg-gray-800/50 p-2 rounded-2xl border border-gray-700/50">
                    <Target size={16} className="text-blue-400 ml-2" />
                    <input
                      type="text"
                      value={workout.focus}
                      onChange={(e) => onUpdateWorkoutDayInfo(workout.id, 'focus', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "text-xs font-black uppercase tracking-widest bg-transparent outline-none transition-all w-32 sm:w-48 text-gray-300",
                        isCoach ? 'focus:text-blue-400' : 'cursor-pointer'
                      )}
                      placeholder="FOCO DO TREINO"
                      readOnly={!isCoach}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between w-full md:w-auto gap-6">
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", isDayComplete ? 'text-green-400' : 'text-gray-500')}>
                        {progressPct}% Concluído
                      </span>
                      <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div className={cn("h-full transition-all duration-700", isDayComplete ? 'bg-green-500' : 'bg-blue-500')} style={{ width: `${progressPct}%` }}></div>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">{completedSetsDay} de {totalSetsDay} séries</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCoach && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteWorkoutDay(workout.id); }}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 hover:border-red-600 transition-all shadow-lg active:scale-95 group/del"
                        title="Excluir Dia"
                      >
                        <Trash2 size={20} className="group-hover/del:scale-110 transition-transform" />
                      </button>
                    )}
                    <div className={cn(
                      "p-3 rounded-2xl transition-all",
                      isExpanded ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'
                    )}>
                      {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Exercises List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gray-950/30 border-t border-gray-800/50"
                  >
                    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                      {workout.exercises.length === 0 ? (
                        <div className="text-center py-8 sm:py-12 text-gray-600 font-black uppercase tracking-widest border-2 border-dashed border-gray-800 rounded-2xl sm:rounded-[2rem]">
                          Nenhum exercício definido
                        </div>
                      ) : (
                        workout.exercises.map((ex, exIdx) => {
                          const numSets = parseSets(ex.setsReps);
                          const carga = calculateWeight(ex.liftType, ex.percent, maxes);
                          const canEditRPE = isCoach || ex.liftType === 'accessory';

                          return (
                            <div key={exIdx} className={cn(
                              "bg-gray-900/80 rounded-2xl sm:rounded-[2rem] border border-gray-800 shadow-sm hover:border-blue-500/30 transition-all group/ex",
                              isCompact ? "p-3 sm:p-4 md:p-5" : "p-4 sm:p-6 md:p-8"
                            )}>
                              {/* Exercise Title Row */}
                              <div className={cn(
                                "flex flex-col md:flex-row justify-between items-start gap-3 sm:gap-4",
                                isCompact ? "mb-3 sm:mb-4" : "mb-4 sm:mb-8"
                              )}>
                                <div className="flex-1 w-full">
                                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gray-800 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-gray-500 border border-gray-700">
                                      {exIdx + 1}
                                    </div>
                                    <ExerciseAutocomplete
                                      value={ex.name}
                                      onChange={(val) => onUpdateExercise(workout.id, exIdx, 'name', val)}
                                      readOnly={!isCoach}
                                      placeholder="NOME DO EXERCÍCIO..."
                                      className={cn(
                                        "flex-1 font-black tracking-tight",
                                        isCompact ? "text-base sm:text-lg md:text-xl" : "text-lg sm:text-xl md:text-2xl"
                                      )}
                                    />
                                    {ex.link && ex.link !== '#' && (
                                      <a href={ex.link} target="_blank" rel="noreferrer" className={cn(
                                        "bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all flex items-center justify-center shadow-lg",
                                        isCompact ? "w-7 h-7 sm:w-8 sm:h-8" : "w-8 h-8 sm:w-10 sm:h-10"
                                      )} title="Ver Vídeo">
                                        <PlayCircle size={isCompact ? 16 : 20} />
                                      </a>
                                    )}
                                  </div>
                                  
                                  {isCoach && !isCompact && (
                                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-700/50 w-full md:w-2/3">
                                      <LinkIcon size={10} className="text-gray-500" />
                                      <input
                                        type="text"
                                        value={ex.link || ''}
                                        placeholder="Link do vídeo"
                                        onChange={(e) => onUpdateExercise(workout.id, exIdx, 'link', e.target.value)}
                                        className="flex-1 bg-transparent text-[9px] sm:text-[10px] text-gray-400 outline-none font-bold uppercase tracking-wider"
                                      />
                                    </div>
                                  )}
                                </div>

                                {isCoach && (
                                  <button onClick={() => onRemoveExercise(workout.id, exIdx)} className={cn(
                                    "flex items-center justify-center rounded-xl sm:rounded-2xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 hover:border-red-600 transition-all shadow-lg active:scale-95 group/del",
                                    isCompact ? "w-8 h-8 sm:w-10 sm:h-10" : "w-10 h-10 sm:w-12 sm:h-12"
                                  )} title="Remover Exercício">
                                    <Trash2 size={isCompact ? 14 : 16} className="group-hover/del:scale-110 transition-transform" />
                                  </button>
                                )}
                              </div>

                              {/* Exercise Metrics Grid */}
                              <div className={cn(
                                "grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4",
                                isCompact ? "mb-3 sm:mb-4" : "mb-4 sm:mb-8"
                              )}>
                                <div className={cn("bg-gray-950/50 rounded-xl sm:rounded-2xl border border-gray-800", isCompact ? "p-2 sm:p-3" : "p-3 sm:p-4")}>
                                  <label className="text-[8px] sm:text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] block mb-1 sm:mb-2">Volume</label>
                                  <div className="flex items-center gap-1.5 sm:gap-2">
                                    <List size={12} className="text-blue-500" />
                                    <input
                                      type="text"
                                      value={ex.setsReps}
                                      onChange={(e) => onUpdateExercise(workout.id, exIdx, 'setsReps', e.target.value)}
                                      className={cn("bg-transparent font-black outline-none w-full", isCompact ? "text-xs sm:text-sm" : "text-sm sm:text-lg", isCoach ? 'text-white focus:text-blue-400' : 'text-gray-300')}
                                      placeholder="3x5"
                                      readOnly={!isCoach}
                                    />
                                  </div>
                                </div>

                                <div className={cn("rounded-xl sm:rounded-2xl border transition-all", canEditRPE ? 'bg-blue-600/5 border-blue-500/30' : 'bg-gray-950/50 border-gray-800', isCompact ? "p-2 sm:p-3" : "p-3 sm:p-4")}>
                                  <label className={cn("text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] block mb-1 sm:mb-2", canEditRPE ? 'text-blue-400' : 'text-gray-500')}>
                                    Intensidade
                                  </label>
                                  <div className="flex items-center gap-1.5 sm:gap-2">
                                    <Activity size={12} className={canEditRPE ? 'text-blue-400' : 'text-gray-600'} />
                                    <input
                                      type="text"
                                      value={ex.percent}
                                      onChange={(e) => onUpdateExercise(workout.id, exIdx, 'percent', e.target.value)}
                                      className={cn("bg-transparent font-black outline-none w-full", isCompact ? "text-xs sm:text-sm" : "text-sm sm:text-lg", canEditRPE ? 'text-blue-400' : 'text-gray-500')}
                                      placeholder="8 RPE"
                                      readOnly={!canEditRPE}
                                    />
                                  </div>
                                </div>

                                <div className={cn("bg-gray-950/50 rounded-xl sm:rounded-2xl border border-gray-800", isCompact ? "p-2 sm:p-3" : "p-3 sm:p-4")}>
                                  <label className="text-[8px] sm:text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] block mb-1 sm:mb-2">Base</label>
                                  <div className="flex items-center gap-1.5 sm:gap-2">
                                    <Settings2 size={12} className="text-gray-500" />
                                    <select
                                      value={ex.liftType}
                                      onChange={(e) => onUpdateExercise(workout.id, exIdx, 'liftType', e.target.value as any)}
                                      className={cn("bg-transparent text-[9px] sm:text-[10px] font-black uppercase tracking-widest outline-none w-full appearance-none", isCoach ? 'text-white cursor-pointer' : 'text-gray-500')}
                                      disabled={!isCoach}
                                    >
                                      <option value="accessory">Acessório</option>
                                      <option value="squat">Agach.</option>
                                      <option value="bench">Supino</option>
                                      <option value="deadlift">P. Morto</option>
                                    </select>
                                  </div>
                                </div>

                                <div className={cn("bg-blue-600 rounded-xl sm:rounded-2xl shadow-lg shadow-blue-900/20 flex flex-col justify-center", isCompact ? "p-2 sm:p-3" : "p-3 sm:p-4")}>
                                  <label className="text-[8px] sm:text-[9px] text-blue-100 font-black uppercase tracking-[0.2em] block mb-0.5 sm:mb-1">Carga</label>
                                  <div className={cn("font-black text-white", isCompact ? "text-sm sm:text-lg" : "text-lg sm:text-2xl")}>
                                    {ex.liftType === 'accessory' ? (
                                      <div className="flex items-center gap-1">
                                        <input
                                          type="text"
                                          value={ex.weight || ''}
                                          onChange={(e) => onUpdateExercise(workout.id, exIdx, 'weight', e.target.value)}
                                          className="bg-transparent border-none outline-none w-full text-right p-0 font-black placeholder:text-blue-300/50"
                                          placeholder="---"
                                        />
                                        <span className="text-[10px] opacity-70">kg</span>
                                      </div>
                                    ) : (
                                      carga ? `${carga}kg` : '---'
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Notes & Checkboxes */}
                              <div className={cn(
                                "grid grid-cols-1 gap-6",
                                isCompact ? "lg:grid-cols-3" : "lg:grid-cols-2"
                              )}>
                                <div className={cn("space-y-4", isCompact ? "lg:col-span-2" : "")}>
                                  {/* Coach Notes */}
                                  {(isCoach || ex.coachNotes) && (
                                    <div className={cn(
                                      "bg-blue-600/10 border-l-4 border-blue-500 rounded-r-2xl sm:rounded-r-3xl rounded-l-lg shadow-inner",
                                      isCompact ? "p-2 sm:p-3" : "p-3 sm:p-5"
                                    )}>
                                      <label className="text-[9px] sm:text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] block mb-2 sm:mb-3 flex items-center gap-2">
                                        <ShieldCheck size={12} className="animate-pulse" /> 
                                        INSTRUÇÕES
                                      </label>
                                      <textarea
                                        value={ex.coachNotes || ''}
                                        onChange={(e) => onUpdateExercise(workout.id, exIdx, 'coachNotes', e.target.value)}
                                        placeholder={isCoach ? "Instruções técnicas..." : ""}
                                        className={cn(
                                          "w-full bg-transparent text-xs sm:text-sm text-blue-100 outline-none resize-none font-bold leading-relaxed placeholder:text-blue-900/50",
                                          isCompact ? "h-10 sm:h-12" : "h-16 sm:h-20",
                                          !isCoach && "cursor-default"
                                        )}
                                        readOnly={!isCoach}
                                      />
                                    </div>
                                  )}

                                  {/* Athlete Notes */}
                                  <div className={cn(
                                    "bg-gray-800/30 border border-gray-800 rounded-2xl sm:rounded-3xl",
                                    isCompact ? "p-2 sm:p-3" : "p-3 sm:p-5"
                                  )}>
                                    <label className="text-[8px] sm:text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-2 sm:mb-3 flex items-center gap-2">
                                      <Edit3 size={10} /> Feedback
                                    </label>
                                    <textarea
                                      value={exerciseNotes[`w${activeWeek}-d${workout.id}-e${exIdx}`] || ''}
                                      onChange={(e) => onUpdateExerciseNote(activeWeek, workout.id, exIdx, e.target.value)}
                                      placeholder="Como correu?"
                                      className={cn(
                                        "w-full bg-transparent text-xs sm:text-sm text-gray-300 outline-none resize-none font-medium leading-relaxed focus:text-white transition-colors",
                                        isCompact ? "h-10 sm:h-12" : "h-14 sm:h-16"
                                      )}
                                    />
                                  </div>
                                </div>

                                {/* Set Checkboxes */}
                                <div className={cn(
                                  "bg-gray-950/50 rounded-2xl sm:rounded-3xl border border-gray-800",
                                  isCompact ? "p-3 sm:p-4 lg:col-span-1" : "p-4 sm:p-6"
                                )}>
                                  <label className="text-[8px] sm:text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-3 sm:mb-4">Checklist</label>
                                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {Array.from({ length: numSets }).map((_, s) => {
                                      const key = `w${activeWeek}-d${workout.id}-e${exIdx}-s${s}`;
                                      const isDone = completedSets[key];
                                      return (
                                        <button
                                          key={s}
                                          onClick={() => onToggleSet(activeWeek, workout.id, exIdx, s)}
                                          className={cn(
                                            "flex items-center justify-center rounded-lg sm:rounded-xl border-2 transition-all transform active:scale-90 relative group/set",
                                            isCompact ? "w-8 h-8 sm:w-10 h-10" : "w-10 h-10 sm:w-14 h-14",
                                            isDone 
                                              ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/20' 
                                              : 'bg-gray-800 border-gray-700 text-gray-600 hover:border-blue-500/50'
                                          )}
                                        >
                                          <span className={cn("text-[10px] sm:text-xs font-black", isDone ? 'hidden' : 'block')}>{s + 1}</span>
                                          <Check size={isCompact ? 14 : 18} strokeWidth={4} className={cn("transition-all", isDone ? 'scale-100 opacity-100' : 'scale-50 opacity-0')} />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      
                      {isCoach && (
                        <button onClick={() => onAddExercise(workout.id)} className="w-full py-6 bg-gray-900/50 hover:bg-blue-600/10 border-2 border-dashed border-gray-800 hover:border-blue-500/50 rounded-[2rem] text-blue-500 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all">
                          <Plus size={20} /> Adicionar Exercício
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {isCoach && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onAddWorkoutDay}
            className="w-full py-8 bg-gray-900/40 hover:bg-blue-600/10 border-2 border-dashed border-gray-800 hover:border-blue-500/50 rounded-[2.5rem] text-blue-500 font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Plus size={24} />
            </div>
            Adicionar Novo Dia de Treino
          </motion.button>
        )}
      </div>
      
      {isCoach && (
        <div className="mt-12 flex justify-center pt-8 border-t border-gray-800">
          <button onClick={onResetAll} className="text-gray-600 hover:text-red-400 bg-transparent hover:bg-red-900/10 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all border border-transparent hover:border-red-900/30">
            <RefreshCw size={16} /> Resetar Todos os Checklists do Atleta
          </button>
        </div>
      )}
    </div>
  );
};
