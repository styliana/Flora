import React from 'react';

export function CycleProgressRing({
  cycleDay,
  cycleLength = 28,
  phaseLabel,
  subtitle,
  pregnancyChance,
  isPeriod,
  isFertile,
  isPeakFertile,
  isLate,
  hasData,
  t,
}) {
  const size = 230;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate progress around the cycle circle
  const safeCycleLength = Math.max(20, cycleLength || 28);
  const currentDay = cycleDay || 1;
  const progressFraction = Math.min(1, Math.max(0, currentDay / safeCycleLength));
  const strokeDashoffset = circumference - progressFraction * circumference;

  // Determine stroke color
  let strokeColor = '#f472b6'; // soft pink
  let badgeBg = 'bg-pink-100 text-[#be185d]';

  if (isPeriod) {
    strokeColor = '#be185d'; // Dark Pink
    badgeBg = 'bg-pink-100 text-[#be185d] font-bold';
  } else if (isPeakFertile) {
    strokeColor = '#064e3b'; // Bold Bottle Green
    badgeBg = 'bg-emerald-100 text-[#064e3b] font-black';
  } else if (isFertile) {
    strokeColor = '#15803d'; // Bottle Green
    badgeBg = 'bg-green-100 text-[#15803d] font-bold';
  } else if (isLate) {
    strokeColor = '#d97706'; // Amber for late
    badgeBg = 'bg-amber-100 text-amber-900 font-bold';
  }

  // Calculate angle for indicator dot at the end of progress stroke
  // Starts at top (-90 deg)
  const angle = progressFraction * 360 - 90;
  const angleRad = (angle * Math.PI) / 180;
  const dotX = size / 2 + radius * Math.cos(angleRad);
  const dotY = size / 2 + radius * Math.sin(angleRad);

  return (
    <div className="relative flex items-center justify-center w-[230px] h-[230px] mx-auto select-none">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 origin-center"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#fce7f3"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Dynamic Progress Arc */}
        {hasData && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>

      {/* Tip Indicator Dot */}
      {hasData && (
        <div
          className="absolute w-4 h-4 rounded-full bg-white border-2 shadow-sm transition-all duration-700"
          style={{
            borderColor: strokeColor,
            left: `${dotX - 8}px`,
            top: `${dotY - 8}px`,
          }}
        />
      )}

      {/* Center Information Container */}
      <div className="absolute inset-4 rounded-full bg-white flex flex-col items-center justify-center p-3 text-center pointer-events-none">
        {hasData ? (
          <>
            {/* Phase Badge */}
            <span
              className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1 transition-colors ${badgeBg}`}
            >
              {phaseLabel}
            </span>

            {/* Cycle Day */}
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight my-0.5 leading-none">
              {cycleDay ? `${t.dayPrefix} ${cycleDay}` : t.today}
            </div>

            {/* Subtitle / Next Period countdown */}
            <p className="text-[11px] text-slate-500 font-medium max-w-[130px] leading-tight mt-1">
              {subtitle}
            </p>

            {/* Pregnancy chance */}
            <span className="text-[9px] text-slate-400 mt-2 font-medium">
              Szansa: <span className="font-semibold text-slate-700">{pregnancyChance}</span>
            </span>
          </>
        ) : (
          <div className="text-center px-3">
            <span className="w-8 h-8 rounded-full bg-pink-100 text-[#be185d] flex items-center justify-center mx-auto mb-1.5 text-sm">
              🌸
            </span>
            <p className="text-xs font-bold text-slate-800">{t.welcomeTitle}</p>
            <p className="text-[10px] text-pink-400 mt-0.5 leading-tight">{t.welcomeDesc}</p>
          </div>
        )}
      </div>
    </div>
  );
}
