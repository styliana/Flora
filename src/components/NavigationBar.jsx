import React from 'react';
import { Heart, CalendarDays, Sparkles, Database } from 'lucide-react';

export function NavigationBar({ currentTab, onSelectTab, t }) {
  const tabs = [
    { id: 'today', label: t?.today || 'today', icon: Heart },
    { id: 'calendar', label: t?.calendar || 'calendar', icon: CalendarDays },
    { id: 'predictions', label: t?.forecasts || 'forecast', icon: Sparkles },
    { id: 'backup', label: t?.backup || 'backup', icon: Database },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-white/95 backdrop-blur-md border-t border-pink-100/80 z-40 px-3 pt-2 flex items-center justify-around shadow-sm"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 14px)',
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              isActive
                ? 'text-[#be185d] font-semibold'
                : 'text-slate-400 hover:text-pink-400 font-normal'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-pink-50' : ''}`}>
              <Icon size={19} className={isActive ? 'stroke-[2.2]' : 'stroke-[1.7]'} />
            </div>
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
