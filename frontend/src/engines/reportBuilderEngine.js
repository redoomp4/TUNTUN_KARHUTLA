/**
 * @fileoverview Official Chronology Report & Family Warning Draft Builder
 * @module engines/reportBuilderEngine
 */

/**
 * Builds a structured incident chronology report for Bank Call Center, OJK 157, or Police.
 * @param {{
 *   type?: string,
 *   platform?: string,
 *   entity?: string,
 *   suspect?: string,
 *   loss?: string
 * }} form
 * @returns {string}
 */
export function buildOfficialReportDraft(form = {}) {
  const type = form.type || 'Penipuan Digital';
  const platform = form.platform || 'WhatsApp';
  const entity = (form.entity || '').trim() || '[Nama Instansi / Modus yang Dicatut]';
  const suspect = (form.suspect || '').trim() || '[Nomor HP / Rekening / URL Pelaku]';
  const loss = (form.loss || '').trim() || '[Rincian Waktu & Nominal / Tindakan yang Terjadi]';
  const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });

  return [
    `LAPORAN KRONOLOGI INSIDEN PENIPUAN DIGITAL`,
    `Waktu Penyusunan : ${nowStr}`,
    `Kategori Insiden : ${type}`,
    `Kanal Komunikasi : ${platform}`,
    `Modus / Catutan  : Mengatasnamakan ${entity}`,
    `Identitas Pelaku : ${suspect}`,
    `Detail Kejadian  : ${loss}`,
    ``,
    `PERMOHONAN TINDAK LANJUT:`,
    `Melalui laporan ini, saya memohon bantuan pihak Bank / Otoritas terkait untuk melakukan pemeriksaan dan pemblokiran darurat terhadap nomor rekening atau akses pelaku tersebut, serta menerbitkan nomor tiket pelaporan resmi untuk proses tindak lanjut ke Indonesia Anti-Scam Centre (OJK 157) dan Kepolisian.`
  ].join('\n');
}

/**
 * Builds a concise warning message to share with family or community groups.
 * @param {{
 *   platform?: string,
 *   entity?: string,
 *   suspect?: string
 * }} form
 * @returns {string}
 */
export function buildFamilyWarningDraft(form = {}) {
  const platform = form.platform || 'WhatsApp';
  const entity = (form.entity || '').trim() || 'Instansi/Undian/Kurir';
  const suspect = (form.suspect || '').trim() || '(Nomor/Tautan tidak dikenal)';

  return [
    `PERINGATAN PENIPUAN DIGITAL`,
    `Harap waspada jika menerima pesan melalui ${platform} yang mengatasnamakan ${entity}.`,
    ``,
    `Kontak atau tautan pelaku: ${suspect}`,
    `Jangan mengeklik tautan tidak resmi, jangan mengunduh berkas .APK, jangan membagikan kode OTP/PIN, dan jangan mentransfer uang deposit apa pun.`,
    `Selalu periksa kebenaran informasi hanya melalui aplikasi resmi atau Call Center resmi.`
  ].join('\n');
}
