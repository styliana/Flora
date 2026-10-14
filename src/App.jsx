import React, { useState } from 'react';
import { usePeriodStore } from './hooks/usePeriodStore';
import { MobileContainer } from './components/MobileContainer';
import { NavigationBar } from './components/NavigationBar';
import { TodayTab } from './components/TodayTab';
import { CalendarTab } from './components/CalendarTab';
import { PredictionsTab } from './components/PredictionsTab';
import { BackupTab } from './components/BackupTab';
import { DayDetailsModal } from './components/DayDetailsModal';

export default function App() {
  const {
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
    updateDayNote,
    updateSettings,
    getBackupText,
    restoreFromText,
    clearAllData,
  } = usePeriodStore();

  const [currentTab, setCurrentTab] = useState('today');
  const [selectedDateForModal, setSelectedDateForModal] = useState(null);

  const handleTogglePeriod = (dateStr) => {
    togglePeriodDay(dateStr);
  };

  const handleTogglePeriodToday = () => {
    togglePeriodDay(todayStr);
  };

  const handleOpenDetails = (dateStr) => {
    setSelectedDateForModal(dateStr);
  };

  return (
    <MobileContainer
      appName="flora"
      lang={lang}
      onToggleLanguage={toggleLanguage}
      t={t}
    >
      {/* Active Tab View */}
      {currentTab === 'today' && (
        <TodayTab
          todayInfo={todayInfo}
          onTogglePeriodToday={handleTogglePeriodToday}
          onOpenCalendar={() => setCurrentTab('calendar')}
          onOpenDetailsForToday={() => handleOpenDetails(todayStr)}
          t={t}
          lang={lang}
        />
      )}

      {currentTab === 'calendar' && (
        <CalendarTab
          predictions={predictions}
          todayStr={todayStr}
          onTogglePeriod={handleTogglePeriod}
          onSelectDate={handleOpenDetails}
          dayNotes={dayNotes}
          t={t}
          lang={lang}
        />
      )}

      {currentTab === 'predictions' && (
        <PredictionsTab
          predictions={predictions}
          todayStr={todayStr}
          t={t}
          lang={lang}
        />
      )}

      {currentTab === 'backup' && (
        <BackupTab
          periodDays={periodDays}
          settings={settings}
          onUpdateSettings={updateSettings}
          getBackupText={getBackupText}
          restoreFromText={restoreFromText}
          clearAllData={clearAllData}
          t={t}
          lang={lang}
        />
      )}

      {/* Date Details Modal */}
      <DayDetailsModal
        selectedDateStr={selectedDateForModal}
        isOpen={Boolean(selectedDateForModal)}
        onClose={() => setSelectedDateForModal(null)}
        predictions={predictions}
        isPeriod={selectedDateForModal ? periodDays.includes(selectedDateForModal) : false}
        onTogglePeriod={handleTogglePeriod}
        notes={selectedDateForModal ? dayNotes[selectedDateForModal] : null}
        onUpdateNotes={updateDayNote}
        t={t}
        lang={lang}
      />

      {/* Bottom Navigation */}
      <NavigationBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        t={t}
      />
    </MobileContainer>
  );
}
