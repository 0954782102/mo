
import React, { useState, useMemo } from 'react';
import { Search, Shield, Sword, FileText, ChevronRight, Menu, X, Info, Radio, Building2 } from 'lucide-react';
import { Category, Rule, RuleSection } from './types';
import { RULES_DATA } from './constants';

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.MILITARY);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredRules = useMemo(() => {
    const currentSections = RULES_DATA[activeCategory];
    if (!searchQuery) return currentSections;

    const lowerQuery = searchQuery.toLowerCase();
    return currentSections.map(section => ({
      ...section,
      rules: section.rules.filter(rule => 
        rule.id.toLowerCase().includes(lowerQuery) || 
        rule.text.toLowerCase().includes(lowerQuery) || 
        (rule.punishment && rule.punishment.toLowerCase().includes(lowerQuery)) ||
        (rule.note && rule.note.toLowerCase().includes(lowerQuery))
      )
    })).filter(section => section.rules.length > 0);
  }, [activeCategory, searchQuery]);

  const toggleCategory = (cat: Category) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setIsSidebarOpen(false);
  };

  const getCategoryTheme = (cat: Category) => {
    switch (cat) {
      case Category.MILITARY: return 'text-red-400 bg-red-500/10 border-red-500/20';
      case Category.LEADERS: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case Category.GOVERNMENT: return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case Category.STATE_ORG: return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row overflow-hidden text-zinc-100">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-zinc-100">UA ONLINE Rules</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:relative inset-0 z-40 md:z-auto
        w-full md:w-72 lg:w-80 bg-zinc-900 border-r border-zinc-800 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 h-full flex flex-col">
          <div className="hidden md:flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">UA ONLINE</h1>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Rulebook v2.5</p>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
            <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">Навігація</p>
            
            <button
              onClick={() => toggleCategory(Category.MILITARY)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border ${
                activeCategory === Category.MILITARY 
                ? getCategoryTheme(Category.MILITARY)
                : 'text-zinc-400 border-transparent hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Sword size={20} className={activeCategory === Category.MILITARY ? 'text-red-400' : 'text-zinc-500'} />
              <span className="font-semibold text-sm">Напад на ВЧ</span>
            </button>

            <button
              onClick={() => toggleCategory(Category.STATE_ORG)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border ${
                activeCategory === Category.STATE_ORG 
                ? getCategoryTheme(Category.STATE_ORG)
                : 'text-zinc-400 border-transparent hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Building2 size={20} className={activeCategory === Category.STATE_ORG ? 'text-cyan-400' : 'text-zinc-500'} />
              <span className="font-semibold text-sm text-left leading-tight">Держ. організації</span>
            </button>

            <button
              onClick={() => toggleCategory(Category.LEADERS)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border ${
                activeCategory === Category.LEADERS 
                ? getCategoryTheme(Category.LEADERS)
                : 'text-zinc-400 border-transparent hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <FileText size={20} className={activeCategory === Category.LEADERS ? 'text-blue-400' : 'text-zinc-500'} />
              <span className="font-semibold text-sm text-left leading-tight">Лідери / Заступники</span>
            </button>

            <button
              onClick={() => toggleCategory(Category.GOVERNMENT)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border ${
                activeCategory === Category.GOVERNMENT 
                ? getCategoryTheme(Category.GOVERNMENT)
                : 'text-zinc-400 border-transparent hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <Radio size={20} className={activeCategory === Category.GOVERNMENT ? 'text-purple-400' : 'text-zinc-500'} />
              <span className="font-semibold text-sm text-left leading-tight">Держ. Хвиля / Рація</span>
            </button>
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-800">
             <div className="p-4 rounded-xl bg-zinc-800/50 text-[10px] text-zinc-400 flex items-start gap-3">
               <Info size={14} className="mt-0.5 shrink-0" />
               <p>Сайт створено для швидкого доступу до правил UA Online. Дані відповідають офіційним розділам Discord.</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-zinc-950 p-4 md:p-10 lg:p-16">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Hero Section */}
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              {activeCategory === Category.MILITARY && 'Напад на Військову Частину'}
              {activeCategory === Category.LEADERS && 'Правила Лідерів та Заступників'}
              {activeCategory === Category.GOVERNMENT && 'Держ. Хвиля / Рація департаменту'}
              {activeCategory === Category.STATE_ORG && 'Правила державних організацій'}
            </h2>
            <p className="text-zinc-500 text-sm md:text-base max-w-2xl">
              Використовуйте пошук нижче, щоб швидко знайти конкретне правило за номером або ключовими словами.
            </p>
          </div>

          {/* Search Bar */}
          <div className="sticky top-0 md:relative z-20 -mx-4 md:mx-0 px-4 md:px-0 bg-zinc-950 py-2 md:py-0">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={20} className="text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук (напр. 'Jail', 'Міранда', '1.5')..."
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 pl-12 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-base shadow-xl shadow-black/20"
              />
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-12 pb-20">
            {filteredRules.length > 0 ? (
              filteredRules.map((section, idx) => (
                <section key={idx} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className={`h-6 w-1 rounded-full ${
                      activeCategory === Category.MILITARY ? 'bg-red-500' :
                      activeCategory === Category.LEADERS ? 'bg-blue-500' : 
                      activeCategory === Category.STATE_ORG ? 'bg-cyan-500' : 'bg-purple-500'
                    }`}></div>
                    <h3 className="text-xl font-bold tracking-tight text-zinc-200">{section.title}</h3>
                  </div>
                  <div className="grid gap-4">
                    {section.rules.map((rule) => (
                      <RuleItem key={rule.id} rule={rule} category={activeCategory} />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-600 space-y-4">
                <Search size={48} strokeWidth={1.5} />
                <p className="text-lg font-medium">Нічого не знайдено за вашим запитом</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-blue-500 hover:text-blue-400 transition-colors text-sm font-semibold"
                >
                  Очистити пошук
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const RuleItem: React.FC<{ rule: Rule; category: Category }> = ({ rule, category }) => {
  const getLabelStyle = () => {
    switch (category) {
      case Category.MILITARY: return 'bg-red-500/10 text-red-400';
      case Category.LEADERS: return 'bg-blue-500/10 text-blue-400';
      case Category.GOVERNMENT: return 'bg-purple-500/10 text-purple-400';
      case Category.STATE_ORG: return 'bg-cyan-500/10 text-cyan-400';
      default: return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="rule-card group bg-zinc-900 border border-zinc-800 p-5 rounded-2xl hover:bg-zinc-800/80 hover:border-zinc-700/50 transition-all">
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className={`
          px-3 py-1 rounded-lg font-bold text-xs shrink-0 mt-0.5
          ${getLabelStyle()}
        `}>
          #{rule.id}
        </div>
        <div className="flex-1 space-y-3">
          <p className="text-zinc-200 leading-relaxed font-medium">
            {rule.text}
          </p>
          
          {(rule.punishment || rule.note) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {rule.punishment && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 border border-red-900/30 text-red-500 text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  Покарання: {rule.punishment}
                </div>
              )}
              {rule.note && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 text-[11px] font-medium italic">
                   Примітка: {rule.note}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
