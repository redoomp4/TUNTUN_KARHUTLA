/**
 * @fileoverview Client-Side Binary Magic-Bytes (File Signature) Forensic Engine
 * @module engines/fileSignatureEngine
 *
 * Inspects the first bytes and internal markers of a file in browser memory
 * without executing or uploading it. Detects disguised Android .APK packages
 * (e.g., "Surat_Resi.pdf.apk" or an APK renamed to ".pdf") and Windows executables.
 */

/**
 * Formats the first N bytes of a Uint8Array into an uppercase hex string.
 * @param {Uint8Array} bytes
 * @param {number} [length=8]
 * @returns {string}
 */
export function formatMagicHex(bytes, length = 8) {
  if (!bytes || bytes.length === 0) return '00 00 00 00';
  return Array.from(bytes.slice(0, length))
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

/**
 * Inspects a binary buffer and filename to detect disguised malware packages.
 * @param {string} fileName
 * @param {number} fileSize
 * @param {Uint8Array} headerBytes - First 4096 bytes of the file
 * @returns {{
 *   fileName: string,
 *   fileSizeKB: string,
 *   magicHex: string,
 *   detectedFormat: string,
 *   claimedExtension: string,
 *   isDangerous: boolean,
 *   isMismatch: boolean,
 *   verdictTitle: string,
 *   verdictDesc: string,
 *   score: number,
 *   recommendedGuideId: string
 * }}
 */
export function analyzeFileBinarySignature(fileName, fileSize, headerBytes) {
  const cleanName = (fileName || 'dokumen_tidak_dikenal').trim();
  const lowerName = cleanName.toLowerCase();
  const magicHex = formatMagicHex(headerBytes, 8);
  const asciiSlice = new TextDecoder('latin1').decode(headerBytes.slice(0, 4096));

  const parts = lowerName.split('.');
  const claimedExt = parts.length > 1 ? `.${parts[parts.length - 1]}` : '(tanpa ekstensi)';
  const hasDoubleExtension = /\.(pdf|jpg|jpeg|png|doc|docx|xls|xlsx)\.(apk|exe|scr|bat|msi)$/i.test(lowerName);

  // Detect binary header signature
  const isZipContainer =
    headerBytes[0] === 0x50 &&
    headerBytes[1] === 0x4b &&
    headerBytes[2] === 0x03 &&
    headerBytes[3] === 0x04;

  const hasAndroidMarkers =
    asciiSlice.includes('AndroidManifest.xml') ||
    asciiSlice.includes('classes.dex') ||
    asciiSlice.includes('META-INF/');

  const isMzExecutable = headerBytes[0] === 0x4d && headerBytes[1] === 0x5a; // "MZ"
  const isPdfSignature =
    headerBytes[0] === 0x25 &&
    headerBytes[1] === 0x50 &&
    headerBytes[2] === 0x44 &&
    headerBytes[3] === 0x46; // "%PDF"
  const isPngSignature =
    headerBytes[0] === 0x89 &&
    headerBytes[1] === 0x50 &&
    headerBytes[2] === 0x4e &&
    headerBytes[3] === 0x47;
  const isJpegSignature =
    headerBytes[0] === 0xff &&
    headerBytes[1] === 0xd8 &&
    headerBytes[2] === 0xff;

  let detectedFormat = 'Berkas biner umum';
  let isDangerous = false;
  let isMismatch = false;
  let score = 0;
  let verdictTitle = 'Struktur header sesuai dengan ekstensi berkas';
  let verdictDesc = 'Tidak ditemukan tanda paket instalasi aplikasi Android (.APK) atau program eksekusi berbahaya pada header berkas.';

  if ((isZipContainer && (hasAndroidMarkers || lowerName.endsWith('.apk'))) || hasDoubleExtension) {
    detectedFormat = 'Paket Aplikasi Android (APK / ZIP Archive)';
    isDangerous = true;
    isMismatch = hasDoubleExtension || claimedExt === '.pdf' || claimedExt === '.jpg' || claimedExt === '.png';
    score = 95;
    verdictTitle = 'Bahaya: Berkas ini adalah paket instalasi aplikasi Android (.APK)';
    verdictDesc = isMismatch
      ? `Berkas "${cleanName}" menyamar sebagai dokumen/gambar, namun header binernya (${magicHex}) menunjukkan paket aplikasi Android (ditemukan struktur AndroidManifest.xml / classes.dex). Jangan pernah membuka atau menginstal berkas ini.`
      : `Berkas "${cleanName}" memiliki signature biner ${magicHex} (paket instalasi APK). Menginstal APK dari luar toko aplikasi resmi berisiko menyadap SMS OTP perbankan Anda.`;
  } else if (isMzExecutable || /\.(exe|scr|bat|vbs|msi)$/i.test(lowerName)) {
    detectedFormat = 'Program Eksekusi Windows (PE / MZ Executable)';
    isDangerous = true;
    isMismatch = claimedExt === '.pdf' || claimedExt === '.jpg';
    score = 90;
    verdictTitle = 'Bahaya: Berkas ini adalah program eksekusi sistem (.EXE / .SCR)';
    verdictDesc = `Header biner (${magicHex}) mengidentifikasi program yang dapat dieksekusi oleh sistem operasi, bukan dokumen bacaan biasa.`;
  } else if (isPdfSignature) {
    detectedFormat = 'Dokumen PDF Asli (%PDF Header)';
    score = 5;
    verdictTitle = 'Dokumen PDF terverifikasi (%PDF)';
    verdictDesc = `Header biner (${magicHex}) cocok dengan standar dokumen PDF (25 50 44 46). Tetap waspada terhadap tautan mencurigakan di dalam isi halaman PDF.`;
  } else if (isPngSignature || isJpegSignature) {
    detectedFormat = isPngSignature ? 'Gambar PNG Asli' : 'Gambar JPEG Asli';
    score = 0;
    verdictTitle = 'Berkas gambar standar terverifikasi';
    verdictDesc = `Header biner (${magicHex}) merupakan format gambar murni dan bukan paket aplikasi .APK.`;
  }

  return {
    fileName: cleanName,
    fileSizeKB: `${Math.max(1, Math.round((fileSize || 1024) / 1024))} KB`,
    magicHex,
    detectedFormat,
    claimedExtension: claimedExt,
    isDangerous,
    isMismatch,
    verdictTitle,
    verdictDesc,
    score,
    recommendedGuideId: isDangerous ? 'guide-sit-2' : 'guide-sit-1'
  };
}

/**
 * Generates simulated binary samples so users/judges can test the Magic-Bytes
 * Inspector in 1 click without needing a real malicious .APK on their disk.
 */
export const SIMULATED_BINARY_SAMPLES = {
  disguisedApk: {
    fileName: 'Surat_Resi_JNT_99201.pdf.apk',
    fileSize: 4820480,
    bytes: new Uint8Array([
      0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x08, 0x08,
      ...new TextEncoder().encode('AndroidManifest.xmlclasses.dexMETA-INF/')
    ])
  },
  renamedApkAsPdf: {
    fileName: 'Undangan_Pernikahan_Digital.pdf',
    fileSize: 5120000,
    bytes: new Uint8Array([
      0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00,
      ...new TextEncoder().encode('AndroidManifest.xmlclasses.dex')
    ])
  },
  genuinePdf: {
    fileName: 'eStatement_Resmi_Bulanan.pdf',
    fileSize: 312400,
    bytes: new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37,
      ...new TextEncoder().encode('%PDF-1.7 Official Document')
    ])
  }
};
