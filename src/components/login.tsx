import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Scissors, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-zinc-900 rounded-3xl border border-white/5 shadow-2xl">
            <img 
              src="/logodruppy.png" 
              alt="Logo" 
              className="w-16 h-16 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const icon = document.createElement('div');
                  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scissors text-red-500 w-10 h-10"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>';
                  parent.appendChild(icon.firstChild as Node);
                }
              }}
            />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            DRUPPY BARBER <span className="text-red-500 not-italic">SHOP</span>
          </h1>
          <p className="text-zinc-500 font-medium mt-2">Panel de Administración</p>
        </div>

        <div className="bg-[#1a1c20] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Entrar al Panel'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-8 font-medium">
          &copy; 2026 Druppy Barber Shop. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  );
}

