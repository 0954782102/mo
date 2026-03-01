
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, Shield, Sword, FileText, Menu, X, Radio, Building2, 
  Copy, Check, Trash2, RefreshCw, Sparkles, Layout, MessageSquare, 
  Users, Lightbulb, Send, LogIn, UserPlus, LogOut, Settings, 
  Bell, Activity, Terminal, Plus, Edit, Trash, ClipboardCheck
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Category, Rule, User, ActivityLog, ChangelogEntry } from './types';
import { RULES_DATA as INITIAL_RULES } from './constants';

// --- Constants ---
const SERVER_LOGO = "https://i.postimg.cc/zv1LkJ72/photo-5269377281501631949-x.jpg";
const SERVER_NAME = "Server 02 UA Online";
const SYSADMIN_EMAIL = "a60840397@gmail.com";

// --- Components ---

const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-5">
    <div className="glass border-emerald-500/40 bg-emerald-500/10 p-4 rounded-2xl flex items-center gap-3 shadow-2xl ring-1 ring-emerald-500/20">
      <Bell className="text-emerald-400" size={20} />
      <p className="text-white font-bold text-sm">{message}</p>
      <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
        <X size={16} />
      </button>
    </div>
  </div>
);

const RuleItem = React.memo(({ 
  rule, 
  category, 
  isSelected, 
  onToggle,
  isAdmin,
  onEdit,
  onDelete
}: { 
  rule: Rule; 
  category: Category; 
  isSelected: boolean;
  onToggle: (rule: Rule) => void;
  isAdmin?: boolean;
  onEdit?: (rule: Rule) => void;
  onDelete?: (id: string) => void;
}) => {
  const getAccentColor = () => {
    switch (category) {
      case Category.MILITARY: return isSelected ? 'bg-rose-500 text-white' : 'bg-rose-500/20 text-rose-400';
      case Category.CHAT: return isSelected ? 'bg-amber-500 text-white' : 'bg-amber-500/20 text-amber-400';
      case Category.GOVERNMENT: return isSelected ? 'bg-purple-500 text-white' : 'bg-purple-500/20 text-purple-400';
      case Category.ROLEPLAY: return isSelected ? 'bg-blue-500 text-white' : 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  const handleQuickCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    let command = "";
    const nameMatch = rule.text.match(/^([A-ZА-Я]{2,10})/);
    const abbr = nameMatch ? nameMatch[1] : (category === Category.CHAT ? "ППЧ" : "ПП");
    
    if (category === Category.CHAT || category === Category.ROLEPLAY) {
      const timeMatch = rule.punishment?.match(/\d+/);
      const time = timeMatch ? timeMatch[0] : "20";
      const cmd = rule.punishment?.toLowerCase().includes('mute') ? '/mute' : '/jail';
      command = `${cmd} [id] ${time} ${abbr} | П. ${rule.id}`;
    } else {
      command = `${abbr} | П. ${rule.id}`;
    }
    
    navigator.clipboard.writeText(command);
    alert(`Скопійовано: ${command}`);
  };

  return (
    <div 
      onClick={() => onToggle(rule)}
      className={`
        glass-card cursor-pointer p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.8rem] transition-all relative will-change-transform group
        ${isSelected ? 'btn-active border-blue-500/40' : 'border-white/5'}
      `}
    >
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start relative z-10">
        <div className={`
          px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-sm shrink-0 transition-all
          ${getAccentColor()}
        `}>
          #{rule.id}
        </div>
        <div className="flex-1 space-y-3 md:space-y-5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-white leading-tight md:leading-snug font-bold text-base md:text-2xl tracking-tight">
              {rule.text}
            </p>
            <button 
              onClick={handleQuickCopy}
              className="p-2 bg-white/5 hover:bg-blue-600/20 text-blue-400 rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0"
              title="Швидке копіювання команди"
            >
              <ClipboardCheck size={20} />
            </button>
          </div>
          
          {(rule.punishment || rule.note) && (
            <div className="flex flex-wrap gap-2 md:gap-4 pt-1">
              {rule.punishment && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl bg-slate-950/80 border border-rose-900/40 text-rose-500 text-[9px] md:text-[11px] font-black uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></div>
                  {rule.punishment}
                </div>
              )}
              {rule.note && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-slate-400 text-[10px] md:text-[12px] font-medium italic">
                   {rule.note}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 shrink-0 self-end md:self-start">
          <div className={`
            w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-[1.8rem] border-2 flex items-center justify-center transition-all
            ${isSelected 
              ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
              : 'border-white/10'
            }
          `}>
            {isSelected ? <Check size={20} className="md:w-8 md:h-8" strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-white/20"></div>}
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={(e) => { e.stopPropagation(); onEdit?.(rule); }} className="p-2 bg-amber-500/20 text-amber-500 rounded-lg hover:bg-amber-500/40 transition-all">
                <Edit size={16} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete?.(rule.id); }} className="p-2 bg-rose-500/20 text-rose-500 rounded-lg hover:bg-rose-500/40 transition-all">
                <Trash size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// --- Main App ---

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [authForm, setAuthForm] = useState({ nickname: '', email: '', password: '', confirmPassword: '' });

  // App State
  const [activeCategory, setActiveCategory] = useState<Category>(Category.CHAT);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedRules, setSelectedRules] = useState<Rule[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [suggestionText, setSuggestionText] = useState('');
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(true);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Admin State
  const [adminTab, setAdminTab] = useState<'users' | 'logs' | 'content' | 'notify'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [notificationText, setNotificationText] = useState('');

  // Socket
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('push_notification', (data) => {
      setToast(data.text);
      setTimeout(() => setToast(null), 5000);
    });

    newSocket.on('online_users_count', (count) => setOnlineCount(count));
    newSocket.on('activity_logs_updated', (newLogs) => setLogs(newLogs));
    newSocket.on('rules_updated', fetchRules);
    newSocket.on('changelog_updated', fetchChangelog);

    return () => { newSocket.close(); };
  }, []);

  useEffect(() => {
    if (user && socket) {
      socket.emit('identify', user);
    }
  }, [user, socket]);

  useEffect(() => {
    fetchRules();
    fetchChangelog();
    if (token) fetchMe();
  }, [token]);

  const fetchRules = async () => {
    setIsLoadingRules(true);
    try {
      const res = await fetch('/api/rules');
      const data = await res.json();
      setRules(data);
    } finally {
      setIsLoadingRules(false);
    }
  };

  const fetchChangelog = async () => {
    const res = await fetch('/api/changelog');
    const data = await res.json();
    setChangelog(data);
  };

  const fetchMe = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        handleLogout();
      }
    } catch (e) {
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleAuth called', { authMode, authForm });
    try {
      if (authMode === 'register' && authForm.password !== authForm.confirmPassword) {
        alert('Паролі не співпадають');
        return;
      }

      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });

      const data = await res.json();
      if (res.ok) {
        if (authMode === 'login') {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          setUser(data.user);
          setAuthMode(null);
          socket?.emit('log_activity', { userId: data.user.id, nickname: data.user.nickname, action: 'Увійшов в акаунт' });
        } else {
          setAuthMode('login');
          alert('Реєстрація успішна! Тепер увійдіть.');
        }
      } else {
        alert(data.error || 'Помилка');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Сталася помилка при спробі авторизації. Перевірте з\'єднання з сервером.');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const vchStatus = useMemo(() => {
    const hours = currentTime.getHours();
    const intervals = [[12, 14], [16, 18], [20, 24]];
    return intervals.some(([start, end]) => hours >= start && hours < end);
  }, [currentTime]);

  const filteredRules = useMemo(() => {
    // Group rules by sectionTitle
    const currentRules = rules.length > 0 ? rules.filter(r => r.category === activeCategory) : [];
    
    // Fallback to INITIAL_RULES if DB is empty for this category
    const displayRules = currentRules.length > 0 ? currentRules : (INITIAL_RULES[activeCategory]?.flatMap(s => s.rules.map(r => ({ ...r, sectionTitle: s.title }))) || []);

    const filtered = searchQuery 
      ? displayRules.filter(r => r.id.includes(searchQuery) || r.text.toLowerCase().includes(searchQuery.toLowerCase()))
      : displayRules;

    // Re-group into sections
    const sections: { title: string, rules: Rule[] }[] = [];
    filtered.forEach(r => {
      const sectionTitle = (r as any).sectionTitle || "Загальні правила";
      let section = sections.find(s => s.title === sectionTitle);
      if (!section) {
        section = { title: sectionTitle, rules: [] };
        sections.push(section);
      }
      section.rules.push(r);
    });
    return sections;
  }, [activeCategory, searchQuery, rules]);

  const toggleCategory = (cat: Category) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setIsSidebarOpen(false);
  };

  const handleToggleRule = useCallback((rule: Rule) => {
    setSelectedRules(prev => 
      prev.find(r => r.id === rule.id) 
        ? prev.filter(r => r.id !== rule.id) 
        : [...prev, rule]
    );
  }, []);

  const clearSelection = () => setSelectedRules([]);

  const getReasonCode = (cat: Category) => {
    switch (cat) {
      case Category.MILITARY: return 'ППВЧ';
      case Category.CHAT: return 'ППЧ';
      case Category.GOVERNMENT: return 'ППГ';
      case Category.ROLEPLAY: return 'ПП';
      default: return 'ПП';
    }
  };

  const calculatedPunishment = useMemo(() => {
    let totalTime = 0;
    const ruleIds: string[] = [];
    const ruleNames: string[] = [];
    let punishmentType = 'хвилин';

    selectedRules.forEach(rule => {
      ruleIds.push(rule.id);
      const nameMatch = rule.text.match(/^([A-ZА-Я]{2,10})/);
      if (nameMatch) ruleNames.push(nameMatch[1]);

      if (rule.punishment) {
        const matches = rule.punishment.match(/\d+/g);
        if (matches) totalTime += Math.max(...matches.map(Number));
        if (rule.punishment.toLowerCase().includes('mute')) punishmentType = 'хв (Mute)';
        else if (rule.punishment.toLowerCase().includes('jail')) punishmentType = 'хв (Jail)';
      }
    });

    const uniqueNames = Array.from(new Set(ruleNames));
    const reasonCode = getReasonCode(activeCategory);
    const reason = uniqueNames.length > 0 ? uniqueNames.join(', ') : reasonCode;
    return `${totalTime} ${punishmentType}, причина: ${reason} (п. ${ruleIds.join(', ')})`;
  }, [selectedRules, activeCategory]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(calculatedPunishment);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
    if (user) {
      socket?.emit('log_activity', { userId: user.id, nickname: user.nickname, action: `Скопіював покарання: ${calculatedPunishment}` });
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden relative text-sm md:text-base selection:bg-blue-600/30">
      
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Бічна панель навігації */}
      <aside className={`
        fixed md:relative inset-0 z-40 md:z-auto
        w-full md:w-72 lg:w-80 glass border-r border-white/5 
        transform transition-transform duration-300 ease-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 md:p-8 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8 md:mb-14">
            <img src={SERVER_LOGO} className="w-10 h-10 md:w-12 md:h-12 rounded-xl shadow-lg object-cover" alt="Logo" />
            <div>
              <h1 className="font-black text-lg md:text-xl tracking-tight text-white leading-none">UA ХАБ</h1>
              <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest opacity-80 mt-1">{SERVER_NAME}</p>
            </div>
            <button className="md:hidden ml-auto text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
            <p className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Категорії</p>
            {[
              { id: Category.CHAT, icon: MessageSquare, label: 'Правила чату', activeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
              { id: Category.ROLEPLAY, icon: Users, label: 'Role Play', activeClass: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
              { id: Category.MILITARY, icon: Sword, label: 'Напад на ВЧ', activeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
              { id: Category.GOVERNMENT, icon: Radio, label: 'Держ. хвиля', activeClass: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
              { id: Category.SUGGESTIONS, icon: Lightbulb, label: 'Пропозиції', activeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => toggleCategory(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all border ${
                  activeCategory === item.id ? item.activeClass : 'text-slate-400 border-transparent hover:bg-white/5'
                }`}
              >
                <item.icon size={18} />
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}

            {user?.email === SYSADMIN_EMAIL && (
              <button
                onClick={() => { setAdminTab('users'); toggleCategory(Category.SUGGESTIONS); /* Just to clear view */ }}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all border text-rose-400 border-rose-500/20 hover:bg-rose-500/10 mt-4"
              >
                <Settings size={18} />
                <span className="font-bold text-sm">Панель SysAdmin</span>
              </button>
            )}
          </nav>

          <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="text-slate-400">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Київ</p>
                 <p className="text-xl font-black text-white">
                   {currentTime.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                 </p>
              </div>
              <div className="flex items-center gap-2">
                {user?.email === SYSADMIN_EMAIL && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-400">{onlineCount}</span>
                  </div>
                )}
                <RefreshCw size={18} className="text-slate-600 cursor-pointer hover:text-white transition-colors" onClick={() => window.location.reload()} />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Основний контент */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-12 lg:p-16 relative">
        
        {/* Header with Profile */}
        <header className="max-w-4xl mx-auto flex items-center justify-between mb-12">
          <div className="hidden md:block">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">UA ONLINE RP</p>
            <h3 className="text-white font-black text-xl">Helper Hub</h3>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {user ? (
              <div className="flex items-center gap-4 glass p-2 pr-4 rounded-2xl border-white/10">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                  {user.nickname[0].toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <p className="text-white font-bold text-sm leading-none">{user.nickname}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{user.position}</p>
                </div>
                <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setAuthMode('login')} className="px-5 py-2.5 rounded-xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all border border-white/10">
                  Увійти
                </button>
                <button onClick={() => setAuthMode('register')} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20">
                  Реєстрація
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 pb-40">
          
          {/* Changelog Section (Only on main page) */}
          {activeCategory === Category.CHAT && !searchQuery && changelog.length > 0 && (
            <div className="glass-card p-6 rounded-[2rem] border-blue-500/20 bg-blue-500/5 animate-reveal">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="text-blue-400" size={20} />
                <h4 className="text-white font-black text-sm uppercase tracking-widest">Останні зміни</h4>
              </div>
              <div className="space-y-3">
                {changelog.map(entry => (
                  <div key={entry.id} className="flex gap-4 items-start">
                    <span className="text-[10px] font-black text-blue-400 shrink-0 mt-1">{entry.date}</span>
                    <p className="text-slate-300 text-sm font-medium">{entry.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 animate-reveal">
            <div className="space-y-2 md:space-y-4">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white leading-tight">
                {activeCategory === Category.MILITARY ? 'Контроль ВЧ' : 
                 activeCategory === Category.CHAT ? 'Чат та Голос' :
                 activeCategory === Category.SUGGESTIONS ? 'Пропозиції' :
                 activeCategory === Category.ROLEPLAY ? 'Role Play' : 'Рація'}
              </h2>
            </div>

            {activeCategory === Category.MILITARY && (
              <div className={`
                flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all backdrop-blur-md
                ${vchStatus ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}
              `}>
                <div className={`w-2 h-2 rounded-full ${vchStatus ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`}></div>
                <span className="font-black text-sm uppercase tracking-widest">{vchStatus ? 'Відкрито' : 'Закрито'}</span>
              </div>
            )}
          </div>

          {/* Search */}
          {activeCategory !== Category.SUGGESTIONS && (
            <div className="sticky top-0 z-30 py-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search size={20} className="text-slate-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Пошук правил..."
                  className="w-full bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white pl-14 pr-6 py-4 md:py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-semibold shadow-xl"
                />
              </div>
            </div>
          )}

          <div className="space-y-12">
            {activeCategory === Category.SUGGESTIONS ? (
              <div className="glass-card p-8 md:p-12 rounded-[2.5rem] space-y-8 animate-reveal will-change-transform">
                <div className="space-y-4">
                  <h3 className="text-2xl md:text-3xl font-black text-white">Маєте ідею чи знайшли баг?</h3>
                  <p className="text-slate-400 font-medium">Ваш відгук допомагає нам ставати кращими. Опишіть вашу пропозицію або недопрацювання нижче.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Ваша пропозиція / недопрацювання</label>
                    <textarea 
                      value={suggestionText}
                      onChange={(e) => setSuggestionText(e.target.value)}
                      placeholder="Опишіть детально..."
                      rows={6}
                      className="w-full bg-slate-950/40 border border-white/5 text-white px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all font-bold resize-none"
                    />
                  </div>

                  <button 
                    onClick={() => {
                      if (!suggestionText) {
                        alert('Будь ласка, заповніть поле');
                        return;
                      }
                      const time = new Date().toLocaleString('uk-UA');
                      const message = `Время ${time}, пропозиція: ${suggestionText}`;
                      const encodedMessage = encodeURIComponent(message);
                      window.open(`https://t.me/bortovt?text=${encodedMessage}`, '_blank');
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-16 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-lg shadow-lg shadow-emerald-900/20"
                  >
                    <Send size={20} />
                    ВІДПРАВИТИ В TELEGRAM
                  </button>
                </div>
              </div>
            ) : isLoadingRules ? (
              <div className="py-20 text-center">
                <div className="inline-block w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-bold">Завантаження правил...</p>
              </div>
            ) : filteredRules.length > 0 ? (
              filteredRules.map((section, idx) => (
                <section key={idx} className="space-y-6 animate-reveal">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl md:text-2xl font-black text-white/90">{section.title}</h3>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {section.rules.map((rule) => (
                      <RuleItem 
                        key={rule.id} 
                        rule={rule} 
                        category={activeCategory} 
                        isSelected={!!selectedRules.find(r => r.id === rule.id)}
                        onToggle={handleToggleRule}
                        isAdmin={user?.email === SYSADMIN_EMAIL}
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="py-20 text-center text-slate-500 font-bold">Нічого не знайдено</div>
            )}
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      {authMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass w-full max-w-md p-8 rounded-[2.5rem] border-white/10 relative animate-in zoom-in-95">
            <button onClick={() => setAuthMode(null)} className="absolute top-6 right-6 text-white/40 hover:text-white">
              <X size={24} />
            </button>
            <div className="text-center mb-8">
              <h3 className="text-3xl font-black text-white mb-2">{authMode === 'login' ? 'З поверненням!' : 'Створити акаунт'}</h3>
              <p className="text-slate-400 font-medium">{authMode === 'login' ? 'Увійдіть у свій профіль адміністратора' : 'Приєднуйтесь до нашої команди'}</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Ігровий Nick_Name</label>
                  <input 
                    type="text" required
                    value={authForm.nickname}
                    onChange={(e) => setAuthForm({...authForm, nickname: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-bold"
                    placeholder="Ivan_Ivanov"
                  />
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Email</label>
                <input 
                  type="email" required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-bold"
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Пароль</label>
                <input 
                  type="password" required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>
              {authMode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Повтор паролю</label>
                  <input 
                    type="password" required
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-bold"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {authMode === 'register' && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                  <p className="text-[10px] font-bold text-rose-400 leading-relaxed">
                    ⚠️ УВАГА: Цей сервіс не є офіційним ресурсом UA ONLINE. НЕ ВИКОРИСТОВУЙТЕ ігрові паролі. Вигадайте новий унікальний пароль.
                  </p>
                </div>
              )}

              <button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-blue-900/20 mt-4">
                {authMode === 'login' ? 'УВІЙТИ' : 'ЗАРЕЄСТРУВАТИСЯ'}
              </button>
            </form>

            <div className="text-center mt-6">
              <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-slate-400 font-bold text-sm hover:text-white transition-colors">
                {authMode === 'login' ? 'Немає акаунту? Створити' : 'Вже є акаунт? Увійти'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SysAdmin Dashboard Modal */}
      {user?.email === SYSADMIN_EMAIL && activeCategory === Category.SUGGESTIONS && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="glass w-full max-w-6xl h-[85vh] rounded-[3rem] border-white/10 flex flex-col overflow-hidden relative">
            <button onClick={() => setActiveCategory(Category.CHAT)} className="absolute top-8 right-8 text-white/40 hover:text-white z-10">
              <X size={32} />
            </button>

            <div className="flex h-full">
              {/* Sidebar */}
              <div className="w-64 border-r border-white/5 p-8 space-y-2">
                <h3 className="text-white font-black text-xl mb-8">SysAdmin</h3>
                {[
                  { id: 'users', icon: Users, label: 'Користувачі' },
                  { id: 'logs', icon: Terminal, label: 'Логи подій' },
                  { id: 'content', icon: Edit, label: 'Контент' },
                  { id: 'notify', icon: Bell, label: 'Сповіщення' },
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${adminTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 p-12 overflow-y-auto">
                {adminTab === 'users' && (
                  <div className="space-y-6">
                    <h4 className="text-2xl font-black text-white">Управління користувачами</h4>
                    <div className="glass rounded-2xl overflow-hidden border-white/5">
                      <table className="w-full text-left">
                        <thead className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <tr>
                            <th className="px-6 py-4">Нікнейм</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Роль</th>
                            <th className="px-6 py-4">Дата</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm text-white font-bold">
                          {users.map(u => (
                            <tr key={u.id} className="border-t border-white/5">
                              <td className="px-6 py-4">{u.nickname}</td>
                              <td className="px-6 py-4 text-slate-400">{u.email}</td>
                              <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-[10px] ${u.role === 'SysAdmin' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>{u.role}</span></td>
                              <td className="px-6 py-4 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminTab === 'logs' && (
                  <div className="space-y-6">
                    <h4 className="text-2xl font-black text-white">Activity Logs</h4>
                    <div className="bg-black/40 rounded-2xl p-6 font-mono text-xs border border-white/5 h-[500px] overflow-y-auto space-y-2">
                      {logs.map(log => (
                        <div key={log.id} className="flex gap-4">
                          <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <span className="text-blue-400">{log.nickname}</span>
                          <span className="text-white">{log.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === 'content' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-2xl font-black text-white">Управління контентом</h4>
                      <button 
                        onClick={() => {
                          const id = prompt('Введіть ID правила (напр. 5.1):');
                          if (!id) return;
                          const text = prompt('Введіть текст правила:');
                          if (!text) return;
                          const punishment = prompt('Введіть покарання (напр. Мут 20 хв):');
                          const sectionTitle = prompt('Введіть назву розділу:');
                          
                          fetch('/api/rules', {
                            method: 'POST',
                            headers: { 
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ id, text, punishment, category: activeCategory, sectionTitle: sectionTitle || 'Загальні' })
                          }).then(() => fetchRules());
                        }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-sm flex items-center gap-2"
                      >
                        <Plus size={18} />
                        ДОДАТИ ПРАВИЛО
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {rules.filter(r => r.category === activeCategory).map(rule => (
                        <div key={rule.id} className="glass p-6 rounded-2xl flex items-center justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-black">#{rule.id}</span>
                              <span className="text-slate-500 text-[10px] font-bold uppercase">{(rule as any).sectionTitle}</span>
                            </div>
                            <p className="text-white font-bold">{rule.text}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                const text = prompt('Новий текст правила:', rule.text);
                                if (!text) return;
                                fetch('/api/rules', {
                                  method: 'POST',
                                  headers: { 
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: JSON.stringify({ ...rule, text })
                                }).then(() => fetchRules());
                              }}
                              className="p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white transition-all"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm('Видалити це правило?')) {
                                  fetch(`/api/rules/${rule.id}`, {
                                    method: 'DELETE',
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  }).then(() => fetchRules());
                                }
                              }}
                              className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all"
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === 'notify' && (
                  <div className="space-y-6 max-w-lg">
                    <h4 className="text-2xl font-black text-white">Push-сповіщення</h4>
                    <p className="text-slate-400 font-medium">Це сповіщення побачать усі користувачі, які зараз онлайн на сайті.</p>
                    <textarea 
                      value={notificationText}
                      onChange={(e) => setNotificationText(e.target.value)}
                      placeholder="Текст сповіщення..."
                      className="w-full bg-white/5 border border-white/10 text-white p-6 rounded-2xl focus:ring-2 focus:ring-blue-500/40 font-bold resize-none"
                      rows={4}
                    />
                    <button 
                      onClick={() => {
                        socket?.emit('send_notification', { text: notificationText });
                        setNotificationText('');
                        alert('Відправлено!');
                      }}
                      className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black flex items-center justify-center gap-3"
                    >
                      <Bell size={20} />
                      ВІДПРАВИТИ ВСІМ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Результати */}
      {selectedRules.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 animate-in slide-in-from-bottom-5">
          <div className="glass shadow-2xl border-white/20 rounded-[2rem] p-4 md:p-6 flex flex-col gap-4 max-w-lg ml-auto ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-4">
               <div className="flex -space-x-2">
                 {selectedRules.slice(0, 3).map((r, i) => (
                   <div key={i} className="w-8 h-8 rounded-lg bg-blue-600 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-white">
                     {r.id.split('.').pop()}
                   </div>
                 ))}
                 {selectedRules.length > 3 && (
                   <div className="w-8 h-8 rounded-lg bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[10px] font-black text-slate-400">
                     +{selectedRules.length - 3}
                   </div>
                 )}
               </div>
               <button onClick={clearSelection} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                 <Trash2 size={20} />
               </button>
            </div>
            
            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
              <h4 className="text-white font-bold text-sm md:text-base leading-snug break-words">
                {calculatedPunishment}
              </h4>
            </div>

            <button 
              onClick={copyToClipboard}
              className={`
                w-full h-12 rounded-xl flex items-center justify-center gap-2 transition-all font-black text-sm
                ${copyFeedback ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'}
              `}
            >
              {copyFeedback ? <Check size={18} strokeWidth={3} /> : <Copy size={18} />}
              {copyFeedback ? 'ГОТОВО' : 'КОПІЮВАТИ'}
            </button>
          </div>
        </div>
      )}

      {/* Мобільна кнопка */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed top-6 right-6 w-12 h-12 glass text-white rounded-xl shadow-xl flex items-center justify-center z-50"
        >
          <Menu size={24} />
        </button>
      )}
    </div>
  );
};

export default App;
