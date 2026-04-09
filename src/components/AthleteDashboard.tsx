import React from 'react';
import { Dumbbell, BarChart2, TrendingUp, Activity, Zap, AlertTriangle, Calendar, FileDown, Share2 } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AthleteData, Maxes } from '../types';
import { calculateWeight, parseSets } from '../lib/utils';
import { cn } from '../lib/utils';

interface AthleteDashboardProps {
  athleteData: AthleteData;
  isCoach: boolean;
  onUpdateMax: (lift: keyof Maxes, val: number) => void;
  onUpdateAthleteField: (field: keyof AthleteData, val: any) => void;
  onSetChartPeriod: (period: 'week' | 'month' | 'year') => void;
}

export const AthleteDashboard: React.FC<AthleteDashboardProps> = ({
  athleteData,
  isCoach,
  onUpdateMax,
  onUpdateAthleteField,
  onSetChartPeriod,
}) => {
  const { maxes, workoutData, numWeeks, completedSets, chartPeriod } = athleteData;

  // Process data for daily volume/intensity cards
  const dailyMetrics = (workoutData || []).map(day => {
    let dayVol = 0;
    let sumPct = 0;
    let pctCount = 0;
    
    if (day && day.exercises) {
      day.exercises.forEach(ex => {
        if (!ex) return;
        const sets = parseSets(ex.setsReps || '0x0');
        const repsStr = String(ex.setsReps || '').split('x')[1];
        const reps = parseInt(repsStr) || 1;
        const carga = calculateWeight(ex.liftType, ex.percent, maxes);
        
        if (carga && !isNaN(carga)) dayVol += carga * sets * reps;
        
        let p = typeof ex.percent === 'string' ? parseFloat(ex.percent) : ex.percent;
        if (!isNaN(p) && p > 0) {
          if (p <= 1.5) p *= 100;
          sumPct += p;
          pctCount++;
        }
      });
    }
    
    return { 
      day: day?.day || '?', 
      volume: dayVol, 
      intensity: pctCount > 0 ? Math.round(sumPct / pctCount) : 0 
    };
  });

  const maxDailyVolume = Math.max(...dailyMetrics.map(d => d.volume), 1);

  const handleExportPDF = async () => {
    const dashboardElement = document.getElementById('athlete-dashboard-content');
    if (!dashboardElement) return;

    // Create a toast or loading state if needed, but for now we'll just run it
    const originalStyle = dashboardElement.style.padding;
    dashboardElement.style.padding = '20px'; // Add some padding for the PDF

    try {
      // Temporary fix for oklch color function error in html2canvas
      const style = document.createElement('style');
      style.innerHTML = `
        * { 
          color-interpolation-filters: sRGB !important;
          border-color: rgba(255,255,255,0.1) !important;
        }
        .text-blue-500 { color: #3b82f6 !important; }
        .bg-blue-600 { background-color: #2563eb !important; }
        .bg-gray-900 { background-color: #111827 !important; }
        .border-gray-800 { border-color: #1f2937 !important; }
      `;
      document.head.appendChild(style);

      const canvas = await html2canvas(dashboardElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0a0a',
        logging: false,
        windowWidth: 1200,
      });

      document.head.removeChild(style);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // If it's too long, we might need multiple pages, but for now let's fit it
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
      
      pdf.save(`Relatorio_Treino_${athleteData.appTitle.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      dashboardElement.style.padding = originalStyle;
    }
  };

  // Process historical weekly data
  const getWeeklyStats = () => {
    const stats = [];
    for (let w = 0; w < numWeeks; w++) {
      let weekVolume = 0;
      let weekIntensitySum = 0;
      let intensityCount = 0;
      let activeDays = 0;

      const progressFactor = numWeeks > 1 ? (w / (numWeeks - 1)) : 0;

      workoutData.forEach(day => {
        let dayHasCompletedSet = false;
        day.exercises.forEach((ex, exIndex) => {
          const sets = parseSets(ex.setsReps);
          const reps = parseInt(ex.setsReps.toString().split('x')[1]) || 1;
          const carga = calculateWeight(ex.liftType, ex.percent, maxes);
          
          let completedSetsCount = 0;
          for (let s = 0; s < sets; s++) {
            if (completedSets[`w${w}-d${day.id}-e${exIndex}-s${s}`]) {
              completedSetsCount++;
              dayHasCompletedSet = true;
            }
          }

          const effectiveSets = completedSetsCount > 0 ? completedSetsCount : (w < athleteData.activeWeek ? sets : 0);
          
          if (effectiveSets > 0 && carga) {
            weekVolume += carga * effectiveSets * reps;
            let p = typeof ex.percent === 'string' ? parseFloat(ex.percent) : ex.percent;
            if (!isNaN(p) && p > 0) {
              if (p <= 1.5) p *= 100;
              weekIntensitySum += p;
              intensityCount++;
            }
          }
        });
        if (dayHasCompletedSet || (w < athleteData.activeWeek)) activeDays++;
      });

      const avgIntensity = intensityCount > 0 ? weekIntensitySum / intensityCount : 0;
      const fatigue = (weekVolume * avgIntensity) / 5000;

      stats.push({
        name: `Semana ${w + 1}`,
        volume: Math.round(weekVolume),
        intensity: Math.round(avgIntensity),
        frequency: activeDays,
        fatigue: Math.round(fatigue),
        squat: Math.round(maxes.squat * (0.85 + progressFactor * 0.15)),
        bench: Math.round(maxes.bench * (0.85 + progressFactor * 0.15)),
        deadlift: Math.round(maxes.deadlift * (0.85 + progressFactor * 0.15)),
      });
    }
    return stats;
  };

  const weeklyStats = getWeeklyStats();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-800 p-3 rounded-xl shadow-2xl">
          <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-gray-300">{entry.name}:</span>
              <span className="font-bold text-white">{entry.value}{entry.name.includes('Intensidade') ? '%' : entry.name.includes('Volume') ? 'kg' : ''}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-8" id="athlete-dashboard-content">
      {/* Header with Export Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3 tracking-tight">
            <BarChart2 className="text-blue-500" size={24} /> 
            ANÁLISE DE <span className="text-blue-500">PERFORMANCE</span>
          </h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 sm:mt-1">Relatórios e Métricas de Evolução</p>
        </div>
        
        <button 
          onClick={handleExportPDF}
          data-html2canvas-ignore="true"
          className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 active:scale-95"
        >
          <FileDown size={14} /> Exportar Relatório PDF
        </button>
      </div>
      {/* Top Row: Maxes and Daily Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1RM Table */}
        <div className="bg-gray-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-800">
          <h3 className="font-bold mb-4 sm:mb-6 flex justify-between items-center text-base sm:text-lg">
            <span className="flex gap-2 items-center"><Dumbbell className="text-blue-500" size={18} /> Recordes Pessoais (1RM)</span>
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {(['squat', 'bench', 'deadlift'] as const).map((lift) => (
              <div key={lift} className="flex items-center bg-gray-800/50 rounded-xl sm:rounded-2xl border border-gray-700/50 overflow-hidden">
                <div className="w-20 sm:w-24 px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 border-r border-gray-700/50">
                  {lift === 'squat' ? 'Agach.' : lift === 'bench' ? 'Supino' : 'P. Morto'}
                </div>
                <input
                  type="number"
                  value={maxes[lift]}
                  onChange={(e) => onUpdateMax(lift, Number(e.target.value))}
                  className="flex-1 bg-transparent px-3 sm:px-4 py-2 sm:py-3 text-right font-black text-blue-400 outline-none focus:bg-blue-500/5 transition-colors text-sm sm:text-base"
                />
                <div className="px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-bold text-gray-600 uppercase">kg</div>
              </div>
            ))}
          </div>

          {isCoach && (
            <div className="mt-8 pt-6 border-t border-gray-800">
              <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                <Zap size={10} /> Senha de Acesso do Atleta
              </label>
              <input
                type="text"
                value={athleteData.password || ''}
                onChange={(e) => onUpdateAthleteField('password', e.target.value)}
                className="w-full p-3 text-sm font-mono bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-blue-500 outline-none transition-all"
                placeholder="Defina uma senha"
              />
              <p className="text-[9px] text-gray-500 mt-2 leading-relaxed italic">Visível apenas para o treinador. O atleta usará esta senha para entrar.</p>
            </div>
          )}
        </div>

        {/* Daily Volume & Intensity Bars */}
        <div className="bg-gray-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl lg:col-span-2 shadow-lg border border-gray-800">
          <h3 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg flex items-center gap-2">
            <BarChart2 className="text-orange-500" size={18} /> Volume & Intensidade Diária
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Estimativa do Bloco</span>
          </h3>
          <div className="h-48 sm:h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyMetrics} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: 'bold' }}
                  dy={5}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volume" name="Volume Total" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={16} />
                <Bar dataKey="intensity" name="Intensidade Média" fill="#f97316" radius={[2, 2, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle Row: Frequency and Fatigue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Frequency Chart */}
        <div className="bg-gray-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-800">
          <h3 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg flex items-center gap-2">
            <Calendar className="text-purple-500" size={18} /> Frequência Semanal
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Sessões por Semana</span>
          </h3>
          <div className="h-48 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: 'bold' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="frequency" name="Sessões" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fatigue & Intensity Trend */}
        <div className="bg-gray-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-800">
          <h3 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={18} /> Fadiga vs Intensidade
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Nível de Esforço</span>
          </h3>
          <div className="h-48 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: 'bold' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 9 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="fatigue" name="Nível de Fadiga" stroke="#ef4444" fillOpacity={1} fill="url(#colorFatigue)" strokeWidth={2} />
                <Line type="monotone" dataKey="intensity" name="Intensidade (%)" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: '#f97316' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: 1RM Progression Over Time */}
      <div className="bg-gray-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-800">
        <h3 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg flex items-center gap-2">
          <TrendingUp className="text-blue-500" size={18} /> Progressão de 1RM (Histórico)
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Tendência de Força</span>
        </h3>
        <div className="h-64 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyStats} margin={{ top: 10, right: 30, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: 'bold' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 9 }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }} />
              <Line 
                type="monotone" 
                dataKey="squat" 
                name="Agachamento" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0a0a0a' }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                dataKey="bench" 
                name="Supino" 
                stroke="#f97316" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#0a0a0a' }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                dataKey="deadlift" 
                name="Peso Morto" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0a0a0a' }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Lift Progression Bar Chart */}
      <div className="bg-gray-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-800">
        <h3 className="font-bold mb-4 sm:mb-6 text-base sm:text-lg flex items-center gap-2">
          <TrendingUp className="text-blue-500" size={18} /> Progressão de Cargas Semanais
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-2">Cargas por Levantamento</span>
        </h3>
        <div className="h-64 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: 'bold' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 9 }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="rect" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }} />
              <Bar dataKey="squat" name="Agachamento" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={20} />
              <Bar dataKey="bench" name="Supino" fill="#f97316" radius={[2, 2, 0, 0]} barSize={20} />
              <Bar dataKey="deadlift" name="Peso Morto" fill="#10b981" radius={[2, 2, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Estimated Progression (Composed) */}
      <div className="bg-gray-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg border border-gray-800">
        <div className="flex flex-wrap justify-between items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
          <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
            <TrendingUp className="text-green-500" size={18} /> Evolução de Cargas Estimada
          </h3>
          <div className="flex bg-gray-950/50 p-1 rounded-xl border border-gray-800">
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => onSetChartPeriod(period)}
                className={cn(
                  "px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all",
                  chartPeriod === period ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                )}
              >
                {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={weeklyStats} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: 'bold' }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }} />
              <Line type="monotone" dataKey="squat" name="Agachamento" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="bench" name="Supino" stroke="#f97316" strokeWidth={3} dot={{ r: 3, fill: '#f97316' }} />
              <Line type="monotone" dataKey="deadlift" name="Peso Morto" stroke="#10b981" strokeWidth={3} dot={{ r: 3, fill: '#10b981' }} />
              <Bar dataKey="volume" name="Volume Total" fill="#374151" opacity={0.3} barSize={40} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
