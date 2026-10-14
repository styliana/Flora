import React, { useMemo } from 'react';
import { Droplet, Calendar as CalendarIcon, Clock, TrendingUp, Sparkles, Heart } from 'lucide-react';
import { parseDate } from '../utils/cycleEngine';
import { CycleProgressRing } from './CycleProgressRing';

export function TodayTab({
  todayInfo,
  onTogglePeriodToday,
  onOpenCalendar,
  onOpenDetailsForToday,
  t,
  lang = 'pl',
}) {
  const {
    hasData,
    cycleDay,
    cycleLength,
    daysToNextPeriod,
    phase,
    pregnancyChance,
    isPeriodToday,
    isFertileToday,
    isPeakFertileToday,
    nextPeriodDate,
    isCalculatedFromHistory,
    isLate,
    daysLate,
  } = todayInfo;

  const todayFormatted = useMemo(() => {
    const locale = lang === 'pl' ? 'pl-PL' : 'en-US';
    return new Date().toLocaleDateString(locale, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, [lang]);

  // Determine localized phase label
  const phaseLabel = isPeriodToday
    ? t.phaseMenstruation
    : isLate
    ? `${t.phaseLate} (${daysLate}d)`
    : isPeakFertileToday
    ? t.phaseOvulation
    : isFertileToday
    ? t.phaseFertile
    : phase === 'Luteal Phase'
    ? t.phaseLuteal
    : t.phaseFollicular;

  // Localized pregnancy chance
  const pregnancyChanceLabel = isPeakFertileToday
    ? t.chanceHighest
    : isFertileToday
    ? t.chanceHigh
    : isPeriodToday
    ? t.chanceLowPeriod
    : t.chanceLower;

  // Localized subtitle for center ring
  const ringSubtitle = isPeriodToday
    ? t.periodLoggedToday
    : isLate
    ? t.periodLateBy(daysLate)
    : daysToNextPeriod !== null && daysToNextPeriod > 0
    ? t.periodInDays(daysToNextPeriod)
    : daysToNextPeriod === 0
    ? t.periodDueToday
    : phase;

  // Daily physiological insight for the current phase
  const dailyInsight = isPeriodToday
    ? t.insightMenstruation
    : isLate
    ? t.insightLate
    : isPeakFertileToday
    ? t.insightOvulation
    : isFertileToday
    ? t.insightFertile
    : phase === 'Luteal Phase'
    ? t.insightLuteal
    : t.insightFollicular;

  return (
    <div className="flex flex-col space-y-5 pb-6 animate-in fade-in duration-200">
      {/* Date Header */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div>
          <span className="text-[11px] font-semibold text-pink-400 uppercase tracking-widest block">
            {t.today}
          </span>
          <h2 className="text-xl font-bold text-slate-900 capitalize tracking-tight">{todayFormatted}</h2>
        </div>
        <button
          onClick={onOpenCalendar}
          className="p-2 rounded-full bg-pink-50/70 hover:bg-pink-100 text-[#be185d] transition-colors shadow-2xs"
          title={t.calendar}
        >
          <CalendarIcon size={17} />
        </button>
      </div>

      {/* Signature Cycle Progress Ring */}
      <div className="flex flex-col items-center justify-center pt-1">
        <CycleProgressRing
          cycleDay={cycleDay}
          cycleLength={cycleLength}
          phaseLabel={phaseLabel}
          subtitle={ringSubtitle}
          pregnancyChance={pregnancyChanceLabel}
          isPeriod={isPeriodToday}
          isFertile={isFertileToday}
          isPeakFertile={isPeakFertileToday}
          isLate={isLate}
          hasData={hasData}
          t={t}
        />

        {/* 1-Tap Period Action Button */}
        <div className="w-full max-w-xs mt-5 space-y-2">
          <button
            onClick={onTogglePeriodToday}
            className={`w-full py-3.5 px-6 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-98 ${
              isPeriodToday
                ? 'bg-pink-50 text-[#be185d] border border-pink-200 hover:bg-pink-100'
                : 'bg-[#be185d] hover:bg-[#a2134e] text-white shadow-pink-600/20'
            }`}
          >
            <Droplet size={16} className={isPeriodToday ? 'fill-[#be185d]' : 'fill-white'} />
            <span>{isPeriodToday ? t.periodLoggedUndo : t.logPeriodForToday}</span>
          </button>

          <button
            onClick={onOpenDetailsForToday}
            className="w-full text-center text-[11px] text-pink-400/90 hover:text-pink-600 font-medium transition-colors pt-0.5 block"
          >
            {t.addSymptomsNotes}
          </button>
        </div>
      </div>

      {/* Daily Phase Insight Card */}
      {hasData && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50/60 to-white border border-pink-100/70 shadow-2xs flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-pink-100 text-[#be185d] flex items-center justify-center shrink-0 mt-0.5 text-xs">
            🌸
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#be185d] block">
              {phaseLabel}
            </span>
            <p className="text-xs text-slate-600 mt-0.5 leading-snug">
              {dailyInsight}
            </p>
          </div>
        </div>
      )}

      {/* Minimal Stats Row */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <div className="p-3.5 rounded-2xl bg-white border border-pink-100/70 shadow-2xs">
          <div className="flex items-center gap-1.5 text-pink-400 text-[11px] font-medium mb-1">
            <Clock size={13} />
            <span>{t.nextPeriod}</span>
          </div>
          <div className="text-base font-bold text-slate-800">
            {nextPeriodDate ? (
              parseDate(nextPeriodDate).toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US', {
                month: 'short',
                day: 'numeric',
              })
            ) : (
              '--'
            )}
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {isLate
              ? t.periodLateBy(daysLate)
              : daysToNextPeriod !== null && daysToNextPeriod >= 0
              ? t.periodInDays(daysToNextPeriod)
              : 'Auto-forecast'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-pink-100/70 shadow-2xs">
          <div className="flex items-center gap-1.5 text-pink-400 text-[11px] font-medium mb-1">
            <TrendingUp size={13} />
            <span>{t.cycleLength}</span>
          </div>
          <div className="text-base font-bold text-slate-800">
            {cycleLength} <span className="text-xs font-normal text-slate-400">{lang === 'pl' ? 'dni' : 'days'}</span>
          </div>
          <span className="text-[10px] text-slate-400 block truncate">
            {isCalculatedFromHistory ? t.learnedFromHistory : t.yourSetting}
          </span>
        </div>
      </div>
    </div>
  );
}
