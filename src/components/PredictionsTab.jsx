import React from 'react';
import {
  Sparkles,
  Clock,
  Info,
} from 'lucide-react';
import { parseDate, diffDays } from '../utils/cycleEngine';

export function PredictionsTab({
  predictions,
  todayStr,
  t,
  lang = 'pl',
}) {
  const { stats, futurePredictions } = predictions;
  const { cycleLength, periodLength, isCalculatedFromHistory, historicalIntervalsCount, episodes } = stats;

  const locale = lang === 'pl' ? 'pl-PL' : 'en-US';

  const formatShortDate = (dateStr) => {
    if (!dateStr) return '';
    const d = parseDate(dateStr);
    return d.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col space-y-4 pb-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="px-1 pt-1">
        <span className="text-[11px] font-semibold text-pink-400 uppercase tracking-widest block">{t?.forecasts || 'Forecasts'}</span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t?.forecastsTitle || 'Cycle Predictions'}</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {t?.forecastsSubtitle || 'Based on standard 14-day luteal phase biology & your cycle history.'}
        </p>
      </div>

      {/* Baseline Summary */}
      <div className="bg-white rounded-3xl p-4 border border-pink-100/70 shadow-2xs space-y-3">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 bg-pink-50/40 rounded-2xl border border-pink-100/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t?.periodLength || 'Period Duration'}</span>
            <span className="text-xl font-bold text-[#be185d]">{periodLength}</span>
            <span className="text-[10px] text-slate-400 block">{lang === 'pl' ? 'dni' : 'days'}</span>
          </div>
          <div className="p-2.5 bg-green-50/40 rounded-2xl border border-green-100/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{t?.cycleLength || 'Cycle Length'}</span>
            <span className="text-xl font-bold text-[#15803d]">{cycleLength}</span>
            <span className="text-[10px] text-slate-400 block">{lang === 'pl' ? 'dni' : 'days'}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center leading-relaxed">
          {isCalculatedFromHistory
            ? (lang === 'pl'
                ? `✓ Personalizacja: Średnia obliczona z ${historicalIntervalsCount} zarejestrowanych cykli.`
                : `✓ Personalized: Automatically calculated from ${historicalIntervalsCount} cycle interval(s).`)
            : (lang === 'pl'
                ? `Używane ustawienie bazowe: ${cycleLength} dni. Możesz zmienić w zakładce Kopia i dane.`
                : `Using your custom setting of ${cycleLength} days. Set anytime in Backup & Settings tab.`)}
        </p>
      </div>

      {/* Upcoming Cycles Forecast List */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#be185d]" />
            {t?.upcomingCycles || 'Upcoming Forecasts'}
          </span>
          <span className="text-[10px] text-slate-400">{t?.next6Cycles || 'Next 6 cycles'}</span>
        </div>

        {futurePredictions.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center border border-pink-100/60 shadow-2xs">
            <p className="text-xs font-semibold text-slate-700">{lang === 'pl' ? 'Brak danych do prognozy' : 'No predictions yet'}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{lang === 'pl' ? 'Zaznacz okres w kalendarzu, aby wygenerować prognozę.' : 'Log your period to project upcoming cycles.'}</p>
          </div>
        ) : (
          futurePredictions.map((cycle, idx) => {
            const daysUntilPeriod = diffDays(todayStr, cycle.startDate);

            return (
              <div
                key={cycle.startDate}
                className="bg-white rounded-3xl p-4 border border-pink-100/70 shadow-2xs space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-pink-50 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                      {idx === 0 ? (t?.nextCycle || 'Next Cycle') : (t?.cycleNum ? t.cycleNum(cycle.cycleNumber) : `Cycle #${cycle.cycleNumber}`)}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 capitalize">
                      {parseDate(cycle.startDate).toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-pink-50 text-[#be185d]">
                    {daysUntilPeriod > 0
                      ? (t?.inDaysShort ? t.inDaysShort(daysUntilPeriod) : `In ${daysUntilPeriod}d`)
                      : daysUntilPeriod === 0
                      ? (t?.dueTodayShort || 'Due today')
                      : (t?.daysAgoShort ? t.daysAgoShort(Math.abs(daysUntilPeriod)) : `${Math.abs(daysUntilPeriod)}d ago`)}
                  </span>
                </div>

                {/* Period forecast */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-pink-50/40 border border-pink-100/60">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#be185d] shrink-0" />
                    <div>
                      <span className="text-[11px] font-semibold text-[#be185d] block leading-tight">
                        {t?.legendForecast || 'Forecasted Period'}
                      </span>
                      <span className="text-xs text-slate-700 font-medium">
                        {formatShortDate(cycle.startDate)} –{' '}
                        {formatShortDate(cycle.periodDays[cycle.periodDays.length - 1])}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{periodLength} {lang === 'pl' ? 'dni' : 'days'}</span>
                </div>

                {/* Fertile Window */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-green-50/30 border border-green-100">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#e8f5e9] border border-[#15803d] shrink-0" />
                    <div>
                      <span className="text-[11px] font-semibold text-[#15803d] block leading-tight">
                        {t?.phaseFertile || 'Fertile Window'}
                      </span>
                      <span className="text-xs text-slate-700 font-medium">
                        {formatShortDate(cycle.fertileStart)} – {formatShortDate(cycle.fertileEnd)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#15803d]">{t?.chanceHigh || 'High chance'}</span>
                </div>

                {/* Main Fertile Day (Ovulation) */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/50 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#064e3b] text-amber-300 text-[8px] flex items-center justify-center font-bold shrink-0">
                      ★
                    </span>
                    <div>
                      <span className="text-[11px] font-bold text-[#064e3b] block leading-tight">
                        {t?.phaseOvulation || 'Main Fertile Day (Peak Ovulation)'}
                      </span>
                      <span className="text-xs text-slate-900 font-bold capitalize">
                        {parseDate(cycle.ovulationDate).toLocaleDateString(locale, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#064e3b] bg-emerald-100 px-1.5 py-0.5 rounded-full">
                    ★ {lang === 'pl' ? 'Szczyt' : 'Peak'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* History */}
      {episodes.length > 0 && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 px-1">
            <Clock size={13} className="text-slate-400" />
            {t?.recordedPeriodsHistory || 'Recorded Periods History'} ({episodes.length})
          </span>

          <div className="bg-white rounded-3xl p-3 border border-pink-100/70 shadow-2xs divide-y divide-pink-50">
            {episodes.slice().reverse().map((ep) => (
              <div key={ep.startDate} className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    {formatShortDate(ep.startDate)} – {formatShortDate(ep.endDate)}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {ep.duration} {lang === 'pl' ? 'dni krwawienia' : 'bleeding days'} ({ep.loggedCount} {lang === 'pl' ? 'zapisanych' : 'ticked'})
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#be185d] bg-pink-50 px-2 py-0.5 rounded-full">
                  {lang === 'pl' ? 'Zapisany' : 'Recorded'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Safety Disclaimer */}
      <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-2.5">
        <Info size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-500 leading-relaxed">
          {t?.medicalNote || (
            <>
              <strong>Medical Note:</strong> Menstrual cycle predictions and fertile windows are statistical estimates based on clinical luteal phase models. Biological ovulation can naturally fluctuate due to stress, illness, or hormonal shifts. Do not use this app as a standalone method of contraception.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
