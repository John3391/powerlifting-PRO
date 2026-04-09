import { Maxes, MobilityItem, WorkoutDay } from './types';

export const INITIAL_MAXES: Maxes = { squat: 250, bench: 180, deadlift: 300 };

export const INITIAL_MOBILITY_DATA: MobilityItem[] = [
  { name: "Mobilidade de Tornozelo com elástico", sets: "2x 15 seg", link: "#" },
  { name: "Rotação Torácica no chão", sets: "2x 10 cada lado", link: "#" },
  { name: "Alongamento de posterior com elástico", sets: "2x 20 seg", link: "#" },
  { name: "Mobilidade de Quadril (90/90)", sets: "2x 10 cada lado", link: "#" }
];

export const INITIAL_WORKOUT_PLAN: WorkoutDay[] = [
  { id: 1, day: "DIA 1", focus: "Squat", exercises: [
    { name: "Squat low bar", setsReps: "3x8", percent: 0.60, liftType: "squat" },
    { name: "Búlgaro halter", setsReps: "4x8", percent: "", liftType: "accessory" },
    { name: "Leg press", setsReps: "4x6", percent: "", liftType: "accessory" },
    { name: "Stiff barra", setsReps: "3x6", percent: "", liftType: "accessory" }
  ] },
  { id: 2, day: "DIA 2", focus: "Bench Press", exercises: [
    { name: "Bench press", setsReps: "6x6", percent: 0.60, liftType: "bench" },
    { name: "Close-grip board médio", setsReps: "2x10", percent: 0.50, liftType: "bench" },
    { name: "OHP press", setsReps: "4x5", percent: "", liftType: "accessory" },
    { name: "Elevação lateral", setsReps: "3x10", percent: "", liftType: "accessory" },
    { name: "Tríceps testa Halter", setsReps: "4x6", percent: "", liftType: "accessory" }
  ] },
  { id: 3, day: "DIA 3", focus: "Deadlift", exercises: [
    { name: "Deadlift Convencional", setsReps: "4x8", percent: 0.60, liftType: "deadlift" },
    { name: "Remada pendlay", setsReps: "4x6", percent: "", liftType: "accessory" },
    { name: "Barra Fixa", setsReps: "3x máx", percent: "", liftType: "accessory" },
    { name: "Rosca direta barra W", setsReps: "4x8", percent: "", liftType: "accessory" },
    { name: "Rosca martelo", setsReps: "3x6", percent: "", liftType: "accessory" }
  ] },
  { id: 4, day: "DIA 4", focus: "SBD", exercises: [
    { name: "Squat low bar", setsReps: "2x5", percent: 0.65, liftType: "squat" },
    { name: "Bench press", setsReps: "3x5", percent: 0.65, liftType: "bench" },
    { name: "Deadlift pausa 3s", setsReps: "2x5", percent: 0.65, liftType: "deadlift" }
  ] }
];

export const DB_KEY = 'powerliftPro_AthletesDB';
export const COACH_PASSWORD = "3636";
