import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';
import { formatDate } from '../utils/cycleEngine';
import { exportTextFile } from '../utils/fileExporter';

export function BackupTab({
  periodDays,
  settings,
  onUpdateSettings,
  getBackupText,
  restoreFromText,
  clearAllData,
  t,
  lang = 'pl',
}) {
  const [copied, setCopied] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [restoreMode, setRestoreMode] = useState('merge');
  const [importStatus, setImportStatus] = useState(null);

  // Protected Danger Zone state
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [dangerConfirmChecked, setDangerConfirmChecked] = useState(false);
  const [dangerConfirmText, setDangerConfirmText] = useState('');
  const [dangerSuccessMsg, setDangerSuccessMsg] = useState('');

  const [exportNotice, setExportNotice] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadBackup = async () => {
    try {
      setIsExporting(true);
      const textContent = getBackupText();
      const dateStr = formatDate(new Date());
      const filename = `flora_backup_${dateStr}.txt`;

      const result = await exportTextFile({
        filename,
        content: textContent,
        title: lang === 'pl' ? 'Kopia zapasowa Flora' : 'Flora Period Backup',
        dialogTitle: lang === 'pl' ? 'Zapisz lub udostępnij plik kopii' : 'Save or share backup file',
      });

      if (result.method !== 'cancelled') {
        setExportNotice({
          type: 'success',
          message: lang === 'pl'
            ? 'Plik kopii jest gotowy! Możesz go zapisać w plikach lub przesłać.'
            : 'Backup file ready! Save to your device or share.',
        });
        setTimeout(() => setExportNotice(null), 6000);
      }
    } catch (err) {
      console.error('Failed to export backup', err);
      setExportNotice({
        type: 'error',
        message: lang === 'pl'
          ? 'Nie udało się pobrać pliku bezpośrednio. Użyj przycisku "Kopiuj tekst", aby zapisać dane.'
          : 'Could not export file directly. Use "Copy Text" to save your data.',
      });
      setTimeout(() => setExportNotice(null), 6000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyClipboard = async () => {
    try {
      const textContent = getBackupText();
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setPasteText(content);
        executeRestore(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const executeRestore = (rawText) => {
    const textToProcess = rawText || pasteText;
    if (!textToProcess.trim()) {
      setImportStatus({
        type: 'error',
        message: 'Please paste text or upload a backup file.',
      });
      return;
    }

    try {
      const result = restoreFromText(textToProcess, restoreMode);
      setImportStatus({
        type: 'success',
        message: `Restored ${result.foundCount} period day(s)!`,
      });
      setPasteText('');
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err) {
      setImportStatus({
        type: 'error',
        message: err.message || 'Failed to restore. Please check the text format.',
      });
    }
  };

  const handleExecutePermanentDelete = () => {
    if (!dangerConfirmChecked || dangerConfirmText.trim().toUpperCase() !== 'DELETE') {
      return;
    }
    clearAllData();
    setDangerConfirmChecked(false);
    setDangerConfirmText('');
    setShowDangerZone(false);
    setDangerSuccessMsg('All recorded period days have been permanently cleared.');
    setTimeout(() => setDangerSuccessMsg(''), 5000);
  };

  const isDeleteReady = dangerConfirmChecked && dangerConfirmText.trim().toUpperCase() === 'DELETE';

  return (
    <div className="flex flex-col space-y-4 pb-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="px-1 pt-1">
        <span className="text-[11px] font-semibold text-pink-400 uppercase tracking-widest block">{t?.backup || 'Data & Privacy'}</span>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t?.backupTitle || 'Settings & Backup'}</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {t?.backupSubtitle || '100% private and stored on your device. Transfer your text file anytime to a new phone.'}
        </p>
      </div>

      {dangerSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl font-semibold">
          {dangerSuccessMsg}
        </div>
      )}

      {/* Cycle Parameters Settings */}
      <div className="bg-white rounded-3xl p-4 border border-pink-100/70 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sliders size={13} className="text-[#be185d]" /> {t?.cycleParameters || 'Cycle Parameters'}
          </h3>
          <span className="text-[10px] text-pink-400 font-medium">{t?.yourSetting || 'Personalized'}</span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Cycle Length Setting */}
          <div>
            <div className="flex justify-between items-center font-medium text-slate-700 mb-1 text-[11px]">
              <span>{t?.yourCycleLength || 'Your Cycle Length:'}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="20"
                  max="45"
                  value={settings.cycleLength}
                  onChange={(e) => onUpdateSettings({ cycleLength: Math.max(20, Math.min(45, Number(e.target.value) || 28)) })}
                  className="w-12 text-center py-0.5 px-1 bg-pink-50 border border-pink-200 rounded-lg text-xs font-bold text-[#15803d]"
                />
                <span className="text-slate-500 font-semibold">{lang === 'pl' ? 'dni' : 'days'}</span>
              </div>
            </div>
            <input
              type="range"
              min="21"
              max="45"
              value={settings.cycleLength}
              onChange={(e) => onUpdateSettings({ cycleLength: Number(e.target.value) })}
              className="w-full accent-[#15803d]"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {lang === 'pl' ? 'Prawidłowy zakres: 21 do 35 dni (ACOG). Standard to 28 dni.' : 'Normal range: 21 to 35 days (ACOG). Standard average is 28 days.'}
            </span>
          </div>

          {/* Period Bleeding Length Setting */}
          <div className="pt-2 border-t border-pink-50">
            <div className="flex justify-between items-center font-medium text-slate-700 mb-1 text-[11px]">
              <span>{t?.yourPeriodLength || 'Period Bleeding Duration:'}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={settings.periodLength}
                  onChange={(e) => onUpdateSettings({ periodLength: Math.max(2, Math.min(10, Number(e.target.value) || 5)) })}
                  className="w-12 text-center py-0.5 px-1 bg-pink-50 border border-pink-200 rounded-lg text-xs font-bold text-[#be185d]"
                />
                <span className="text-slate-500 font-semibold">{lang === 'pl' ? 'dni' : 'days'}</span>
              </div>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              value={settings.periodLength}
              onChange={(e) => onUpdateSettings({ periodLength: Number(e.target.value) })}
              className="w-full accent-[#be185d]"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {lang === 'pl' ? 'Typowa długość krwawienia to od 3 do 7 dni.' : 'Typical bleeding duration is 3 to 7 days.'}
            </span>
          </div>

          {/* Auto-calculate toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-pink-50">
            <div>
              <span className="font-semibold text-slate-800 text-[11px] block">{t?.autoCalculateToggle || 'Auto-calculate from my periods'}</span>
              <span className="text-[10px] text-slate-400">{t?.autoCalculateDesc || 'Adapts average automatically once 2+ periods are recorded'}</span>
            </div>
            <input
              type="checkbox"
              checked={settings.autoDetect !== false}
              onChange={(e) => onUpdateSettings({ autoDetect: e.target.checked })}
              className="w-4 h-4 accent-[#be185d] rounded-md cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-3xl p-4 border border-pink-100/70 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800">{t?.exportTitle || 'Export Period Text File'}</h3>
            <span className="text-[11px] text-pink-400/90">{periodDays.length} {lang === 'pl' ? 'zapisanych dni' : 'registered day(s)'}</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#be185d]" />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleDownloadBackup}
            disabled={periodDays.length === 0 || isExporting}
            className="py-2.5 px-3 rounded-full bg-[#be185d] hover:bg-[#a2134e] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 shadow-2xs"
          >
            <Download size={13} className={isExporting ? 'animate-bounce' : ''} />
            <span>{isExporting ? (lang === 'pl' ? 'Przygotowywanie...' : 'Preparing...') : (t?.downloadTxtBtn || 'Download .txt')}</span>
          </button>

          <button
            onClick={handleCopyClipboard}
            disabled={periodDays.length === 0}
            className="py-2.5 px-3 rounded-full bg-pink-50 hover:bg-pink-100/70 text-[#be185d] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-600" />
                <span className="text-emerald-700">{t?.copiedMsg || 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>{t?.copyTextBtn || 'Copy Text'}</span>
              </>
            )}
          </button>
        </div>

        {exportNotice && (
          <div
            className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
              exportNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                : 'bg-rose-50 text-rose-800 border border-rose-100'
            }`}
          >
            {exportNotice.type === 'success' ? (
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={14} className="text-rose-600 shrink-0" />
            )}
            <span>{exportNotice.message}</span>
          </div>
        )}
      </div>

      {/* Restore Section */}
      <div className="bg-white rounded-3xl p-4 border border-pink-100/70 shadow-2xs space-y-3">
        <div>
          <h3 className="text-xs font-bold text-slate-800">{t?.restoreTitle || 'Insert / Restore on New Phone'}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{t?.restoreDesc || 'Upload .txt or paste text below to insert your dates'}</p>
        </div>

        <label className="w-full py-2.5 px-3 border border-dashed border-pink-200 hover:border-pink-300 rounded-2xl flex items-center justify-center gap-2 cursor-pointer text-xs font-medium text-pink-900/70 bg-pink-50/30 transition-all">
          <FileText size={14} className="text-[#be185d]" />
          <span>{t?.uploadBtn || 'Upload .txt Backup File'}</span>
          <input
            type="file"
            accept=".txt,.json,text/plain,application/json,text/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={t?.pastePlaceholder || 'Paste YYYY-MM-DD dates or backup text here...'}
          rows={3}
          className="w-full p-2.5 text-xs bg-slate-50/70 border border-pink-100/80 rounded-2xl focus:outline-none focus:ring-1 focus:ring-pink-300 font-mono resize-none text-slate-700"
        />

        <div className="flex items-center justify-between text-xs pt-0.5">
          <div className="flex items-center gap-2.5 text-[11px] text-slate-500">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="restoreMode"
                value="merge"
                checked={restoreMode === 'merge'}
                onChange={() => setRestoreMode('merge')}
                className="accent-[#be185d]"
              />
              <span>{t?.mergeOpt || 'Merge'}</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="restoreMode"
                value="replace"
                checked={restoreMode === 'replace'}
                onChange={() => setRestoreMode('replace')}
                className="accent-[#be185d]"
              />
              <span>{t?.replaceOpt || 'Replace'}</span>
            </label>
          </div>

          <button
            onClick={() => executeRestore()}
            disabled={!pasteText.trim()}
            className="py-1.5 px-3.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-medium rounded-full text-xs transition-colors"
          >
            {t?.insertRestoreBtn || 'Insert & Restore'}
          </button>
        </div>

        {importStatus && (
          <div
            className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                : 'bg-rose-50 text-rose-800 border border-rose-100'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={14} className="text-rose-600 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}
      </div>

      {/* SECURED DANGER ZONE (Hidden to prevent accidental deletion) */}
      <div className="pt-2">
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white">
          <button
            onClick={() => setShowDangerZone(!showDangerZone)}
            className="w-full p-3 flex items-center justify-between text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Lock size={12} />
              <span>{t?.dangerZoneTitle || 'Advanced: Data Eraser (Protected)'}</span>
            </div>
            {showDangerZone ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showDangerZone && (
            <div className="p-4 bg-rose-50/40 border-t border-rose-100 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-2">
                <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-rose-900">{lang === 'pl' ? 'Wyczyść wszystkie dane' : 'Erase All Local Data'}</p>
                  <p className="text-[11px] text-rose-700 mt-0.5 leading-snug">
                    {t?.dangerWarning || 'Permanently deletes all recorded period history from this device.'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-[11px] text-rose-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dangerConfirmChecked}
                    onChange={(e) => setDangerConfirmChecked(e.target.checked)}
                    className="w-4 h-4 accent-rose-600 rounded"
                  />
                  <span>{t?.dangerCheckbox || 'I understand this action cannot be undone'}</span>
                </label>

                <div>
                  <label className="text-[10px] uppercase font-bold text-rose-800 block mb-1">
                    {t?.dangerInputPrompt || 'Type DELETE to confirm:'}
                  </label>
                  <input
                    type="text"
                    value={dangerConfirmText}
                    onChange={(e) => setDangerConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    className="w-full p-2 text-xs bg-white border border-rose-200 rounded-xl font-mono text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>

                <button
                  onClick={handleExecutePermanentDelete}
                  disabled={!isDeleteReady}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs transition-all shadow-2xs mt-1"
                >
                  {t?.dangerEraseBtn || 'Permanently Erase All Data'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
