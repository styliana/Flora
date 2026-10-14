import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 * Robust file exporter supporting Native Android/iOS and Web/Desktop.
 * On native Android, saves to device storage and launches the system share/save picker.
 */
export async function exportTextFile({
  filename,
  content,
  title = 'Flora Backup',
  dialogTitle = 'Save or share backup file',
}) {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    try {
      // 1. Write file to Cache
      const saved = await Filesystem.writeFile({
        path: filename,
        data: content,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      // 2. Also try writing to Documents for local retention
      try {
        await Filesystem.writeFile({
          path: filename,
          data: content,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
      } catch (docErr) {
        // Non-critical, ignore if permissions vary on specific OEM
        console.warn('Could not write to Documents directory', docErr);
      }

      // 3. Launch native Android share sheet with file URI
      const canShare = await Share.canShare();
      if (canShare && canShare.value) {
        await Share.share({
          title,
          text: title,
          url: saved.uri,
          dialogTitle,
        });
        return { success: true, method: 'share', uri: saved.uri };
      }

      return { success: true, method: 'saved', uri: saved.uri };
    } catch (nativeError) {
      console.error('Native export failed, attempting browser fallback', nativeError);
      // Fall through to browser download fallback below
    }
  }

  // Web / Browser environment fallback
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

  // Try Web Share API with File object if supported
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      const file = new File([blob], filename, { type: 'text/plain' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
        });
        return { success: true, method: 'web_share' };
      }
    } catch (shareErr) {
      if (shareErr.name === 'AbortError') {
        return { success: true, method: 'cancelled' };
      }
      console.warn('Web share failed', shareErr);
    }
  }

  // Standard web browser download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);

  return { success: true, method: 'download' };
}
