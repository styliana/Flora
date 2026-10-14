import {
  formatDate,
  parseDate,
  addDays,
  diffDays,
  groupPeriodEpisodes,
  calculateCycleStats,
  getCyclePredictions,
  getDayStatus,
  getTodayCycleInfo,
  parseBackupText,
  generateBackupText,
} from './src/utils/cycleEngine.js';

let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    passed++;
    console.log(`✓ [PASS] ${testName}`);
  } else {
    console.error(`✗ [FAIL] ${testName}`);
    process.exitCode = 1;
  }
}

console.log('=== RUNNING RIGOROUS MENSTRUAL CYCLE ENGINE TESTS ===\n');

// Cornercase 1: Empty data
const emptyStats = calculateCycleStats([]);
assert(emptyStats.episodes.length === 0, 'Cornercase 1a: Empty array produces 0 episodes');
assert(emptyStats.isCalculatedFromHistory === false, 'Cornercase 1b: Empty data flagged as not calculated from history');
const emptyInfo = getTodayCycleInfo('2026-10-15', getCyclePredictions([]));
assert(emptyInfo.hasData === false, 'Cornercase 1c: Empty data returns hasData = false');

// Cornercase 2: Exactly 1 period (5 days of bleeding)
const onePeriod = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05'];
const oneStats = calculateCycleStats(onePeriod, { cycleLength: 30, periodLength: 5 });
assert(oneStats.episodes.length === 1, 'Cornercase 2a: 1 episode detected');
assert(oneStats.periodLength === 5, 'Cornercase 2b: Period length is 5');
assert(oneStats.cycleLength === 30, 'Cornercase 2c: Falls back to custom 30d setting (not hardcoded 28)');
assert(oneStats.isCalculatedFromHistory === false, 'Cornercase 2d: Cannot calculate interval from only 1 period');

// Cornercase 3: Biological Ovulation Check (Cycle = 32 days)
// For a 32-day cycle starting Oct 1: Next period starts Nov 2 (32 days later).
// Ovulation MUST be 14 days before Nov 2 -> Oct 19 (Day 19 of cycle, which is day 18 after start).
const cycle32Preds = getCyclePredictions(onePeriod, { cycleLength: 32, periodLength: 5 });
const currentCycle = cycle32Preds.currentCycleData;
assert(currentCycle.ovulationDate === '2026-10-19', `Cornercase 3a: 32-day cycle ovulation is Oct 19 (got ${currentCycle.ovulationDate})`);
assert(currentCycle.fertileStart === '2026-10-14', `Cornercase 3b: Fertile window starts Oct 14 (got ${currentCycle.fertileStart})`);
assert(currentCycle.fertileDays.length === 6, 'Cornercase 3c: Fertile window has exactly 6 days');

// Cornercase 4: Biological Ovulation Check (Cycle = 24 days)
// For a 24-day cycle starting Oct 1: Next period is Oct 25. Ovulation MUST be Oct 11 (25 - 14).
const cycle24Preds = getCyclePredictions(onePeriod, { cycleLength: 24, periodLength: 4 });
assert(cycle24Preds.currentCycleData.ovulationDate === '2026-10-11', `Cornercase 4a: 24-day cycle ovulation is Oct 11 (got ${cycle24Preds.currentCycleData.ovulationDate})`);
assert(cycle24Preds.currentCycleData.fertileStart === '2026-10-06', 'Cornercase 4b: Fertile window starts Oct 6');

// Cornercase 5: Missed tracking gap (e.g. 120-day gap between periods)
// Woman logged: Period 1 on Jan 1, Period 2 on May 1 (120 days later).
// The 120-day gap must NOT be averaged into regular cycle length!
const gapPeriods = [
  '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05',
  '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05'
];
const gapStats = calculateCycleStats(gapPeriods, { cycleLength: 28 });
assert(gapStats.isCalculatedFromHistory === false, 'Cornercase 5a: 120-day gap is rejected from cycle average');
assert(gapStats.cycleLength === 28, 'Cornercase 5b: Reverts to safe user baseline, not 120 days');

// Cornercase 6: Multiple irregular realistic cycles (27 days, 31 days)
// Period 1: Jan 1
// Period 2: Jan 28 (interval: 27 days)
// Period 3: Feb 28 (interval: 31 days)
// Average: (27 + 31) / 2 = 29 days!
const realisticPeriods = [
  '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05',
  '2026-01-28', '2026-01-29', '2026-01-30', '2026-01-31', '2026-02-01',
  '2026-02-28', '2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04'
];
const realStats = calculateCycleStats(realisticPeriods);
assert(realStats.isCalculatedFromHistory === true, 'Cornercase 6a: Successfully calculates from history');
assert(realStats.cycleLength === 29, `Cornercase 6b: Average cycle length is 29 days (got ${realStats.cycleLength})`);
assert(realStats.periodLength === 5, 'Cornercase 6c: Average period duration is 5 days');

// Cornercase 7: Period with non-consecutive logged days (user forgot Day 3)
const skippedDay = ['2026-10-01', '2026-10-02', '2026-10-04', '2026-10-05'];
const skippedEpisodes = groupPeriodEpisodes(skippedDay);
assert(skippedEpisodes.length === 1, 'Cornercase 7a: 1-day pause is correctly grouped into 1 episode');
assert(skippedEpisodes[0].startDate === '2026-10-01', 'Cornercase 7b: Starts Oct 1');
assert(skippedEpisodes[0].endDate === '2026-10-05', 'Cornercase 7c: Ends Oct 5');
assert(skippedEpisodes[0].duration === 5, 'Cornercase 7d: Duration span is 5 days');

// Cornercase 8: Period is late (Today is Day 32 of 28d cycle)
// Period started 2026-09-10. Today is 2026-10-12 (32 days later).
// Expected period was 2026-10-08 (4 days ago).
const latePreds = getCyclePredictions(['2026-09-10', '2026-09-11', '2026-09-12'], { cycleLength: 28 });
const lateInfo = getTodayCycleInfo('2026-10-12', latePreds);
assert(lateInfo.isLate === true, 'Cornercase 8a: Correctly detects period is late');
assert(lateInfo.daysLate === 4, `Cornercase 8b: Exactly 4 days late (got ${lateInfo.daysLate})`);
assert(lateInfo.cycleDay === 33, `Cornercase 8c: Cycle Day 33 (got ${lateInfo.cycleDay})`);
assert(lateInfo.phase.includes('late by 4 days'), `Cornercase 8d: Phase text states 4 days late (got "${lateInfo.phase}")`);

// Cornercase 9: Active cycle lookup when user has past and future periods
// Period 1: Sept 1
// Period 2: Sept 29
// Period 3: Oct 27
// If today is Oct 10, active cycle must be Period 2 (Sept 29), NOT Period 3!
const multiCycleDates = [
  '2026-09-01', '2026-09-02', '2026-09-03',
  '2026-09-29', '2026-09-30', '2026-10-01',
  '2026-10-27', '2026-10-28', '2026-10-29'
];
const multiPreds = getCyclePredictions(multiCycleDates, { cycleLength: 28 });
const oct10Info = getTodayCycleInfo('2026-10-10', multiPreds);
assert(oct10Info.activePeriodStartDate === '2026-09-29', `Cornercase 9a: Oct 10 belongs to Sept 29 cycle (got ${oct10Info.activePeriodStartDate})`);
assert(oct10Info.cycleDay === 12, `Cornercase 9b: Oct 10 is Day 12 of Sept 29 cycle (got ${oct10Info.cycleDay})`);

// Cornercase 10: Peak Ovulation Status & Pregnancy Chance Wording
// On ovulation day: pregnancy chance must be "Highest (Ovulation Day)"
const dayStatusOvulation = getDayStatus('2026-10-19', cycle32Preds);
assert(dayStatusOvulation.isPeakFertile === true, 'Cornercase 10a: Oct 19 is peak fertile');
assert(dayStatusOvulation.pregnancyChance.includes('Highest'), 'Cornercase 10b: Pregnancy chance is Highest');

// On fertile window day (Oct 16):
const dayStatusFertile = getDayStatus('2026-10-16', cycle32Preds);
assert(dayStatusFertile.isFertile === true, 'Cornercase 10c: Oct 16 is fertile');
assert(dayStatusFertile.pregnancyChance.includes('High'), 'Cornercase 10d: Pregnancy chance is High');

// On normal day (Oct 25):
const dayStatusNormal = getDayStatus('2026-10-25', cycle32Preds);
assert(dayStatusNormal.isNeutral === true, 'Cornercase 10e: Oct 25 is neutral');
assert(!dayStatusNormal.pregnancyChance.includes('Zero'), 'Cornercase 10f: Never falsely claims zero chance');

// Cornercase 11: Future Cycle Projections are chronological and well-formed
assert(cycle32Preds.futurePredictions.length === 6, 'Cornercase 11a: Generates 6 future predictions');
const firstFuture = cycle32Preds.futurePredictions[0];
assert(firstFuture.startDate === '2026-11-02', `Cornercase 11b: Next period starts Nov 2 (got ${firstFuture.startDate})`);
assert(firstFuture.ovulationDate === '2026-11-20', `Cornercase 11c: Next cycle ovulation is Nov 20 (got ${firstFuture.ovulationDate})`);

// Cornercase 12: Backup export and round-trip restore
const exportedText = generateBackupText(realisticPeriods, { cycleLength: 30, periodLength: 6 });
const restored = parseBackupText(exportedText);
assert(restored.foundCount === realisticPeriods.length, 'Cornercase 12a: All dates restored');
assert(restored.settings.cycleLength === 30, 'Cornercase 12b: Custom settings preserved in backup');

console.log(`\n=== RESULTS: ${passed}/${total} TESTS PASSED ===\n`);
