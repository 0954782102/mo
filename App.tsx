
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Shield, Sword, FileText, Menu, X, Radio, Building2, Copy, Check, Trash2, RefreshCw, Sparkles, Layout } from 'lucide-react';
import { Category, Rule } from './types';
import { RULES_DATA } from './constants';

// Оптимізований RuleItem для уникнення лагів при скролі та виборі
const RuleItem = React.memo(({ 
  rule, 
  category, 
  isSelected, 
  onToggle 
}: { 
  rule: Rule; 
  category: Category; 
  isSelected: boolean;
  onToggle: (rule: Rule) => void;
}) => {
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
      onClick={() => onToggle(rule)}
      className={`
        glass-card cursor-pointer p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.8rem] transition-all relative
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
          <p className="text-white leading-tight md:leading-snug font-bold text-base md:text-2xl tracking-tight">
            {rule.text}
          </p>
          
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
        
        <div className={`
          w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-[1.8rem] border-2 flex items-center justify-center shrink-0 transition-all self-end md:self-start
          ${isSelected 
            ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
            : 'border-white/10'
          }
        `}>
          {isSelected ? <Check size={20} className="md:w-8 md:h-8" strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-white/20"></div>}
        </div>
      </div>
    </div>
  );
});

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
    return `${totalTime} ${punishmentType}, причина: ${reason} (п. ${ruleIds.join(', ')})`;
  }, [selectedRules, activeCategory]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(calculatedPunishment);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden relative text-sm md:text-base">
      
      {/* Бічна панель навігації */}
      <aside className={`
        fixed md:relative inset-0 z-40 md:z-auto
        w-full md:w-72 lg:w-80 glass border-r border-white/5 
        transform transition-transform duration-300 ease-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 md:p-8 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8 md:mb-14">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl md:text-2xl tracking-tight text-white">UA ХАБ</h1>
              <p className="text-[8px] text-blue-400 font-bold uppercase tracking-widest opacity-80">Оптимізовано</p>
            </div>
            <button className="md:hidden ml-auto text-white" onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
            <p className="px-3 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Категорії</p>
            {[
              { id: Category.MILITARY, icon: Sword, label: 'Напад на ВЧ', color: 'rose' },
              { id: Category.STATE_ORG, icon: Building2, label: 'Держ. орг.', color: 'cyan' },
              { id: Category.LEADERS, icon: FileText, label: 'Лідери / Заст.', color: 'blue' },
              { id: Category.GOVERNMENT, icon: Radio, label: 'Держ. хвиля', color: 'purple' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => toggleCategory(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all border ${
                  activeCategory === item.id 
                  ? `text-${item.color}-400 bg-${item.color}-500/10 border-${item.color}-500/30`
                  : 'text-slate-400 border-transparent hover:bg-white/5'
                }`}
              >
                <item.icon size={18} />
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="text-slate-400">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Київ</p>
                 <p className="text-xl font-black text-white">
                   {currentTime.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                 </p>
              </div>
              <RefreshCw size={18} className="text-slate-600 cursor-pointer" onClick={() => window.location.reload()} />
            </div>
          </div>
        </div>
      </aside>

      {/* Основний контент */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-12 lg:p-16 relative">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 pb-40">
          
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 animate-reveal">
            <div className="space-y-2 md:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest">
                UA ONLINE RP
              </div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter text-white leading-tight">
                {activeCategory === Category.MILITARY ? 'Контроль ВЧ' : 
                 activeCategory === Category.STATE_ORG ? 'Регламент' :
                 activeCategory === Category.LEADERS ? 'Лідери' : 'Рація'}
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

          {/* Пошук */}
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

          <div className="space-y-12">
            {filteredRules.length > 0 ? (
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

      {/* Панель результатів - Більш компактна для мобільних */}
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
