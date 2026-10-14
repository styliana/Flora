import React from 'react';
import { X, Droplet, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { parseDate, getDayStatus, getTodayCycleInfo } from '../utils/cycleEngine';

export function DayDetailsModal({
  selectedDateStr,
  isOpen,
  onClose,
  predictions,
  isPeriod,
  onTogglePeriod,
  notes,
  onUpdateNotes,
  t,
  lang = 'pl',
}) {
  if (!isOpen || !selectedDateStr) return null;

  const dateObj = parseDate(selectedDateStr);
  const status = getDayStatus(selectedDateStr, predictions);
  const dateCycleInfo = getTodayCycleInfo(selectedDateStr, predictions);

  const formattedDateHeader = dateObj.toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const flows = ['Light', 'Medium', 'Heavy', 'Spotting'];
  const symptomsList = ['Cramps', 'Headache', 'Bloating', 'Tender Breasts', 'Acne', 'Fatigue', 'Mood'];

  const currentFlow = notes?.flow || null;
  const currentSymptoms = notes?.symptoms || [];

  const handleToggleSymptom = (symptom) => {
    const exists = currentSymptoms.includes(symptom);
    const updated = exists
      ? currentSymptoms.filter((s) => s !== symptom)
      : [...currentSymptoms, symptom];
    onUpdateNotes(selectedDateStr, { symptoms: updated });
  };

  const handleSelectFlow = (flow) => {
    const newFlow = currentFlow === flow ? null : flow;
    onUpdateNotes(selectedDateStr, { flow: newFlow });
  };

  const statusLabel = isPeriod
    ? (t?.periodRegistered || 'Period Registered')
    : status.isForecastPeriod
    ? (t?.forecastedPeriod || 'Forecasted Period')
    : status.isPeakFertile
    ? (t?.peakOvulationDay || 'Peak Ovulation Day')
    : status.isFertile
    ? (t?.fertileDay || 'Fertile Day')
    : (t?.regularDay || 'Regular Day');

  const pregnancyChanceLabel = status.isPeakFertile
    ? (t?.chanceHighest || 'Highest (Ovulation Day)')
    : status.isFertile
    ? (t?.chanceHigh || 'High (Fertile Window)')
    : isPeriod
    ? (t?.chanceLowPeriod || 'Low (Menstruation)')
    : (t?.chanceLower || 'Lower (Outside Fertile Window)');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/30 backdrop-blur-2xs transition-opacity animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[32px] shadow-xl max-h-[88vh] overflow-y-auto no-scrollbar border border-pink-100/80 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top drag handle */}
        <div className="w-10 h-1 bg-pink-100 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Header */}
        <div className="px-5 pt-3 pb-3 flex items-center justify-between border-b border-pink-50">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                {t?.dateDetails || 'Day Details'}
              </span>
              {dateCycleInfo.cycleDay && (
                <span className="text-[10px] font-bold bg-pink-100 text-[#be185d] px-2 py-0.2 rounded-full">
                  {t?.cycleDayLabel || 'Cycle Day'} {dateCycleInfo.cycleDay}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900">{formattedDateHeader}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-pink-50 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status Badge Box */}
          <div
            className={`p-3.5 rounded-2xl flex items-center justify-between border ${
              isPeriod
                ? 'bg-pink-50/70 border-pink-200 text-pink-950'
                : status.isForecastPeriod
                ? 'bg-pink-50/40 border-dashed border-pink-200 text-pink-900'
                : status.isPeakFertile
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : status.isFertile
                ? 'bg-green-50/60 border-green-200 text-green-950'
                : 'bg-slate-50/80 border-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-2xs ${
                  isPeriod
                    ? 'bg-[#be185d]'
                    : status.isForecastPeriod
                    ? 'bg-[#f472b6]'
                    : status.isPeakFertile
                    ? 'bg-[#064e3b]'
                    : status.isFertile
                    ? 'bg-[#15803d]'
                    : 'bg-slate-300'
                }`}
              >
                {isPeriod ? (
                  <Droplet size={15} className="fill-white" />
                ) : status.isForecastPeriod ? (
                  <Droplet size={14} />
                ) : status.isPeakFertile ? (
                  <Sparkles size={15} className="fill-white" />
                ) : status.isFertile ? (
                  <span className="text-xs">✦</span>
                ) : (
                  <CalendarIcon size={14} />
                )}
              </div>
              <div>
                <p className="font-bold text-xs leading-tight">
                  {statusLabel}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Szansa: <span className="font-semibold text-slate-600">{pregnancyChanceLabel}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Period Toggle Button */}
          <button
            onClick={() => onTogglePeriod(selectedDateStr)}
            className={`w-full py-3 px-5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-98 ${
              isPeriod
                ? 'bg-pink-50 text-[#be185d] border border-pink-200 hover:bg-pink-100'
                : 'bg-[#be185d] hover:bg-[#a2134e] text-white shadow-pink-600/20'
            }`}
          >
            <Droplet size={16} className={isPeriod ? 'fill-[#be185d]' : 'fill-white'} />
            <span>{isPeriod ? (t?.removePeriodBtn || '✓ Period Logged (Tap to Remove)') : (t?.tickPeriodBtn || '+ Tick / Add Period')}</span>
          </button>

          {/* Flow Intensity */}
          {isPeriod && (
            <div className="space-y-2 pt-1 border-t border-pink-50 animate-in fade-in duration-150">
              <label className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
                {t?.flowIntensity || 'Flow Intensity'}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {flows.map((flow) => {
                  const selected = currentFlow === flow;
                  const label = t?.flows?.[flow] || flow;
                  return (
                    <button
                      key={flow}
                      onClick={() => handleSelectFlow(flow)}
                      className={`py-1.5 px-1 text-[11px] font-medium rounded-xl border text-center transition-all ${
                        selected
                          ? 'bg-[#be185d] text-white border-[#be185d] font-bold shadow-2xs'
                          : 'bg-white hover:bg-pink-50 text-slate-600 border-pink-100'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Symptoms and Moods */}
          <div className="space-y-2 pt-1 border-t border-pink-50">
            <label className="text-[10px] font-bold uppercase tracking-wider text-pink-400">
              {t?.symptomsTitle || 'Quick Symptoms'}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {symptomsList.map((symptom) => {
                const active = currentSymptoms.includes(symptom);
                const label = t?.symptoms?.[symptom] || symptom;
                return (
                  <button
                    key={symptom}
                    onClick={() => handleToggleSymptom(symptom)}
                    className={`py-1 px-2.5 rounded-full text-[11px] font-medium border transition-all ${
                      active
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white hover:bg-pink-50 text-slate-600 border-pink-100'
                    }`}
                  >
                    {active ? `✓ ${label}` : `+ ${label}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-3 bg-pink-50/30 border-t border-pink-50 flex justify-end"
          style={{
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 14px)',
          }}
        >
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition-colors"
          >
            {t?.doneBtn || 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
