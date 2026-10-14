import { useState, useEffect } from 'react';
import {
  formatDate,
  getCyclePredictions,
  getTodayCycleInfo,
  generateBackupText,
  parseBackupText,
  DEFAULT_CYCLE_LENGTH,
  DEFAULT_PERIOD_LENGTH,
} from '../utils/cycleEngine';

import { translations } from '../utils/translations';

const STORAGE_KEY_PERIODS = 'flo_app_period_days_v1';
const STORAGE_KEY_SETTINGS = 'flo_app_settings_v1';
const STORAGE_KEY_NOTES = 'flo_app_day_notes_v1';

export function usePeriodStore() {
  // Load initial period days from localStorage
  const [periodDays, setPeriodDays] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PERIODS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.sort();
      }
    } catch (e) {
      console.error('Failed to load period days from localStorage', e);
    }
    // Return empty by default
    return [];
  });

  // Settings
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          cycleLength: DEFAULT_CYCLE_LENGTH,
          periodLength: DEFAULT_PERIOD_LENGTH,
          autoDetect: true,
          lang: 'pl',
          ...parsed,
        };
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
    return {
      cycleLength: DEFAULT_CYCLE_LENGTH,
      periodLength: DEFAULT_PERIOD_LENGTH,
      autoDetect: true,
      lang: 'pl',
    };
  });

  // Notes and symptoms
  const [dayNotes, setDayNotes] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_NOTES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load day notes', e);
    }
    return {};
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PERIODS, JSON.stringify(periodDays));
    } catch (e) {
      console.error('Failed to save period days', e);
    }
  }, [periodDays]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(dayNotes));
    } catch (e) {
      console.error('Failed to save notes', e);
    }
  }, [dayNotes]);

  // Derived predictions based on current periodDays and settings
  const predictions = getCyclePredictions(periodDays, settings, 8);

  const todayStr = formatDate(new Date());
  const todayInfo = getTodayCycleInfo(todayStr, predictions);

  // Toggle a single day's period status
  const togglePeriodDay = (dateStr) => {
    setPeriodDays((prev) => {
      const exists = prev.includes(dateStr);
      let updated;
      if (exists) {
        updated = prev.filter((d) => d !== dateStr);
      } else {
        updated = [...prev, dateStr].sort();
      }
      return updated;
    });
  };

  // Add multiple days at once (e.g. period span)
  const addPeriodDays = (datesArray) => {
    setPeriodDays((prev) => {
      const combined = new Set([...prev, ...datesArray]);
      return Array.from(combined).sort();
    });
  };

  // Remove specific days
  const removePeriodDays = (datesArray) => {
    const toRemove = new Set(datesArray);
    setPeriodDays((prev) => prev.filter((d) => !toRemove.has(d)));
  };

  // Update day note / symptom
  const updateDayNote = (dateStr, data) => {
    setDayNotes((prev) => ({
      ...prev,
      [dateStr]: {
        ...(prev[dateStr] || {}),
        ...data,
      },
    }));
  };

  // Update settings
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  // Generate backup text for download or clipboard
  const getBackupText = () => {
    return generateBackupText(periodDays, settings);
  };

  // Restore data from text
  const restoreFromText = (rawText, mode = 'merge') => {
    const result = parseBackupText(rawText);
    if (!result.periodDays || result.periodDays.length === 0) {
      throw new Error('No valid dates found in the provided backup text.');
    }

    if (mode === 'replace') {
      setPeriodDays(result.periodDays);
    } else {
      // Merge
      setPeriodDays((prev) => {
        const combined = new Set([...prev, ...result.periodDays]);
        return Array.from(combined).sort();
      });
    }

    if (result.settings && Object.keys(result.settings).length > 0) {
      setSettings((prev) => ({
        ...prev,
        ...result.settings,
      }));
    }

    return result;
  };

  // Clear all data
  const clearAllData = () => {
    setPeriodDays([]);
    setDayNotes({});
    localStorage.removeItem(STORAGE_KEY_PERIODS);
    localStorage.removeItem(STORAGE_KEY_NOTES);
  };

  const lang = settings.lang || 'pl';
  const t = translations[lang] || translations.pl;
  const toggleLanguage = () => {
    updateSettings({ lang: lang === 'pl' ? 'en' : 'pl' });
  };

  return {
    periodDays,
    settings,
    dayNotes,
    predictions,
    todayInfo,
    todayStr,
    lang,
    t,
    toggleLanguage,
    togglePeriodDay,
    addPeriodDays,
    removePeriodDays,
    updateDayNote,
    updateSettings,
    getBackupText,
    restoreFromText,
    clearAllData,
  };
}
