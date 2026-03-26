import React, { useState, useEffect, useMemo } from 'react';
import Login from './components/Login';
import { 
  Users, 
  Calendar, 
  Scissors, 
  UserRound, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  CreditCard,
  Wallet,
  Receipt,
  Moon,
  Sun,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit2,
  Edit3,
  Phone,
  MessageCircle,
  Home,
  Package,
  BarChart3,
  Tag,
  Star,
  Trophy,
  FileText,
  Loader2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { motion, AnimatePresence } from 'motion/react';
import { format, startOfDay, endOfDay, isSameDay, differenceInMinutes, differenceInSeconds, differenceInDays, differenceInCalendarDays, addMinutes, subMinutes, isAfter, isBefore, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './lib/supabase';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility for Title Case
function toTitleCase(str: string) {
  return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

// Utility for WhatsApp Link
function getWhatsAppLink(phone: string) {
  const cleanPhone = phone.replace(/\D/g, '');
  // Si tiene 10 dígitos (ej. 809...), asumimos que falta el código de país '1' (RD/USA)
  const finalPhone = cleanPhone.length === 10 ? `1${cleanPhone}` : cleanPhone;
  return `https://wa.me/${finalPhone}`;
}

// Utility to get Base64 from Image URL
const getBase64ImageFromUrl = async (url: string): Promise<string> => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading logo for PDF:', error);
    return '';
  }
};

// Types
type Tab = 'dashboard' | 'appointments' | 'clients' | 'services' | 'barbers' | 'sales' | 'finance' | 'settings' | 'payment_methods' | 'expense_categories' | 'vip' | 'reports';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [preselectedClientId, setPreselectedClientId] = useState<string | null>(null);
  const [preselectedAppointmentId, setPreselectedAppointmentId] = useState<string | null>(null);
  const [preselectedSaleId, setPreselectedSaleId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'finance', label: 'Finanzas', icon: DollarSign },
    { id: 'vip', label: 'VIP', icon: TrendingUp },
    { id: 'sales', label: 'Ventas', icon: Receipt },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  const moreItems: any[] = [];

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans transition-colors duration-300 overflow-hidden">
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1c20] border-r border-white/5 text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 hidden lg:flex flex-col p-6"
        )}
      >
        <div className="flex flex-col items-center gap-4 mb-10 text-center">
          <div className="w-32 h-32 flex items-center justify-center transition-all duration-300">
            <img 
              src="/logodruppy.png" 
              alt="Logo" 
              className="w-full h-full object-contain" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const icon = document.createElement('div');
                  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scissors text-white w-6 h-6"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>';
                  parent.appendChild(icon.firstChild as Node);
                }
              }}
            />
          </div>
          <h1 className="text-lg font-black tracking-tighter leading-none uppercase italic text-white whitespace-nowrap">
            DRUPPY BARBER <span className="text-red-500 not-italic">SHOP</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                activeTab === item.id 
                  ? "bg-red-600 text-white shadow-lg" 
                  : "text-zinc-500 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "group-hover:text-white")} />
              <span className="font-medium">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="sidebar-nav-glow"
                  className="absolute left-0 w-1 h-6 bg-red-500 rounded-r-full blur-[1px]"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-zinc-100 space-y-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-zinc-900 transition-colors rounded-xl hover:bg-zinc-100"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-28 bg-[#1a1c20] border-b border-white/5 flex items-center justify-between px-5 flex-shrink-0 lg:hidden shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 flex items-center justify-center transition-all duration-300">
            <img 
              src="/logodruppy.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const icon = document.createElement('div');
                  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scissors text-blue-500 w-6 h-6"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>';
                  parent.appendChild(icon.firstChild as Node);
                }
              }}
            />
          </div>
          <h1 className="text-base font-black tracking-tighter leading-none uppercase italic text-white whitespace-nowrap">
            DRUPPY BARBER <span className="text-red-500 not-italic">SHOP</span>
          </h1>
        </div>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10 transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-[#1a1c20] border-t border-white/5 flex items-center justify-around px-2 lg:hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className="flex flex-col items-center gap-1 relative group"
          >
            {activeTab === item.id && (
              <motion.div 
                layoutId="nav-glow"
                className="absolute -top-10 w-12 h-1 bg-red-500 blur-[2px]"
              />
            )}
            <item.icon className={cn(
              "w-6 h-6 transition-colors",
              activeTab === item.id ? "text-red-500" : "text-zinc-500"
            )} />
            <span className={cn(
              "text-[10px] font-bold transition-colors",
              activeTab === item.id ? "text-white" : "text-zinc-500"
            )}>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto pt-28 lg:pt-0 pb-24 lg:pb-0 relative">
        <div className="max-w-4xl mx-auto p-5 lg:p-10 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <DashboardView 
                  onTabChange={setActiveTab} 
                  onPreselectAppointment={(id) => {
                    setPreselectedAppointmentId(id);
                    setActiveTab('appointments');
                  }}
                  onPreselectSale={(id) => {
                    setPreselectedSaleId(id);
                    setActiveTab('sales');
                  }}
                />
              )}
              {activeTab === 'appointments' && (
                <AppointmentsView 
                  initialClientId={preselectedClientId} 
                  onClearPreselect={() => setPreselectedClientId(null)} 
                  initialAppointmentId={preselectedAppointmentId}
                  onClearPreselectAppointment={() => setPreselectedAppointmentId(null)}
                />
              )}
              {activeTab === 'sales' && (
                <SalesView 
                  initialSaleId={preselectedSaleId} 
                  onClearPreselect={() => setPreselectedSaleId(null)} 
                />
              )}
              {activeTab === 'clients' && (
                <ClientsView 
                  onTabChange={setActiveTab} 
                  onPreselectClient={setPreselectedClientId} 
                  onPreselectSale={(id) => {
                    setPreselectedSaleId(id);
                    setActiveTab('sales');
                  }}
                />
              )}
              {activeTab === 'barbers' && <BarbersView />}
              {activeTab === 'services' && <ServicesView />}
              {activeTab === 'finance' && <FinanceView />}
              {activeTab === 'vip' && <VIPView />}
              {activeTab === 'reports' && <ReportsView />}
              {activeTab === 'settings' && <SettingsView onTabChange={setActiveTab} />}
              {activeTab === 'payment_methods' && <PaymentMethodsView />}
              {activeTab === 'expense_categories' && <ExpenseCategoriesView />}
              
              {activeTab === 'more' && (
                <div className="grid grid-cols-1 gap-4">
                  {moreItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as Tab)}
                      className="flex items-center justify-between p-5 card hover:border-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-900/50 rounded-xl group-hover:bg-zinc-900/80 transition-colors">
                          <item.icon className="w-6 h-6 text-zinc-300" />
                        </div>
                        <span className="font-black text-lg text-white tracking-tight">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                    </button>
                  ))}
                  <button 
                    onClick={() => supabase.auth.signOut()}
                    className="flex items-center gap-4 p-5 text-red-500 font-black tracking-tight hover:bg-red-500/5 rounded-2xl transition-all"
                  >
                    <LogOut className="w-6 h-6" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- Views ---
function DashboardView({ onTabChange, onPreselectAppointment, onPreselectSale }: { 
  onTabChange: (tab: Tab) => void,
  onPreselectAppointment?: (id: string) => void,
  onPreselectSale?: (id: string) => void
}) {
  const [todaySales, setTodaySales] = useState<any[]>([]);
  const [todayPayments, setTodayPayments] = useState<any[]>([]);
  const [todayExpenses, setTodayExpenses] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [pendingCredits, setPendingCredits] = useState<any[]>([]);
  const [showPendingCredits, setShowPendingCredits] = useState(true);
  const [todayAppsCount, setTodayAppsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);
  const [isAppsModalOpen, setIsAppsModalOpen] = useState(false);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const gracePeriod = useMemo(() => {
    const saved = localStorage.getItem('gracePeriod');
    return saved ? parseInt(saved) : 10;
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for the countdown
    return () => clearInterval(timer);
  }, []);

  async function fetchDashboardData() {
    try {
      const now = new Date();
      const earliestTime = subMinutes(now, gracePeriod).toISOString();
      const today = new Date();
      const start = startOfDay(today).toISOString();
      const end = endOfDay(today).toISOString();

      const [salesRes, paymentsRes, expensesRes, appsCountRes, nextAppsRes, allTodayAppsRes, creditsRes] = await Promise.all([
        supabase.from('sales').select('*, clients(name)').gte('created_at', start).lte('created_at', end),
        supabase.from('sale_payments').select('*, sales(*, clients(name))').gte('created_at', start).lte('created_at', end),
        supabase.from('expenses').select('*').gte('created_at', start).lte('created_at', end),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).gte('appointment_time', start).lte('appointment_time', end),
        supabase.from('appointments')
          .select('*, clients(name), barbers(name)')
          .gte('appointment_time', earliestTime)
          .in('status', ['pending', 'confirmed'])
          .order('appointment_time')
          .limit(5),
        supabase.from('appointments')
          .select('*, clients(name), barbers(name)')
          .gte('appointment_time', start)
          .lte('appointment_time', end)
          .order('appointment_time'),
        supabase.from('sales')
          .select('*, clients(name)')
          .eq('is_paid', false)
          .not('due_date', 'is', null)
          .order('due_date')
      ]);

      if (salesRes.error) throw salesRes.error;
      if (paymentsRes.error) throw paymentsRes.error;
      if (expensesRes.error) throw expensesRes.error;
      if (appsCountRes.error) throw appsCountRes.error;
      if (nextAppsRes.error) throw nextAppsRes.error;
      if (allTodayAppsRes.error) throw allTodayAppsRes.error;
      if (creditsRes.error) throw creditsRes.error;

      setTodaySales(salesRes.data || []);
      setTodayPayments(paymentsRes.data || []);
      setTodayExpenses(expensesRes.data || []);
      setUpcomingAppointments(nextAppsRes.data || []);
      setTodayAppointments(allTodayAppsRes.data || []);
      setTodayAppsCount(appsCountRes.count || 0);
      
      // Filter credits due within 2 days (today and tomorrow)
      const soon = addDays(new Date(), 2);
      const filteredCredits = (creditsRes.data || []).filter(c => {
        const dueDate = new Date(c.due_date);
        return dueDate <= soon;
      });
      setPendingCredits(filteredCredits);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalIncome = todaySales.reduce((acc, s) => acc + s.total_amount, 0);
  const totalExpenses = todayExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  
  // Real collected = (Non-credit sales today) + (Payments recorded today)
  const totalCollected = 
    todaySales.filter(s => s.payment_method !== 'Crédito').reduce((acc, s) => acc + s.total_amount, 0) +
    todayPayments.reduce((acc, p) => acc + p.amount, 0);

  const pendingTotalAmount = pendingCredits.reduce((acc, c) => acc + c.total_amount, 0);

  if (loading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-zinc-500 font-medium">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Pending Credits Alerts */}
      {pendingCredits.length > 0 && (
        <div className="space-y-3">
          <button 
            onClick={() => setShowPendingCredits(!showPendingCredits)}
            className="flex items-center justify-between w-full px-2 group"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">Recordatorios de Cobro</span>
              <span className="bg-orange-500/20 text-orange-500 text-[10px] px-2 py-0.5 rounded-full font-black">
                {pendingCredits.length}
              </span>
            </div>
            <div className={cn(
              "p-1 rounded-lg bg-white/5 text-zinc-500 group-hover:text-white transition-all",
              showPendingCredits ? "rotate-90" : "rotate-0"
            )}>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <AnimatePresence>
            {showPendingCredits && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-2"
              >
                {pendingCredits.map(credit => {
                  const isToday = isSameDay(new Date(credit.due_date), new Date());
                  return (
                    <div key={credit.id} className="glass p-4 rounded-2xl border-l-4 border-orange-500 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">Cobro pendiente: {credit.clients?.name || 'Cliente'}</p>
                        <p className="text-[10px] text-zinc-400 font-medium">
                          Vence: {format(new Date(credit.due_date), "dd 'de' MMMM", { locale: es })} 
                          {isToday ? ' (HOY)' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-orange-500">RD$ {credit.total_amount.toLocaleString()}</p>
                        <button 
                          onClick={() => onPreselectSale?.(credit.id)}
                          className="text-[10px] font-bold text-blue-400 hover:underline"
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main Grid Menu - Matching the image buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => onTabChange('clients')}
          className="flex flex-col items-center justify-center gap-2 p-5 rounded-[1.5rem] active:scale-95 transition-all bg-blue-600 shadow-lg"
        >
          <div className="p-2 bg-white/10 rounded-xl">
            <Users className="w-8 h-8 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Clientes</span>
        </button>
        <button 
          onClick={() => onTabChange('appointments')}
          className="flex flex-col items-center justify-center gap-2 p-5 rounded-[1.5rem] active:scale-95 transition-all bg-emerald-600 shadow-lg"
        >
          <div className="p-2 bg-white/10 rounded-xl">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Agenda</span>
        </button>
        <button 
          onClick={() => onTabChange('sales')}
          className="flex flex-col items-center justify-center gap-2 p-5 rounded-[1.5rem] active:scale-95 transition-all bg-orange-600 shadow-lg"
        >
          <div className="p-2 bg-white/10 rounded-xl">
            <Receipt className="w-8 h-8 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Ventas</span>
        </button>
        <button 
          onClick={() => onTabChange('finance')}
          className="flex flex-col items-center justify-center gap-2 p-5 rounded-[1.5rem] active:scale-95 transition-all bg-purple-600 shadow-lg"
        >
          <div className="p-2 bg-white/10 rounded-xl">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Finanzas</span>
        </button>
        <button 
          onClick={() => onTabChange('vip')}
          className="flex flex-col items-center justify-center gap-2 p-5 rounded-[1.5rem] active:scale-95 transition-all bg-yellow-600 shadow-lg col-span-2 mt-2"
        >
          <div className="p-2 bg-white/10 rounded-xl">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <span className="font-bold text-white text-sm uppercase tracking-widest">Club VIP</span>
        </button>
      </div>

      {/* Modals for Details */}
      {isSalesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Ventas de Hoy</h3>
              <button onClick={() => setIsSalesModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {todaySales.length === 0 ? (
                <p className="text-center text-zinc-500 py-4">No hay ventas registradas hoy.</p>
              ) : (
                todaySales.map((sale) => (
                  <div key={sale.id} className="flex justify-between items-start pb-4 border-b border-white/5 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">
                        {sale.clients?.name || 'Venta General'}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                          {sale.services || 'Servicio General'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-black text-white">RD$ {sale.total_amount.toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 bg-white/5 flex justify-between items-center">
              <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Total Ventas</span>
              <span className="text-xl font-black text-white">RD$ {totalIncome.toLocaleString()}</span>
            </div>
          </motion.div>
        </div>
      )}

      {isPaymentsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Cobros de Hoy</h3>
              <button onClick={() => setIsPaymentsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {/* Combine direct payments (non-credit sales) and credit payments */}
              {(() => {
                const directPayments = todaySales.filter(s => s.payment_method !== 'Crédito').map(s => ({
                  id: `direct-${s.id}`,
                  clientName: s.clients?.name || 'Venta General',
                  services: s.services,
                  amount: s.total_amount,
                  type: 'Venta Directa',
                  status: 'Pago Completo'
                }));
                const creditPayments = todayPayments.map(p => ({
                  id: `payment-${p.id}`,
                  clientName: p.sales?.clients?.name || 'Cliente',
                  services: p.sales?.services,
                  amount: p.amount,
                  type: 'Abono Crédito',
                  status: p.sales?.is_paid ? 'Saldo Completo' : 'Abono'
                }));
                const all = [...directPayments, ...creditPayments];

                if (all.length === 0) return <p className="text-center text-zinc-500 py-4">No hay cobros registrados hoy.</p>;

                return all.map((item) => (
                  <div key={item.id} className="flex justify-between items-start pb-4 border-b border-white/5 last:border-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{item.clientName}</p>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full border uppercase font-bold ${
                          item.status === 'Pago Completo' || item.status === 'Saldo Completo' 
                            ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' 
                            : 'border-orange-500/20 text-orange-400 bg-orange-500/5'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-400">
                          {item.services || 'Servicio General'}
                        </span>
                        <span className="text-[10px] text-zinc-600">•</span>
                        <span className="text-[10px] text-zinc-500 italic">{item.type}</span>
                      </div>
                    </div>
                    <p className="text-sm font-black text-emerald-400">RD$ {item.amount.toLocaleString()}</p>
                  </div>
                ));
              })()}
            </div>
            <div className="p-6 bg-white/5 flex justify-between items-center">
              <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Total Cobrado</span>
              <span className="text-xl font-black text-emerald-400">RD$ {totalCollected.toLocaleString()}</span>
            </div>
          </motion.div>
        </div>
      )}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-base font-bold text-white/90">Resumen de Hoy</h3>
          <button onClick={() => onTabChange('sales')} className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors">Ver todo &gt;</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => setIsSalesModalOpen(true)}
            className="glass p-4 rounded-2xl relative overflow-hidden border-white/5 group text-left"
          >
            <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
            <div className="relative z-10 flex flex-col gap-0.5">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Ventas Hoy</p>
              <h4 className="text-xl font-black text-white">RD$ {totalIncome.toLocaleString()}</h4>
            </div>
            <div className="absolute right-2 bottom-2 opacity-30">
              <Receipt className="w-10 h-10 text-blue-400" />
            </div>
          </button>
          <button 
            onClick={() => setIsPaymentsModalOpen(true)}
            className="glass p-4 rounded-2xl relative overflow-hidden border-white/5 group text-left"
          >
            <div className="absolute inset-0 bg-emerald-600/5 group-hover:bg-emerald-600/10 transition-colors" />
            <div className="relative z-10 flex flex-col gap-0.5">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Cobrado Hoy</p>
              <h4 className="text-xl font-black text-emerald-400">RD$ {totalCollected.toLocaleString()}</h4>
            </div>
            <div className="absolute right-2 bottom-2 opacity-30">
              <DollarSign className="w-10 h-10 text-emerald-400" />
            </div>
          </button>
          <button 
            onClick={() => onTabChange('finance')}
            className="glass p-4 rounded-2xl relative overflow-hidden border-white/5 group text-left"
          >
            <div className="absolute inset-0 bg-red-600/5 group-hover:bg-red-600/10 transition-colors" />
            <div className="relative z-10 flex flex-col gap-0.5">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Gastos Hoy</p>
              <h4 className="text-xl font-black text-red-400">RD$ {totalExpenses.toLocaleString()}</h4>
            </div>
            <div className="absolute right-2 bottom-2 opacity-30">
              <CreditCard className="w-10 h-10 text-red-400" />
            </div>
          </button>
          <button 
            onClick={() => setIsAppsModalOpen(true)}
            className="glass p-4 rounded-2xl relative overflow-hidden border-white/5 group text-left"
          >
            <div className="absolute inset-0 bg-orange-600/5 group-hover:bg-orange-600/10 transition-colors" />
            <div className="relative z-10 flex flex-col gap-0.5">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Citas Hoy</p>
              <h4 className="text-xl font-black text-white">{todayAppsCount}</h4>
            </div>
            <div className="absolute right-2 bottom-2 opacity-30">
              <Calendar className="w-10 h-10 text-orange-400" />
            </div>
          </button>
        </div>
      </div>

      {isAppsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Citas de Hoy</h3>
              <button onClick={() => setIsAppsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              {todayAppointments.length === 0 ? (
                <p className="text-center text-zinc-500 py-4">No hay citas programadas para hoy.</p>
              ) : (
                todayAppointments.map((app) => (
                  <div key={app.id} className="flex justify-between items-center pb-4 border-b border-white/5 last:border-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{app.clients?.name || 'Cliente'}</p>
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded-full border uppercase font-bold",
                          app.status === 'completed' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' :
                          app.status === 'confirmed' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' :
                          app.status === 'cancelled' ? 'border-red-500/20 text-red-400 bg-red-500/5' :
                          'border-zinc-500/20 text-zinc-400 bg-zinc-500/5'
                        )}>
                          {app.status === 'pending' ? 'Pendiente' : 
                           app.status === 'confirmed' ? 'Confirmada' :
                           app.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500">
                        {app.service} | {app.barbers?.name || 'Cualquiera'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">{format(new Date(app.appointment_time), "hh:mm a")}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 bg-white/5">
              <button 
                onClick={() => {
                  setIsAppsModalOpen(false);
                  onTabChange('appointments');
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all"
              >
                Ir a la Agenda
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-base font-bold text-white/90">Próximas Citas</h3>
          <button onClick={() => onTabChange('appointments')} className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors">Ver todo &gt;</button>
        </div>
        <div className="space-y-2">
          {upcomingAppointments.length > 0 ? upcomingAppointments.map((app) => {
            const appTime = new Date(app.appointment_time);
            const isGrace = isAfter(currentTime, appTime);
            const graceEndTime = addMinutes(appTime, gracePeriod);
            const remainingSeconds = differenceInSeconds(graceEndTime, currentTime);
            const isExpired = isAfter(currentTime, graceEndTime);

            if (isExpired) return null;

            const displayTime = remainingSeconds >= 60 
              ? `${Math.floor(remainingSeconds / 60)} min` 
              : `${remainingSeconds} seg`;

            return (
              <button 
                key={app.id} 
                onClick={() => onPreselectAppointment?.(app.id)}
                className={cn(
                  "w-full text-left glass p-3 rounded-2xl flex items-center gap-3 border transition-colors group",
                  isGrace ? "border-red-500/30 bg-red-500/5" : "border-white/5 hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  isGrace ? "bg-red-500/10" : "bg-blue-500/10"
                )}>
                  <Calendar className={cn("w-5 h-5", isGrace ? "text-red-400" : "text-blue-400")} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]",
                      isGrace ? "bg-red-500 shadow-red-500/50" : "bg-blue-500"
                    )} />
                    <h4 className="text-sm font-bold text-white">{app.clients?.name || 'Cliente'}</h4>
                    {isGrace && (
                      <span className="text-[9px] font-black text-red-500 animate-pulse uppercase tracking-tighter">
                        Próximo a vencer: {displayTime}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium ml-3.5">
                    {app.service} | {format(new Date(app.appointment_time), "hh:mm a")}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </button>
            );
          }) : (
            <p className="text-center py-4 text-zinc-500 text-xs italic">No hay citas próximas</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AppointmentsView({ 
  initialClientId, 
  onClearPreselect, 
  initialAppointmentId, 
  onClearPreselectAppointment 
}: { 
  initialClientId?: string | null, 
  onClearPreselect?: () => void,
  initialAppointmentId?: string | null,
  onClearPreselectAppointment?: () => void
}) {
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const [gracePeriod, setGracePeriod] = useState(() => {
    const saved = localStorage.getItem('gracePeriod');
    return saved ? parseInt(saved) : 10;
  });

  useEffect(() => {
    localStorage.setItem('gracePeriod', gracePeriod.toString());
  }, [gracePeriod]);

  const [newAppointment, setNewAppointment] = useState({
    client_id: '',
    barber_id: '',
    service: '',
    appointment_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    status: 'pending',
    commission_rate: 100 // Default 100%
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [completingApp, setCompletingApp] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Efectivo');
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 30), 'yyyy-MM-dd'));

  useEffect(() => {
    if (initialClientId && clients.length > 0) {
      setNewAppointment(prev => ({ ...prev, client_id: initialClientId }));
      setIsAddingAppointment(true);
      if (onClearPreselect) onClearPreselect();
    }
  }, [initialClientId, clients, onClearPreselect]);

  useEffect(() => {
    if (initialAppointmentId && !loading && appointments.length > 0) {
      setHighlightedId(initialAppointmentId);
      
      // Clear search to make sure it's visible
      setSearchTerm('');

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(`appointment-${initialAppointmentId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (onClearPreselectAppointment) onClearPreselectAppointment();
      }, 300);

      // Remove highlight after 3 seconds
      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [initialAppointmentId, loading, appointments, onClearPreselectAppointment]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [appsRes, barbersRes, clientsRes, servicesRes, methodsRes] = await Promise.all([
        supabase.from('appointments').select('*, clients(name, phone), barbers(name)').order('created_at', { ascending: false }),
        supabase.from('barbers').select('*').eq('active', true),
        supabase.from('clients').select('*').order('name'),
        supabase.from('services').select('*').order('name'),
        supabase.from('payment_methods').select('*').eq('active', true).order('name')
      ]);

      if (appsRes.error) throw appsRes.error;
      setAppointments(appsRes.data || []);
      setBarbers(barbersRes.data || []);
      setClients(clientsRes.data || []);
      setServices(servicesRes.data || []);
      setPaymentMethods(methodsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAppointment(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const appData: any = { 
        ...newAppointment,
        appointment_time: new Date(newAppointment.appointment_time).toISOString()
      };

      if (editingId) {
        // On update, we don't want to change the owner (user_id)
        const { error } = await supabase.from('appointments').update({
          client_id: appData.client_id,
          barber_id: appData.barber_id,
          service: appData.service,
          appointment_time: appData.appointment_time,
          status: appData.status,
          commission_rate: appData.commission_rate / 100
        }).eq('id', editingId);
        if (error) throw error;
      } else {
        if (user) appData.user_id = user.id;
        const { error } = await supabase.from('appointments').insert([{
          ...appData,
          commission_rate: appData.commission_rate / 100
        }]);
        if (error) throw error;
      }

      setIsAddingAppointment(false);
      setEditingId(null);
      setNewAppointment({
        client_id: '',
        barber_id: '',
        service: '',
        appointment_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        status: 'pending',
        commission_rate: 100
      });
      fetchData();
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      alert(`Error al guardar cita: ${error.message || 'Error desconocido'}`);
    }
  }

  async function handleEditAppointment(app: any) {
    setNewAppointment({
      client_id: app.client_id,
      barber_id: app.barber_id,
      service: app.service,
      appointment_time: format(new Date(app.appointment_time), "yyyy-MM-dd'T'HH:mm"),
      status: app.status
    });
    setEditingId(app.id);
    setIsAddingAppointment(true);
  }

  async function handleDeleteAppointment(id: string) {
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) throw error;
      setDeletingId(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  }

  async function handleUpdateStatus(id: string, newStatus: string) {
    try {
      const currentApp = appointments.find(a => a.id === id);
      
      if (newStatus === 'completed' && currentApp?.status !== 'completed') {
        setCompletingApp(currentApp);
        setIsPaymentModalOpen(true);
        return;
      }

      const { error } = await supabase.from('appointments').update({ status: newStatus }).eq('id', id);
      if (error) throw error;

      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  async function handleConfirmCompletion() {
    if (!completingApp) return;

    try {
      const { error: statusError } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', completingApp.id);
      
      if (statusError) throw statusError;

      const service = services.find(s => s.name === completingApp.service);
      const { data: { user } } = await supabase.auth.getUser();
      
      const totalAmount = service ? service.price : 0;
      const isPaid = selectedPaymentMethod !== 'Crédito';

      const saleData: any = {
        client_id: completingApp.client_id,
        barber_id: completingApp.barber_id,
        services: completingApp.service,
        total_amount: totalAmount,
        payment_method: selectedPaymentMethod,
        is_paid: isPaid,
        paid_amount: isPaid ? totalAmount : 0,
        user_id: user?.id,
        commission_rate: completingApp.commission_rate || 1.0,
        note: `Venta automática de cita #${completingApp.id.slice(0, 8)}`
      };

      if (!isPaid && dueDate) {
        saleData.due_date = dueDate;
      }

      const { error: saleError } = await supabase.from('sales').insert([saleData]);
      if (saleError) throw saleError;

      setIsPaymentModalOpen(false);
      setCompletingApp(null);
      fetchData();
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('Error al completar la cita y crear la venta');
    }
  }

  // Auto-cancellation and countdown logic
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Check for appointments to auto-cancel
      appointments.forEach(async (app) => {
        if (app.status === 'pending' || app.status === 'confirmed') {
          const appTime = new Date(app.appointment_time);
          const graceEndTime = addMinutes(appTime, gracePeriod);
          
          if (isAfter(now, graceEndTime) && app.status !== 'completed' && app.status !== 'cancelled') {
            // Auto cancel
            await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', app.id);
            fetchData();
          }
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(timer);
  }, [appointments, gracePeriod]);

  function getAppointmentAlert(app: any) {
    const now = currentTime;
    const appTime = new Date(app.appointment_time);
    const diff = differenceInMinutes(appTime, now);
    const graceEndTime = addMinutes(appTime, gracePeriod);

    if (app.status === 'completed' || app.status === 'cancelled') return null;

    if (isAfter(now, appTime) && isBefore(now, graceEndTime)) {
      const remainingGrace = differenceInMinutes(graceEndTime, now);
      return {
        type: 'grace',
        message: `Tiempo de gracia: ${remainingGrace} min restantes`,
        color: 'text-red-500 animate-pulse font-bold'
      };
    }

    if (diff > 0 && diff <= 30) {
      return {
        type: 'upcoming',
        message: `Próxima en ${diff} min`,
        color: 'text-orange-500 font-medium'
      };
    }

    return null;
  }

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold">Agenda de Hoy</h3>
            <p className="text-sm text-zinc-500 mt-1">{format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}</p>
            <div className="mt-4 relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Buscar por cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[var(--bg-input)] border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none glass"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl border border-white/10">
              <Clock className="w-4 h-4 text-zinc-400" />
              <div className="flex flex-col">
                <label className="text-[8px] font-bold text-zinc-500 uppercase">Tiempo Gracia (min)</label>
                <input 
                  type="number" 
                  value={gracePeriod || 0}
                  onChange={(e) => setGracePeriod(Math.max(1, parseInt(e.target.value) || 1))}
                  className="bg-transparent border-none p-0 text-xs font-bold focus:ring-0 w-12 outline-none"
                />
              </div>
            </div>
            <button 
              onClick={() => setIsAddingAppointment(true)}
              className="btn-primary bg-emerald-600 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nueva Cita
            </button>
          </div>
        </div>

        {isAddingAppointment && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 glass border-b border-white/5"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold">{editingId ? 'Editar Cita' : 'Programar Nueva Cita'}</h4>
              <button 
                onClick={() => {
                  setIsAddingAppointment(false);
                  setEditingId(null);
                  setNewAppointment({
                    client_id: '',
                    barber_id: '',
                    service: '',
                    appointment_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                    status: 'pending',
                    commission_rate: 100
                  });
                }} 
                className="p-2 hover:bg-white/5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAppointment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Cliente</label>
                <select 
                  required
                  value={newAppointment.client_id}
                  onChange={e => setNewAppointment({...newAppointment, client_id: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none glass"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Barbero</label>
                <select 
                  required
                  value={newAppointment.barber_id}
                  onChange={e => setNewAppointment({...newAppointment, barber_id: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none glass"
                >
                  <option value="">Seleccionar barbero</option>
                  {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Servicio</label>
                <select 
                  required
                  value={newAppointment.service}
                  onChange={e => setNewAppointment({...newAppointment, service: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none glass"
                >
                  <option value="">Seleccionar servicio</option>
                  {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Comisión (%)</label>
                <input 
                  type="number" 
                  value={newAppointment.commission_rate}
                  onChange={e => setNewAppointment({...newAppointment, commission_rate: parseInt(e.target.value) || 0})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none glass"
                  placeholder="100"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Fecha y Hora</label>
                <input 
                  required
                  type="datetime-local" 
                  value={newAppointment.appointment_time}
                  onChange={e => setNewAppointment({...newAppointment, appointment_time: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none glass"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Estado</label>
                <select 
                  required
                  value={newAppointment.status}
                  onChange={e => setNewAppointment({...newAppointment, status: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none glass"
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
              <div className="lg:col-span-2 flex items-end gap-2">
                <button type="submit" className="btn-primary flex-1">
                  {editingId ? 'Guardar Cambios' : 'Confirmar Cita'}
                </button>
                {editingId && (
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddingAppointment(false);
                      setEditingId(null);
                      setNewAppointment({
                        client_id: '',
                        barber_id: '',
                        service: '',
                        appointment_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
                        status: 'pending',
                        commission_rate: 100
                      });
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}

        <div className="p-8">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-zinc-500">Cargando agenda...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments
                .filter(app => 
                  app.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  app.service?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .length > 0 ? appointments
                .filter(app => 
                  app.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  app.service?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((app, i) => (
                <div 
                  key={app.id} 
                  id={`appointment-${app.id}`}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center p-4 rounded-xl border transition-all group gap-4",
                    highlightedId === app.id 
                      ? "border-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                      : "border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                  )}
                >
                  <div className="w-full sm:w-24 text-sm font-bold text-zinc-400">
                    {format(new Date(app.appointment_time), "hh:mm a")}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{app.clients?.name || 'Cliente desconocido'}</h4>
                      {getAppointmentAlert(app) && (
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-md bg-zinc-100", getAppointmentAlert(app)?.color)}>
                          {getAppointmentAlert(app)?.message}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">{app.service} • Barbero: {app.barbers?.name || 'Cualquiera'}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                    <select 
                      value={app.status}
                      onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                      className={cn(
                        "text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full bg-transparent border border-current cursor-pointer outline-none",
                        app.status === 'completed' ? "text-emerald-500 border-emerald-500/30" :
                        app.status === 'confirmed' ? "text-blue-500 border-blue-500/30" :
                        app.status === 'cancelled' ? "text-red-500 border-red-500/30" :
                        "text-orange-500 border-orange-500/30"
                      )}
                    >
                      <option value="pending" className="text-orange-500">Pendiente</option>
                      <option value="confirmed" className="text-blue-500">Confirmada</option>
                      <option value="completed" className="text-emerald-500">Completada</option>
                      <option value="cancelled" className="text-red-500">Cancelada</option>
                    </select>
                    <div className="flex items-center gap-1">
                      {app.clients?.phone && (
                        <a 
                          href={getWhatsAppLink(app.clients.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </a>
                      )}
                      <button 
                        onClick={() => handleEditAppointment(app)}
                        className="p-2 text-zinc-400 hover:text-blue-500 transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setDeletingId(app.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center">
                  <Calendar className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                  <p className="text-zinc-500 font-medium">No hay citas programadas</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card p-8 shadow-2xl max-w-sm w-full text-center"
          >
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-2">¿Eliminar cita?</h3>
            <p className="text-zinc-500 mb-8">Esta acción no se puede deshacer. ¿Estás seguro?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingId(null)}
                className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-all border border-white/5"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleDeleteAppointment(deletingId)}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Payment Method Selection Modal */}
      {isPaymentModalOpen && completingApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card p-8 shadow-2xl max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Completar Cita</h3>
                <p className="text-zinc-500 text-sm">Selecciona el método de pago</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-zinc-500 uppercase font-bold">Cliente</span>
                  <span className="text-sm font-bold">{completingApp.clients?.name}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-zinc-500 uppercase font-bold">Servicio</span>
                  <span className="text-sm font-bold">{completingApp.service}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-500 uppercase font-bold">Monto</span>
                  <span className="text-lg font-black text-emerald-500">
                    RD$ {services.find(s => s.name === completingApp.service)?.price.toLocaleString() || '0'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Método de Pago</label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedPaymentMethod(m.name)}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border transition-all text-sm font-bold",
                          selectedPaymentMethod === m.name 
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg" 
                            : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                        )}
                      >
                        {m.name === 'Efectivo' && <Wallet className="w-4 h-4" />}
                        {m.name === 'Transferencia' && <TrendingUp className="w-4 h-4" />}
                        {m.name === 'Tarjeta' && <CreditCard className="w-4 h-4" />}
                        {m.name === 'Crédito' && <Clock className="w-4 h-4" />}
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedPaymentMethod === 'Crédito' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Fecha de Vencimiento</label>
                    <input 
                      type="date" 
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </motion.div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setCompletingApp(null);
                  }}
                  className="flex-1 py-3 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-all border border-white/5"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmCompletion}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  Confirmar Pago
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function SalesView({ initialSaleId, onClearPreselect }: { 
  initialSaleId?: string | null,
  onClearPreselect?: () => void
}) {
  const [isAddingSale, setIsAddingSale] = useState(false);
  const [isEditingSale, setIsEditingSale] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [editingSale, setEditingSale] = useState<any>(null);
  const [paymentSale, setPaymentSale] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('Efectivo');
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (initialSaleId) {
      setSearchTerm(initialSaleId);
      onClearPreselect?.();
    }
  }, [initialSaleId]);

  const [newSale, setNewSale] = useState({
    client_id: '',
    barber_id: '',
    services: '',
    total_amount: 0,
    payment_method: '',
    note: '',
    due_date: '',
    created_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    commission_rate: 100 // Default 100%
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [salesRes, barbersRes, clientsRes, servicesRes, methodsRes] = await Promise.all([
        supabase.from('sales').select('*, clients(name, phone), barbers(name)').order('created_at', { ascending: false }),
        supabase.from('barbers').select('*').eq('active', true),
        supabase.from('clients').select('*').order('name'),
        supabase.from('services').select('*').order('name'),
        supabase.from('payment_methods').select('*').eq('active', true).order('name')
      ]);

      if (salesRes.error) throw salesRes.error;
      setSales(salesRes.data || []);
      setBarbers(barbersRes.data || []);
      setClients(clientsRes.data || []);
      setServicesList(servicesRes.data || []);
      setPaymentMethods(methodsRes.data || []);
      
      if (methodsRes.data && methodsRes.data.length > 0) {
        const efectivo = methodsRes.data.find(m => m.name === 'Efectivo');
        setNewSale(prev => ({ ...prev, payment_method: efectivo ? efectivo.name : methodsRes.data[0].name }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleServiceChange = (serviceName: string) => {
    const selectedService = servicesList.find(s => s.name === serviceName);
    setNewSale({
      ...newSale,
      services: serviceName,
      total_amount: selectedService ? selectedService.price : 0
    });
  };

  async function handleAddSale(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const saleData: any = { 
        ...newSale,
        commission_rate: newSale.commission_rate / 100,
        is_paid: newSale.payment_method !== 'Crédito',
        paid_amount: newSale.payment_method !== 'Crédito' ? newSale.total_amount : 0,
        created_at: new Date(newSale.created_at).toISOString()
      };
      if (user) saleData.user_id = user.id;

      // Clean up empty strings for UUID fields to avoid database errors
      if (!saleData.client_id) saleData.client_id = null;
      if (!saleData.barber_id) saleData.barber_id = null;
      if (!saleData.note) delete saleData.note;
      if (!saleData.due_date || newSale.payment_method !== 'Crédito') delete saleData.due_date;

      const { error } = await supabase.from('sales').insert([saleData]);
      if (error) throw error;

      setIsAddingSale(false);
      const defaultMethod = paymentMethods.find(m => m.name === 'Efectivo')?.name || paymentMethods[0]?.name || '';
      setNewSale({
        client_id: '',
        barber_id: '',
        services: '',
        total_amount: 0,
        payment_method: defaultMethod,
        note: '',
        due_date: '',
        created_at: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        commission_rate: 100
      });
      fetchData();
    } catch (error: any) {
      console.error('Error adding sale:', error);
      alert(`Error al registrar venta: ${error.message || 'Error desconocido'}`);
    }
  }

  async function handleUpdateSale(e: React.FormEvent) {
    e.preventDefault();
    try {
      const updateData: any = {
        ...editingSale,
        commission_rate: editingSale.commission_rate > 1 ? editingSale.commission_rate / 100 : editingSale.commission_rate,
        created_at: new Date(editingSale.created_at).toISOString()
      };
      
      // Remove joined data
      delete updateData.clients;
      delete updateData.barbers;

      const { error } = await supabase.from('sales').update(updateData).eq('id', editingSale.id);
      if (error) throw error;

      setIsEditingSale(false);
      setEditingSale(null);
      fetchData();
    } catch (error: any) {
      console.error('Error updating sale:', error);
      alert(`Error al actualizar venta: ${error.message}`);
    }
  }

  async function handleDeleteSale(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta venta?')) return;
    try {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      console.error('Error deleting sale:', error);
      alert(`Error al eliminar: ${error.message}`);
    }
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const newPaidAmount = (paymentSale.paid_amount || 0) + paymentAmount;
      const isFullyPaid = newPaidAmount >= paymentSale.total_amount;

      // 1. Record payment
      const { error: payError } = await supabase.from('sale_payments').insert([{
        sale_id: paymentSale.id,
        amount: paymentAmount,
        payment_method: paymentMethod,
        user_id: user?.id
      }]);
      if (payError) throw payError;

      // 2. Update sale status
      const { error: saleError } = await supabase.from('sales').update({
        paid_amount: newPaidAmount,
        is_paid: isFullyPaid
      }).eq('id', paymentSale.id);
      if (saleError) throw saleError;

      setIsAddingPayment(false);
      setPaymentSale(null);
      setPaymentAmount(0);
      fetchData();
    } catch (error: any) {
      console.error('Error adding payment:', error);
      alert(`Error al registrar pago: ${error.message}`);
    }
  }

  const totalToday = sales
    .filter(s => isSameDay(new Date(s.created_at), new Date()))
    .reduce((acc, s) => acc + s.total_amount, 0);

  const incomeByMethod = useMemo(() => {
    const todaySales = sales.filter(s => isSameDay(new Date(s.created_at), new Date()));
    const methods: Record<string, number> = {};
    todaySales.forEach(s => {
      methods[s.payment_method] = (methods[s.payment_method] || 0) + s.total_amount;
    });
    return Object.entries(methods).map(([name, amount]) => ({ name, amount }));
  }, [sales]);

  const topServices = useMemo(() => {
    const counts: Record<string, number> = {};
    sales.forEach(s => {
      if (s.services) {
        counts[s.services] = (counts[s.services] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [sales]);

  const maxServiceCount = topServices.length > 0 ? topServices[0].count : 1;
  const serviceColors = ['bg-emerald-500', 'bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500'];

  const filteredSales = useMemo(() => {
    if (!searchTerm) return sales;
    const term = searchTerm.toLowerCase();
    return sales.filter(sale => 
      sale.id.toLowerCase().includes(term) ||
      (sale.clients?.name || 'Cliente ocasional').toLowerCase().includes(term) ||
      (sale.barbers?.name || '').toLowerCase().includes(term) ||
      (sale.services || '').toLowerCase().includes(term) ||
      (sale.payment_method || '').toLowerCase().includes(term)
    );
  }, [sales, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-white tracking-tight">Registro de Trabajos</h3>
        <button 
          onClick={() => setIsAddingSale(true)}
          className="btn-primary bg-orange-600 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Registrar Venta
        </button>
      </div>

      {isAddingSale && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h4 className="font-black text-white tracking-tight">Nueva Venta</h4>
            <button onClick={() => setIsAddingSale(false)} className="p-2 hover:bg-white/5 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddSale} className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cliente</label>
              <select 
                value={newSale.client_id}
                onChange={e => setNewSale({...newSale, client_id: e.target.value})}
                className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none glass"
              >
                <option value="" className="bg-[#1a1c20] text-white">Cliente ocasional</option>
                {clients.map(c => <option key={c.id} value={c.id} className="bg-[#1a1c20] text-white">{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Barbero</label>
              <select 
                required
                value={newSale.barber_id}
                onChange={e => setNewSale({...newSale, barber_id: e.target.value})}
                className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none glass"
              >
                <option value="" className="bg-[#1a1c20] text-white">Seleccionar barbero</option>
                {barbers.map(b => <option key={b.id} value={b.id} className="bg-[#1a1c20] text-white">{b.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Servicio</label>
              <select 
                required
                value={newSale.services}
                onChange={e => handleServiceChange(e.target.value)}
                className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none glass"
              >
                <option value="" className="bg-[#1a1c20] text-white">Seleccionar servicio</option>
                {servicesList.map(s => <option key={s.id} value={s.name} className="bg-[#1a1c20] text-white">{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Monto Total (RD$)</label>
              <input 
                required
                type="number" 
                value={newSale.total_amount || 0}
                onChange={e => setNewSale({...newSale, total_amount: parseFloat(e.target.value) || 0})}
                className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Comisión (%)</label>
              <input 
                type="number" 
                value={newSale.commission_rate}
                onChange={e => setNewSale({...newSale, commission_rate: parseInt(e.target.value) || 0})}
                className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Método de Pago</label>
              <select 
                required
                value={newSale.payment_method}
                onChange={e => setNewSale({...newSale, payment_method: e.target.value})}
                className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none glass"
              >
                {paymentMethods.map(m => <option key={m.id} value={m.name} className="bg-[#1a1c20] text-white">{m.name}</option>)}
              </select>
            </div>
            {newSale.payment_method === 'Crédito' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Fecha de Pago</label>
                <input 
                  required
                  type="date" 
                  value={newSale.due_date}
                  onChange={e => setNewSale({...newSale, due_date: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none glass"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Fecha de Venta</label>
              <input 
                required
                type="datetime-local" 
                value={newSale.created_at}
                onChange={e => setNewSale({...newSale, created_at: e.target.value})}
                className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none glass"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nota / Referencia</label>
              <input 
                type="text" 
                value={newSale.note}
                onChange={e => setNewSale({...newSale, note: toTitleCase(e.target.value)})}
                className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: # Transacción, Zelle de Juan..."
              />
            </div>
            <div className="lg:col-span-1 flex items-end">
              <button type="submit" className="w-full bg-emerald-500 text-white py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
                Registrar Venta
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {isEditingSale && editingSale && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="card w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h4 className="font-black text-white tracking-tight">Editar Venta</h4>
              <button onClick={() => setIsEditingSale(false)} className="p-2 hover:bg-white/5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateSale} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Monto Total</label>
                <input 
                  required
                  type="number" 
                  value={editingSale.total_amount}
                  onChange={e => setEditingSale({...editingSale, total_amount: parseFloat(e.target.value) || 0})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Comisión (%)</label>
                <input 
                  type="number" 
                  value={editingSale.commission_rate * (editingSale.commission_rate <= 1 ? 100 : 1)}
                  onChange={e => setEditingSale({...editingSale, commission_rate: parseInt(e.target.value) || 0})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Fecha de Venta</label>
                <input 
                  required
                  type="datetime-local" 
                  value={editingSale.created_at}
                  onChange={e => setEditingSale({...editingSale, created_at: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none glass"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nota / Referencia</label>
                <input 
                  type="text" 
                  value={editingSale.note || ''}
                  onChange={e => setEditingSale({...editingSale, note: toTitleCase(e.target.value)})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="sm:col-span-2 flex gap-3 mt-4">
                <button type="button" onClick={() => setIsEditingSale(false)} className="flex-1 bg-white/5 text-white py-2.5 rounded-xl font-bold hover:bg-white/10 transition-all">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {isAddingPayment && paymentSale && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="card w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h4 className="font-black text-white tracking-tight">Registrar Cobro</h4>
              <button onClick={() => setIsAddingPayment(false)} className="p-2 hover:bg-white/5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPayment} className="p-6 space-y-4">
              <div className="bg-white/5 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Total Venta:</span>
                  <span className="text-white font-bold">RD$ {paymentSale.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Ya Pagado:</span>
                  <span className="text-emerald-400 font-bold">RD$ {(paymentSale.paid_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                  <span className="text-zinc-300 font-bold">Pendiente:</span>
                  <span className="text-orange-400 font-black">RD$ {(paymentSale.total_amount - (paymentSale.paid_amount || 0)).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Monto a Cobrar</label>
                <input 
                  required
                  type="number" 
                  autoFocus
                  max={paymentSale.total_amount - (paymentSale.paid_amount || 0)}
                  value={paymentAmount || ''}
                  onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-lg font-black text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Método de Cobro</label>
                <select 
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none glass"
                >
                  <option value="Efectivo" className="bg-[#1a1c20]">Efectivo</option>
                  <option value="Transferencia" className="bg-[#1a1c20]">Transferencia</option>
                  <option value="Tarjeta" className="bg-[#1a1c20]">Tarjeta</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all mt-4">
                Confirmar Cobro
              </button>
            </form>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#050505] text-white p-8 rounded-2xl shadow-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-orange-500/20 transition-all" />
          <p className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-widest">Total Ventas Hoy</p>
          <h3 className="text-3xl font-black mb-6 text-white tracking-tight">RD$ {totalToday.toLocaleString()}</h3>
          <div className="space-y-4">
            {incomeByMethod.length > 0 ? incomeByMethod.map((m, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 font-medium">{m.name}</span>
                <span className="font-black text-white">RD$ {m.amount.toLocaleString()}</span>
              </div>
            )) : (
              <p className="text-xs text-zinc-500 italic font-medium">No hay ingresos hoy</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h4 className="font-black text-white tracking-tight mb-4">Top Servicios</h4>
          <div className="space-y-4">
            {topServices.length > 0 ? topServices.map((s, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-zinc-300">
                  <span className="tracking-tight">{s.name}</span>
                  <span>{s.count}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className={cn("h-full rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)]", serviceColors[i % serviceColors.length])} 
                    style={{ width: `${(s.count / maxServiceCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <p className="text-xs text-zinc-500 italic py-4 text-center font-medium">No hay datos de servicios</p>
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h4 className="font-black text-white tracking-tight">Ventas Recientes</h4>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Buscar venta..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-[var(--bg-input)] border-none rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full glass"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-900/50 text-[11px] uppercase tracking-widest font-bold text-zinc-500">
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Barbero</th>
                <th className="px-6 py-4">Servicios</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado / Pago</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-500 font-medium">Cargando ventas...</td>
                </tr>
              ) : filteredSales.length > 0 ? filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-zinc-200">{sale.clients?.name || 'Cliente ocasional'}</p>
                    <p className="text-[10px] text-zinc-500 font-medium">{format(new Date(sale.created_at), "dd/MM hh:mm a")}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400 font-medium">{sale.barbers?.name || '---'}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400 font-medium">{sale.services}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-emerald-400">RD$ {sale.total_amount.toLocaleString()}</p>
                    {sale.payment_method === 'Crédito' && (
                      <p className="text-[10px] text-orange-400 font-bold">
                        Pagado: RD$ {(sale.paid_amount || 0).toLocaleString()}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded block w-fit border ${
                        sale.is_paid 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>
                        {sale.payment_method} {sale.is_paid ? '(Pagado)' : '(Pendiente)'}
                      </span>
                      {sale.due_date && !sale.is_paid && (
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
                          Vence: {format(new Date(sale.due_date), "dd MMM")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      {sale.clients?.phone && (
                        <a 
                          href={getWhatsAppLink(sale.clients.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          title="Enviar WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                      {!sale.is_paid && sale.payment_method === 'Crédito' && (
                        <button 
                          onClick={() => {
                            setPaymentSale(sale);
                            setIsAddingPayment(true);
                            setPaymentAmount(sale.total_amount - (sale.paid_amount || 0));
                          }}
                          className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-lg transition-all"
                          title="Registrar Cobro"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setEditingSale({
                            ...sale,
                            created_at: format(new Date(sale.created_at), "yyyy-MM-dd'T'HH:mm")
                          });
                          setIsEditingSale(true);
                        }}
                        className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSale(sale.id)}
                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-500 font-medium">No hay ventas registradas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function ClientsView({ onTabChange, onPreselectClient, onPreselectSale }: { 
  onTabChange: (tab: Tab) => void, 
  onPreselectClient: (id: string) => void,
  onPreselectSale: (id: string) => void
}) {
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visitHistory, setVisitHistory] = useState<any[]>([]);

  // Form state
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchVisitHistory(selectedClient.id);
    } else {
      setVisitHistory([]);
    }
  }, [selectedClient]);

  const totalSpent = useMemo(() => {
    return visitHistory.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
  }, [visitHistory]);

  const lastVisit = useMemo(() => {
    if (visitHistory.length === 0) return 'N/A';
    return format(new Date(visitHistory[0].created_at), "dd MMM yyyy", { locale: es });
  }, [visitHistory]);

  const pendingClientCredits = useMemo(() => {
    return visitHistory.filter(sale => !sale.is_paid && sale.payment_method === 'Crédito');
  }, [visitHistory]);

  async function fetchVisitHistory(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVisitHistory(data || []);
    } catch (error) {
      console.error('Error fetching visit history:', error);
    }
  }

  async function fetchClients() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setClients(data || []);
      
      // Update selected client if it's currently open
      if (selectedClient) {
        const updated = data?.find(c => c.id === selectedClient.id);
        if (updated) setSelectedClient(updated);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const clientData: any = { ...newClient };
      if (user && !editingClientId) {
        clientData.user_id = user.id;
      }

      if (editingClientId) {
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', editingClientId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clients')
          .insert([clientData]);
        if (error) throw error;
      }
      
      setIsAddingClient(false);
      setEditingClientId(null);
      setNewClient({ name: '', phone: '', email: '', notes: '' });
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Error al guardar cliente.');
    }
  }

  const handleEditClient = () => {
    setNewClient({
      name: selectedClient.name,
      phone: selectedClient.phone,
      email: selectedClient.email || '',
      notes: selectedClient.notes || ''
    });
    setEditingClientId(selectedClient.id);
    setIsAddingClient(true);
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function handleDeleteClient(id: string) {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setDeleteConfirmId(null);
      setSelectedClient(null);
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {isAddingClient && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-black text-white tracking-tight">{editingClientId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
            <button 
              onClick={() => {
                setIsAddingClient(false);
                setEditingClientId(null);
                setNewClient({ name: '', phone: '', email: '', notes: '' });
              }} 
              className="p-2 hover:bg-white/5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddClient} className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nombre Completo</label>
              <input 
                required
                type="text" 
                value={newClient.name}
                onChange={e => setNewClient({...newClient, name: toTitleCase(e.target.value)})}
                className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: Juan Perez"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Teléfono</label>
              <input 
                required
                type="tel" 
                value={newClient.phone}
                onChange={e => setNewClient({...newClient, phone: e.target.value})}
                className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ej: 809-555-0000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Email (Opcional)</label>
              <input 
                type="email" 
                value={newClient.email}
                onChange={e => setNewClient({...newClient, email: e.target.value})}
                className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="ejemplo@correo.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Notas</label>
              <input 
                type="text"
                value={newClient.notes}
                onChange={e => setNewClient({...newClient, notes: e.target.value})}
                className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Detalles..."
              />
            </div>
            <div className="sm:col-span-2 pt-2">
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                {editingClientId ? 'Actualizar Cliente' : 'Guardar Cliente'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {selectedClient ? (
        !isAddingClient && (
          <div className="space-y-6">
            <button 
              onClick={() => setSelectedClient(null)}
              className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-blue-500 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Volver a la lista
            </button>

            <div className="card p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-24 h-24 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-3xl font-black border border-blue-500/30">
                  {selectedClient.name.charAt(0)}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{selectedClient.name}</h3>
                    <p className="text-zinc-500 text-sm font-medium">Cliente registrado</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Teléfono</p>
                      <p className="font-bold text-zinc-200">{selectedClient.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Email</p>
                      <p className="font-bold text-zinc-200">{selectedClient.email || 'No registrado'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Última Visita</p>
                      <p className="font-bold text-zinc-200">{lastVisit}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Total Gastado</p>
                      <p className="font-black text-emerald-400">RD$ {totalSpent.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Notas / Preferencias</p>
                    <p className="text-sm text-zinc-400 leading-relaxed glass p-4 rounded-xl border border-white/5">
                      {selectedClient.notes || 'Sin notas adicionales'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-6">
                    <button 
                      onClick={() => {
                        onPreselectClient(selectedClient.id);
                        onTabChange('appointments');
                      }}
                      className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                    >
                      Nueva Cita
                    </button>
                    <button 
                      onClick={handleEditClient}
                      className="px-6 py-3 bg-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-700 transition-all border border-white/5"
                    >
                      Editar Ficha
                    </button>
                    {deleteConfirmId === selectedClient.id ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDeleteClient(selectedClient.id)}
                          className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                        >
                          Confirmar
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-6 py-3 bg-zinc-800 text-zinc-400 border border-white/5 rounded-xl font-bold hover:bg-zinc-700 transition-all"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDeleteConfirmId(selectedClient.id)}
                        className="p-3 text-zinc-500 bg-zinc-800 border border-white/5 rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-all"
                        title="Eliminar Cliente"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {pendingClientCredits.length > 0 && (
              <div className="card overflow-hidden border-l-4 border-orange-500">
                <div className="p-6 border-b border-white/5 bg-orange-500/5 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  <h4 className="font-bold text-orange-500">Recordatorios de Cobro</h4>
                </div>
                <div className="p-6 space-y-4">
                  {pendingClientCredits.map(credit => (
                    <div key={credit.id} className="flex items-center justify-between p-4 glass rounded-xl border border-white/5">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">Venta del {format(new Date(credit.created_at), "d MMM, yyyy")}</p>
                        <p className="text-[10px] text-zinc-400 font-medium">
                          Vence: {credit.due_date ? format(new Date(credit.due_date), "dd 'de' MMMM", { locale: es }) : 'No definida'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-orange-500">RD$ {(credit.total_amount - (credit.paid_amount || 0)).toLocaleString()}</p>
                        <button 
                          onClick={() => onPreselectSale(credit.id)}
                          className="text-[10px] font-bold text-blue-400 hover:underline"
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h4 className="font-bold">Historial de Visitas</h4>
              </div>
              <div className="p-6 space-y-4">
                {visitHistory.length > 0 ? visitHistory.map((sale, i) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 glass rounded-xl border border-white/5 hover:border-white/10 transition-all">
                    <div>
                      <p className="font-bold text-sm text-zinc-200">{sale.services}</p>
                      <p className="text-xs text-zinc-500">{format(new Date(sale.created_at), "d MMM, yyyy")} • RD$ {sale.total_amount.toLocaleString()}</p>
                      {sale.note && <p className="text-[10px] text-zinc-400 italic mt-1">{sale.note}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] font-bold bg-white/5 text-zinc-400 px-2 py-1 rounded border border-white/5">{sale.payment_method}</span>
                      <button 
                        onClick={() => onPreselectSale(sale.id)}
                        className="text-[10px] font-bold text-blue-400 hover:underline"
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-center py-8 text-zinc-500 text-sm">No hay historial de visitas</p>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-black text-white tracking-tight">Base de Clientes</h3>
            <div className="flex gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Buscar cliente..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-[var(--bg-input)] border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full"
                />
              </div>
              <button 
                onClick={() => setIsAddingClient(true)}
                className="bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-zinc-500 font-medium">Cargando clientes...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-900/50 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                    <th className="px-3 py-2">Nombre</th>
                    <th className="px-3 py-2">Teléfono</th>
                    <th className="px-3 py-2 text-right">Acc.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredClients.length > 0 ? filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-3 py-2">
                        <button 
                          onClick={() => setSelectedClient(client)}
                          className="flex items-center gap-2 text-left group"
                        >
                          <div className="w-7 h-7 shrink-0 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-[9px] font-bold group-hover:bg-blue-500 group-hover:text-white transition-all">
                            {client.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-zinc-200 group-hover:text-blue-500 transition-colors truncate max-w-[100px] sm:max-w-none">{client.name}</span>
                        </button>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-zinc-500 font-medium whitespace-nowrap">{client.phone}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          {client.phone && (
                            <>
                              <a 
                                href={`tel:${client.phone}`}
                                className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                title="Llamar"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a 
                                href={getWhatsAppLink(client.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center card border-dashed m-4">
                        <Users className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                        <p className="text-zinc-500 font-medium">No se encontraron clientes</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BarbersView() {
  const [barbers, setBarbers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingBarber, setIsAddingBarber] = useState(false);
  const [editingBarberId, setEditingBarberId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [newBarber, setNewBarber] = useState({
    name: '',
    phone: '',
    active: true
  });

  useEffect(() => {
    fetchBarbers();
  }, []);

  async function fetchBarbers() {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setBarbers(data || []);
    } catch (error) {
      console.error('Error fetching barbers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBarber(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Preparar los datos para la base de datos
      const barberData: any = {
        name: newBarber.name,
        phone: newBarber.phone,
        active: newBarber.active
      };

      // Solo asignar user_id si es un nuevo registro
      if (user && !editingBarberId) {
        barberData.user_id = user.id;
      }

      if (editingBarberId) {
        const { error } = await supabase
          .from('barbers')
          .update(barberData)
          .eq('id', editingBarberId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('barbers')
          .insert([barberData]);
        if (error) throw error;
      }
      
      setIsAddingBarber(false);
      setEditingBarberId(null);
      setNewBarber({ name: '', phone: '', active: true });
      fetchBarbers();
    } catch (error: any) {
      console.error('Error saving barber:', error);
      alert('Error al guardar el barbero: ' + (error.message || 'Error desconocido. Por favor intente de nuevo.'));
    }
  }

  const handleEditBarber = (barber: any) => {
    setNewBarber({
      name: barber.name,
      phone: barber.phone || '',
      active: barber.active
    });
    setEditingBarberId(barber.id);
    setIsAddingBarber(true);
    
    // Asegurar que el formulario sea visible
    setTimeout(() => {
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  async function handleDeleteBarber(id: string) {
    try {
      // Intentar eliminar físicamente
      const { error } = await supabase
        .from('barbers')
        .delete()
        .eq('id', id);
      
      if (error) {
        // Error 23503 es una violación de clave foránea (historial existente)
        if (error.code === '23503') {
          // Si tiene historial, lo marcamos como inactivo (Soft Delete)
          const { error: updateError } = await supabase
            .from('barbers')
            .update({ active: false })
            .eq('id', id);
          
          if (updateError) throw updateError;
          
          alert('Este barbero tiene historial y no puede ser borrado permanentemente. Se ha marcado como "Inactivo" y se ha ocultado de la lista principal para conservar tus datos.');
          setDeleteConfirmId(null);
          fetchBarbers();
          return;
        }
        throw error;
      }
      
      setDeleteConfirmId(null);
      fetchBarbers();
    } catch (error: any) {
      console.error('Error deleting barber:', error);
      alert('Error al procesar la baja del barbero: ' + (error.message || 'Error desconocido'));
    }
  }

  const filteredBarbers = barbers.filter(b => showInactive ? true : b.active);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-black text-white tracking-tight">Equipo de Barberos</h3>
          <button 
            onClick={() => setShowInactive(!showInactive)}
            className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-all border",
              showInactive ? "bg-blue-600 border-blue-500 text-white" : "bg-zinc-800 text-zinc-500 border-white/5"
            )}
          >
            {showInactive ? 'Viendo Todos' : 'Ver Solo Activos'}
          </button>
        </div>
        <button 
          onClick={() => setIsAddingBarber(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Barbero
        </button>
      </div>

      {isAddingBarber && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold">{editingBarberId ? 'Editar Barbero' : 'Registrar Nuevo Barbero'}</h3>
            <button 
              onClick={() => {
                setIsAddingBarber(false);
                setEditingBarberId(null);
                setNewBarber({ name: '', phone: '', active: true });
              }} 
              className="p-2 hover:bg-white/5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAddBarber} className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nombre</label>
              <input 
                required
                type="text" 
                value={newBarber.name}
                onChange={e => setNewBarber({...newBarber, name: toTitleCase(e.target.value)})}
                className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nombre del barbero"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Teléfono</label>
              <input 
                type="tel" 
                value={newBarber.phone}
                onChange={e => setNewBarber({...newBarber, phone: e.target.value})}
                className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="809-000-0000"
              />
            </div>
            <div className="flex items-end pb-1 sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={newBarber.active}
                  onChange={e => setNewBarber({...newBarber, active: e.target.checked})}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-zinc-300">Barbero Activo</span>
              </label>
            </div>
            <div className="sm:col-span-2 pt-2">
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                {editingBarberId ? 'Actualizar Barbero' : 'Guardar Barbero'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 card animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBarbers.length > 0 ? filteredBarbers.map((barber) => (
            <div key={barber.id} className="card p-8 group hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl font-black border border-blue-500/30">
                  {barber.name.charAt(0)}
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border",
                  barber.active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-zinc-800 text-zinc-500 border-white/5"
                )}>
                  {barber.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <h4 className="text-lg font-black text-white tracking-tight">{barber.name}</h4>
              <p className="text-sm text-zinc-500 mb-6 font-medium">{barber.phone || 'Sin teléfono'}</p>
              
              <div className="grid grid-cols-1 gap-4 pt-6 border-t border-white/5">
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Ventas Mes</p>
                  <p className="text-sm font-black text-blue-400">RD$ 0</p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-8">
                {deleteConfirmId === barber.id ? (
                  <div className="flex-1 flex gap-2">
                    <button 
                      onClick={() => handleDeleteBarber(barber.id)}
                      className="flex-1 py-3 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                    >
                      Confirmar
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 py-3 text-xs font-bold text-zinc-500 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-all border border-white/5"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => handleEditBarber(barber)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold text-zinc-400 bg-zinc-800 rounded-xl hover:bg-blue-500/10 hover:text-blue-500 transition-all border border-white/5"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(barber.id)}
                      className="p-3 text-zinc-500 bg-zinc-800 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center card border-dashed">
              <UserRound className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">No hay barberos registrados</p>
              <button onClick={() => setIsAddingBarber(true)} className="mt-4 text-blue-500 font-bold hover:underline">Agregar mi primer barbero</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ServicesView() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newService, setNewService] = useState({
    name: '',
    price: 0,
    duration: '30 min',
    color: 'border-l-[#1E40AF]'
  });

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const serviceData: any = { ...newService };
      if (user && !editingServiceId) {
        serviceData.user_id = user.id;
      }

      if (editingServiceId) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingServiceId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);
        if (error) throw error;
      }
      
      setIsAddingService(false);
      setEditingServiceId(null);
      setNewService({ name: '', price: 0, duration: '30 min', color: 'border-l-[#1E40AF]' });
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  }

  const handleEditService = (service: any) => {
    setNewService({
      name: service.name,
      price: service.price,
      duration: service.duration,
      color: service.color
    });
    setEditingServiceId(service.id);
    setIsAddingService(true);
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function handleDeleteService(id: string) {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setDeleteConfirmId(null);
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-black text-white tracking-tight">Catálogo de Servicios</h3>
          <button 
            onClick={() => setIsAddingService(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Servicio
          </button>
        </div>

        {isAddingService && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-zinc-900/50 border-b border-white/5"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-white">{editingServiceId ? 'Editar Servicio' : 'Registrar Nuevo Servicio'}</h4>
              <button 
                onClick={() => {
                  setIsAddingService(false);
                  setEditingServiceId(null);
                  setNewService({ name: '', price: 0, duration: '30 min', color: 'border-l-[#1E40AF]' });
                }} 
                className="p-2 hover:bg-white/5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddService} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nombre del Servicio</label>
                <input 
                  required
                  type="text" 
                  value={newService.name}
                  onChange={e => setNewService({...newService, name: toTitleCase(e.target.value)})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej: Corte de Pelo"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Precio (RD$)</label>
                <input 
                  required
                  type="number" 
                  value={newService.price || 0}
                  onChange={e => setNewService({...newService, price: parseFloat(e.target.value) || 0})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Duración</label>
                <select 
                  value={newService.duration}
                  onChange={e => setNewService({...newService, duration: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="10 min">10 min</option>
                  <option value="20 min">20 min</option>
                  <option value="30 min">30 min</option>
                  <option value="45 min">45 min</option>
                  <option value="60 min">60 min</option>
                  <option value="90 min">90 min</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Color Etiqueta</label>
                <select 
                  value={newService.color}
                  onChange={e => setNewService({...newService, color: e.target.value})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="border-l-[#1E40AF]">Azul</option>
                  <option value="border-l-emerald-500">Verde</option>
                  <option value="border-l-orange-500">Naranja</option>
                  <option value="border-l-red-500">Rojo</option>
                  <option value="border-l-sky-500">Cielo</option>
                  <option value="border-l-zinc-500">Gris</option>
                </select>
              </div>
              <div className="lg:col-span-4 pt-2">
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                  {editingServiceId ? 'Actualizar Servicio' : 'Guardar Servicio'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="p-8">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-zinc-500">Cargando servicios...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {services.length > 0 ? services.map((service) => (
                <div key={service.id} className={cn(
                  "p-6 bg-zinc-900/40 rounded-2xl border border-white/5 border-l-4 hover:bg-zinc-900/60 hover:border-white/10 transition-all group relative", 
                  service.color
                )}>
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    {deleteConfirmId === service.id ? (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleDeleteService(service.id)}
                          className="px-2 py-1 text-[10px] font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                        >
                          Si
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 text-[10px] font-bold text-zinc-400 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-all border border-white/5"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEditService(service)}
                          className="p-2 text-zinc-400 hover:text-blue-500 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(service.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex justify-between items-start mb-4 pr-8">
                    <h4 className="font-black text-white tracking-tight">{service.name}</h4>
                    <span className="text-blue-400 font-black tracking-tight">RD$ {service.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.duration}</span>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center card border-dashed">
                  <Scissors className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                  <p className="text-zinc-500 font-medium">No hay servicios registrados</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsView({ onTabChange }: { onTabChange: (tab: Tab) => void }) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setIsChangingPassword(false), 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al actualizar contraseña' });
    } finally {
      setLoading(false);
    }
  };

  const configOptions = [
    { id: 'appointments', label: 'Agenda', icon: Calendar, desc: 'Gestionar citas y horarios', glow: 'blue' },
    { id: 'barbers', label: 'Barberos', icon: UserRound, desc: 'Administrar equipo de trabajo', glow: 'orange' },
    { id: 'services', label: 'Servicios', icon: Scissors, desc: 'Catálogo de servicios y precios', glow: 'emerald' },
    { id: 'payment_methods', label: 'Métodos de Pago', icon: CreditCard, desc: 'Configurar formas de cobro', glow: 'purple' },
    { id: 'expense_categories', label: 'Categorías de Gastos', icon: Tag, desc: 'Organizar tipos de egresos', glow: 'red' },
    { id: 'reports', label: 'Reportes PDF', icon: FileText, desc: 'Generar reportes detallados', glow: 'emerald' },
  ];

  return (
    <div className="space-y-8">
      {/* Config Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {configOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onTabChange(opt.id as Tab)}
            className={cn(
              "flex flex-col items-start p-6 card hover:border-white/20 transition-all text-left group",
              opt.glow === 'blue' && "hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
              opt.glow === 'orange' && "hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]",
              opt.glow === 'emerald' && "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
              opt.glow === 'purple' && "hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
              opt.glow === 'red' && "hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]"
            )}
          >
            <div className={cn(
              "p-3 rounded-xl mb-4 transition-colors",
              opt.glow === 'blue' && "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20",
              opt.glow === 'orange' && "bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20",
              opt.glow === 'emerald' && "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20",
              opt.glow === 'purple' && "bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20",
              opt.glow === 'red' && "bg-red-500/10 text-red-500 group-hover:bg-red-500/20"
            )}>
              <opt.icon className="w-6 h-6" />
            </div>
            <h4 className="font-black text-lg mb-1 text-white tracking-tight">{opt.label}</h4>
            <p className="text-xs text-zinc-500 font-medium">{opt.desc}</p>
          </button>
        ))}
      </div>

      {/* Security Section */}
      <div className="card p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Seguridad</h3>
            <p className="text-sm text-zinc-500 font-medium">Gestiona el acceso a tu cuenta de administrador</p>
          </div>
        </div>

        {!isChangingPassword ? (
          <button 
            onClick={() => setIsChangingPassword(true)}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5"
          >
            Cambiar Contraseña
          </button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
              <input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500/50 transition-all"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-red-500/50 transition-all"
                placeholder="Repite la contraseña"
                required
              />
            </div>

            {message && (
              <div className={cn(
                "p-4 rounded-xl text-sm font-bold flex items-center gap-2",
                message.type === 'success' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
              )}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {message.text}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-600/50 text-white rounded-xl font-bold transition-all flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Guardar Cambios
              </button>
              <button 
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setMessage(null);
                }}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Logout Section */}
      <div className="pt-4">
        <button 
          onClick={() => supabase.auth.signOut()}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl font-black transition-all border border-red-500/20 uppercase tracking-widest"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión Segura
        </button>
      </div>
    </div>
  );
}

function PaymentMethodsView() {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingMethod, setIsAddingMethod] = useState(false);
  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newMethod, setNewMethod] = useState({ name: '', active: true });

  useEffect(() => {
    fetchMethods();
  }, []);

  async function fetchMethods() {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching methods:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMethod(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const methodData: any = { ...newMethod };
      if (user && !editingMethodId) methodData.user_id = user.id;

      if (editingMethodId) {
        const { error } = await supabase
          .from('payment_methods')
          .update(methodData)
          .eq('id', editingMethodId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('payment_methods').insert([methodData]);
        if (error) throw error;
      }

      setIsAddingMethod(false);
      setEditingMethodId(null);
      setNewMethod({ name: '', active: true });
      fetchMethods();
    } catch (error) {
      console.error('Error saving method:', error);
    }
  }

  const handleEditMethod = (method: any) => {
    setNewMethod({
      name: method.name,
      active: method.active
    });
    setEditingMethodId(method.id);
    setIsAddingMethod(true);
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function handleDeleteMethod(id: string) {
    try {
      const { error } = await supabase.from('payment_methods').delete().eq('id', id);
      if (error) throw error;
      setDeleteConfirmId(null);
      fetchMethods();
    } catch (error) {
      console.error('Error deleting method:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Métodos de Pago</h3>
            <p className="text-sm text-zinc-500 mt-1 font-medium">Configura cómo recibes los pagos de tus clientes</p>
          </div>
          <button 
            onClick={() => setIsAddingMethod(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Método
          </button>
        </div>

        {isAddingMethod && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-zinc-900/50 border-b border-white/5"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-white">{editingMethodId ? 'Editar Método de Pago' : 'Registrar Nuevo Método'}</h4>
              <button 
                onClick={() => {
                  setIsAddingMethod(false);
                  setEditingMethodId(null);
                  setNewMethod({ name: '', active: true });
                }} 
                className="p-2 hover:bg-white/5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddMethod} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nombre del Método</label>
                <input 
                  required
                  type="text" 
                  value={newMethod.name}
                  onChange={e => setNewMethod({...newMethod, name: toTitleCase(e.target.value)})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej: Efectivo, Transferencia, Zelle..."
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={newMethod.active}
                    onChange={e => setNewMethod({...newMethod, active: e.target.checked})}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-bold text-zinc-300">Método Activo</span>
                </label>
              </div>
              <div className="sm:col-span-2 pt-2">
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                  {editingMethodId ? 'Actualizar Método' : 'Guardar Método'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="p-8">
          {loading ? (
            <div className="py-10 text-center text-zinc-500 font-medium">Cargando métodos...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentMethods.length > 0 ? paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-xl border border-white/5 group hover:bg-zinc-900/60 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", method.active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-zinc-500")}></div>
                    <span className="font-bold text-zinc-200">{method.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {deleteConfirmId === method.id ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDeleteMethod(method.id)}
                          className="px-3 py-1.5 text-[10px] font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                        >
                          Si
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-all border border-white/5"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEditMethod(method)}
                          className="p-2 text-zinc-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(method.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-10 text-center text-zinc-500 font-medium">No hay métodos de pago registrados</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExpenseCategoriesView() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', active: true });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const categoryData: any = { ...newCategory };
      
      // Siempre intentar asociar el usuario si está logueado
      if (user) {
        categoryData.user_id = user.id;
      }

      if (editingCategoryId) {
        const { error } = await supabase
          .from('expense_categories')
          .update(categoryData)
          .eq('id', editingCategoryId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('expense_categories').insert([categoryData]);
        if (error) throw error;
      }

      setIsAddingCategory(false);
      setEditingCategoryId(null);
      setNewCategory({ name: '', active: true });
      fetchCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      alert(`Error al guardar categoría: ${error.message || 'Error de permisos (RLS)'}`);
    }
  }

  const handleEditCategory = (category: any) => {
    setNewCategory({
      name: category.name,
      active: category.active
    });
    setEditingCategoryId(category.id);
    setIsAddingCategory(true);
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function handleDeleteCategory(id: string) {
    try {
      const { error } = await supabase.from('expense_categories').delete().eq('id', id);
      if (error) throw error;
      setDeleteConfirmId(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Categorías de Gastos</h3>
            <p className="text-sm text-zinc-500 mt-1 font-medium">Organiza tus egresos para un mejor control financiero</p>
          </div>
          <button 
            onClick={() => setIsAddingCategory(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Categoría
          </button>
        </div>

        {isAddingCategory && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-zinc-900/50 border-b border-white/5"
          >
            <div className="flex items-center justify-between mb-6">
              <h4 className="font-bold text-white">{editingCategoryId ? 'Editar Categoría' : 'Registrar Nueva Categoría'}</h4>
              <button 
                onClick={() => {
                  setIsAddingCategory(false);
                  setEditingCategoryId(null);
                  setNewCategory({ name: '', active: true });
                }} 
                className="p-2 hover:bg-white/5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nombre de la Categoría</label>
                <input 
                  required
                  type="text" 
                  value={newCategory.name}
                  onChange={e => setNewCategory({...newCategory, name: toTitleCase(e.target.value)})}
                  className="w-full bg-[var(--bg-input)] border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej: Alquiler, Suministros, Publicidad..."
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={newCategory.active}
                    onChange={e => setNewCategory({...newCategory, active: e.target.checked})}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-bold text-zinc-300">Categoría Activa</span>
                </label>
              </div>
              <div className="sm:col-span-2 pt-2">
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                  {editingCategoryId ? 'Actualizar Categoría' : 'Guardar Categoría'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="p-8">
          {loading ? (
            <div className="py-10 text-center text-zinc-500 font-medium">Cargando categorías...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.length > 0 ? categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-xl border border-white/5 group hover:bg-zinc-900/60 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", cat.active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-zinc-500")}></div>
                    <span className="font-bold text-zinc-200">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {deleteConfirmId === cat.id ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="px-3 py-1.5 text-[10px] font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                        >
                          Si
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-all border border-white/5"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEditCategory(cat)}
                          className="p-2 text-zinc-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(cat.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-10 text-center text-zinc-500 font-medium">No hay categorías de gastos registradas</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FinanceView() {
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [pendingCredits, setPendingCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [startDate, setStartDate] = useState(format(startOfDay(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfDay(new Date()), 'yyyy-MM-dd'));
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: 0,
    category: ''
  });

  useEffect(() => {
    fetchFinanceData();
  }, [startDate, endDate]);

  async function fetchFinanceData() {
    try {
      setLoading(true);
      const start = startOfDay(new Date(startDate + 'T00:00:00')).toISOString();
      const end = endOfDay(new Date(endDate + 'T23:59:59')).toISOString();

      const [salesRes, expensesRes, barbersRes, categoriesRes, creditsRes] = await Promise.all([
        supabase.from('sales')
          .select('*, barbers(name)')
          .gte('created_at', start)
          .lte('created_at', end)
          .order('created_at', { ascending: false }),
        supabase.from('expenses')
          .select('*')
          .gte('created_at', start)
          .lte('created_at', end)
          .order('created_at', { ascending: false }),
        supabase.from('barbers').select('*').eq('active', true),
        supabase.from('expense_categories').select('*').eq('active', true).order('name'),
        supabase.from('sales')
          .select('*, clients(name)')
          .eq('is_paid', false)
          .not('due_date', 'is', null)
          .order('due_date')
      ]);

      if (salesRes.error) throw salesRes.error;
      setSales(salesRes.data || []);
      setExpenses(expensesRes.data || []);
      setBarbers(barbersRes.data || []);
      setCategories(categoriesRes.data || []);
      setPendingCredits(creditsRes.data || []);
      
      if (categoriesRes.data && categoriesRes.data.length > 0 && !newExpense.category) {
        setNewExpense(prev => ({ ...prev, category: categoriesRes.data[0].name }));
      }
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const expenseData: any = { ...newExpense };
      if (user) expenseData.user_id = user.id;

      const { error } = await supabase.from('expenses').insert([expenseData]);
      if (error) throw error;

      setIsAddingExpense(false);
      setNewExpense({ description: '', amount: 0, category: 'General' });
      fetchFinanceData();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error al registrar gasto.');
    }
  }

  const totalIncome = sales.reduce((acc, s) => acc + s.total_amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalReceivables = pendingCredits.reduce((acc, c) => acc + (c.total_amount - (c.paid_amount || 0)), 0);
  const netProfit = totalIncome - totalExpenses;

  const barberCommissions = useMemo(() => {
    const comms: Record<string, { name: string, sales: number, commissionAmount: number }> = {};
    sales.forEach(s => {
      if (s.barber_id && s.barbers) {
        if (!comms[s.barber_id]) {
          comms[s.barber_id] = { 
            name: s.barbers.name, 
            sales: 0, 
            commissionAmount: 0
          };
        }
        comms[s.barber_id].sales += s.total_amount;
        const rate = s.commission_rate !== undefined && s.commission_rate !== null ? s.commission_rate : 1.0;
        comms[s.barber_id].commissionAmount += (s.total_amount * rate);
      }
    });
    return Object.values(comms);
  }, [sales]);

  const recentTransactions = useMemo(() => {
    const combined = [
      ...sales.map(s => ({ ...s, type: 'income' })),
      ...expenses.map(e => ({ ...e, type: 'expense' }))
    ];
    return combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  }, [sales, expenses]);

  if (loading) {
    return (
      <div className="p-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-zinc-500 font-medium">Cargando finanzas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold">Caja y Finanzas</h3>
          <p className="text-xs text-zinc-500 font-medium mt-1">Resumen financiero y control de gastos</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 glass px-4 py-2 rounded-xl border border-white/5">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Desde</span>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-white outline-none p-0 h-auto w-28"
              />
            </div>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Hasta</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-white outline-none p-0 h-auto w-28"
              />
            </div>
          </div>
          <button 
            onClick={() => setIsAddingExpense(true)}
            className="btn-primary bg-red-600 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Registrar Gasto
          </button>
        </div>
      </div>

      {isAddingExpense && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h4 className="font-black text-white tracking-tight">Nuevo Gasto</h4>
            <button onClick={() => setIsAddingExpense(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
          <form onSubmit={handleAddExpense} className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Descripción</label>
              <input 
                required
                type="text" 
                value={newExpense.description}
                onChange={e => setNewExpense({...newExpense, description: toTitleCase(e.target.value)})}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-white placeholder:text-zinc-600"
                placeholder="Ej: Pago de luz, Alquiler..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Monto (RD$)</label>
              <input 
                required
                type="number" 
                value={newExpense.amount || 0}
                onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-white placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Categoría</label>
              <select 
                value={newExpense.category}
                onChange={e => setNewExpense({...newExpense, category: e.target.value})}
                className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all text-white appearance-none"
              >
                {categories.length > 0 ? categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                )) : (
                  <option value="General">General</option>
                )}
              </select>
            </div>
            <div className="sm:col-span-3 pt-2">
              <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-black text-sm transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] uppercase tracking-widest">
                Guardar Gasto
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card border-l-4 border-blue-500">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4 opacity-80">
              <Wallet className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-zinc-400">Ingresos Totales</span>
            </div>
            <h3 className="text-3xl font-bold text-blue-400">RD$ {totalIncome.toLocaleString()}</h3>
            <p className="text-xs mt-4 font-medium text-zinc-500">Basado en {sales.length} ventas</p>
          </div>
        </div>
        <div className="card border-l-4 border-red-500">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4 opacity-80">
              <CreditCard className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium text-zinc-400">Gastos Totales</span>
            </div>
            <h3 className="text-3xl font-bold text-red-400">RD$ {totalExpenses.toLocaleString()}</h3>
            <p className="text-xs mt-4 font-medium text-zinc-500">Basado en {expenses.length} gastos</p>
          </div>
        </div>
        <div className="card border-l-4 border-orange-500">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4 opacity-80">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-medium text-zinc-400">Por Cobrar</span>
            </div>
            <h3 className="text-3xl font-bold text-orange-400">RD$ {totalReceivables.toLocaleString()}</h3>
            <p className="text-xs mt-4 font-medium text-zinc-500">{pendingCredits.length} créditos pendientes</p>
          </div>
        </div>
        <div className="card border-l-4 border-emerald-500">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-4 opacity-80">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-zinc-400">Ganancia Neta</span>
            </div>
            <h3 className="text-3xl font-bold text-emerald-400">RD$ {netProfit.toLocaleString()}</h3>
            <p className="text-xs mt-4 font-medium text-zinc-500">Margen del {totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="card">
          <div className="p-8 border-b border-white/5">
            <h4 className="font-black text-white tracking-tight uppercase tracking-widest text-xs opacity-60">Comisiones por Barbero</h4>
          </div>
          <div className="p-8 space-y-6">
            {barberCommissions.length > 0 ? barberCommissions.map((b, i) => (
              <div key={i} className="glass p-4 rounded-xl flex items-center justify-between group hover:border-orange-500/30 transition-all">
                <div>
                  <p className="font-bold">{b.name}</p>
                  <p className="text-xs text-zinc-500">Ventas: RD$ {b.sales.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-orange-400">RD$ {b.commissionAmount.toLocaleString()}</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">A Pagar ({b.sales > 0 ? Math.round((b.commissionAmount / b.sales) * 100) : 0}%)</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-zinc-500 py-10">No hay comisiones calculadas</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="p-8 border-b border-white/5">
            <h4 className="font-black text-white tracking-tight uppercase tracking-widest text-xs opacity-60">Últimos Movimientos</h4>
          </div>
          <div className="p-8 space-y-4">
            {recentTransactions.length > 0 ? recentTransactions.map((t: any, i) => (
              <div key={i} className="glass p-4 rounded-xl flex items-center justify-between group hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    t.type === 'income' ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
                  )}>
                    {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t.type === 'income' ? (t.services || 'Venta') : t.description}</p>
                    <p className="text-[10px] text-zinc-500">{format(new Date(t.created_at), "dd MMM, hh:mm a", { locale: es })}</p>
                  </div>
                </div>
                <p className={cn(
                  "font-bold",
                  t.type === 'income' ? "text-emerald-400" : "text-red-400"
                )}>
                  {t.type === 'income' ? '+' : '-'} RD$ {(t.total_amount || t.amount).toLocaleString()}
                </p>
              </div>
            )) : (
              <p className="text-center text-zinc-500 py-10">No hay movimientos recientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VIPView() {
  const [vipClients, setVipClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientForContact, setSelectedClientForContact] = useState<any>(null);

  useEffect(() => {
    fetchVIPData();
  }, []);

  async function fetchVIPData() {
    try {
      const [clientsRes, appointmentsRes, salesRes] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('appointments').select('client_id, status, appointment_time'),
        supabase.from('sales').select('client_id, total_amount, created_at')
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (appointmentsRes.error) throw appointmentsRes.error;
      if (salesRes.error) throw salesRes.error;

      const clients = clientsRes.data || [];
      const appointments = appointmentsRes.data || [];
      const sales = salesRes.data || [];

      const clientStats = clients.map(client => {
        const completedAppointments = appointments.filter(a => a.client_id === client.id && a.status === 'completed');
        const clientSales = sales.filter(s => s.client_id === client.id);
        
        // Total visits could be from appointments or direct sales
        // We'll use the number of sales as the primary visit counter if they exist, 
        // as every sale represents a visit.
        const clientVisits = Math.max(completedAppointments.length, clientSales.length);
        const clientSpending = clientSales.reduce((acc, s) => acc + s.total_amount, 0);
        
        // Find last visit from both appointments and sales
        let lastVisitText = 'Nunca';
        const dates: number[] = [
          ...completedAppointments.map(a => new Date(a.appointment_time).getTime()),
          ...clientSales.map(s => new Date(s.created_at).getTime())
        ];

        if (dates.length > 0) {
          const lastVisitDate = new Date(Math.max(...dates));
          const daysSince = differenceInCalendarDays(new Date(), lastVisitDate);
          
          if (daysSince === 0) lastVisitText = 'Hoy';
          else if (daysSince === 1) lastVisitText = 'Ayer';
          else lastVisitText = `Hace ${daysSince} días`;
        }

        // Scoring logic: 
        // Visits weight: 10 points per visit
        // Spending weight: 1 point per 100 RD$
        const score = (clientVisits * 10) + (clientSpending / 100);

        return {
          ...client,
          visits: clientVisits,
          spending: clientSpending,
          lastVisitText,
          score
        };
      });

      // Sort by score descending
      const sortedClients = clientStats.sort((a, b) => b.score - a.score);

      // Assign stars based on rank or score thresholds
      const maxScore = sortedClients.length > 0 ? sortedClients[0].score : 0;

      const clientsWithStars = sortedClients.map(client => {
        let stars = 0;
        if (client.score > 0) {
          const ratio = client.score / (maxScore || 1);
          if (ratio >= 0.8) stars = 5;
          else if (ratio >= 0.6) stars = 4;
          else if (ratio >= 0.4) stars = 3;
          else if (ratio >= 0.2) stars = 2;
          else stars = 1;
        }
        
        // Occasional visitors (less than 2 visits and low spending) get 0 stars
        if (client.visits < 2 && client.spending < 500) stars = 0;

        return { ...client, stars };
      });

      setVipClients(clientsWithStars);
    } catch (error) {
      console.error('Error fetching VIP data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="text-center space-y-2 pt-4">
        <div className="inline-flex items-center justify-center p-3 bg-yellow-500/10 rounded-2xl mb-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight uppercase italic">Club VIP</h2>
        <p className="text-zinc-400 font-medium">Nuestros clientes más exclusivos y leales</p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-zinc-500 font-bold tracking-widest uppercase text-xs">Analizando lealtad...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vipClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedClientForContact(client)}
              className={cn(
                "card p-6 relative overflow-hidden group transition-all hover:translate-y-[-4px] cursor-pointer",
                client.stars === 5 ? "border-yellow-500/30 bg-yellow-500/5" : 
                client.stars === 4 ? "border-blue-500/30 bg-blue-500/5" :
                "border-white/5"
              )}
            >
              {/* Rank Badge */}
              <div className="absolute top-4 right-4 text-[40px] font-black opacity-10 italic group-hover:opacity-20 transition-opacity">
                #{index + 1}
              </div>

              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black",
                  client.stars === 5 ? "bg-yellow-500 text-black" : 
                  client.stars === 4 ? "bg-blue-500 text-white" :
                  "bg-zinc-800 text-zinc-400"
                )}>
                  {client.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-black text-white leading-tight">{client.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "w-4 h-4",
                          i < client.stars ? "fill-yellow-500 text-yellow-500" : "text-zinc-700"
                        )} 
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Última visita: <span className="text-white">{client.lastVisitText}</span>
                  </p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Visitas</p>
                  <p className="text-xl font-black text-white">{client.visits}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Inversión</p>
                  <p className="text-xl font-black text-emerald-500">RD${client.spending.toLocaleString()}</p>
                </div>
              </div>

              {client.stars === 5 && (
                <div className="mt-4 py-2 px-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-center">
                  <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest flex items-center justify-center gap-2">
                    <Trophy className="w-3 h-3" /> Cliente de Élite
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedClientForContact && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card w-full max-w-md p-8 relative overflow-hidden"
            >
              <button 
                onClick={() => setSelectedClientForContact(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-6">
                <div className={cn(
                  "w-24 h-24 rounded-3xl mx-auto flex items-center justify-center text-4xl font-black",
                  selectedClientForContact.stars === 5 ? "bg-yellow-500 text-black" : 
                  selectedClientForContact.stars === 4 ? "bg-blue-500 text-white" :
                  "bg-zinc-800 text-zinc-400"
                )}>
                  {selectedClientForContact.name.charAt(0)}
                </div>
                
                <div>
                  <h3 className="text-2xl font-black text-white">{selectedClientForContact.name}</h3>
                  <p className="text-zinc-500 font-medium">{selectedClientForContact.phone || 'Sin teléfono'}</p>
                  <div className="mt-2 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <Clock className="w-3 h-3" /> Última visita: <span className="text-white">{selectedClientForContact.lastVisitText}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {selectedClientForContact.phone ? (
                    <>
                      <a
                        href={`tel:${selectedClientForContact.phone}`}
                        className="flex items-center justify-center gap-3 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
                      >
                        <Phone className="w-5 h-5" /> Llamar Ahora
                      </a>
                      
                      <a
                        href={`https://wa.me/${selectedClientForContact.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20"
                      >
                        <MessageCircle className="w-5 h-5" /> Enviar WhatsApp
                      </a>
                    </>
                  ) : (
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest py-4">No hay información de contacto</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReportsView() {
  const [activeReportTab, setActiveReportTab] = useState<'finance' | 'clients'>('finance');
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [barbers, setBarbers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [pendingCredits, setPendingCredits] = useState<any[]>([]);

  // Filters
  const [dateRange, setDateRange] = useState({
    start: format(startOfDay(new Date()), 'yyyy-MM-dd'),
    end: format(endOfDay(new Date()), 'yyyy-MM-dd')
  });
  const [selectedClient, setSelectedClient] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedBarber, setSelectedBarber] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [reportConfig, setReportConfig] = useState({
    showSummary: true,
    showByMethod: true,
    showByService: true,
    showByCategory: true,
    showCommissions: true,
    showSalesDetail: true,
    showExpensesDetail: true,
    showPendingCredits: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [salesRes, clientsRes, servicesRes, barbersRes, expensesRes] = await Promise.all([
        supabase.from('sales').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('name'),
        supabase.from('services').select('*').order('name'),
        supabase.from('barbers').select('*').order('name'),
        supabase.from('expenses').select('*').order('created_at', { ascending: false })
      ]);

      if (salesRes.error) throw salesRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (servicesRes.error) throw servicesRes.error;
      if (barbersRes.error) throw barbersRes.error;
      if (expensesRes.error) throw expensesRes.error;

      setSales(salesRes.data || []);
      setClients(clientsRes.data || []);
      setServices(servicesRes.data || []);
      setBarbers(barbersRes.data || []);
      setExpenses(expensesRes.data || []);
      
      // Fetch pending credits separately to include client data
      const { data: creditsData, error: creditsError } = await supabase
        .from('sales')
        .select('*, clients(name)')
        .eq('is_paid', false)
        .not('due_date', 'is', null)
        .order('due_date');
      
      if (creditsError) throw creditsError;
      setPendingCredits(creditsData || []);
    } catch (error) {
      console.error('Error fetching data for reports:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredSales = useMemo(() => {
    let result = sales.filter(s => {
      const saleDate = format(new Date(s.created_at), 'yyyy-MM-dd');
      const dateMatch = saleDate >= dateRange.start && saleDate <= dateRange.end;
      const clientMatch = selectedClient === 'all' || s.client_id === selectedClient;
      const serviceMatch = selectedService === 'all' || s.services === selectedService;
      const barberMatch = selectedBarber === 'all' || s.barber_id === selectedBarber;

      return dateMatch && clientMatch && serviceMatch && barberMatch;
    });

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date_desc': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'amount_asc': return a.total_amount - b.total_amount;
        case 'amount_desc': return b.total_amount - a.total_amount;
        case 'client_name':
          const nameA = clients.find(c => c.id === a.client_id)?.name || 'Ocasional';
          const nameB = clients.find(c => c.id === b.client_id)?.name || 'Ocasional';
          return nameA.localeCompare(nameB);
        default: return 0;
      }
    });

    return result;
  }, [sales, dateRange, selectedClient, selectedService, selectedBarber, sortBy, clients]);

  const filteredClients = useMemo(() => {
    let result = [...clients];
    
    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        case 'date_asc': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'date_desc': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default: return 0;
      }
    });

    return result;
  }, [clients, sortBy]);

  const generateFinancePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Helper for currency formatting
    const fmt = (num: number) => `RD$ ${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // 1. HEADER
    try {
      const logoBase64 = await getBase64ImageFromUrl('/logodruppy.png');
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 14, 10, 25, 25);
      }
    } catch (e) {
      console.warn('Could not add logo to PDF', e);
    }

    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('DRUPPY BARBER SHOP', 45, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('REPORTE FINANCIERO INTEGRAL', 45, 28);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Periodo: ${format(new Date(dateRange.start), 'dd/MM/yyyy')} al ${format(new Date(dateRange.end), 'dd/MM/yyyy')}`, 45, 34);
    
    let filterY = 39;
    if (selectedClient !== 'all') {
      const clientName = clients.find(c => c.id === selectedClient)?.name || 'Desconocido';
      doc.text(`Filtrado por Cliente: ${clientName}`, 45, filterY);
      filterY += 5;
    }
    if (selectedBarber !== 'all') {
      const barberName = barbers.find(b => b.id === selectedBarber)?.name || 'Desconocido';
      doc.text(`Filtrado por Barbero: ${barberName}`, 45, filterY);
      filterY += 5;
    }
    if (selectedService !== 'all') {
      doc.text(`Filtrado por Servicio: ${selectedService}`, 45, filterY);
      filterY += 5;
    }
    
    doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy hh:mm a')}`, 45, filterY);

    // Filter data based on date range and other filters
    const periodSales = sales.filter(s => {
      const saleDate = format(new Date(s.created_at), 'yyyy-MM-dd');
      const dateMatch = saleDate >= dateRange.start && saleDate <= dateRange.end;
      const clientMatch = selectedClient === 'all' || s.client_id === selectedClient;
      const serviceMatch = selectedService === 'all' || s.services === selectedService;
      const barberMatch = selectedBarber === 'all' || s.barber_id === selectedBarber;
      return dateMatch && clientMatch && serviceMatch && barberMatch;
    });
    
    const periodExpenses = expenses.filter(e => {
      const expenseDate = format(new Date(e.created_at), 'yyyy-MM-dd');
      return expenseDate >= dateRange.start && expenseDate <= dateRange.end;
    });

    const periodPendingCredits = pendingCredits.filter(c => {
      const creditDate = format(new Date(c.created_at), 'yyyy-MM-dd');
      const dateMatch = creditDate >= dateRange.start && creditDate <= dateRange.end;
      const clientMatch = selectedClient === 'all' || c.client_id === selectedClient;
      const serviceMatch = selectedService === 'all' || c.services === selectedService;
      const barberMatch = selectedBarber === 'all' || c.barber_id === selectedBarber;
      return dateMatch && clientMatch && serviceMatch && barberMatch;
    });

    const totalIncome = periodSales.reduce((acc, s) => acc + s.total_amount, 0);
    const totalExpenses = periodExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const totalReceivables = periodPendingCredits.reduce((acc, c) => acc + (c.total_amount - (c.paid_amount || 0)), 0);

    // 2. EXECUTIVE SUMMARY
    if (reportConfig.showSummary) {
      doc.setFontSize(14);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text('1. RESUMEN EJECUTIVO', 14, 55);
      
      autoTable(doc, {
        startY: 60,
        head: [['Métrica Financiera', 'Monto', 'Estado']],
        body: [
          ['INGRESOS TOTALES', fmt(totalIncome), 'Ingresos brutos del periodo'],
          ['GASTOS OPERATIVOS', fmt(totalExpenses), 'Egresos registrados'],
          [{ content: 'UTILIDAD NETA', styles: { fontStyle: 'bold' } }, { content: fmt(netProfit), styles: { fontStyle: 'bold', textColor: netProfit >= 0 ? [16, 185, 129] : [239, 68, 68] } }, 'Balance final'],
          ['CUENTAS POR COBRAR', fmt(totalReceivables), 'Pendiente de cobro en el periodo'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
        styles: { fontSize: 10, cellPadding: 5 },
      });
    }

    // 3. INCOME BY PAYMENT METHOD
    if (reportConfig.showByMethod) {
      const byMethod = periodSales.reduce((acc: any, s) => {
        const m = s.payment_method || 'Otros';
        acc[m] = (acc[m] || 0) + s.total_amount;
        return acc;
      }, {});

      doc.setFontSize(14);
      doc.text('2. INGRESOS POR MÉTODO DE PAGO', 14, (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : 55);
      autoTable(doc, {
        startY: (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : 60,
        head: [['Método', 'Monto', '%']],
        body: Object.entries(byMethod).map(([m, a]: [string, any]) => [
          m,
          fmt(a),
          `${((a / (totalIncome || 1)) * 100).toFixed(1)}%`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [71, 85, 105] },
        styles: { fontSize: 9 },
      });
    }

    // 3.1 INCOME BY SERVICE
    if (reportConfig.showByService) {
      const byService = periodSales.reduce((acc: any, s) => {
        const services = s.services || 'Otros';
        acc[services] = (acc[services] || 0) + s.total_amount;
        return acc;
      }, {});

      doc.setFontSize(14);
      doc.text('3. INGRESOS POR SERVICIO', 14, (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : 55);
      autoTable(doc, {
        startY: (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : 60,
        head: [['Servicio', 'Monto', '%']],
        body: Object.entries(byService).map(([s, a]: [string, any]) => [
          s,
          fmt(a),
          `${((a / (totalIncome || 1)) * 100).toFixed(1)}%`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [51, 65, 85] },
        styles: { fontSize: 9 },
      });
    }

    // 4. EXPENSES BY CATEGORY
    if (reportConfig.showByCategory) {
      const byCategory = periodExpenses.reduce((acc: any, e) => {
        const c = e.category || 'General';
        acc[c] = (acc[c] || 0) + e.amount;
        return acc;
      }, {});

      doc.setFontSize(14);
      doc.text('4. GASTOS POR CATEGORÍA', 14, (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : 55);
      autoTable(doc, {
        startY: (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : 60,
        head: [['Categoría', 'Monto', '%']],
        body: Object.entries(byCategory).map(([c, a]: [string, any]) => [
          c,
          fmt(a),
          `${((a / (totalExpenses || 1)) * 100).toFixed(1)}%`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [185, 28, 28] },
        styles: { fontSize: 9 },
      });
    }

    // 5. BARBER COMMISSIONS (Within period)
    if (reportConfig.showCommissions) {
      const comms: Record<string, { name: string, sales: number, commissionAmount: number }> = {};
      periodSales.forEach(s => {
        if (s.barber_id) {
          const barber = barbers.find(b => b.id === s.barber_id);
          const name = barber?.name || 'N/A';
          if (!comms[s.barber_id]) {
            comms[s.barber_id] = { name, sales: 0, commissionAmount: 0 };
          }
          comms[s.barber_id].sales += s.total_amount;
          const rate = s.commission_rate !== undefined && s.commission_rate !== null ? s.commission_rate : 1.0;
          comms[s.barber_id].commissionAmount += (s.total_amount * rate);
        }
      });

      doc.addPage();
      doc.setFontSize(14);
      doc.text('5. COMISIONES DE BARBEROS (PERIODO)', 14, 20);
      autoTable(doc, {
        startY: 25,
        head: [['Barbero', 'Ventas', 'Comisión', '% Prom.']],
        body: Object.values(comms).map(b => [
          b.name,
          fmt(b.sales),
          fmt(b.commissionAmount),
          `${Math.round((b.commissionAmount / (b.sales || 1)) * 100)}%`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [245, 158, 11] },
        styles: { fontSize: 9 },
      });
    }

    // 6. DETAILED SALES LIST
    if (reportConfig.showSalesDetail) {
      doc.setFontSize(14);
      doc.text('6. DETALLE DE VENTAS', 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Fecha', 'Cliente', 'Servicio', 'Método', 'Monto']],
      body: periodSales.map(s => [
        format(new Date(s.created_at), 'dd/MM/yy HH:mm'),
        clients.find(c => c.id === s.client_id)?.name || 'Ocasional',
        s.services || 'N/A',
        s.payment_method || 'N/A',
        fmt(s.total_amount)
      ]),
      theme: 'striped',
      headStyles: { fillColor: [44, 62, 80] },
      styles: { fontSize: 8 },
    });
    }

    // 7. DETAILED EXPENSES LIST
    if (reportConfig.showExpensesDetail && periodExpenses.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('7. DETALLE DE GASTOS', 14, 20);
      autoTable(doc, {
        startY: 25,
        head: [['Fecha', 'Descripción', 'Categoría', 'Monto']],
        body: periodExpenses.map(e => [
          format(new Date(e.created_at), 'dd/MM/yy HH:mm'),
          e.description,
          e.category || 'General',
          fmt(e.amount)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [153, 27, 27] },
        styles: { fontSize: 9 },
      });
    }

    // 8. PENDING CREDITS (Accounts Receivable)
    if (reportConfig.showPendingCredits && periodPendingCredits.length > 0) {
      if ((doc as any).lastAutoTable.finalY > pageHeight - 60) {
        doc.addPage();
        doc.text('8. CUENTAS POR COBRAR (CRÉDITOS ACTIVOS)', 14, 20);
      } else {
        doc.text('8. CUENTAS POR COBRAR (CRÉDITOS ACTIVOS)', 14, (doc as any).lastAutoTable.finalY + 15);
      }
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + ( (doc as any).lastAutoTable.finalY > pageHeight - 60 ? 5 : 20),
        head: [['Cliente', 'Fecha', 'Vencimiento', 'Total', 'Pagado', 'Pendiente']],
        body: periodPendingCredits.map(c => [
          c.clients?.name || 'Cliente',
          format(new Date(c.created_at), 'dd/MM/yy'),
          format(new Date(c.due_date), 'dd/MM/yy'),
          fmt(c.total_amount),
          fmt(c.paid_amount || 0),
          fmt(c.total_amount - (c.paid_amount || 0))
        ]),
        theme: 'striped',
        headStyles: { fillColor: [217, 119, 6] },
        styles: { fontSize: 8 },
      });
    }

    // FOOTER
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - 25, pageHeight - 10);
      doc.text('Druppy Barber Shop - Reporte Generado por Sistema', 14, pageHeight - 10);
    }

    doc.save(`Reporte_Finanzas_Druppy_${format(new Date(dateRange.start), 'yyyyMMdd')}_${format(new Date(dateRange.end), 'yyyyMMdd')}.pdf`);
  };

  const generateClientsPDF = async () => {
    const doc = new jsPDF();
    const title = "DRUPPY BARBER SHOP";
    const subtitle = "Reporte de Clientes Registrados";

    // Logo
    try {
      const logoBase64 = await getBase64ImageFromUrl('/logodruppy.png');
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 10, 10, 25, 25);
      }
    } catch (e) {
      console.warn('Could not add logo to PDF', e);
    }

    // Header
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.text(title, 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text(subtitle, 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy hh:mm a')}`, 105, 38, { align: 'center' });

    const tableData = filteredClients.map(c => {
      const clientSales = sales.filter(s => s.client_id === c.id);
      const totalSpent = clientSales.reduce((acc, s) => acc + s.total_amount, 0);
      const lastVisit = clientSales.length > 0 
        ? format(new Date(clientSales[0].created_at), 'dd/MM/yyyy')
        : 'Nunca';

      return [
        c.name,
        c.phone || 'N/A',
        format(new Date(c.created_at), 'dd/MM/yyyy'),
        clientSales.length.toString(),
        `RD$ ${totalSpent.toLocaleString()}`,
        lastVisit
      ];
    });

    autoTable(doc, {
      startY: 45,
      head: [['Nombre', 'Teléfono', 'Registro', 'Visitas', 'Total Invertido', 'Última Visita']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`Reporte_Clientes_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Reportes PDF</h3>
            <p className="text-zinc-500 text-sm font-medium">Genera reportes detallados de tu negocio</p>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className={cn(
              "p-2 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-all",
              loading && "animate-spin"
            )}
            title="Actualizar datos"
          >
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>
        <div className="flex p-1 bg-zinc-900/50 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveReportTab('finance')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeReportTab === 'finance' ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"
            )}
          >
            Finanzas
          </button>
          <button
            onClick={() => setActiveReportTab('clients')}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
              activeReportTab === 'clients' ? "bg-blue-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"
            )}
          >
            Clientes
          </button>
        </div>
      </div>

      {activeReportTab === 'finance' && (
        <div className="card p-6">
          <h4 className="text-sm font-bold text-zinc-400 uppercase mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuración del Reporte
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries({
              showSummary: 'Resumen Ejecutivo',
              showByMethod: 'Por Método Pago',
              showByService: 'Por Servicio',
              showByCategory: 'Por Categoría Gasto',
              showCommissions: 'Comisiones',
              showSalesDetail: 'Detalle Ventas',
              showExpensesDetail: 'Detalle Gastos',
              showPendingCredits: 'Cuentas por Cobrar'
            }).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(reportConfig as any)[key]}
                  onChange={(e) => setReportConfig({ ...reportConfig, [key]: e.target.checked })}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 space-y-6">
            <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-500" /> Filtros y Orden
            </h4>

            {activeReportTab === 'finance' ? (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Rango de Fechas</label>
                  <div className="space-y-2">
                    <input 
                      type="date" 
                      value={dateRange.start}
                      onChange={e => setDateRange({...dateRange, start: e.target.value})}
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input 
                      type="date" 
                      value={dateRange.end}
                      onChange={e => setDateRange({...dateRange, end: e.target.value})}
                      className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cliente</label>
                  <select 
                    value={selectedClient}
                    onChange={e => setSelectedClient(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos los clientes</option>
                    <option value="">Ocasionales</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Servicio</label>
                  <select 
                    value={selectedService}
                    onChange={e => setSelectedService(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos los servicios</option>
                    {services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Barbero</label>
                  <select 
                    value={selectedBarber}
                    onChange={e => setSelectedBarber(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos los barberos</option>
                    {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ordenar por</label>
                  <select 
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="date_desc">Fecha (Reciente primero)</option>
                    <option value="date_asc">Fecha (Antiguo primero)</option>
                    <option value="amount_desc">Monto (Mayor primero)</option>
                    <option value="amount_asc">Monto (Menor primero)</option>
                    <option value="client_name">Nombre del Cliente</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ordenar por</label>
                  <select 
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name_asc">Nombre (A-Z)</option>
                    <option value="name_desc">Nombre (Z-A)</option>
                    <option value="date_desc">Fecha Registro (Reciente)</option>
                    <option value="date_asc">Fecha Registro (Antiguo)</option>
                  </select>
                </div>
              </>
            )}

            <button
              onClick={activeReportTab === 'finance' ? generateFinancePDF : generateClientsPDF}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" /> Descargar PDF
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-3">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-widest">Vista Previa de Datos</h4>
              <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 px-2 py-1 rounded-md">
                {activeReportTab === 'finance' ? filteredSales.length : filteredClients.length} registros
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/50">
                    {activeReportTab === 'finance' ? (
                      <>
                        <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5">Fecha</th>
                        <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5">Cliente</th>
                        <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5">Servicio</th>
                        <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5">Monto</th>
                      </>
                    ) : (
                      <>
                        <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5">Nombre</th>
                        <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5">Teléfono</th>
                        <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5">Registro</th>
                        <th className="p-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5">Inversión</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeReportTab === 'finance' ? (
                    filteredSales.slice(0, 10).map((s, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-xs text-zinc-400">{format(new Date(s.created_at), 'dd/MM/yy')}</td>
                        <td className="p-4 text-xs text-white font-medium">{clients.find(c => c.id === s.client_id)?.name || 'Ocasional'}</td>
                        <td className="p-4 text-xs text-zinc-400">{s.services}</td>
                        <td className="p-4 text-xs text-emerald-500 font-bold">RD$ {s.total_amount.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    filteredClients.slice(0, 10).map((c, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-xs text-white font-medium">{c.name}</td>
                        <td className="p-4 text-xs text-zinc-400">{c.phone || '-'}</td>
                        <td className="p-4 text-xs text-zinc-400">{format(new Date(c.created_at), 'dd/MM/yy')}</td>
                        <td className="p-4 text-xs text-emerald-500 font-bold">
                          RD$ {sales.filter(s => s.client_id === c.id).reduce((acc, s) => acc + s.total_amount, 0).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                  {((activeReportTab === 'finance' ? filteredSales.length : filteredClients.length) > 10) && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">
                        Y {(activeReportTab === 'finance' ? filteredSales.length : filteredClients.length) - 10} registros más...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
