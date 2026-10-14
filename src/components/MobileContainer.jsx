import React, { useState } from 'react';
import { Smartphone, Monitor, Globe } from 'lucide-react';

export function MobileContainer({
  children,
  appName = 'flora',
  lang = 'pl',
  onToggleLanguage,
  t,
}) {
  const [deviceFrame, setDeviceFrame] = useState(true);

  return (
    <div className="min-h-screen bg-[#faf5f7] flex flex-col items-center justify-start sm:py-6 sm:px-4 select-none">
      {/* Top Device switcher bar for desktop users */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-sm mb-2.5 px-3 text-[11px] text-pink-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#be185d]" />
          <span className="text-pink-900/60 font-semibold lowercase">flora preview</span>
        </div>
        <button
          onClick={() => setDeviceFrame(!deviceFrame)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-pink-700/70 hover:text-pink-900 border border-pink-100 shadow-2xs transition-colors"
        >
          {deviceFrame ? <Monitor size={12} /> : <Smartphone size={12} />}
          <span>{deviceFrame ? 'Expand' : 'Phone'}</span>
        </button>
      </div>

      {/* Main App Container */}
      <div
        className={`w-full bg-white text-slate-800 flex flex-col relative transition-all ${
          deviceFrame
            ? 'max-w-sm sm:min-h-[820px] sm:max-h-[92vh] sm:rounded-[36px] sm:border sm:border-pink-100 sm:shadow-2xl sm:shadow-pink-950/5 overflow-y-auto no-scrollbar'
            : 'max-w-md min-h-screen shadow-sm'
        }`}
      >
        {/* Dynamic Safe Header */}
        <header
          className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-5 pb-2.5 flex items-center justify-between border-b border-pink-50"
          style={{
            paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#be185d] shadow-xs" />
            <h1 className="font-bold text-xl tracking-tight text-slate-900 font-serif lowercase">
              {appName}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher Pill */}
            {onToggleLanguage && (
              <button
                onClick={onToggleLanguage}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-pink-50 text-[#be185d] hover:bg-pink-100/70 transition-colors border border-pink-100 flex items-center gap-1"
                title="Switch Language (PL / EN)"
              >
                <Globe size={10} />
                <span>{lang === 'pl' ? 'PL' : 'EN'}</span>
              </button>
            )}

            <span className="text-[10px] font-medium text-pink-400/80 tracking-wide">
              {t?.appSubtitle || 'offline • private'}
            </span>
          </div>
        </header>

        {/* Tab content area */}
        <main
          className="flex-1 p-4 overflow-y-auto no-scrollbar bg-white"
          style={{
            paddingBottom: 'calc(80px + max(env(safe-area-inset-bottom, 0px), 16px))',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
