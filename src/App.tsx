import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, ShieldCheck, User, Camera, UploadCloud, ArrowLeft, AlertTriangle, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Login } from './components/Login';
import { CoachDashboard } from './components/CoachDashboard';
import { AthleteDashboard } from './components/AthleteDashboard';
import { WorkoutPlan } from './components/WorkoutPlan';
import { Mobility } from './components/Mobility';
import { Toast } from './components/Toast';
import { CoachLoginModal } from './components/CoachLoginModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { AthleteData, Database, Maxes, WorkoutDay, Exercise, MobilityItem } from './types';
import { INITIAL_MAXES, INITIAL_MOBILITY_DATA, INITIAL_WORKOUT_PLAN, DB_KEY, COACH_PASSWORD } from './constants';
import { cn } from './lib/utils';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCoach, setIsCoach] = useState(false);
  const [athleteName, setAthleteName] = useState('');
  const [viewingAthlete, setViewingAthlete] = useState<string | null>(null);

  // App Data State
  const [database, setDatabase] = useState<Database>(() => {
    try {
      const saved = localStorage.getItem(DB_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Error parsing database from localStorage:", error);
      return {};
    }
  });

  const [activeTab, setActiveTab] = useState('bloco1');
  const [athleteData, setAthleteData] = useState<AthleteData | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'danger'
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(database));
  }, [database]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  const loadAthleteProfile = useCallback((name: string, password?: string) => {
    const existingData = database[name];
    
    if (existingData && !isCoach) {
      if (existingData.password && existingData.password !== password) {
        showToast("Senha incorreta!", "error");
        return false;
      }
    }

    const defaultData: AthleteData = {
      maxes: { ...INITIAL_MAXES },
      completedSets: {},
      exerciseNotes: {},
      numWeeks: 3,
      activeWeek: 0,
      password: password || '',
      mobilityList: [...INITIAL_MOBILITY_DATA],
      workoutData: [...INITIAL_WORKOUT_PLAN],
      tabNames: { bloco1: "📋 TREINO", dashboard: "📊 DASHBOARD", mobilidade: "🧘 MOBILIDADE" },
      appTitle: "TEAM JOHN",
      appSubtitle: "Powerlifting Excellence",
      profileImage: "https://storage.googleapis.com/test-media-antigravity/67f59451-04e4-4113-9111-972138986870.png",
      expandedDays: {},
      chartPeriod: 'week',
    };

    const data = existingData ? { ...defaultData, ...existingData } : defaultData;

    // Ensure nested objects are also merged if they exist but are incomplete
    if (existingData) {
      data.tabNames = { ...defaultData.tabNames, ...(existingData.tabNames || {}) };
      data.maxes = { ...defaultData.maxes, ...(existingData.maxes || {}) };
    }

    if (password && !data.password) {
      data.password = password;
    }

    if (!data.exerciseNotes) {
      data.exerciseNotes = {};
    }
    
    // Ensure activeWeek exists in data
    if (data.activeWeek === undefined) data.activeWeek = 0;

    setAthleteData(data);
    setAthleteName(name);
    return true;
  }, [database, isCoach]);

  const saveAthleteProfile = useCallback(() => {
    if (!athleteName || !athleteData) return;
    setDatabase(prev => ({
      ...prev,
      [athleteName]: athleteData
    }));
  }, [athleteName, athleteData]);

  // Sync athleteData back to database whenever it changes
  useEffect(() => {
    if (athleteData && athleteName) {
      const timer = setTimeout(() => {
        saveAthleteProfile();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [athleteData, athleteName, saveAthleteProfile]);

  // Auth Actions
  const handleLoginAthlete = (name: string, password?: string) => {
    const success = loadAthleteProfile(name, password);
    if (success) {
      setIsAuthenticated(true);
      setIsCoach(false);
      setViewingAthlete(null);
      showToast(`Bem-vindo(a), ${name}!`);
    }
  };

  const handleLoginCoach = (password?: string) => {
    if (password) {
      handleConfirmCoachLogin(password);
    } else {
      setIsCoachModalOpen(true);
    }
  };

  const handleConfirmCoachLogin = (password: string) => {
    if (password === COACH_PASSWORD) {
      setIsAuthenticated(true);
      setIsCoach(true);
      setViewingAthlete(null);
      setAthleteName('');
      setAthleteData(null);
      setIsCoachModalOpen(false);
      showToast("Modo Coach ativado com sucesso!");
    } else {
      showToast("Palavra-passe incorreta.", "error");
    }
  };

  const handleLogout = () => {
    saveAthleteProfile();
    setIsAuthenticated(false);
    setIsCoach(false);
    setViewingAthlete(null);
    setAthleteName('');
    setAthleteData(null);
    showToast("Sessão terminada.");
  };

  const handleViewAthlete = (name: string) => {
    setViewingAthlete(name);
    loadAthleteProfile(name);
    setActiveTab('bloco1');
  };

  const handleBackToStudentsList = () => {
    saveAthleteProfile();
    setViewingAthlete(null);
    setAthleteName('');
    setAthleteData(null);
  };

  const handleDeleteAthlete = (name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Excluir Atleta",
      message: `ATENÇÃO: Deseja excluir permanentemente o atleta "${name}" e todo o seu histórico de treino? Esta ação não pode ser desfeita.`,
      variant: 'danger',
      onConfirm: () => {
        setDatabase(prev => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
        showToast(`Atleta ${name} removido.`, 'warning');
      }
    });
  };

  // Athlete Data Actions
  const updateAthleteData = (updates: Partial<AthleteData>) => {
    setAthleteData(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleUpdateMax = (lift: keyof Maxes, val: number) => {
    if (!athleteData) return;
    updateAthleteData({
      maxes: { ...athleteData.maxes, [lift]: val }
    });
  };

  const handleSetChartPeriod = (period: 'week' | 'month' | 'year') => {
    updateAthleteData({ chartPeriod: period });
  };

  const handleSwitchWeek = (idx: number) => {
    updateAthleteData({ activeWeek: idx } as any);
  };

  const handleToggleSet = (weekIdx: number, dayId: number, exIdx: number, setIdx: number) => {
    if (!athleteData) return;
    const key = `w${weekIdx}-d${dayId}-e${exIdx}-s${setIdx}`;
    updateAthleteData({
      completedSets: {
        ...athleteData.completedSets,
        [key]: !athleteData.completedSets[key]
      }
    });
  };

  const handleToggleDay = (weekIdx: number, dayId: number) => {
    if (!athleteData) return;
    const key = `${weekIdx}-${dayId}`;
    updateAthleteData({
      expandedDays: {
        ...athleteData.expandedDays,
        [key]: !athleteData.expandedDays[key]
      }
    });
  };

  const handleUpdateWorkoutDayInfo = (dayId: number, field: keyof WorkoutDay, value: string) => {
    if (!athleteData || !isCoach) return;
    updateAthleteData({
      workoutData: (athleteData.workoutData || []).map(day => 
        day.id === dayId ? { ...day, [field]: value } : day
      )
    });
  };

  const handleUpdateExercise = (dayId: number, exIdx: number, field: keyof Exercise, value: string | number) => {
    if (!athleteData) return;
    // If not coach, only allow editing RPE for accessories
    if (!isCoach) {
      const day = athleteData.workoutData.find(d => d.id === dayId);
      const ex = day?.exercises[exIdx];
      if ((field !== 'percent' && field !== 'weight') || ex?.liftType !== 'accessory') return;
    }

    updateAthleteData({
      workoutData: (athleteData.workoutData || []).map(day => 
        day.id === dayId ? {
          ...day,
          exercises: (day.exercises || []).map((ex, i) => 
            i === exIdx ? { ...ex, [field]: value } : ex
          )
        } : day
      )
    });
  };

  const handleAddWorkoutDay = () => {
    if (!athleteData || !isCoach) return;
    const nextId = (athleteData.workoutData || []).length + 1;
    const newDay: WorkoutDay = {
      id: nextId,
      day: `Dia ${nextId}`,
      focus: "Foco do dia",
      exercises: []
    };
    updateAthleteData({
      workoutData: [...(athleteData.workoutData || []), newDay]
    });
    showToast("Novo dia de treino adicionado!");
  };

  const handleAddExercise = (dayId: number) => {
    if (!athleteData || !isCoach) return;
    updateAthleteData({
      workoutData: athleteData.workoutData.map(day => 
        day.id === dayId ? {
          ...day,
          exercises: [...day.exercises, { name: "Novo exercício", setsReps: "3x10", percent: "", weight: "", liftType: "accessory", link: "" }]
        } : day
      )
    });
  };

  const handleRemoveExercise = (dayId: number, exIdx: number) => {
    if (!athleteData || !isCoach) return;
    
    const newCompleted: Record<string, boolean> = {};
    Object.keys(athleteData.completedSets).forEach(key => {
      const parts = key.split('-'); // [w0, d1, e0, s0]
      if (parts.length < 4) {
        newCompleted[key] = athleteData.completedSets[key];
        return;
      }
      
      const dPart = parts[1];
      const ePart = parts[2];
      const currentDayId = parseInt(dPart.substring(1));
      const currentExIdx = parseInt(ePart.substring(1));
      
      if (currentDayId === dayId) {
        if (currentExIdx === exIdx) return; // Skip deleted exercise
        if (currentExIdx > exIdx) {
          parts[2] = `e${currentExIdx - 1}`;
          newCompleted[parts.join('-')] = athleteData.completedSets[key];
          return;
        }
      }
      newCompleted[key] = athleteData.completedSets[key];
    });

    const newNotes: Record<string, string> = {};
    Object.keys(athleteData.exerciseNotes).forEach(key => {
      const parts = key.split('-'); // [w0, d1, e0]
      if (parts.length < 3) {
        newNotes[key] = athleteData.exerciseNotes[key];
        return;
      }
      const dPart = parts[1];
      const ePart = parts[2];
      const currentDayId = parseInt(dPart.substring(1));
      const currentExIdx = parseInt(ePart.substring(1));

      if (currentDayId === dayId) {
        if (currentExIdx === exIdx) return;
        if (currentExIdx > exIdx) {
          parts[2] = `e${currentExIdx - 1}`;
          newNotes[parts.join('-')] = athleteData.exerciseNotes[key];
          return;
        }
      }
      newNotes[key] = athleteData.exerciseNotes[key];
    });

    updateAthleteData({
      workoutData: athleteData.workoutData.map(day => 
        day.id === dayId ? {
          ...day,
          exercises: day.exercises.filter((_, i) => i !== exIdx)
        } : day
      ),
      completedSets: newCompleted,
      exerciseNotes: newNotes
    });
  };

  const handleDeleteWorkoutDay = (dayId: number) => {
    if (!athleteData || !isCoach) return;
    
    setConfirmModal({
      isOpen: true,
      title: "Excluir Dia de Treino",
      message: "Tem certeza que deseja excluir este dia permanentemente? Todos os exercícios e checklists deste dia serão removidos.",
      variant: 'danger',
      onConfirm: () => {
        const filteredData = (athleteData.workoutData || []).filter(day => day.id !== dayId);
        
        // Re-index IDs and update all related state
        const newWorkoutData = filteredData.map((day, idx) => ({ ...day, id: idx + 1 }));
        
        const newCompleted: Record<string, boolean> = {};
        Object.keys(athleteData.completedSets).forEach(key => {
          const parts = key.split('-'); // [w0, d1, e0, s0]
          if (parts.length < 2) {
            newCompleted[key] = athleteData.completedSets[key];
            return;
          }
          const dPart = parts[1]; // d1
          const currentDayId = parseInt(dPart.substring(1));
          
          if (currentDayId === dayId) return;
          
          if (currentDayId > dayId) {
            parts[1] = `d${currentDayId - 1}`;
            newCompleted[parts.join('-')] = athleteData.completedSets[key];
          } else {
            newCompleted[key] = athleteData.completedSets[key];
          }
        });

        const newNotes: Record<string, string> = {};
        Object.keys(athleteData.exerciseNotes).forEach(key => {
          const parts = key.split('-'); // [w0, d1, e0]
          if (parts.length < 2) {
            newNotes[key] = athleteData.exerciseNotes[key];
            return;
          }
          const dPart = parts[1];
          const currentDayId = parseInt(dPart.substring(1));

          if (currentDayId === dayId) return;
          if (currentDayId > dayId) {
            parts[1] = `d${currentDayId - 1}`;
            newNotes[parts.join('-')] = athleteData.exerciseNotes[key];
          } else {
            newNotes[key] = athleteData.exerciseNotes[key];
          }
        });

        const newExpanded: Record<string, boolean> = {};
        Object.keys(athleteData.expandedDays).forEach(key => {
          const [w, d] = key.split('-');
          const currentDayId = parseInt(d);
          if (currentDayId === dayId) return;
          if (currentDayId > dayId) newExpanded[`${w}-${currentDayId - 1}`] = athleteData.expandedDays[key];
          else newExpanded[key] = athleteData.expandedDays[key];
        });

        updateAthleteData({ 
          workoutData: newWorkoutData,
          completedSets: newCompleted,
          exerciseNotes: newNotes,
          expandedDays: newExpanded
        });
        showToast("Dia de treino removido", "error");
      }
    });
  };

  const handleDuplicateWeek = () => {
    if (!athleteData || !isCoach) return;
    const newWeekIndex = athleteData.numWeeks;
    const newExpanded = { ...athleteData.expandedDays };
    athleteData.workoutData.forEach(day => {
      newExpanded[`${newWeekIndex}-${day.id}`] = true;
    });
    updateAthleteData({
      numWeeks: athleteData.numWeeks + 1,
      expandedDays: newExpanded,
      activeWeek: newWeekIndex
    });
    showToast("Semana duplicada com sucesso!");
  };

  const handleResetWeek = () => {
    if (!athleteData || !isCoach) return;
    const activeWeek = athleteData.activeWeek;
    setConfirmModal({
      isOpen: true,
      title: "Resetar Semana",
      message: `Deseja resetar todos os checklists da Semana ${activeWeek + 1}? Esta ação não pode ser desfeita.`,
      variant: 'warning',
      onConfirm: () => {
        const newCompleted = { ...athleteData.completedSets };
        Object.keys(newCompleted).forEach(key => {
          if (key.startsWith(`w${activeWeek}-`)) delete newCompleted[key];
        });
        updateAthleteData({ completedSets: newCompleted });
        showToast("Checklists da semana resetados");
      }
    });
  };

  const handleDeleteWeek = () => {
    if (!athleteData || !isCoach) return;
    const activeWeek = athleteData.activeWeek;
    if (athleteData.numWeeks <= 1) {
      showToast("Não é possível excluir a única semana restante.", "error");
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: "Excluir Semana",
      message: `Tem certeza que deseja remover a Semana ${activeWeek + 1} permanentemente? Todo o histórico desta semana será perdido.`,
      variant: 'danger',
      onConfirm: () => {
        const newCompleted: Record<string, boolean> = {};
        Object.keys(athleteData.completedSets).forEach(key => {
          if (key.startsWith('w')) {
            const parts = key.split('-');
            const weekIdx = parseInt(parts[0].substring(1));
            if (weekIdx > activeWeek) {
              newCompleted[`w${weekIdx - 1}-${parts[1]}-${parts[2]}-${parts[3]}`] = athleteData.completedSets[key];
            } else if (weekIdx < activeWeek) {
              newCompleted[key] = athleteData.completedSets[key];
            }
          } else {
            newCompleted[key] = athleteData.completedSets[key];
          }
        });

        const newNotes: Record<string, string> = {};
        Object.keys(athleteData.exerciseNotes).forEach(key => {
          if (key.startsWith('w')) {
            const parts = key.split('-');
            const weekIdx = parseInt(parts[0].substring(1));
            if (weekIdx > activeWeek) {
              newNotes[`w${weekIdx - 1}-${parts[1]}-${parts[2]}`] = athleteData.exerciseNotes[key];
            } else if (weekIdx < activeWeek) {
              newNotes[key] = athleteData.exerciseNotes[key];
            }
          } else {
            newNotes[key] = athleteData.exerciseNotes[key];
          }
        });

        const newExpanded: Record<string, boolean> = {};
        Object.keys(athleteData.expandedDays).forEach(key => {
          const [w, d] = key.split('-');
          const weekNum = parseInt(w);
          if (weekNum > activeWeek) newExpanded[`${weekNum - 1}-${d}`] = athleteData.expandedDays[key];
          else if (weekNum < activeWeek) newExpanded[key] = athleteData.expandedDays[key];
        });

        updateAthleteData({
          numWeeks: athleteData.numWeeks - 1,
          completedSets: newCompleted,
          exerciseNotes: newNotes,
          expandedDays: newExpanded,
          activeWeek: Math.max(0, activeWeek - 1)
        });
        showToast("Semana excluída", "error");
      }
    });
  };

  const handleAddWeek = () => {
    if (!athleteData || !isCoach) return;
    const newWeekIdx = athleteData.numWeeks;
    const newExpanded = { ...athleteData.expandedDays };
    athleteData.workoutData.forEach(day => {
      newExpanded[`${newWeekIdx}-${day.id}`] = true;
    });
    updateAthleteData({
      numWeeks: athleteData.numWeeks + 1,
      activeWeek: newWeekIdx,
      expandedDays: newExpanded
    });
    showToast("Nova semana criada!");
  };

  const handleResetAll = () => {
    if (!athleteData || !isCoach) return;
    setConfirmModal({
      isOpen: true,
      title: "Resetar Tudo",
      message: "Deseja resetar ABSOLUTAMENTE TODOS os checklists e notas de todas as semanas deste atleta? Esta ação é irreversível.",
      variant: 'danger',
      onConfirm: () => {
        updateAthleteData({ completedSets: {}, exerciseNotes: {} });
        showToast("Todo o histórico foi resetado", "warning");
      }
    });
  };

  const handleAddMobility = () => {
    if (!athleteData || !isCoach) return;
    updateAthleteData({
      mobilityList: [...athleteData.mobilityList, { name: "Novo exercício", sets: "3x10", link: "" }]
    });
  };

  const handleRemoveMobility = (idx: number) => {
    if (!athleteData || !isCoach) return;
    setConfirmModal({
      isOpen: true,
      title: "Remover Mobilidade",
      message: "Deseja remover este exercício de mobilidade?",
      variant: 'warning',
      onConfirm: () => {
        updateAthleteData({
          mobilityList: athleteData.mobilityList.filter((_, i) => i !== idx)
        });
        showToast("Exercício removido", "error");
      }
    });
  };

  const handleUpdateMobility = (idx: number, field: keyof MobilityItem, value: string) => {
    if (!athleteData || !isCoach) return;
    updateAthleteData({
      mobilityList: athleteData.mobilityList.map((item, i) => 
        i === idx ? { ...item, [field]: value } : item
      )
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!athleteData || !isCoach) return;
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation: Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      showToast("Arquivo muito grande. Máximo 2MB.", "error");
      event.target.value = ''; // Reset input
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast("Formato inválido. Use JPG, PNG ou WEBP.", "error");
      event.target.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset input to allow re-uploading same file
  };

  const handleConfirmImageUpload = () => {
    if (imagePreview) {
      updateAthleteData({ profileImage: imagePreview });
      setImagePreview(null);
      showToast("Foto de perfil atualizada!");
    }
  };

  const handleCancelImageUpload = () => {
    setImagePreview(null);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(database));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `powerlift_pro_DATABASE_BACKUP_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
    showToast("Base de dados exportada com sucesso!");
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedDB = JSON.parse(e.target?.result as string);
        if (typeof importedDB === 'object') {
          setDatabase(importedDB);
          showToast("Base de dados restaurada com sucesso!");
        } else {
          throw new Error("Formato inválido");
        }
      } catch (err) {
        showToast("O arquivo selecionado não é um backup válido.", "error");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleHardReset = () => {
    setConfirmModal({
      isOpen: true,
      title: "Limpeza Total do Sistema",
      message: "ATENÇÃO: Esta ação irá apagar TODOS os atletas e configurações do sistema, resetando a base de dados para o estado inicial. Deseja prosseguir?",
      variant: 'danger',
      onConfirm: () => {
        setDatabase({});
        localStorage.removeItem(DB_KEY);
        window.location.reload();
      }
    });
  };

  const handleUpdateExerciseNote = (weekIdx: number, dayId: number, exIdx: number, note: string) => {
    if (!athleteData) return;
    const key = `w${weekIdx}-d${dayId}-e${exIdx}`;
    updateAthleteData({
      exerciseNotes: {
        ...athleteData.exerciseNotes,
        [key]: note
      }
    });
  };

  const handleAddAthlete = (name: string) => {
    const nameTrimmed = name.trim();
    if (!nameTrimmed) return;
    if (database[nameTrimmed]) {
      showToast("Este atleta já existe.", "error");
      return;
    }

    const defaultData: AthleteData = {
      maxes: { ...INITIAL_MAXES },
      completedSets: {},
      exerciseNotes: {},
      numWeeks: 3,
      activeWeek: 0,
      password: '',
      mobilityList: [...INITIAL_MOBILITY_DATA],
      workoutData: [...INITIAL_WORKOUT_PLAN],
      tabNames: { bloco1: "📋 TREINO", dashboard: "📊 DASHBOARD", mobilidade: "🧘 MOBILIDADE" },
      appTitle: "TEAM JOHN",
      appSubtitle: "Powerlifting Excellence",
      profileImage: "https://storage.googleapis.com/test-media-antigravity/67f59451-04e4-4113-9111-972138986870.png",
      expandedDays: {},
      chartPeriod: 'week',
    };

    setDatabase(prev => ({
      ...prev,
      [nameTrimmed]: defaultData
    }));
    showToast(`Atleta ${nameTrimmed} adicionado com sucesso!`);
  };

  // Render Logic
  if (!isAuthenticated) {
    return (
      <Login
        onLoginAthlete={handleLoginAthlete}
        onLoginCoach={handleLoginCoach}
        athleteExists={(name) => !!database[name]}
      />
    );
  }

  if (isCoach && !viewingAthlete) {
    return (
      <CoachDashboard
        database={database}
        onLogout={handleLogout}
        onViewAthlete={handleViewAthlete}
        onDeleteAthlete={handleDeleteAthlete}
        onAddAthlete={handleAddAthlete}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onHardReset={handleHardReset}
      />
    );
  }

  if (!athleteData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-widest">Erro de Carregamento</h2>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">Não foi possível carregar os dados do atleta. Tente recarregar a página.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20"
          >
            Recarregar App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-gray-200 font-sans app-bg-overlay">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 z-10 p-3 sm:p-4 flex flex-wrap justify-end gap-2 max-w-[70%] sm:max-w-none">
          {isCoach && viewingAthlete && (
            <div className="flex items-center gap-2">
              <button onClick={handleBackToStudentsList} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-900/50 bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 hover:text-white transition-colors shadow-lg" title="Voltar ao Painel Principal">
                <ArrowLeft size={14} /> PAINEL
              </button>
              
              <select 
                value={viewingAthlete}
                onChange={(e) => handleViewAthlete(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-xs font-bold text-gray-300 px-3 py-1.5 rounded-full outline-none focus:border-blue-500 transition-colors shadow-lg cursor-pointer"
              >
                {Object.keys(database).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          )}
          {!isCoach && (
            <button 
              onClick={handleLoginCoach}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold border border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors shadow-lg"
              title="Aceder ao Painel de Treinador"
            >
              <ShieldCheck size={14} /> TROCAR
            </button>
          )}
          <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold border shadow-lg", isCoach ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400')}>
            {isCoach ? <ShieldCheck size={14} /> : <User size={14} />}
            {isCoach ? 'COACH' : 'ATLETA'}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold border border-red-900/50 bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors shadow-lg">
            <LogOut size={14} /> SAIR
          </button>
        </div>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500"></div>
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-2 sm:mt-4">
          <div
            className={cn("w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gray-800 border-2 rounded-2xl flex flex-col items-center justify-center transition-all shadow-xl relative shrink-0", isCoach ? 'border-blue-500/20' : 'border-gray-700')}
          >
            {athleteData.profileImage ? (
              <img src={athleteData.profileImage} className="w-full h-full object-cover rounded-2xl" alt="Profile" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-800/50 rounded-2xl">
                <img 
                  src="https://storage.googleapis.com/test-media-antigravity/67f59451-04e4-4113-9111-972138986870.png" 
                  className="w-full h-full object-cover rounded-2xl opacity-40 grayscale"
                  alt="Default Profile"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Camera size={32} className="mb-1 text-blue-500/50" />
                  <span className="text-[10px] font-bold uppercase text-gray-400">Foto</span>
                </div>
              </div>
            )}
          </div>
          <input type="file" id="hidden-file-input" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
          
          <div className="text-center sm:text-left w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                {athleteName && <div className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1 justify-center sm:justify-start"><User size={12} /> {athleteName}</div>}
                <input
                  type="text"
                  value={athleteData.appTitle}
                  onChange={(e) => isCoach && updateAthleteData({ appTitle: e.target.value })}
                  className={cn("text-2xl sm:text-3xl md:text-4xl font-black text-white bg-transparent outline-none border-b-2 border-transparent w-full transition-colors tracking-tight", isCoach ? 'focus:border-blue-500' : 'opacity-90 cursor-default')}
                  readOnly={!isCoach}
                />
                <input
                  type="text"
                  value={athleteData.appSubtitle}
                  onChange={(e) => isCoach && updateAthleteData({ appSubtitle: e.target.value })}
                  className={cn("text-xs sm:text-sm md:text-base font-medium text-gray-400 mt-0.5 sm:mt-1 bg-transparent outline-none border-b border-transparent w-full transition-colors", isCoach ? 'focus:border-blue-500' : 'cursor-default')}
                  readOnly={!isCoach}
                />
              </div>
              {isCoach && (
                <button 
                  onClick={() => document.getElementById('hidden-file-input')?.click()}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95 self-center sm:self-auto shrink-0"
                >
                  <Camera size={14} /> Alterar Foto
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40 shadow-sm">
        <div className="flex overflow-x-auto no-scrollbar max-w-6xl mx-auto px-2">
          {['bloco1', 'dashboard', 'mobilidade'].map(key => (
            <div
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex-1 sm:flex-none px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold cursor-pointer flex items-center justify-center transition-all",
                activeTab === key ? 'text-blue-400 border-b-2 border-blue-500 bg-gray-800/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
              )}
            >
              <input
                type="text"
                value={athleteData.tabNames[key]}
                onChange={(e) => isCoach && updateAthleteData({ tabNames: { ...athleteData.tabNames, [key]: e.target.value } })}
                onClick={(e) => e.stopPropagation()}
                size={Math.max(athleteData.tabNames[key].length, 6)}
                className={cn("bg-transparent outline-none text-center font-bold min-w-[80px] sm:min-w-[100px]", isCoach ? 'cursor-text' : 'cursor-pointer')}
                readOnly={!isCoach}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pb-16 bg-[#0a0a0a]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <AthleteDashboard
                athleteData={athleteData}
                isCoach={isCoach}
                onUpdateMax={handleUpdateMax}
                onUpdateAthleteField={(field, val) => updateAthleteData({ [field]: val })}
                onSetChartPeriod={handleSetChartPeriod}
              />
            )}
            {activeTab === 'bloco1' && (
              <WorkoutPlan
                athleteData={athleteData}
                isCoach={isCoach}
                onSwitchWeek={handleSwitchWeek}
                onToggleSet={handleToggleSet}
                onUpdateExerciseNote={handleUpdateExerciseNote}
                onToggleDay={handleToggleDay}
                onUpdateWorkoutDayInfo={handleUpdateWorkoutDayInfo}
                onUpdateExercise={handleUpdateExercise}
                onAddExercise={handleAddExercise}
                onRemoveExercise={handleRemoveExercise}
                onDeleteWorkoutDay={handleDeleteWorkoutDay}
                onAddWorkoutDay={handleAddWorkoutDay}
                onDuplicateWeek={handleDuplicateWeek}
                onResetWeek={handleResetWeek}
                onDeleteWeek={handleDeleteWeek}
                onAddWeek={handleAddWeek}
                onResetAll={handleResetAll}
              />
            )}
            {activeTab === 'mobilidade' && (
              <Mobility
                athleteData={athleteData}
                isCoach={isCoach}
                onAddMobility={handleAddMobility}
                onRemoveMobility={handleRemoveMobility}
                onUpdateMobility={handleUpdateMobility}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {imagePreview && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 border border-gray-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                <Camera className="text-blue-500" size={20} /> Pré-visualização
              </h3>
              
              <div className="aspect-square w-full rounded-2xl overflow-hidden border-2 border-blue-500/30 mb-6 bg-gray-800">
                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleCancelImageUpload}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <X size={16} /> Cancelar
                </button>
                <button 
                  onClick={handleConfirmImageUpload}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                >
                  <Check size={16} /> Confirmar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
      />

      <CoachLoginModal 
        isOpen={isCoachModalOpen}
        onClose={() => setIsCoachModalOpen(false)}
        onLogin={handleConfirmCoachLogin}
      />
    </div>
  );
};

export default App;
