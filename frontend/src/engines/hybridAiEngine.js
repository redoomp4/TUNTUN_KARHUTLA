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
 *   responses via the free OpenAI-compatible Pollinations endpoint
 *   (`https://text.pollinations.ai/openai`) + optional user Gemini/Groq key, with
 *   a context-aware local synthesizer fallback (NFR-09 Graceful Degradation).
 */

export const SPARRING_PERSONAS = {
  hackedFriend: {
    id: 'hackedFriend',
    label: 'Teman Pinjam Uang (WA Dibajak)',
    shortTag: 'Modus WA Dibajak',
    contactName: 'Raka: Teman Kuliah (WA Dibajak)',
    contactAvatar: 'RK',
    openingMessage:
      'Bro, tolong banget pinjam Rp 1.500.000 sekarang. M-banking gue terblokir, harus deposit IGD rumah sakit darurat. Transfer ke BRI 0419-01-99281 a.n. Dedi Pratama dulu ya, malam ini gue ganti.',
    localFallbacks: [
      'Tolong banget bro, ini lagi di kasir IGD harus deposit sekarang. Nanti gue telepon kalau urusan udah beres, transfer dulu aja ke rekening Dedi Pratama itu ya.',
      'HP gue kameranya lagi rusak jadi gak bisa video call. Udah kirim aja dulu Rp 1,5 juta atau Rp 500 ribu dulu, darurat banget ini.',
      'Kalau lo gak percaya ya udah, tapi ini beneran gue lagi butuh cepat.'
    ]
  },
  fakeCourier: {
    id: 'fakeCourier',
    label: 'Kurir File .APK Resi Palsu',
    shortTag: 'Modus Malware .APK',
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
    label: 'CS Bank Minta Kode OTP',
    shortTag: 'Modus Phishing OTP',
    contactName: 'Unit Keamanan Transaksi Bank',
    contactAvatar: 'CS',
    openingMessage:
      'Peringatan Keamanan: Terdeteksi transaksi pembelian sebesar Rp 8.900.000 pada akun Anda. Jika bukan Anda, segera sebutkan 6 digit kode OTP yang baru masuk ke SMS Anda agar kami batalkan sekarang.',
    localFallbacks: [
      'Waktu pemblokiran hanya tersisa 2 menit Pak/Bu. Sebutkan saja 6 angka kode OTP di SMS tersebut supaya mesin kami membatalkan pendebitan Rp 8.900.000.',
      'Kami dari petugas pusat tidak meminta uang, hanya butuh kode OTP pembatalan agar saldo Anda tidak terpotong otomatis.',
      'Jika Anda menutup percakapan ini, transaksi Rp 8.900.000 akan langsung kami setujui.'
    ]
  },
  fakeJobVip: {
    id: 'fakeJobVip',
    label: 'Admin Kerja Paruh Waktu VIP',
    shortTag: 'Modus Deposit Tugas',
    contactName: 'Mentor Tugas VIP E-Commerce',
    contactAvatar: 'VIP',
    openingMessage:
      'Selamat Kak! Komisi tugas pertama Rp 75.000 sudah cair. Untuk membuka Tugas Bundling VIP dengan komisi Rp 1.850.000, silakan top-up deposit Rp 500.000 ke rekening bendahara kami sekarang.',
    localFallbacks: [
      'Slot VIP tinggal 1 orang lagi Kak! Begitu deposit Rp 500.000 masuk, modal beserta komisi Rp 1.850.000 langsung cair otomatis ke rekening Kakak dalam 5 menit.',
      'Tidak bisa dipotong dari komisi Kak, karena sistem merchant mewajibkan saldo akun aktif minimal Rp 500.000 agar pesanan terbuka.',
      'Semua anggota grup Telegram kami sudah cair jutaan hari ini Kak, jangan sampai hangus kuotanya.'
    ]
  }
};

const PERSONA_ALIAS_MAP = {
  courier: 'fakeCourier',
  bank: 'fakeBankCs',
  job: 'fakeJobVip',
  hackedFriend: 'hackedFriend',
  fakeCourier: 'fakeCourier',
  fakeBankCs: 'fakeBankCs',
  fakeJobVip: 'fakeJobVip'
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
 * Context-aware deterministic conversational synthesizer so even when offline or
 * rate-limited, the chatbot responds directly to the user's exact words and questions.
 *
 * @param {string} personaKey
 * @param {number} turnIndex
 * @param {string} userMessage
 * @returns {string}
 */
export function buildSmartContextualScammerReply(personaKey, turnIndex, userMessage = '') {
  const lower = userMessage.toLowerCase();
  const resolvedKey = PERSONA_ALIAS_MAP[personaKey] || personaKey || 'hackedFriend';
  const persona = SPARRING_PERSONAS[resolvedKey] || SPARRING_PERSONAS.hackedFriend;

  if (resolvedKey === 'hackedFriend') {
    if (/(video\s*call|vc|telepon|telpon|suara|muka)/i.test(lower)) {
      return 'Waduh bro, di ruang tindakan IGD lagi gak boleh berisik dan kamera depan HP gue retak parah. Udah percaya aja sama gue, transfer dulu ke BRI Dedi Pratama itu ya, darurat banget!';
    }
    if (/(dedi\s*pratama|beda\s*nama|rekening\s*siapa|bukan\s*nama\s*lo)/i.test(lower)) {
      return 'Itu rekening perawat bagian administrasi IGD-nya bro, soalnya m-banking atas nama gue lagi ke-reset. Tolong banget talangin Rp 1,5 juta sekarang, jam 8 malam gue ganti lebih.';
    }
    if (/(rumah\s*sakit\s*mana|rs\s*mana|sakit\s*apa|siapa\s*yang\s*sakit)/i.test(lower)) {
      return 'Ini di RS Medika Sentral, adek gue jatuh dari motor harus langsung tindakan sekarang. Kasirnya nunggu bukti transfer Rp 1,5 juta dalam 5 menit, tolong bantu dulu bro!';
    }
    if (/(penipu|bajak|hack|scam|bohong|lapor)/i.test(lower)) {
      return 'Astaga tega banget lo nuduh gue penipu pas lagi musibah begini. Kalau gak mau bantu bilang aja bro, gak usah nuduh akun dibajak!';
    }
  }

  if (resolvedKey === 'fakeCourier') {
    if (/(foto\s*biasa|jpg|png|screenshot|jangan\s*apk|tidak\s*mau\s*apk)/i.test(lower)) {
      return 'Dari sistem scanner gudang pusat otomatis ter-export jadi file aplikasi .APK Kak, tidak bisa foto JPG biasa. Kalau Kakak tidak buka dan klik Izinkan SMS sekarang, paket terpaksa kami retur.';
    }
    if (/(nomor\s*resi|no\s*resi|cek\s*sendiri|aplikasi\s*resmi|web\s*resmi)/i.test(lower)) {
      return 'Resinya belum terbaca di aplikasi publik karena barcode-nya terkelupas Kak. Makanya wajib buka file Cek_Resi_Pengiriman.pdf.apk yang saya kirim barusan untuk konfirmasi manual.';
    }
    if (/(satpam|taruh\s*saja|titip|retur\s*saja)/i.test(lower)) {
      return 'Tidak bisa dititip satpam Kak, harus ada tanda tangan digital lewat aplikasi resi .APK yang saya kirim tadi sebelum kurir berangkat.';
    }
  }

  if (resolvedKey === 'fakeBankCs') {
    if (/(call\s*center|1500888|14017|14000|157|kantor\s*cabang|aplikasi\s*resmi)/i.test(lower)) {
      return 'Antrean telepon Call Center sedang penuh Pak/Bu, dan transaksi Rp 8.900.000 ini akan otomatis terdebet dalam 90 detik jika Anda tidak menyebutkan 6 digit kode OTP pembatalan di chat ini.';
    }
    if (/(tidak\s*akan|rahasia|jangan\s*kasih\s*otp|penipu|bank\s*tidak\s*minta\s*otp)/i.test(lower)) {
      return 'Ini bukan OTP transaksi Pak/Bu, melainkan Kode Otorisasi Pembatalan (Void OTP) dari sistem pusat. Jika tidak disebutkan sekarang, dana Rp 8.900.000 tidak dapat kami bekukan.';
    }
    if (/(\d{6}|\d{4})/i.test(lower)) {
      return 'Kode sedang kami masukkan ke terminal... Tunggu sebentar, sistem meminta 6 digit kode OTP kedua yang baru saja masuk ke SMS Anda untuk menyelesaikan pembatalan.';
    }
  }

  if (resolvedKey === 'fakeJobVip') {
    if (/(potong\s*komisi|tidak\s*mau\s*deposit|jangan\s*transfer|penipu|scam|berhenti)/i.test(lower)) {
      return 'Sayang sekali Kak, padahal komisi Rp 1.850.000 sudah siap cair di sistem! Hanya perlu top-up aktivasi Rp 500.000 ke rekening bendahara kami, 5 menit langsung balik modal penuh.';
    }
    if (/(rekening\s*pribadi|ojk|ilegal|lapor)/i.test(lower)) {
      return 'Kami menggunakan rekening bendahara mitra resmi Kak agar pencairan komisi bebas pajak. Kuota tinggal 10 menit lagi sebelum akun Kakak dibekukan.';
    }
  }

  const fallbackList = persona.localFallbacks;
  return fallbackList[turnIndex % fallbackList.length];
}

/**
 * Extracts clean text from Pollinations / OpenAI JSON or plain-text responses.
 * @param {string} rawBody
 * @returns {string}
 */
function parseAiResponseText(rawBody) {
  if (!rawBody) return '';
  const trimmed = rawBody.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const content = parsed?.choices?.[0]?.message?.content;
      if (typeof content === 'string' && content.trim()) {
        return content.trim();
      }
    } catch {
      return '';
    }
  }
  if (/free limit reached|402 payment required|error|bad gateway/i.test(trimmed)) {
    return '';
  }
  return trimmed;
}

/**
 * Generates dynamic scammer dialogue using Free Hybrid AI (`https://text.pollinations.ai/openai`)
 * with conversation history and automatic contextual fallback (satisfies NFR-09).
 *
 * @param {string} personaKey
 * @param {number} turnIndex
 * @param {string} userMessage
 * @param {{ forceOffline?: boolean, history?: Array<{sender: string, text: string}> }} [options]
 * @returns {Promise<{ replyText: string, source: 'AI_HYBRID'|'LOCAL_FALLBACK', providerName?: string }>}
 */
export async function requestHybridScammerReply(personaKey, turnIndex, userMessage, options = {}) {
  const resolvedKey = PERSONA_ALIAS_MAP[personaKey] || personaKey || 'hackedFriend';
  const persona = SPARRING_PERSONAS[resolvedKey] || SPARRING_PERSONAS.hackedFriend;
  const smartFallback = buildSmartContextualScammerReply(resolvedKey, turnIndex, userMessage);

  if (options.forceOffline) {
    return {
      replyText: smartFallback,
      source: 'LOCAL_FALLBACK',
      providerName: 'Mesin Kontekstual Lokal (NFR-09)'
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8500);

  try {
    const systemPrompt = [
      `Kamu sedang berperan sebagai lawan latihan (roleplay) bernama "${persona.contactName}" dalam simulator edukasi keamanan siber TUNTUN.`,
      `Skenario: ${persona.label}. Pesan pembuka kamu tadi: "${persona.openingMessage}".`,
      `Aturan: Balas langsung kalimat pengguna berikut dalam 1-2 kalimat bahasa Indonesia yang natural dan mendesak sesuai peranmu (misalnya beralasan kamera rusak jika diminta video call, atau mendesak waktu habis).`,
      `Jangan gunakan emoji, jangan kirim link aktif berbahaya, dan jangan keluar dari karakter.`
    ].join(' ');

    const historyMessages = (options.history || []).slice(-4).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'openai-fast',
        messages: [
          { role: 'system', content: systemPrompt },
          ...historyMessages,
          { role: 'user', content: userMessage }
        ]
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        replyText: smartFallback,
        source: 'LOCAL_FALLBACK',
        providerName: 'Mesin Kontekstual Lokal (NFR-09)'
      };
    }

    const rawBody = await response.text();
    const cleaned = parseAiResponseText(rawBody);
    if (!cleaned || cleaned.length < 8 || cleaned.length > 550) {
      return {
        replyText: smartFallback,
        source: 'LOCAL_FALLBACK',
        providerName: 'Mesin Kontekstual Lokal (NFR-09)'
      };
    }

    return {
      replyText: cleaned,
      source: 'AI_HYBRID',
      providerName: 'Pollinations OpenAI Gratis (Aktif)'
    };
  } catch {
    clearTimeout(timeoutId);
    return {
      replyText: smartFallback,
      source: 'LOCAL_FALLBACK',
      providerName: 'Mesin Kontekstual Lokal (NFR-09)'
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

/**
 * Generates a deterministic local contextual synthesis when the external AI API
 * is offline or unreachable (NFR-09 compliance).
 *
 * @param {string} rawText
 * @param {object} heuristicResult
 * @returns {string}
 */
export function buildDeterministicContextualSummary(rawText = '', heuristicResult = {}) {
  const score = heuristicResult?.score ?? 0;
  const isPromo = Boolean(heuristicResult?.isTelcoPromoBroadcast);

  if (isPromo && score < 35) {
    return 'Pesan ini adalah iklan promosi resmi operator seluler (MyAds & STOP 8000), bukan penipuan atau pencurian OTP. Anda aman.';
  }

  if (score >= 60) {
    return `Bahaya (Skor ${score}/100): Terdeteksi upaya penipuan. Jangan buka tautan, jangan instal .APK, dan jangan berikan kode OTP.`;
  }

  if (score >= 25) {
    return `Waspada (Skor ${score}/100): Ditemukan indikasi mencurigakan. Selalu konfirmasi melalui aplikasi atau kontak resmi instansi.`;
  }

  return 'Aman (Skor 0/100): Tidak ditemukan indikasi bahaya atau berkas berbahaya. Tetap jaga kerahasiaan kata sandi dan PIN Anda.';
}

/**
 * Hybrid AI Deep Message Analyzer (AI Second-Opinion + Deterministic Guardrail).
 * Uses free OpenAI-compatible Pollinations endpoint (`https://text.pollinations.ai/openai`)
 * while strictly preserving the deterministic score from heuristicEngine.js (prompt.MD Rule #5).
 *
 * @param {string} rawText
 * @param {object} heuristicResult
 * @returns {Promise<{ summaryText: string, source: 'AI_HYBRID'|'LOCAL_FALLBACK', providerName: string }>}
 */
export async function requestHybridMessageAnalysis(rawText, heuristicResult) {
  const localSummary = buildDeterministicContextualSummary(rawText, heuristicResult);

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { summaryText: localSummary, source: 'LOCAL_FALLBACK', providerName: 'Analisis Lokal (Offline)' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6500);

  try {
    const isPromo = Boolean(heuristicResult?.isTelcoPromoBroadcast);
    const systemPrompt = [
      'Anda adalah Asisten Analis Keamanan Siber TUNTUN.',
      `Konteks: ${isPromo ? 'Pesan teridentifikasi sebagai broadcast iklan promosi operator.' : `Skor risiko: ${heuristicResult?.score ?? 0}/100.`}`,
      'Berikan kesimpulan verifikasi dalam MAKSIMAL 2 kalimat Bahasa Indonesia yang sangat jelas, ramah, dan mudah dipahami remaja hingga lansia.',
      'Sebutkan dengan tegas: Apakah pesan ini aman/resmi atau penipuan, dan tindakan apa yang sebaiknya diambil penerima.'
    ].join(' ');

    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'openai-fast',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Evaluasi pesan ini secara objektif:\n"${rawText}"` }
        ]
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { summaryText: localSummary, source: 'LOCAL_FALLBACK', providerName: 'Analisis Lokal Cepat' };
    }

    const rawBody = await response.text();
    const cleaned = parseAiResponseText(rawBody);
    if (!cleaned || cleaned.length < 15 || cleaned.length > 520) {
      return { summaryText: localSummary, source: 'LOCAL_FALLBACK', providerName: 'Analisis Lokal Cepat' };
    }

    return {
      summaryText: cleaned,
      source: 'AI_HYBRID',
      providerName: 'AI Cloud Gratis (Online)'
    };
  } catch {
    clearTimeout(timeoutId);
    return {
      summaryText: localSummary,
      source: 'LOCAL_FALLBACK',
      providerName: 'Analisis Lokal Cepat'
    };
  }
}

/**
 * Free Interactive AI Chatbot Consultation for Scanner / Simulator.
 * Allows users to ask any question to the free AI about the scanned message.
 *
 * @param {string} userQuestion
 * @param {string} contextMessage
 * @returns {Promise<string>}
 */
export async function askAiChatbotFree(userQuestion, contextMessage = '') {
  const fallback = 'Pihak resmi tidak pernah meminta kode OTP, PIN, atau mengunduh berkas .APK melalui chat. Selalu hubungi Call Center resmi jika Anda ragu.';

  if (!userQuestion || !userQuestion.trim()) return fallback;

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return fallback;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'openai-fast',
        messages: [
          {
            role: 'system',
            content:
              'Anda adalah Asisten Keamanan TUNTUN. Jawab pertanyaan pengguna dengan ramah, lugas, dan praktis dalam maksimal 2 kalimat Bahasa Indonesia agar mudah dipahami dari remaja hingga lansia. Konteks pesan yang diperiksa: "' +
              (contextMessage || '').slice(0, 200) +
              '"'
          },
          { role: 'user', content: userQuestion.trim() }
        ]
      })
    });

    clearTimeout(timeoutId);
    if (!response.ok) return fallback;

    const rawBody = await response.text();
    const cleaned = parseAiResponseText(rawBody);
    return cleaned && cleaned.length >= 10 ? cleaned : fallback;
  } catch {
    clearTimeout(timeoutId);
    return fallback;
  }
}
