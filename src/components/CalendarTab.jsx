import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ListFilter,
} from 'lucide-react';
import {
  formatDate,
  getDayStatus,
} from '../utils/cycleEngine';

export function CalendarTab({
  predictions,
  todayStr,
  onTogglePeriod,
  onSelectDate,
  dayNotes,
  t,
  lang = 'pl',
}) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [calendarViewMode, setCalendarViewMode] = useState('month');
  const [quickTickMode, setQuickTickMode] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US', {
    month: 'long',
    year: 'numeric',
  });

  const getMonthDays = (y, m) => {
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Preceding padding days
    for (let i = startDayOfWeek; i > 0; i--) {
      const prevDate = new Date(y, m, 1 - i);
      days.push({
        dateStr: formatDate(prevDate),
        dayNum: prevDate.getDate(),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currDate = new Date(y, m, day);
      days.push({
        dateStr: formatDate(currDate),
        dayNum: day,
        isCurrentMonth: true,
      });
    }

    // Trailing padding days
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        const nextDate = new Date(y, m + 1, i);
        days.push({
          dateStr: formatDate(nextDate),
          dayNum: nextDate.getDate(),
          isCurrentMonth: false,
        });
      }
    }

    return days;
  };

  const currentMonthDays = useMemo(() => getMonthDays(year, month), [year, month]);

  const continuousMonths = useMemo(() => {
    const months = [];
    const base = new Date();
    for (let offset = -2; offset <= 6; offset++) {
      const target = new Date(base.getFullYear(), base.getMonth() + offset, 1);
      months.push({
        year: target.getFullYear(),
        month: target.getMonth(),
        isCurrent: offset === 0,
        label: target.toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US', { month: 'long', year: 'numeric' }),
        days: getMonthDays(target.getFullYear(), target.getMonth()),
      });
    }
    return months;
  }, [lang]);

  const handleDayClick = (dateStr) => {
    if (quickTickMode) {
      onTogglePeriod(dateStr);
    } else {
      onSelectDate(dateStr);
    }
  };

  // Render day cell in minimalist aesthetic
  const renderDayCell = (day) => {
    const { dateStr, dayNum, isCurrentMonth } = day;
    const status = getDayStatus(dateStr, predictions);
    const isToday = dateStr === todayStr;
    const hasNote = dayNotes && dayNotes[dateStr];

    let badgeClasses = 'w-9 h-9 flex items-center justify-center rounded-full text-xs transition-all relative select-none ';

    if (status.isRegisteredPeriod) {
      // Period: Dark Pink solid
      badgeClasses += 'bg-[#be185d] text-white font-bold shadow-xs';
    } else if (status.isForecastPeriod) {
      // Forecast: Dark Pink dashed outline
      badgeClasses += 'border border-dashed border-[#be185d] bg-pink-50/50 text-[#be185d] font-semibold';
    } else if (status.isPeakFertile) {
      // Main fertile day: Bold Bottle Green
      badgeClasses += 'bg-[#064e3b] text-white font-black ring-2 ring-[#064e3b]/20 shadow-xs';
    } else if (status.isFertile) {
      // Fertile day: Bottle Green
      badgeClasses += 'bg-[#e8f5e9] text-[#15803d] border border-[#15803d]/30 font-semibold';
    } else {
      // Regular day: Gray
      if (isCurrentMonth) {
        badgeClasses += 'text-slate-600 hover:bg-pink-50/40 font-normal';
      } else {
        badgeClasses += 'text-slate-300 font-light';
      }
    }

    if (isToday) {
      badgeClasses += ' ring-2 ring-pink-400 ring-offset-1';
    }

    return (
      <div
        key={dateStr}
        onClick={() => handleDayClick(dateStr)}
        className="flex flex-col items-center justify-center h-11 w-full cursor-pointer py-0.5"
      >
        <div className={badgeClasses}>
          {dayNum}
          {status.isPeakFertile && (
            <span className="absolute -top-1 -right-0.5 text-[8px] text-amber-300 font-bold">★</span>
          )}
        </div>
        {hasNote && (
          <span className="w-1 h-1 rounded-full bg-pink-400 mt-0.5 block" />
        )}
      </div>
    );
  };

  const weekDayHeaders = lang === 'pl'
    ? ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <div className="flex flex-col space-y-4 pb-6 animate-in fade-in duration-200">
      {/* Month Navigation & Controls */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-full hover:bg-pink-50 text-slate-500 hover:text-[#be185d] transition-colors"
            aria-label="Previous Month"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-base font-bold text-slate-900 capitalize min-w-[130px] text-center">
            {monthName}
          </h2>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-full hover:bg-pink-50 text-slate-500 hover:text-[#be185d] transition-colors"
            aria-label="Next Month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={jumpToToday}
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#be185d] bg-pink-50 hover:bg-pink-100/70 transition-colors"
          >
            {t.today}
          </button>
          <button
            onClick={() => setCalendarViewMode((v) => (v === 'month' ? 'vertical' : 'month'))}
            className={`p-1.5 rounded-full transition-colors ${
              calendarViewMode === 'vertical'
                ? 'bg-[#be185d] text-white'
                : 'text-slate-400 hover:text-slate-600 hover:bg-pink-50'
            }`}
            title="Toggle Continuous Scroll"
          >
            <ListFilter size={15} />
          </button>
        </div>
      </div>

      {/* Minimalist Quick Tick Switch */}
      <div className="bg-pink-50/50 rounded-2xl px-3.5 py-2 flex items-center justify-between border border-pink-100/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">{t.quickMode}</span>
          {quickTickMode && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#be185d] bg-pink-100 px-1.5 py-0.5 rounded-full">
              {t.quickModeOn}
            </span>
          )}
        </div>
        <button
          onClick={() => setQuickTickMode(!quickTickMode)}
          className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
            quickTickMode ? 'bg-[#be185d]' : 'bg-slate-200'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
              quickTickMode ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {quickTickMode && (
        <p className="text-[11px] text-[#be185d] font-medium bg-pink-50 p-2 rounded-xl text-center">
          {t.quickModeActiveNote}
        </p>
      )}

      {/* Calendar Grid */}
      {calendarViewMode === 'month' ? (
        <div className="bg-white rounded-3xl p-3 border border-pink-100/60 shadow-xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center mb-1">
            {weekDayHeaders.map((day) => (
              <span key={day} className="text-[11px] font-medium text-slate-400 py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {currentMonthDays.map(renderDayCell)}
          </div>
        </div>
      ) : (
        /* Continuous Vertical Scroll View */
        <div className="space-y-4">
          {continuousMonths.map((m) => (
            <div key={`${m.year}-${m.month}`} className="bg-white rounded-3xl p-3 border border-pink-100/60 shadow-xs">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-xs font-bold text-slate-800">{m.label}</span>
                {m.isCurrent && (
                  <span className="text-[10px] text-[#be185d] font-semibold bg-pink-50 px-2 py-0.5 rounded-full">
                    {t.today}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-7 text-center mb-1">
                {weekDayHeaders.map((day) => (
                  <span key={day} className="text-[10px] font-medium text-slate-400 py-0.5">
                    {day}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-0.5">
                {m.days.map(renderDayCell)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Minimalist Legend (Compact Chips) */}
      <div className="pt-1">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-pink-50/40 border border-pink-100/60">
            <span className="w-4 h-4 rounded-full bg-[#be185d] inline-block shrink-0 shadow-2xs" />
            <span className="text-slate-700 font-medium">{t.legendPeriod}</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-pink-50/20 border border-pink-100/60">
            <span className="w-4 h-4 rounded-full border border-dashed border-[#be185d] bg-pink-50 inline-block shrink-0" />
            <span className="text-slate-700 font-medium">{t.legendForecast}</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-green-50/30 border border-green-100">
            <span className="w-4 h-4 rounded-full bg-[#e8f5e9] border border-[#15803d] inline-block shrink-0" />
            <span className="text-slate-700 font-medium">{t.legendFertile}</span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/40 border border-emerald-200">
            <span className="w-4 h-4 rounded-full bg-[#064e3b] text-amber-300 text-[8px] flex items-center justify-center font-bold inline-block shrink-0 leading-none">
              ★
            </span>
            <span className="text-slate-800 font-semibold">{t.legendPeak}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
