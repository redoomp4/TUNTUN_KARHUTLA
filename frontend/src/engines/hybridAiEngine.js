/**
 * @fileoverview Hybrid AI Dynamic Sparring & Safe Verification Reply Engine
 * @module engines/hybridAiEngine
 *
 * Implements prompt.MD Section 4 Rule #5 & Section 10/12 (NFR-09):
 * - "AI dapat dipertimbangkan sebagai pengembangan lanjutan untuk membuat dialog
 *    lebih dinamis, tetapi bukan sebagai penentu utama kebenaran penilaian."
 * - Deterministic Guardrail Engine (`evaluateUserDefenseResponse`) is ALWAYS the
 *   sole authority for scoring and safety evaluation.
 * - Hybrid AI Layer (`requestHybridScammerReply`) generates dynamic conversational
 *   responses via a keyless public LLM endpoint with automatic timeout and
 *   100% reliable local fallback (NFR-09 Graceful Degradation).
 */

export const SPARRING_PERSONAS = {
  hackedFriend: {
    id: 'hackedFriend',
    label: 'Teman pinjam uang mendadak (WA dibajak)',
    contactName: 'Raka - Teman Kuliah (Akun Dibajak)',
    contactAvatar: 'RK',
    openingMessage:
      'Bro, tolong banget pinjam Rp 1.500.000 sekarang. M-banking gue lagi terblokir, harus bayar rumah sakit darurat. Transfer ke rekening BRI 0419-01-99281 a.n. Dedi Pratama dulu ya, nanti malam gue ganti.',
    localFallbacks: [
      'Tolong banget bro, ini lagi di kasir IGD harus deposit sekarang. Nanti gue telepon kalau urusan udah beres, transfer dulu aja ke rekening Dedi Pratama itu ya.',
      'HP gue kameranya lagi rusak jadi gak bisa video call. Udah kirim aja dulu Rp 1,5 juta atau Rp 500 ribu dulu, darurat banget ini.',
      'Kalau lo gak percaya ya udah, tapi ini beneran gue lagi butuh cepat.'
    ]
  },
  fakeCourier: {
    id: 'fakeCourier',
    label: 'Kurir mendesak buka berkas .APK',
    contactName: 'Kurir Gudang Ekspedisi',
    contactAvatar: 'KG',
    openingMessage:
      'Selamat siang, paket Anda tertahan di gudang sortir karena label alamat rusak. Silakan buka lampiran Cek_Resi_Pengiriman.pdf.apk yang saya kirim dan izinkan akses SMS agar kurir bisa jalan sekarang.',
    localFallbacks: [
      'Tidak bisa dikirim foto biasa Kak, aturan dari sistem pusat harus buka berkas aplikasi resi itu. Kalau lewat 15 menit paket kami retur ke pengirim.',
      'Aman Kak itu aplikasi resmi gudang kami. Tinggal klik instal lalu pilih Izinkan Semua pada notifikasi SMS.',
      'Kalau Kakak cek di web memang belum muncul karena belum sinkronisasi lewat aplikasi yang saya kirim tadi.'
    ]
  },
  fakeBankCs: {
    id: 'fakeBankCs',
    label: 'CS bank meminta kode OTP pembatalan',
    contactName: 'Unit Keamanan Transaksi Bank',
    contactAvatar: 'CS',
    openingMessage:
      'Peringatan Keamanan: Terdeteksi transaksi pembelian sebesar Rp 8.900.000 pada akun Anda. Jika bukan Anda, segera sebutkan 6 digit kode OTP yang baru masuk ke SMS Anda agar kami batalkan sekarang.',
    localFallbacks: [
      'Waktu pemblokiran hanya tersisa 2 menit Pak/Bu. Sebutkan saja 6 angka kode OTP di SMS tersebut supaya mesin kami membatalkan pendebitan Rp 8.900.000.',
      'Kami dari petugas pusat tidak meminta uang, hanya butuh kode OTP pembatalan agar saldo Anda tidak terpotong otomatis.',
      'Jika Anda menutup percakapan ini, transaksi Rp 8.900.000 akan langsung kami setujui.'
    ]
  }
};

/**
 * Deterministic Guardrail Evaluator (Penentu Utama Kebenaran Penilaian).
 * Evaluates a user's free-text reply in the sparring simulator.
 *
 * @param {string} userReply
 * @returns {{
 *   verdict: 'DANGEROUS'|'STRONG_DEFENSE'|'NEUTRAL_CAUTION',
 *   scoreDelta: number,
 *   badgeText: string,
 *   headline: string,
 *   explanation: string,
 *   checklistMatched: string[]
 * }}
 */
export function evaluateUserDefenseResponse(userReply) {
  const text = (userReply || '').trim();
  const lower = text.toLowerCase();
  const checklistMatched = [];

  // 1. Check if user leaked OTP, PIN, CVV, Password, or agreed to transfer/install
  const leakedOtpOrPin =
    /\b(\d{6}|\d{4})\b/.test(text) &&
    !/(1500888|14017|14000|1500046|14040|157|\brp\b)/i.test(text);
  const agreedToDanger =
    /\b(saya\s*transfer\s*sekarang|sudah\s*saya\s*transfer|sudah\s*saya\s*instal|ini\s*kode\s*otp|otp\s*saya|pin\s*saya|cvv\s*saya)\b/i.test(lower);

  if (leakedOtpOrPin || agreedToDanger) {
    return {
      verdict: 'DANGEROUS',
      scoreDelta: -45,
      badgeText: 'Berisiko tinggi',
      headline: 'Terdeteksi penyerahan data rahasia atau persetujuan berisiko',
      explanation:
        'Evaluasi deterministik mendeteksi bahwa balasan Anda memberikan angka kode rahasia (OTP/PIN) atau menyetujui instruksi pelaku tanpa verifikasi.',
      checklistMatched: ['Hindari mengirim angka OTP/PIN atau menyetujui transfer langsung']
    };
  }

  // 2. Check for strong active defense & verification tactics
  if (/\b(video\s*call|vc|telepon\s*langsung|suara|ketemuan|tanya\s*dulu)\b/i.test(lower)) {
    checklistMatched.push('Meminta verifikasi tatap muka (video call / telepon langsung)');
  }
  if (/\b(aplikasi\s*resmi|call\s*center|1500888|14017|14000|157|cek\s*di\s*web\s*resmi|situs\s*resmi|m-?banking)\b/i.test(lower)) {
    checklistMatched.push('Mengalihkan pengecekan ke kanal atau aplikasi resmi');
  }
  if (/\b(tidak\s*mau\s*buka|jangan\s*kirim\s*apk|format\s*jpg|foto\s*biasa|tidak\s*akan\s*kasih\s*otp|rahasia|penipu|blokir|rekening\s*beda\s*nama)\b/i.test(lower)) {
    checklistMatched.push('Menolak tegas permintaan APK, OTP, atau rekening pihak ketiga');
  }

  if (checklistMatched.length > 0) {
    return {
      verdict: 'STRONG_DEFENSE',
      scoreDelta: 15,
      badgeText: 'Pertahanan tepat',
      headline: 'Respons verifikasi kritis dan aman',
      explanation:
        'Anda menerapkan prinsip verifikasi independen dan menolak mengikuti tekanan waktu pelaku.',
      checklistMatched
    };
  }

  return {
    verdict: 'NEUTRAL_CAUTION',
    scoreDelta: 0,
    badgeText: 'Netral / perlu ketegasan',
    headline: 'Balasan belum memutus manipulasi pelaku',
    explanation:
      'Anda belum membocorkan data rahasia, namun pelaku masih dapat mendesak Anda. Gunakan penolakan tegas atau minta verifikasi melalui kanal resmi.',
    checklistMatched: ['Tambahkan verifikasi kanal resmi atau video call']
  };
}

/**
 * Generates dynamic scammer dialogue using Hybrid AI with automatic timeout
 * and deterministic offline fallback (satisfies NFR-09).
 *
 * @param {string} personaKey
 * @param {number} turnIndex
 * @param {string} userMessage
 * @param {{ forceOffline?: boolean }} [options]
 * @returns {Promise<{ replyText: string, source: 'AI_HYBRID'|'LOCAL_FALLBACK' }>}
 */
export async function requestHybridScammerReply(personaKey, turnIndex, userMessage, options = {}) {
  const persona = SPARRING_PERSONAS[personaKey] || SPARRING_PERSONAS.hackedFriend;
  const fallbackList = persona.localFallbacks;
  const fallbackReply = fallbackList[turnIndex % fallbackList.length];

  if (options.forceOffline) {
    return {
      replyText: fallbackReply,
      source: 'LOCAL_FALLBACK'
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3800);

  try {
    const systemPrompt = [
      `Kamu berperan sebagai karakter simulasi edukasi keamanan siber bernama "${persona.contactName}".`,
      `Konteks simulasi: ${persona.label}.`,
      `Balas pesan pengguna berikut dalam 1-2 kalimat singkat bahasa Indonesia untuk menguji ketahanan pengguna terhadap bujukan rekayasa sosial.`,
      `Jangan pernah menyertakan tautan aktif berbahaya. Tetap dalam konteks simulasi edukatif.`
    ].join(' ');

    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        model: 'openai',
        seed: 42
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { replyText: fallbackReply, source: 'LOCAL_FALLBACK' };
    }

    const rawText = (await response.text()).trim();
    if (!rawText || rawText.length < 10 || rawText.length > 450) {
      return { replyText: fallbackReply, source: 'LOCAL_FALLBACK' };
    }

    return {
      replyText: rawText,
      source: 'AI_HYBRID'
    };
  } catch {
    clearTimeout(timeoutId);
    return {
      replyText: fallbackReply,
      source: 'LOCAL_FALLBACK'
    };
  }
}

/**
 * Generates 3 practical, copy-ready verification replies based on the detected scam type
 * so users know exactly what to reply to test a suspicious sender.
 *
 * @param {string} rawText
 * @returns {Array<{ label: string, reply: string }>}
 */
export function generateSafeVerificationReplies(rawText = '') {
  const lower = rawText.toLowerCase();

  if (/(\.apk|kurir|paket|resi|ekspedisi)/i.test(lower)) {
    return [
      {
        label: '1. Tolak file APK & minta foto standar',
        reply: 'Maaf Pak, saya tidak membuka file berakhiran .APK. Tolong kirimkan foto paket biasa (JPG) atau sebutkan nomor resi agar saya cek langsung di aplikasi resmi ekspedisi.'
      },
      {
        label: '2. Konfirmasi penitipan tanpa buka tautan',
        reply: 'Paket silakan ditaruh di pos satpam saja Pak, saya sedang memverifikasi nomor resi ini melalui Call Center resmi ekspedisi.'
      },
      {
        label: '3. Peringatan ke grup keluarga',
        reply: 'Info penting untuk keluarga di rumah: jika ada nomor asing mengaku kurir dan mengirim file berakhiran .APK atau .PDF.APK, jangan pernah dibuka atau diinstal karena itu penyadap SMS OTP bank.'
      }
    ];
  }

  if (/(otp|pin|tarif|bank|bca|bri|mandiri|bni|blokir)/i.test(lower)) {
    return [
      {
        label: '1. Tolak tautan & alihkan ke Call Center resmi',
        reply: 'Terima kasih informasinya. Saya tidak mengisi formulir melalui tautan luar dan akan mengonfirmasi langsung melalui aplikasi mobile banking resmi serta Call Center resmi bank.'
      },
      {
        label: '2. Tegaskan kerahasiaan OTP & PIN',
        reply: 'Sesuai prosedur keamanan perbankan, saya tidak pernah memberikan kode OTP, PIN, atau CVV kepada pihak mana pun.'
      },
      {
        label: '3. Peringatan ke grup keluarga',
        reply: 'Waspada modus surat perubahan tarif transfer Rp 150.000/bulan. Bank resmi tidak pernah meminta pembatalan lewat tautan web luar atau meminta PIN dan kode OTP.'
      }
    ];
  }

  return [
    {
      label: '1. Uji identitas via Video Call (antisipasi WA dibajak)',
      reply: 'Sebentar, berhubung sekarang banyak akun WhatsApp dibajak, ayo kita video call 10 detik dulu untuk memastikan ini benar-benar kamu sebelum saya proses.'
    },
    {
      label: '2. Tolak transfer deposit / rekening pihak ketiga',
      reply: 'Maaf, saya tidak melakukan pembayaran deposit di muka atau transfer ke rekening pribadi yang berbeda nama tanpa verifikasi kanal resmi.'
    },
    {
      label: '3. Peringatan ke grup keluarga',
      reply: 'Hati-hati jika ada tawaran kerja paruh waktu yang meminta uang deposit atau pesan teman meminjam uang mendadak ke rekening beda nama. Wajib video call terlebih dahulu.'
    }
  ];
}
