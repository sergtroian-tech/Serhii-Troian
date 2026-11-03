import JSZip from 'jszip';
import { BUNDLED_SOURCE } from '../data/bundledSource';

export async function downloadProjectZip(): Promise<boolean> {
  try {
    const zip = new JSZip();

    // Add all source code and config files to zip
    Object.entries(BUNDLED_SOURCE).forEach(([filePath, content]) => {
      // Normalize slashes
      const cleanPath = filePath.replace(/^[./\\]+/, '');
      zip.file(cleanPath, content, {
        date: new Date('2026-11-03T12:00:00Z'),
        dosPermissions: 0o644,
      });
    });

    // Generate standard cross-platform ZIP blob
    const blob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/zip',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6,
      },
      platform: 'DOS', // Fully compliant with Windows Explorer, 7-Zip, WinRAR, macOS
    });

    // Create Blob URL and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nexusmail-app.zip';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke after download is triggered
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 15000);

    return true;
  } catch (error) {
    console.error('Failed to generate and download ZIP:', error);
    // Fallback: direct window location
    window.location.href = '/nexusmail-app.zip';
    return false;
  }
}
