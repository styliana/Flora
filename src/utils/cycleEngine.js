// cycleEngine.js - Menstrual cycle forecasting and fertile window calculations
// Clinically based on ACOG (American College of Obstetricians and Gynecologists) and WHO reproductive endocrinology standards.

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;
export const LUTEAL_PHASE_DAYS = 14; // Standard clinical luteal phase: ovulation occurs ~14 days before next period start
export const FERTILE_WINDOW_DAYS_BEFORE_OVULATION = 5; // Sperm lifespan in fertile cervical mucus is up to 5 days
export const MIN_PLAUSIBLE_CYCLE_DAYS = 18;
export const MAX_PLAUSIBLE_CYCLE_DAYS = 50;

/**
 * Format Date object to 'YYYY-MM-DD' in local timezone
 */
export function formatDate(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse 'YYYY-MM-DD' string to Date object at local midnight
 */
export function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) return null;
  const [year, month, day] = parts.map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  const d = new Date(year, month - 1, day, 0, 0, 0, 0);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Add days to a Date object or 'YYYY-MM-DD' string
 */
export function addDays(date, days) {
  const d = typeof date === 'string' ? parseDate(date) : new Date(date);
  if (!d) return null;
  d.setDate(d.getDate() + Number(days));
  return d;
}

/**
 * Difference in whole calendar days (dateStr2 - dateStr1)
 */
export function diffDays(dateStr1, dateStr2) {
  const d1 = parseDate(dateStr1);
  const d2 = parseDate(dateStr2);
  if (!d1 || !d2) return 0;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((d2.getTime() - d1.getTime()) / msPerDay);
}

/**
 * Group registered period days into distinct episodes.
 * Bleeding days separated by <= 2 days (spotting or 1-day pause) belong to the same episode.
 */
export function groupPeriodEpisodes(periodDaysArray) {
  if (!periodDaysArray || !Array.isArray(periodDaysArray) || periodDaysArray.length === 0) {
    return [];
  }

  // Filter valid YYYY-MM-DD dates and deduplicate
  const validDates = periodDaysArray
    .filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.trim()) && parseDate(d.trim()) !== null)
    .map(d => d.trim());

  if (validDates.length === 0) return [];

  const sorted = Array.from(new Set(validDates)).sort();
  const episodes = [];

  let currentEpisodeDays = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = currentEpisodeDays[currentEpisodeDays.length - 1];
    const currDate = sorted[i];
    const gap = diffDays(prevDate, currDate);

    // If dates are consecutive (gap === 1) or have a 1-day pause/spotting gap (gap === 2)
    if (gap <= 2) {
      currentEpisodeDays.push(currDate);
    } else {
      episodes.push(finishEpisode(currentEpisodeDays));
      currentEpisodeDays = [currDate];
    }
  }

  if (currentEpisodeDays.length > 0) {
    episodes.push(finishEpisode(currentEpisodeDays));
  }

  return episodes;
}

function finishEpisode(days) {
  const startDate = days[0];
  const endDate = days[days.length - 1];
  const span = diffDays(startDate, endDate) + 1;
  return {
    startDate,
    endDate,
    days,
    loggedCount: days.length,
    duration: Math.max(span, days.length),
  };
}

/**
 * Calculate cycle stats based on history and settings.
 * Transparently reveals whether cycle length is auto-calculated or user baseline.
 */
export function calculateCycleStats(periodDaysArray, userSettings = {}) {
  const episodes = groupPeriodEpisodes(periodDaysArray);

  // Manual baseline settings chosen by user (or defaults)
  const manualCycle = Number(userSettings.cycleLength) || DEFAULT_CYCLE_LENGTH;
  const manualPeriod = Number(userSettings.periodLength) || DEFAULT_PERIOD_LENGTH;
  const autoDetect = userSettings.autoDetect !== false; // defaults to true

  let computedCycleLength = manualCycle;
  let computedPeriodLength = manualPeriod;

  // Calculate average period duration from logged episodes
  if (episodes.length > 0 && autoDetect) {
    const totalDuration = episodes.reduce((acc, ep) => acc + ep.duration, 0);
    const avgDuration = Math.round(totalDuration / episodes.length);
    // Clinical clamp: period bleeding typically 2 to 10 days
    computedPeriodLength = Math.max(2, Math.min(10, avgDuration));
  }

  // Calculate cycle intervals between consecutive episode start dates
  const validIntervals = [];
  const allIntervals = [];

  if (episodes.length >= 2) {
    for (let i = 0; i < episodes.length - 1; i++) {
      const interval = diffDays(episodes[i].startDate, episodes[i + 1].startDate);
      allIntervals.push(interval);
      // Valid menstrual cycles are typically between 18 and 50 days (ACOG)
      // Long gaps (e.g. 90 days of missed logging) must NOT corrupt regular cycle length
      if (interval >= MIN_PLAUSIBLE_CYCLE_DAYS && interval <= MAX_PLAUSIBLE_CYCLE_DAYS) {
        validIntervals.push(interval);
      }
    }

    if (autoDetect && validIntervals.length > 0) {
      const avgInterval = validIntervals.reduce((a, b) => a + b, 0) / validIntervals.length;
      computedCycleLength = Math.max(21, Math.min(45, Math.round(avgInterval)));
    }
  }

  return {
    episodes,
    cycleLength: computedCycleLength,
    periodLength: computedPeriodLength,
    manualCycleLength: manualCycle,
    manualPeriodLength: manualPeriod,
    autoDetect,
    isCalculatedFromHistory: autoDetect && validIntervals.length > 0,
    validIntervals,
    allIntervals,
    historicalIntervalsCount: validIntervals.length,
    latestEpisode: episodes.length > 0 ? episodes[episodes.length - 1] : null,
  };
}

/**
 * Generate cycle predictions and fertile windows.
 * Every cycle correctly groups its own period, fertile window, and ovulation day.
 */
export function getCyclePredictions(periodDaysArray, userSettings = {}, forecastCyclesCount = 6) {
  const stats = calculateCycleStats(periodDaysArray, userSettings);
  const { episodes, cycleLength, periodLength, latestEpisode } = stats;

  const pastCycleData = [];
  const futurePredictions = [];

  // 1. Process past completed cycles
  if (episodes.length >= 2) {
    for (let i = 0; i < episodes.length - 1; i++) {
      const currentEp = episodes[i];
      const nextEp = episodes[i + 1];

      // Clinically: Ovulation occurs ~14 days BEFORE next period start
      const ovulationDate = formatDate(addDays(nextEp.startDate, -LUTEAL_PHASE_DAYS));
      const fertileStart = formatDate(addDays(ovulationDate, -FERTILE_WINDOW_DAYS_BEFORE_OVULATION));

      const fertileDays = [];
      for (let d = -FERTILE_WINDOW_DAYS_BEFORE_OVULATION; d <= 0; d++) {
        fertileDays.push(formatDate(addDays(ovulationDate, d)));
      }

      pastCycleData.push({
        cycleIndex: i + 1,
        startDate: currentEp.startDate,
        endDate: formatDate(addDays(nextEp.startDate, -1)),
        periodDays: currentEp.days,
        ovulationDate,
        fertileStart,
        fertileEnd: ovulationDate,
        fertileDays,
      });
    }
  }

  // 2. Current active cycle and future projections
  let currentCycleData = null;

  if (latestEpisode) {
    // Current cycle starts at latestEpisode.startDate
    const currentStart = latestEpisode.startDate;
    const nextPredictedStart = formatDate(addDays(currentStart, cycleLength));
    const currentOvulationDate = formatDate(addDays(nextPredictedStart, -LUTEAL_PHASE_DAYS));
    const currentFertileStart = formatDate(addDays(currentOvulationDate, -FERTILE_WINDOW_DAYS_BEFORE_OVULATION));

    const currentFertileDays = [];
    for (let d = -FERTILE_WINDOW_DAYS_BEFORE_OVULATION; d <= 0; d++) {
      currentFertileDays.push(formatDate(addDays(currentOvulationDate, d)));
    }

    currentCycleData = {
      startDate: currentStart,
      periodDays: latestEpisode.days,
      nextPeriodStartDate: nextPredictedStart,
      ovulationDate: currentOvulationDate,
      fertileStart: currentFertileStart,
      fertileEnd: currentOvulationDate,
      fertileDays: currentFertileDays,
    };

    // Project future cycles (Cycles starting from nextPredictedStart forward)
    let projectionBaseStart = nextPredictedStart;

    for (let cycleNum = 1; cycleNum <= forecastCyclesCount; cycleNum++) {
      const cycleStart = projectionBaseStart;
      const subsequentCycleStart = formatDate(addDays(cycleStart, cycleLength));
      const ovulationDate = formatDate(addDays(subsequentCycleStart, -LUTEAL_PHASE_DAYS));
      const fertileStart = formatDate(addDays(ovulationDate, -FERTILE_WINDOW_DAYS_BEFORE_OVULATION));

      const periodDays = [];
      for (let p = 0; p < periodLength; p++) {
        periodDays.push(formatDate(addDays(cycleStart, p)));
      }

      const fertileDays = [];
      for (let f = -FERTILE_WINDOW_DAYS_BEFORE_OVULATION; f <= 0; f++) {
        fertileDays.push(formatDate(addDays(ovulationDate, f)));
      }

      futurePredictions.push({
        cycleNumber: cycleNum,
        startDate: cycleStart,
        endDate: formatDate(addDays(subsequentCycleStart, -1)),
        periodDays,
        subsequentCycleStart,
        ovulationDate,
        fertileStart,
        fertileEnd: ovulationDate,
        fertileDays,
      });

      projectionBaseStart = subsequentCycleStart;
    }
  }

  // Sets for quick calendar styling lookups
  const registeredPeriodSet = new Set(periodDaysArray || []);
  const forecastedPeriodSet = new Set();
  const fertileDaysSet = new Set();
  const peakFertileDaysSet = new Set();

  // Add past fertile days
  pastCycleData.forEach(c => {
    c.fertileDays.forEach(d => fertileDaysSet.add(d));
    peakFertileDaysSet.add(c.ovulationDate);
  });

  // Add current ongoing cycle fertile days
  if (currentCycleData) {
    currentCycleData.fertileDays.forEach(d => fertileDaysSet.add(d));
    peakFertileDaysSet.add(currentCycleData.ovulationDate);
  }

  // Add future forecast days
  futurePredictions.forEach(pred => {
    pred.periodDays.forEach(d => forecastedPeriodSet.add(d));
    pred.fertileDays.forEach(d => fertileDaysSet.add(d));
    peakFertileDaysSet.add(pred.ovulationDate);
  });

  return {
    stats,
    pastCycleData,
    currentCycleData,
    futurePredictions,
    registeredPeriodSet,
    forecastedPeriodSet,
    fertileDaysSet,
    peakFertileDaysSet,
  };
}

/**
 * Determine classification and display attributes for any given calendar date.
 */
export function getDayStatus(dateStr, predictionsData) {
  const { registeredPeriodSet, forecastedPeriodSet, fertileDaysSet, peakFertileDaysSet } = predictionsData;

  const isRegisteredPeriod = registeredPeriodSet.has(dateStr);
  const isForecastPeriod = !isRegisteredPeriod && forecastedPeriodSet.has(dateStr);
  const isPeakFertile = peakFertileDaysSet.has(dateStr);
  const isFertile = !isRegisteredPeriod && !isForecastPeriod && fertileDaysSet.has(dateStr);

  return {
    dateStr,
    isRegisteredPeriod,
    isForecastPeriod,
    isPeakFertile,
    isFertile,
    isNeutral: !isRegisteredPeriod && !isForecastPeriod && !isFertile && !isPeakFertile,
    label: isRegisteredPeriod
      ? 'Period Day'
      : isForecastPeriod
      ? 'Forecasted Period'
      : isPeakFertile
      ? 'Peak Ovulation Day'
      : isFertile
      ? 'Fertile Window'
      : 'Normal Day',
    pregnancyChance: isPeakFertile
      ? 'Highest (Ovulation Day)'
      : isFertile
      ? 'High (Fertile Window)'
      : isRegisteredPeriod
      ? 'Low (Menstruation)'
      : 'Lower (Outside Fertile Window)',
  };
}

/**
 * Calculate accurate status for today (or any date) within the cycle.
 * Accurately handles:
 * - Ongoing normal cycle (Day X of cycle)
 * - Ovulation day & fertile window
 * - Period is late by X days
 * - Prolonged absence of logged periods
 */
export function getTodayCycleInfo(todayStr, predictionsData) {
  const { stats } = predictionsData;
  const { episodes, cycleLength, periodLength, isCalculatedFromHistory, manualCycleLength } = stats;

  if (!episodes || episodes.length === 0) {
    return {
      hasData: false,
      message: 'Log your first period to start forecasting',
      cycleDay: null,
      cycleLength: manualCycleLength,
      periodLength,
      daysToNextPeriod: null,
      phase: 'Welcome',
      pregnancyChance: 'No data',
      isPeriodToday: false,
      isFertileToday: false,
      isPeakFertileToday: false,
      nextPeriodDate: null,
      isLate: false,
      daysLate: 0,
    };
  }

  // Find the episode that is active for today:
  // The most recent episode with startDate <= todayStr
  const pastOrPresentEpisodes = episodes.filter(ep => ep.startDate <= todayStr);

  if (pastOrPresentEpisodes.length === 0) {
    // All logged episodes are in the future
    const firstFuture = episodes[0];
    const daysUntilFirst = diffDays(todayStr, firstFuture.startDate);
    return {
      hasData: true,
      message: `Next logged period starts in ${daysUntilFirst} days`,
      cycleDay: null,
      cycleLength,
      periodLength,
      daysToNextPeriod: daysUntilFirst,
      phase: 'Future period logged',
      pregnancyChance: 'Lower (Calendar estimate)',
      isPeriodToday: false,
      isFertileToday: false,
      isPeakFertileToday: false,
      nextPeriodDate: firstFuture.startDate,
      isLate: false,
      daysLate: 0,
    };
  }

  // Active episode is the most recent one on or before today
  const activeEpisode = pastOrPresentEpisodes[pastOrPresentEpisodes.length - 1];
  const daysSinceStart = diffDays(activeEpisode.startDate, todayStr);
  const cycleDay = daysSinceStart + 1;

  // Expected next period start date for this cycle
  const nextPeriodDate = formatDate(addDays(activeEpisode.startDate, cycleLength));
  const daysToNext = diffDays(todayStr, nextPeriodDate);

  const dayStatus = getDayStatus(todayStr, predictionsData);

  const isLate = daysToNext < 0;
  const daysLate = isLate ? Math.abs(daysToNext) : 0;

  let phase = 'Follicular Phase';

  if (dayStatus.isRegisteredPeriod) {
    phase = 'Period (Bleeding)';
  } else if (isLate) {
    if (daysLate > 60) {
      phase = `Cycle paused (${daysLate} days since expected)`;
    } else {
      phase = `Period late by ${daysLate} day${daysLate === 1 ? '' : 's'}`;
    }
  } else if (dayStatus.isPeakFertile) {
    phase = '★ Peak Ovulation Day';
  } else if (dayStatus.isFertile) {
    phase = 'Fertile Window (High Chance)';
  } else if (daysSinceStart >= (cycleLength - LUTEAL_PHASE_DAYS)) {
    phase = 'Luteal Phase';
  }

  return {
    hasData: true,
    cycleDay: isLate && daysLate > 60 ? null : cycleDay,
    cycleLength,
    periodLength,
    isCalculatedFromHistory,
    daysToNextPeriod: isLate ? 0 : daysToNext,
    phase,
    pregnancyChance: dayStatus.pregnancyChance,
    isPeriodToday: dayStatus.isRegisteredPeriod,
    isFertileToday: dayStatus.isFertile || dayStatus.isPeakFertile,
    isPeakFertileToday: dayStatus.isPeakFertile,
    nextPeriodDate,
    activePeriodStartDate: activeEpisode.startDate,
    isLate,
    daysLate,
  };
}

/**
 * Format backup text file with all registered period days and metadata
 */
export function generateBackupText(periodDaysArray, userSettings = {}) {
  const sorted = [...(periodDaysArray || [])].sort();
  const dateExported = formatDate(new Date());

  const jsonPayload = JSON.stringify(
    {
      app: 'flo-period-tracker',
      version: 2,
      exportedAt: dateExported,
      settings: userSettings,
      periodDays: sorted,
    },
    null,
    2
  );

  return `=====================================================
FLO PERIOD TRACKER - BACKUP DATA
Exported on: ${dateExported}
Total Registered Period Days: ${sorted.length}
=====================================================

--- REGISTERED PERIOD DAYS (YYYY-MM-DD) ---
${sorted.length > 0 ? sorted.join('\n') : '(No period days recorded yet)'}

=====================================================
--- RAW RESTORE DATA (DO NOT MODIFY BELOW) ---
${jsonPayload}
=====================================================`;
}

/**
 * Parse text from backup file or pasted text to extract period days & settings.
 */
export function parseBackupText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Please provide text to restore.');
  }

  // 1. Try to find JSON block
  const jsonMatch = rawText.match(/\{[\s\S]*"periodDays"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed.periodDays)) {
        const validDates = parsed.periodDays.filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.trim()));
        return {
          periodDays: Array.from(new Set(validDates)).sort(),
          settings: parsed.settings || {},
          foundCount: validDates.length,
          type: 'json_structured',
        };
      }
    } catch {
      // Continue to regex
    }
  }

  // 2. Try parsing entire text as direct JSON
  try {
    const directParsed = JSON.parse(rawText.trim());
    if (Array.isArray(directParsed)) {
      const validDates = directParsed.filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.trim()));
      return {
        periodDays: Array.from(new Set(validDates)).sort(),
        settings: {},
        foundCount: validDates.length,
        type: 'json_array',
      };
    }
    if (directParsed.periodDays && Array.isArray(directParsed.periodDays)) {
      const validDates = directParsed.periodDays.filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.trim()));
      return {
        periodDays: Array.from(new Set(validDates)).sort(),
        settings: directParsed.settings || {},
        foundCount: validDates.length,
        type: 'json_object',
      };
    }
  } catch {
    // Continue to regex
  }

  // 3. Fallback: Extract every single YYYY-MM-DD date found in the text
  const dateRegex = /\b\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])\b/g;
  const matches = rawText.match(dateRegex);

  if (matches && matches.length > 0) {
    const uniqueDates = Array.from(new Set(matches)).sort();
    return {
      periodDays: uniqueDates,
      settings: {},
      foundCount: uniqueDates.length,
      type: 'dates_extracted',
    };
  }

  throw new Error('No valid YYYY-MM-DD period dates could be found in the provided text.');
}
