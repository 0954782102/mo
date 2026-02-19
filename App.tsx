
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Shield, Sword, FileText, Menu, X, Info, Radio, Building2, Calculator, Copy, Check, Clock, Trash2, RefreshCw, Sparkles, Layout } from 'lucide-react';
import { Category, Rule, RuleSection } from './types';
import { RULES_DATA } from './constants';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.MILITARY);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedRules, setSelectedRules] = useState<Rule[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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
    const currentSections = RULES_DATA[activeCategory];
    if (!searchQuery) return currentSections;

    const lowerQuery = searchQuery.toLowerCase();
    return currentSections.map(section => ({
      ...section,
      rules: section.rules.filter(rule => 
        rule.id.toLowerCase().includes(lowerQuery) || 
        rule.text.toLowerCase().includes(lowerQuery) || 
        (rule.punishment && rule.punishment.toLowerCase().includes(lowerQuery))
      )
    })).filter(section => section.rules.length > 0);
  }, [activeCategory, searchQuery]);

  const toggleCategory = (cat: Category) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setIsSidebarOpen(false);
  };

  const toggleRuleSelection = (rule: Rule) => {
    setSelectedRules(prev => 
      prev.find(r => r.id === rule.id) 
        ? prev.filter(r => r.id !== rule.id) 
        : [...prev, rule]
    );
  };

  const clearSelection = () => {
    setSelectedRules([]);
  };

  const getReasonCode = (cat: Category) => {
    switch (cat) {
      case Category.MILITARY: return 'ППВЧ';
      case Category.LEADERS: return 'ППЛ';
      case Category.GOVERNMENT: return 'ППГ';
      case Category.STATE_ORG: return 'ППГО';
      default: return 'ПП';
    }
  };

  const calculatedPunishment = useMemo(() => {
    let totalTime = 0;
    const ruleIds: string[] = [];
    let punishmentType = 'хвилин';

    selectedRules.forEach(rule => {
      ruleIds.push(rule.id);
      if (rule.punishment) {
        const matches = rule.punishment.match(/\d+/g);
        if (matches) {
          totalTime += Math.max(...matches.map(Number));
        }
        if (rule.punishment.toLowerCase().includes('mute')) punishmentType = 'хв (Mute)';
        else if (rule.punishment.toLowerCase().includes('jail')) punishmentType = 'хв (Jail)';
      }
    });

    const reason = getReasonCode(activeCategory);
    const result = `${totalTime} ${punishmentType}, причина: ${reason} (п. ${ruleIds.join(', ')})`;
    return { text: result, ruleCount: selectedRules.length };
  }, [selectedRules, activeCategory]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(calculatedPunishment.text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden relative">
      
      {/* Бічна панель навігації */}
      <aside className={`
        fixed md:relative inset-0 z-40 md:z-auto
        w-full md:w-80 lg:w-96 glass border-r border-white/5 
        transform transition-transform duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/40">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter text-white text-glow">UA ХАБ</h1>
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] opacity-80">Максимальне видання</p>
            </div>
          </div>

          <nav className="flex-1 space-y-3 overflow-y-auto px-1">
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Категорії правил</p>
            
            {[
              { id: Category.MILITARY, icon: Sword, label: 'Напад на ВЧ', color: 'rose' },
              { id: Category.STATE_ORG, icon: Building2, label: 'Держ. організації', color: 'cyan' },
              { id: Category.LEADERS, icon: FileText, label: 'Лідери та Заступники', color: 'blue' },
              { id: Category.GOVERNMENT, icon: Radio, label: 'Державна хвиля', color: 'purple' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => toggleCategory(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all duration-300 border ${
                  activeCategory === item.id 
                  ? `text-${item.color}-400 bg-${item.color}-500/10 border-${item.color}-500/40 shadow-xl shadow-${item.color}-500/10`
                  : 'text-slate-400 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={22} className={activeCategory === item.id ? `text-${item.color}-400` : 'text-slate-500'} />
                <span className="font-bold text-base">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="text-slate-400">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Поточний час</p>
                 <p className="text-2xl font-black text-white tracking-tighter">
                   {currentTime.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                 </p>
              </div>
              <RefreshCw size={20} className="text-slate-600 cursor-pointer hover:rotate-180 transition-transform duration-700" onClick={() => window.location.reload()} />
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex gap-4">
              <Sparkles size={18} className="text-blue-500 shrink-0" />
              <p className="text-[11px] leading-relaxed text-slate-400 font-medium">Швидка навігація та авто-генератор покарань.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Основний контент */}
      <main className="flex-1 h-full overflow-y-auto p-6 md:p-12 lg:p-20 relative">
        <div className="max-w-5xl mx-auto space-y-16 pb-48">
          
          {/* Заголовки розділів */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10 animate-reveal">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <Layout size={12} />
                UA ONLINE RP
              </div>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-[0.85] text-glow">
                {activeCategory === Category.MILITARY ? 'Контроль ВЧ' : 
                 activeCategory === Category.STATE_ORG ? 'Держ. Регламент' :
                 activeCategory === Category.LEADERS ? 'Ядро Лідерів' : 'Хвиля Зв’язку'}
              </h2>
              <p className="text-slate-400 text-xl font-medium max-w-xl">
                Миттєва генерація покарань та швидка навігація по регламенту.
              </p>
            </div>

            {activeCategory === Category.MILITARY && (
              <div className={`
                flex items-center gap-5 px-8 py-6 rounded-[2.5rem] border transition-all duration-1000 backdrop-blur-3xl
                ${vchStatus 
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-2xl shadow-emerald-500/10' 
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-2xl shadow-rose-500/10'
                }
              `}>
                <div className="relative">
                  <div className={`w-4 h-4 rounded-full animate-ping absolute inset-0 ${vchStatus ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  <div className={`w-4 h-4 rounded-full relative z-10 ${vchStatus ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                </div>
                <div className="font-black flex flex-col">
                  <span className="uppercase tracking-[0.3em] text-[10px] opacity-60 mb-1">Статус ВЧ</span>
                  <span className="text-xl tracking-tight">{vchStatus ? 'ВІДКРИТО' : 'ЗАКРИТО'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Панель пошуку */}
          <div className="sticky top-0 z-30 py-4 -mx-6 px-6 backdrop-blur-sm md:backdrop-blur-none">
            <div className="relative group max-w-3xl">
              <div className="absolute inset-y-0 left-7 flex items-center pointer-events-none">
                <Search size={24} className="text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Знайти правило або статтю..."
                className="w-full bg-slate-900/40 backdrop-blur-3xl border border-white/10 text-white pl-16 pr-8 py-6 rounded-[2.2rem] focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all text-xl font-semibold shadow-2xl"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-7 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              )}
            </div>
          </div>

          {/* Список правил */}
          <div className="space-y-24">
            {filteredRules.length > 0 ? (
              filteredRules.map((section, idx) => (
                <section key={idx} className="space-y-10 animate-reveal" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className="flex items-center gap-6">
                    <h3 className="text-3xl font-black tracking-tight text-white/95">{section.title}</h3>
                    <div className="flex-1 h-[2px] bg-gradient-to-r from-white/15 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {section.rules.map((rule) => (
                      <RuleItem 
                        key={rule.id} 
                        rule={rule} 
                        category={activeCategory} 
                        isSelected={!!selectedRules.find(r => r.id === rule.id)}
                        onToggle={() => toggleRuleSelection(rule)}
                      />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-slate-500 space-y-8">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                  <Search size={48} strokeWidth={1.5} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-bold text-slate-300">Правил не знайдено</p>
                  <p className="text-base text-slate-500">Спробуйте інший запит або змініть фільтр.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Панель результатів (Док) */}
      {selectedRules.length > 0 && (
        <div className="fixed bottom-10 left-0 right-0 md:left-80 lg:left-96 z-50 px-8 animate-in slide-in-from-bottom-20 duration-700">
          <div className="max-w-4xl mx-auto">
            <div className="glass shadow-[0_40px_100px_rgba(0,0,0,0.7)] border-white/20 rounded-[3.5rem] p-7 md:p-9 flex flex-col md:flex-row items-center gap-10 ring-1 ring-white/10">
              
              <div className="flex-1 min-w-0 w-full text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                  <div className="flex -space-x-3">
                    {selectedRules.slice(0, 4).map((r, i) => (
                      <div key={i} className="w-9 h-9 rounded-xl bg-blue-600 border-2 border-slate-900 flex items-center justify-center text-[11px] font-black text-white shadow-2xl">
                        {r.id.split('.')[1] || r.id}
                      </div>
                    ))}
                    {selectedRules.length > 4 && (
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[11px] font-black text-slate-400">
                        +{selectedRules.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-400">Покарання згенеровано</span>
                </div>
                {/* ПРАВКА ТЕКСТУ: Прибрано truncate, додано перенесення */}
                <h4 className="text-white font-black text-xl md:text-3xl tracking-tighter leading-tight whitespace-normal break-words">
                  {calculatedPunishment.text}
                </h4>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto shrink-0">
                <button 
                  onClick={clearSelection}
                  className="w-16 h-16 rounded-[1.8rem] bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 transition-all flex items-center justify-center group shadow-xl"
                  title="Очистити список"
                >
                  <Trash2 size={28} className="group-hover:scale-110 transition-transform" />
                </button>
                <button 
                  onClick={copyToClipboard}
                  className={`
                    h-16 px-12 rounded-[1.8rem] flex items-center justify-center gap-4 transition-all font-black text-lg flex-1 md:flex-none
                    ${copyFeedback ? 'bg-emerald-600 text-white shadow-2xl shadow-emerald-500/40' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-2xl shadow-blue-600/60 hover:scale-[1.03] active:scale-95'}
                  `}
                >
                  {copyFeedback ? (
                    <><Check size={28} strokeWidth={4} /> КОПІЙОВАНО</>
                  ) : (
                    <><Copy size={24} /> КОПІЮВАТИ</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Мобільна кнопка меню */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center z-50 hover:scale-110 active:scale-90 transition-all"
        >
          <Menu size={32} />
        </button>
      )}
    </div>
  );
};

const RuleItem: React.FC<{ 
  rule: Rule; 
  category: Category; 
  isSelected: boolean;
  onToggle: () => void;
}> = ({ rule, category, isSelected, onToggle }) => {
  const getAccentColor = () => {
    switch (category) {
      case Category.MILITARY: return isSelected ? 'bg-rose-500 text-white' : 'bg-rose-500/20 text-rose-400';
      case Category.LEADERS: return isSelected ? 'bg-blue-500 text-white' : 'bg-blue-500/20 text-blue-400';
      case Category.GOVERNMENT: return isSelected ? 'bg-purple-500 text-white' : 'bg-purple-500/20 text-purple-400';
      case Category.STATE_ORG: return isSelected ? 'bg-cyan-500 text-white' : 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div 
      onClick={onToggle}
      className={`
        glass-card cursor-pointer p-8 rounded-[2.8rem] transition-all relative group
        ${isSelected ? 'btn-active border-blue-500/40' : 'border-white/5'}
      `}
    >
      <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
        <div className={`
          px-5 py-2.5 rounded-2xl font-black text-sm shrink-0 mt-1 transition-all
          ${getAccentColor()}
        `}>
          #{rule.id}
        </div>
        <div className="flex-1 space-y-5">
          <p className="text-white leading-snug font-bold text-xl md:text-2xl tracking-tight">
            {rule.text}
          </p>
          
          {(rule.punishment || rule.note) && (
            <div className="flex flex-wrap gap-4 pt-1">
              {rule.punishment && (
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-950/80 border border-rose-900/40 text-rose-500 text-[11px] font-black uppercase tracking-widest shadow-2xl">
                  <div className="w-2 h-2 rounded-full bg-rose-600 shadow-[0_0_12px_rgba(225,29,72,1)] animate-pulse"></div>
                  {rule.punishment}
                </div>
              )}
              {rule.note && (
                <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-950/40 border border-white/5 text-slate-400 text-[12px] font-bold italic tracking-tight">
                   {rule.note}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={`
          w-14 h-14 rounded-[1.8rem] border-2 flex items-center justify-center shrink-0 transition-all self-center md:self-start
          ${isSelected 
            ? 'bg-blue-600 border-blue-600 text-white rotate-0 shadow-xl shadow-blue-600/40' 
            : 'border-white/10 group-hover:border-white/20 rotate-6 group-hover:rotate-0'
          }
        `}>
          {isSelected ? <Check size={32} strokeWidth={4} /> : <div className="w-3 h-3 rounded-full bg-white/20"></div>}
        </div>
      </div>
    </div>
  );
};

export default App;
