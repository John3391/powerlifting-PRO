import React, { useState, useEffect } from 'react';
import { Zap, LogIn, ShieldCheck, Eye, EyeOff, UserPlus, KeyRound, User } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface LoginProps {
  onLoginAthlete: (name: string, password?: string) => void;
  onLoginCoach: (password?: string) => void;
  athleteExists: (name: string) => boolean;
}

export const Login: React.FC<LoginProps> = ({ onLoginAthlete, onLoginCoach, athleteExists }) => {
  const [mode, setMode] = useState<'athlete' | 'coach'>('athlete');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [coachPassword, setCoachPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAthleteLogin = () => {
    if (name.trim()) {
      onLoginAthlete(name.trim(), password);
    }
  };

  const handleCoachLogin = () => {
    if (coachPassword.trim()) {
      onLoginCoach(coachPassword.trim());
    }
  };

  useEffect(() => {
    if (name.trim()) {
      setIsRegistering(!athleteExists(name.trim()));
    } else {
      setIsRegistering(false);
    }
  }, [name, athleteExists]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a] relative overflow-hidden w-full">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-10 grayscale"
          alt="Gym Background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 via-[#0a0a0a]/95 to-[#0a0a0a]"></div>
      </div>

      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 z-20"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] z-0 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/60 backdrop-blur-3xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/10 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gray-900 rounded-full mx-auto mb-5 flex items-center justify-center border-2 border-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.2)] relative overflow-hidden">
            <img 
              src="https://picsum.photos/seed/ram/200/200" 
              alt="Team John Logo" 
              className="w-full h-full object-cover opacity-90"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">TEAM <span className="text-blue-600">JOHN</span></h1>
          <p className="text-gray-500 text-[10px] mt-2 font-black uppercase tracking-[0.3em]">Powerlifting Excellence</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-950/50 p-1 rounded-2xl border border-gray-800 mb-8">
          <button
            onClick={() => setMode('athlete')}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
              mode === 'athlete' ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <User size={16} /> ATLETA
          </button>
          <button
            onClick={() => setMode('coach')}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2",
              mode === 'coach' ? "bg-gray-800 text-white shadow-lg border border-gray-700" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <ShieldCheck size={16} /> TREINADOR
          </button>
        </div>

        <div className="space-y-6">
          {mode === 'athlete' ? (
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 focus-within:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                {isRegistering ? (
                  <UserPlus size={14} className="text-green-400" />
                ) : (
                  <KeyRound size={14} className="text-blue-400" />
                )}
                <label className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  isRegistering ? "text-green-400" : "text-blue-400"
                )}>
                  {isRegistering ? 'Novo Cadastro Atleta' : 'Acesso Atleta / Aluno'}
                </label>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome de atleta"
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white font-semibold placeholder-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAthleteLogin()}
                    placeholder={isRegistering ? "Defina uma senha" : "Sua senha"}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white font-semibold placeholder-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleAthleteLogin}
                className={cn(
                  "w-full mt-6 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2",
                  isRegistering 
                    ? "bg-green-600 hover:bg-green-500 shadow-green-900/20" 
                    : "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
                )}
              >
                <LogIn size={20} /> {isRegistering ? 'Criar Conta e Entrar' : 'Acessar Treino'}
              </button>

              {isRegistering && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-[10px] text-gray-500 mt-3 text-center leading-relaxed"
                >
                  Este nome ainda não existe. Ao entrar, uma nova conta será criada com esta senha para seus futuros acessos.
                </motion.p>
              )}
            </div>
          ) : (
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 focus-within:border-blue-500/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-4 text-blue-400">
                <ShieldCheck size={14} />
                <label className="text-[10px] font-bold uppercase tracking-wider">
                  Painel Administrativo
                </label>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={coachPassword}
                    onChange={(e) => setCoachPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCoachLogin()}
                    placeholder="Senha do Treinador"
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white font-semibold placeholder-gray-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleCoachLogin}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <ShieldCheck size={20} /> Entrar como Coach
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
