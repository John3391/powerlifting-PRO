import React from 'react';
import { 
  Users, LogOut, ArrowRight, Trash2, Database, Download, Upload, 
  AlertOctagon, ShieldCheck, UserPlus, Search, Filter, Activity,
  Calendar, Lock, Unlock, ChevronRight, PlusCircle, Dumbbell, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Database as AthleteDatabase } from '../types';
import { cn } from '../lib/utils';
import { FULL_EXERCISE_DATABASE } from '../constants/exercises';
import { ExerciseAutocomplete } from './ExerciseAutocomplete';

interface CoachDashboardProps {
  database: AthleteDatabase;
  onLogout: () => void;
  onViewAthlete: (name: string) => void;
  onDeleteAthlete: (name: string) => void;
  onAddAthlete: (name: string) => void;
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onHardReset: () => void;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({
  database,
  onLogout,
  onViewAthlete,
  onDeleteAthlete,
  onAddAthlete,
  onExportData,
  onImportData,
  onHardReset,
}) => {
  const [activeTab, setActiveTab] = React.useState<'athletes' | 'exercises'>('athletes');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [exerciseSearch, setExerciseSearch] = React.useState('');
  const [newAthleteName, setNewAthleteName] = React.useState('');
  
  const athletes = Object.keys(database)
    .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  const filteredExercises = React.useMemo(() => {
    if (!exerciseSearch) return FULL_EXERCISE_DATABASE.slice(0, 50);
    return FULL_EXERCISE_DATABASE.filter(ex => 
      ex.toLowerCase().includes(exerciseSearch.toLowerCase())
    ).slice(0, 100);
  }, [exerciseSearch]);

  const handleAddAthleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAthleteName.trim()) {
      onAddAthlete(newAthleteName.trim());
      setNewAthleteName('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans">
      {/* Premium Header */}
      <header className="bg-gray-900/50 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500"></div>
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tighter leading-none">
                TEAM <span className="text-blue-500">JOHN</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Powerlifting Excellence</p>
            </div>
          </div>
          
          <button 
            onClick={onLogout} 
            className="group flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-900/30 bg-red-900/10 text-red-500 hover:bg-red-900/20 transition-all active:scale-95"
          >
            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> 
            Encerrar Sessão
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full space-y-10">
        {/* Tab Switcher */}
        <div className="flex p-1.5 bg-gray-900/50 backdrop-blur-md rounded-[2rem] border border-white/5 w-full sm:w-fit mx-auto">
          <button
            onClick={() => setActiveTab('athletes')}
            className={cn(
              "flex-1 sm:flex-none px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3",
              activeTab === 'athletes' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <Users size={16} /> Atletas
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={cn(
              "flex-1 sm:flex-none px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3",
              activeTab === 'exercises' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <Dumbbell size={16} /> Exercícios
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'athletes' ? (
            <motion.div
              key="athletes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-10"
            >
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900/40 border border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                    <Users size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Total Atletas</span>
                    <span className="text-3xl font-black text-white">{Object.keys(database).length}</span>
                  </div>
                </div>
                <div className="bg-gray-900/40 border border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                    <Activity size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Semanas Ativas</span>
                    <span className="text-3xl font-black text-white">
                      {Object.keys(database).reduce((acc, name) => acc + (database[name].numWeeks || 0), 0)}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-900/40 border border-white/5 p-6 rounded-[2rem] flex items-center gap-5">
                  <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                    <Database size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Status BD</span>
                    <span className="text-lg font-black text-green-500 uppercase">Sincronizado</span>
                  </div>
                </div>
              </div>

              {/* Athlete List Section */}
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                    <Users className="text-blue-500" size={24} /> 
                    MEUS <span className="text-blue-500">ATLETAS</span>
                  </h2>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <form onSubmit={handleAddAthleteSubmit} className="relative w-full sm:w-64">
                      <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                      <input 
                        type="text" 
                        value={newAthleteName}
                        onChange={(e) => setNewAthleteName(e.target.value)}
                        placeholder="NOVO ATLETA..." 
                        className="w-full bg-gray-900 border border-blue-500/30 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest text-white focus:border-blue-500 outline-none transition-all"
                      />
                      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 p-1.5 rounded-lg text-white hover:bg-blue-500 transition-colors">
                        <PlusCircle size={14} />
                      </button>
                    </form>

                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="PROCURAR ATLETA..." 
                        className="w-full bg-gray-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest text-white focus:border-blue-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {athletes.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/20 rounded-[3rem] border-2 border-dashed border-white/5">
                      <Users className="mx-auto text-gray-800 mb-4" size={64} />
                      <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-sm">Nenhum atleta no sistema</p>
                      <p className="text-xs text-gray-600 mt-2">Comece por criar um novo perfil de aluno.</p>
                    </div>
                  ) : (
                    athletes.map((name, idx) => {
                      const athleteData = database[name];
                      const numWeeks = athleteData.numWeeks || 0;
                      const squatRM = athleteData.maxes?.squat || 0;
                      const benchRM = athleteData.maxes?.bench || 0;
                      const deadliftRM = athleteData.maxes?.deadlift || 0;

                      const workoutPreview = athleteData.workoutData?.[0]?.exercises?.slice(0, 2).map(ex => ex.name).join(', ') || 'Sem treino definido';

                      return (
                        <motion.div
                          key={name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => onViewAthlete(name)}
                          className="group bg-gray-900/40 hover:bg-gray-900 border border-white/5 hover:border-blue-500/30 p-6 rounded-[2.5rem] flex flex-col lg:flex-row justify-between lg:items-center gap-6 transition-all cursor-pointer shadow-xl relative overflow-hidden"
                        >
                          {/* Athlete Info */}
                          <div className="flex items-center gap-6 relative z-10 flex-1">
                            <div className="relative shrink-0">
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                                {athleteData.profileImage ? (
                                  <img src={athleteData.profileImage} className="w-full h-full object-cover" alt={name} referrerPolicy="no-referrer" />
                                ) : (
                                  name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className={cn(
                                "absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-2 border-gray-900 flex items-center justify-center",
                                athleteData.password ? "bg-green-500" : "bg-yellow-500"
                              )}>
                                {athleteData.password ? <Lock size={10} className="text-white" /> : <Unlock size={10} className="text-white" />}
                              </div>
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <h3 className="font-black text-xl text-white tracking-tight group-hover:text-blue-400 transition-colors truncate">{name}</h3>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gray-500 bg-gray-950 px-3 py-1.5 rounded-xl border border-white/5">
                                  <Calendar size={10} className="text-blue-500" /> {numWeeks} Semanas
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400/70 truncate max-w-[150px]">
                                  {workoutPreview}...
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stats Preview */}
                          <div className="flex items-center gap-4 md:gap-8 bg-gray-950/50 p-4 rounded-3xl border border-white/5 relative z-10">
                            <div className="flex flex-col items-center px-2">
                              <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">SQ</span>
                              <span className="text-sm font-black text-blue-400">{squatRM}kg</span>
                            </div>
                            <div className="w-px h-8 bg-white/5"></div>
                            <div className="flex flex-col items-center px-2">
                              <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">BP</span>
                              <span className="text-sm font-black text-purple-400">{benchRM}kg</span>
                            </div>
                            <div className="w-px h-8 bg-white/5"></div>
                            <div className="flex flex-col items-center px-2">
                              <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">DL</span>
                              <span className="text-sm font-black text-orange-400">{deadliftRM}kg</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-3 relative z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteAthlete(name);
                              }}
                              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 hover:border-red-600 transition-all shadow-lg active:scale-95 group/del"
                              title="Excluir Atleta"
                            >
                              <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" />
                            </button>
                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/20 group-hover:translate-x-1 transition-all">
                              <ChevronRight size={24} />
                            </div>
                          </div>

                          {/* Background Accent */}
                          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none"></div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Exercise Database Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                    <Dumbbell className="text-blue-500" size={24} /> 
                    BANCO DE <span className="text-blue-500">EXERCÍCIOS</span>
                  </h2>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Mais de 5.000 opções disponíveis</p>
                </div>

                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                  <input 
                    type="text" 
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    placeholder="PESQUISAR EXERCÍCIO..." 
                    className="w-full bg-gray-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest text-white focus:border-blue-500 outline-none transition-all shadow-xl"
                  />
                </div>
              </div>

              {/* Exercise Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map((ex, idx) => (
                  <motion.div
                    key={ex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.01 }}
                    className="bg-gray-900/40 border border-white/5 p-5 rounded-2xl flex items-center gap-4 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Activity size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 group-hover:text-white transition-colors leading-relaxed">
                      {ex}
                    </span>
                  </motion.div>
                ))}
              </div>

              {filteredExercises.length === 0 && (
                <div className="text-center py-20 bg-gray-900/20 rounded-[3rem] border-2 border-dashed border-white/5">
                  <Dumbbell className="mx-auto text-gray-800 mb-4" size={64} />
                  <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-sm">Nenhum exercício encontrado</p>
                  <p className="text-xs text-gray-600 mt-2">Tente termos mais genéricos como "Agachamento" ou "Supino".</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Database Management Section */}
        <section className="pt-10 border-t border-white/5">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gray-900/40 p-8 rounded-[3rem] border border-white/5 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none rotate-12">
              <Database size={240} />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-black text-white flex items-center gap-3 mb-2 tracking-tight">
                <Database className="text-purple-500" size={24} /> 
                CENTRAL DE <span className="text-purple-500">DADOS</span>
              </h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-8 max-w-xl">
                Gestão avançada da base de dados. Realize backups periódicos para garantir a segurança da informação dos seus atletas.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={onExportData} 
                  className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-purple-900/20"
                >
                  <Download size={18} /> Exportar Backup
                </button>
                
                <label className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-white/5 transition-all cursor-pointer active:scale-95">
                  <Upload size={18} /> Importar BD
                  <input type="file" accept=".json" className="hidden" onChange={onImportData} />
                </label>
                
                <div className="flex-1 min-w-[20px]"></div>
                
                <button 
                  onClick={onHardReset} 
                  className="bg-transparent hover:bg-red-900/10 text-red-500 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all border border-red-900/20 hover:border-red-900/50"
                >
                  <AlertOctagon size={18} /> Limpeza Total
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="py-10 text-center">
        <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.4em]">Powerlift Pro © 2026 • Performance Engineering</p>
      </footer>
    </div>
  );
};
