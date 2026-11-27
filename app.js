'use strict';

(() => {
  const HISTORY_KEY = 'amanbersama.history.v1';
  const REPORTS_KEY = 'amanbersama.reports.v1';
  const MAX_FILE_BYTES = 20 * 1024 * 1024;
  const PAGE_NAMES = {
    dashboard: 'Dashboard', message: 'Deteksi Pesan Scam', link: 'Link Scanner', file: 'File Scanner',
    number: 'Cek Nomor & Rekening', reports: 'Laporan Komunitas', education: 'Edukasi Digital', history: 'Riwayat Pemeriksaan'
  };
  const PAGE_ICONS = { message: '▤', link: '↗', file: '▧', number: '⌕' };
  const ARTICLE_DATA = {
    checklist: {
      category: 'CHECKLIST', title: 'Checklist sebelum percaya pada pesan digital',
      intro: 'Gunakan langkah sederhana ini setiap kali menerima pesan yang meminta tindakan cepat.',
      points: [
        'Berhenti sejenak. Jangan langsung mengeklik tautan, mengunduh lampiran, atau mentransfer uang.',
        'Periksa identitas pengirim melalui nomor atau situs resmi yang kamu cari sendiri.',
        'Jangan pernah membagikan OTP, PIN, kata sandi, kode pemulihan, atau data kartu.',
        'Periksa alamat situs dengan teliti. HTTPS saja tidak menjamin situs tersebut resmi.',
        'Konfirmasi permintaan uang melalui kanal lain yang sudah kamu kenal.',
        'Simpan bukti dan laporkan melalui kanal resmi apabila menemukan dugaan penipuan.'
      ]
    },
    phishing: {
      category: 'PHISHING', title: 'Kenali tautan phishing sebelum kamu klik',
      intro: 'Phishing adalah upaya mengelabui seseorang agar memberikan informasi atau melakukan tindakan yang menguntungkan pelaku.',
      points: [
        'Baca nama domain dari kanan ke kiri sebelum bagian path. Domain resmi tidak ditentukan hanya oleh tulisan besar pada halaman.',
        'Waspadai salah eja, tambahan karakter, subdomain panjang, dan nama domain yang meniru merek terkenal.',
        'Jangan masuk melalui tautan yang dikirim secara tiba-tiba. Ketik alamat situs resmi sendiri atau gunakan aplikasi resmi.',
        'Jangan mengisi kata sandi, OTP, atau data pembayaran pada halaman yang asal-usulnya tidak jelas.',
        'HTTPS hanya mengenkripsi koneksi; HTTPS bukan bukti bahwa pemilik situs dapat dipercaya.'
      ]
    },
    whatsapp: {
      category: 'WHATSAPP', title: 'Modus penipuan melalui pesan WhatsApp',
      intro: 'Pelaku sering memanfaatkan kedekatan, kepanikan, atau rasa penasaran agar korban bertindak tanpa memeriksa.',
      points: [
        'Waspadai file APK yang dikirim dengan alasan undangan, resi, foto, atau tagihan. Jangan memasang aplikasi dari sumber yang tidak jelas.',
        'Kode OTP dan PIN tidak boleh diberikan kepada siapa pun, termasuk orang yang mengaku petugas.',
        'Verifikasi permintaan bantuan uang dengan menelepon orang yang bersangkutan melalui nomor yang sudah tersimpan.',
        'Jangan percaya hadiah atau undian yang mensyaratkan biaya administrasi atau pengiriman uang.',
        'Aktifkan verifikasi dua langkah dan batasi siapa yang dapat menambahkan akunmu ke grup.'
      ]
    },
    marketplace: {
      category: 'MARKETPLACE', title: 'Belanja online dengan transaksi lebih aman',
      intro: 'Transaksi di luar platform dapat menghilangkan perlindungan pembeli dan menyulitkan penyelesaian sengketa.',
      points: [
        'Lakukan pembayaran, komunikasi, dan pencatatan transaksi melalui fitur resmi platform.',
        'Hindari penjual yang mendesak transfer langsung ke rekening pribadi di luar alur pembayaran.',
        'Periksa ulasan secara kritis. Waspadai ulasan yang seragam atau akun yang baru dibuat.',
        'Jangan membagikan kode OTP atau tautan pemulihan akun kepada pihak yang mengaku kurir atau admin.',
        'Simpan bukti transaksi dan komunikasi sampai pesanan benar-benar selesai.'
      ]
    },
    investasi: {
      category: 'INVESTASI', title: 'Waspada janji keuntungan investasi pasti',
      intro: 'Penawaran yang menjanjikan keuntungan besar, cepat, dan tanpa risiko merupakan tanda bahaya yang perlu diperiksa.',
      points: [
        'Jangan mengambil keputusan hanya karena testimoni, tangkapan layar keuntungan, atau tekanan waktu.',
        'Cari informasi izin dan status pihak yang menawarkan melalui regulator resmi.',
        'Pahami cara kerja produk, biaya, risiko, dan bagaimana dana dapat ditarik.',
        'Jangan mentransfer uang ke rekening pribadi yang tidak sesuai dengan identitas penyelenggara.',
        'Minta pendapat pihak independen sebelum menempatkan dana.'
      ]
    },
    lowongan: {
      category: 'LOWONGAN KERJA', title: 'Periksa lowongan kerja sebelum mengirim uang',
      intro: 'Penipuan lowongan dapat meminta biaya pendaftaran, pelatihan, seragam, atau perjalanan dengan alasan proses rekrutmen.',
      points: [
        'Cari lowongan pada situs karier resmi perusahaan dan periksa alamat email perekrut.',
        'Waspadai permintaan biaya untuk wawancara, administrasi, pelatihan wajib, atau jaminan pekerjaan.',
        'Periksa apakah deskripsi pekerjaan, lokasi, dan identitas perusahaan masuk akal.',
        'Jangan mengirim foto identitas atau data rekening sebelum mengetahui pihak yang menerima dan tujuannya.',
        'Hubungi perusahaan melalui kontak resmi yang ditemukan secara mandiri untuk mengonfirmasi lowongan.'
      ]
    },
    akun: {
      category: 'KEAMANAN AKUN', title: 'Lindungi akun dengan kebiasaan yang benar',
      intro: 'Keamanan akun dibangun dari kebiasaan yang konsisten, bukan hanya satu aplikasi keamanan.',
      points: [
        'Gunakan kata sandi unik untuk setiap akun penting dan simpan dengan pengelola kata sandi tepercaya.',
        'Aktifkan autentikasi multifaktor jika tersedia, terutama untuk email dan akun keuangan.',
        'Jangan membagikan OTP, PIN, kata sandi, atau kode pemulihan melalui chat atau telepon.',
        'Perbarui sistem operasi dan aplikasi dari sumber resmi.',
        'Periksa perangkat dan sesi masuk yang terhubung. Keluar dari sesi yang tidak dikenal.'
      ]
    }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function readStore(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) {
      return [];
    }
  }

  function writeStore(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      toast('Penyimpanan tidak tersedia', 'Browser tidak dapat menyimpan data lokal. Periksa pengaturan privasi atau ruang penyimpanan.', 'error');
      return false;
    }
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = String(text);
    return element;
  }

  function toast(title, message, type = 'success') {
    const region = $('#toast-region');
    if (!region) return;
    const item = makeElement('div', `toast${type === 'error' ? ' error' : ''}`);
    const icon = makeElement('span', 'toast-icon', type === 'error' ? '!' : '✓');
    const copy = makeElement('div', 'toast-copy');
    copy.append(makeElement('strong', '', title), makeElement('span', '', message));
    const close = makeElement('button', 'toast-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Tutup notifikasi');
    close.addEventListener('click', () => item.remove());
    item.append(icon, copy, close);
    region.append(item);
    window.setTimeout(() => {
      item.classList.add('toast-out');
      window.setTimeout(() => item.remove(), 220);
    }, 4200);
  }

  function showModal({ title, category = 'INFORMASI', content, symbol = '✦', confirmText = 'Mengerti', cancelText = null, onConfirm = null }) {
    const backdrop = $('#modal-backdrop');
    const actions = $('#modal-actions');
    const description = $('#modal-description');
    const previousFocus = document.activeElement;
    $('#modal-title').textContent = title;
    $('#modal-eyebrow').textContent = category;
    $('#modal-symbol').textContent = symbol;
    description.replaceChildren();
    if (typeof content === 'string') description.textContent = content;
    else if (content instanceof Node) description.append(content);
    actions.replaceChildren();

    if (cancelText) {
      const cancel = makeElement('button', 'button button-outline', cancelText);
      cancel.type = 'button';
      cancel.addEventListener('click', closeModal);
      actions.append(cancel);
    }
    const confirm = makeElement('button', 'button button-primary', confirmText);
    confirm.type = 'button';
    confirm.addEventListener('click', () => {
      closeModal();
      if (typeof onConfirm === 'function') onConfirm();
    });
    actions.append(confirm);
    backdrop.hidden = false;
    $('#modal-close').focus();
    backdrop.dataset.previousFocus = previousFocus && previousFocus.id ? previousFocus.id : '';
  }

  function closeModal() {
    const backdrop = $('#modal-backdrop');
    const previousId = backdrop.dataset.previousFocus;
    backdrop.hidden = true;
    if (previousId) {
      const previous = document.getElementById(previousId);
      if (previous) previous.focus();
    }
  }

  function setPage(page) {
    if (!PAGE_NAMES[page]) return;
    $$('.page-view').forEach(view => {
      const active = view.dataset.view === page;
      view.classList.toggle('active', active);
      view.hidden = !active;
    });
    $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.page === page));
    $('#breadcrumb-current').textContent = PAGE_NAMES[page];
    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'dashboard') updateDashboard();
    if (page === 'history') renderHistory();
    if (page === 'reports') renderReports();
  }

  function openSidebar() {
    $('#sidebar').classList.add('open');
    $('#sidebar-backdrop').classList.add('visible');
    $('#menu-toggle').setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    $('#sidebar').classList.remove('open');
    $('#sidebar-backdrop').classList.remove('visible');
    $('#menu-toggle').setAttribute('aria-expanded', 'false');
  }

  function formatDate(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Waktu tidak tersedia';
    return date.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function riskFor(score) {
    if (score >= 60) return { key: 'high', label: 'RISIKO TINGGI', title: 'Indikasi kuat perlu diwaspadai', color: '#e6535c' };
    if (score >= 30) return { key: 'medium', label: 'RISIKO SEDANG', title: 'Perlu pemeriksaan lebih lanjut', color: '#d89b2d' };
    return { key: 'low', label: 'RISIKO RENDAH', title: 'Tidak banyak indikator ditemukan', color: '#20a45a' };
  }

  function renderScoreCard(parent, score, summary, findings, recommendation, footnote) {
    const risk = riskFor(score);
    const summaryRow = makeElement('div', 'result-summary');
    const ring = makeElement('div', `risk-score-ring score-${risk.key}`);
    ring.append(makeElement('strong', '', score), makeElement('small', '', 'SKOR / 100'));
    const copy = makeElement('div', 'result-summary-copy');
    copy.append(makeElement('span', `risk-label ${risk.key}`, risk.label), makeElement('h4', '', risk.title), makeElement('p', '', summary));
    summaryRow.append(ring, copy);
    parent.append(summaryRow);

    const findingsBlock = makeElement('div', 'analysis-block');
    findingsBlock.append(makeElement('h4', '', 'Indikator yang ditemukan'));
    const list = makeElement('div', 'analysis-list');
    findings.forEach((finding, index) => {
      const item = makeElement('div', `analysis-item${finding.safe ? ' safe' : ''}`);
      item.append(makeElement('span', 'bullet', finding.safe ? '✓' : `${index + 1}`), makeElement('span', '', finding.text));
      list.append(item);
    });
    findingsBlock.append(list);
    parent.append(findingsBlock);

    const recommendationBlock = makeElement('div', 'analysis-block');
    recommendationBlock.append(makeElement('h4', '', 'Rekomendasi tindakan'));
    recommendation.forEach(text => recommendationBlock.append(makeElement('div', 'recommendation-box', text)));
    parent.append(recommendationBlock);
    parent.append(makeElement('p', 'result-footnote', footnote));
    return risk;
  }

  function saveHistory(type, target, score, summary) {
    const items = readStore(HISTORY_KEY);
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type, target: String(target).slice(0, 220), score: Math.max(0, Math.min(100, Number(score) || 0)),
      summary: String(summary).slice(0, 260), createdAt: new Date().toISOString()
    };
    items.unshift(entry);
    writeStore(HISTORY_KEY, items.slice(0, 100));
    updateDashboard();
    return entry;
  }

  function historyTypeName(type) {
    return ({ message: 'Pesan scam', link: 'Link scanner', file: 'File scanner', number: 'Nomor & rekening' })[type] || 'Pemeriksaan';
  }

  function renderActivityRow(item) {
    const risk = riskFor(item.score);
    const row = makeElement('div', 'activity-row');
    const symbol = makeElement('span', `activity-symbol ${item.score >= 60 ? 'quick-orange' : item.score >= 30 ? 'quick-purple' : 'quick-green'}`, PAGE_ICONS[item.type] || '⌕');
    const copy = makeElement('div', 'activity-copy');
    copy.append(makeElement('strong', '', item.target || historyTypeName(item.type)), makeElement('small', '', `${historyTypeName(item.type)} · ${formatDate(item.createdAt)}`));
    row.append(symbol, copy, makeElement('span', `activity-score score-${risk.key}`, `${item.score}/100`));
    return row;
  }

  function updateDashboard() {
    const history = readStore(HISTORY_KEY);
    const reports = readStore(REPORTS_KEY);
    const threats = history.filter(item => Number(item.score) >= 60).length;
    $('#stat-total').textContent = String(history.length);
    $('#stat-threats').textContent = String(threats);
    $('#stat-reports').textContent = String(reports.length);
    $('#stat-awareness').replaceChildren(document.createTextNode(String(Math.max(0, 100 - threats * 7))), makeElement('span', 'stat-suffix', '/100'));
    const activity = $('#dashboard-activity');
    activity.replaceChildren();
    if (!history.length) {
      const empty = makeElement('div', 'empty-state compact-empty');
      empty.append(makeElement('span', 'empty-icon', '◷'), makeElement('b', '', 'Belum ada aktivitas'), makeElement('p', '', 'Hasil pemeriksaanmu akan muncul di sini.'));
      activity.append(empty);
    } else {
      history.slice(0, 4).forEach(item => activity.append(renderActivityRow(item)));
    }
  }

  function renderHistory() {
    const body = $('#history-table-body');
    const type = $('#history-type').value;
    const risk = $('#history-risk').value;
    const query = $('#history-search').value.trim().toLowerCase();
    const all = readStore(HISTORY_KEY);
    const filtered = all.filter(item => {
      const typeMatch = type === 'all' || item.type === type;
      const itemRisk = riskFor(Number(item.score)).key;
      const riskMatch = risk === 'all' || itemRisk === risk;
      const queryMatch = !query || `${item.target} ${item.summary} ${historyTypeName(item.type)}`.toLowerCase().includes(query);
      return typeMatch && riskMatch && queryMatch;
    });
    body.replaceChildren();
    if (!filtered.length) {
      const row = makeElement('tr');
      const cell = makeElement('td');
      cell.colSpan = 6;
      const empty = makeElement('div', 'empty-state');
      empty.append(makeElement('span', 'empty-icon', '◷'), makeElement('b', '', all.length ? 'Tidak ada hasil yang cocok' : 'Belum ada riwayat pemeriksaan'), makeElement('p', '', all.length ? 'Coba ubah filter atau kata kunci pencarian.' : 'Mulai pemeriksaan untuk melihat catatan di halaman ini.'));
      cell.append(empty);
      row.append(cell);
      body.append(row);
    } else {
      filtered.forEach(item => {
        const riskInfo = riskFor(Number(item.score));
        const row = makeElement('tr');
        const typeCell = makeElement('td');
        const typeWrap = makeElement('div', 'history-type-cell');
        typeWrap.append(makeElement('span', 'history-type-icon', PAGE_ICONS[item.type] || '⌕'), makeElement('span', '', historyTypeName(item.type)));
        typeCell.append(typeWrap);
        const objectCell = makeElement('td', 'history-object', item.target || '—');
        objectCell.title = item.target || '';
        const riskCell = makeElement('td');
        riskCell.append(makeElement('span', `history-risk-pill ${riskInfo.key}`, riskInfo.label.replace('RISIKO ', '')));
        const scoreCell = makeElement('td', '', `${item.score}/100`);
        const timeCell = makeElement('td', '', formatDate(item.createdAt));
        const actionCell = makeElement('td');
        const remove = makeElement('button', 'table-action', '×');
        remove.type = 'button';
        remove.setAttribute('aria-label', 'Hapus satu riwayat');
        remove.dataset.deleteHistory = item.id;
        actionCell.append(remove);
        row.append(typeCell, objectCell, riskCell, scoreCell, timeCell, actionCell);
        body.append(row);
      });
    }
    $('#history-count').textContent = `Menampilkan ${filtered.length} dari ${all.length} aktivitas`;
  }

  function renderReports() {
    const target = $('#reports-feed');
    const category = $('#report-filter-category').value;
    const query = $('#report-search').value.trim().toLowerCase();
    const reports = readStore(REPORTS_KEY);
    const filtered = reports.filter(report => {
      const categoryMatch = category === 'all' || report.category === category;
      const queryMatch = !query || `${report.category} ${report.target} ${report.description}`.toLowerCase().includes(query);
      return categoryMatch && queryMatch;
    });
    target.replaceChildren();
    if (!filtered.length) {
      const empty = makeElement('div', 'empty-state');
      empty.append(makeElement('span', 'empty-icon', '◎'), makeElement('b', '', reports.length ? 'Laporan tidak ditemukan' : 'Belum ada laporan komunitas'), makeElement('p', '', reports.length ? 'Coba ubah kategori atau kata kunci.' : 'Laporan yang kamu kirim akan tersimpan secara lokal di browser ini.'));
      target.append(empty);
      return;
    }
    filtered.forEach(report => {
      const card = makeElement('article', 'report-card');
      const head = makeElement('div', 'report-card-head');
      head.append(makeElement('span', 'report-category', report.category.toUpperCase()), makeElement('span', 'report-status', 'Belum diverifikasi'));
      card.append(head, makeElement('h4', '', report.target ? `Objek: ${report.target}` : 'Laporan indikasi penipuan'), makeElement('p', '', report.description));
      const foot = makeElement('div', 'report-card-foot');
      foot.append(makeElement('span', '', report.id), makeElement('span', '', formatDate(report.createdAt)));
      card.append(foot);
      target.append(card);
    });
  }

  function runScan(button, label, callback) {
    const original = button.textContent;
    button.disabled = true;
    button.classList.add('is-scanning');
    button.replaceChildren(makeElement('span', 'button-spinner'), document.createTextNode(label));
    window.setTimeout(() => {
      try { callback(); }
      finally {
        button.disabled = false;
        button.classList.remove('is-scanning');
        button.textContent = original;
      }
    }, 650);
  }

  function findMessageIndicators(message) {
    const patterns = [
      { re: /\b(otp|one time password|kode verifikasi|kode keamanan)\b/i, weight: 42, text: 'Pesan menyebut OTP atau kode verifikasi yang bersifat rahasia.' },
      { re: /\b(pin|password|kata sandi|kata laluan)\b/i, weight: 38, text: 'Ada penyebutan PIN atau kata sandi yang tidak boleh dibagikan.' },
      { re: /\b(menang|pemenang|hadiah|undian|doorprize|gratis|giveaway)\b/i, weight: 24, text: 'Ada iming-iming hadiah atau kemenangan yang perlu diverifikasi.' },
      { re: /\b(transfer|kirim uang|biaya admin|uang muka|deposit)\b/i, weight: 32, text: 'Pesan mengarahkan penerima untuk mengirim uang atau membayar biaya.' },
      { re: /\b(segera|sekarang juga|dalam 1 jam|terakhir hari ini|jangan tunda|urgent)\b/i, weight: 18, text: 'Ada tekanan waktu agar penerima bertindak tanpa berpikir panjang.' },
      { re: /\b(diblokir|ditangguhkan|akun ditutup|akun anda bermasalah|verifikasi ulang)\b/i, weight: 20, text: 'Pesan menggunakan ancaman atau ketakutan terkait status akun.' },
      { re: /https?:\/\/|www\./i, weight: 14, text: 'Pesan menyertakan tautan yang sebaiknya diperiksa secara terpisah.' },
      { re: /\b(bank|customer service|admin|petugas|kurir)\b/i, weight: 8, text: 'Pesan mengatasnamakan petugas atau layanan; identitas pengirim perlu diverifikasi.' },
      { re: /\b(rahasia|jangan beri tahu|jangan hubungi siapa pun)\b/i, weight: 18, text: 'Ada upaya membuat komunikasi tetap rahasia atau mengisolasi penerima.' }
    ];
    const matched = patterns.filter(pattern => pattern.re.test(message));
    const score = Math.min(100, matched.reduce((sum, item) => sum + item.weight, 0));
    return { score, matched };
  }

  function showMessageResult(message, channel) {
    const { score, matched } = findMessageIndicators(message);
    const findings = matched.length ? matched.map(item => ({ text: item.text })) : [{ text: 'Tidak ditemukan kata kunci kuat dari pola dasar yang diperiksa.', safe: true }];
    const recommendations = score >= 60
      ? ['Jangan membalas, mengeklik tautan, mengunduh file, atau mengirim uang. Verifikasi pengirim melalui kanal resmi yang kamu cari sendiri.', 'Jangan pernah membagikan OTP, PIN, kata sandi, atau kode pemulihan. Blokir dan laporkan pengirim bila perlu.']
      : score >= 30
        ? ['Tunda tindakan. Hubungi organisasi atau orang terkait melalui nomor dan situs resmi yang ditemukan secara mandiri.', 'Periksa tautan dan permintaan pembayaran secara terpisah sebelum melakukan tindakan.']
        : ['Tetap periksa konteks dan identitas pengirim. Skor rendah bukan jaminan bahwa pesan aman.', 'Jangan membagikan informasi sensitif melalui pesan.'];
    const result = $('#message-result');
    const body = $('#message-result-body');
    body.replaceChildren();
    const risk = renderScoreCard(body, score, `Sumber pesan: ${channel}. Ditemukan ${matched.length} pola yang perlu diperhatikan.`, findings, recommendations, 'Analisis pola lokal berbasis kata kunci. Ini bukan model AI dan tidak dapat memastikan pesan benar-benar penipuan atau aman.');
    $('#message-result-time').textContent = formatDate(new Date());
    result.hidden = false;
    saveHistory('message', message.replace(/\s+/g, ' ').slice(0, 85), score, risk.title);
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function analyzeUrl(rawUrl) {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();
    const labels = host.split('.').filter(Boolean);
    const signals = [];
    let score = 0;
    const add = (points, text) => { score += points; signals.push(text); };
    if (url.protocol !== 'https:') add(15, 'Alamat tidak menggunakan HTTPS. Koneksi HTTP tidak mengenkripsi lalu lintas seperti HTTPS.');
    if (host.includes('xn--')) add(28, 'Nama domain memakai format Punycode yang dapat menyamarkan karakter tertentu.');
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) add(30, 'Alamat tujuan menggunakan alamat IP langsung, bukan nama domain umum.');
    if (url.username || url.password || rawUrl.includes('@')) add(28, 'URL mengandung informasi pengguna atau karakter @ yang dapat mengecoh tujuan sebenarnya.');
    if (rawUrl.length > 110) add(10, 'URL sangat panjang dan perlu diperiksa lebih teliti.');
    if (labels.length >= 5) add(12, 'Domain memiliki banyak subdomain yang dapat membingungkan pengguna.');
    if (/bit\.ly|tinyurl\.com|t\.co|cutt\.ly|shorturl\.at/i.test(host)) add(24, 'Tautan memakai layanan pemendek URL sehingga tujuan akhirnya tidak terlihat dari alamat ini.');
    if (/login|verify|verification|secure|account| hadiah |bonus|claim|reset|otp|banking|wallet/i.test(`${host}${url.pathname}`)) add(13, 'Alamat mengandung kata yang sering muncul pada halaman login, verifikasi, atau klaim hadiah.');
    const brandRules = [
      { word: 'google', root: 'google.com' }, { word: 'paypal', root: 'paypal.com' },
      { word: 'facebook', root: 'facebook.com' }, { word: 'instagram', root: 'instagram.com' },
      { word: 'tokopedia', root: 'tokopedia.com' }, { word: 'shopee', root: 'shopee.co.id' },
      { word: 'bca', root: 'bca.co.id' }, { word: 'bri', root: 'bri.co.id' }, { word: 'dana', root: 'dana.id' }
    ];
    const impersonated = brandRules.find(rule => host.includes(rule.word) && host !== rule.root && !host.endsWith(`.${rule.root}`));
    if (impersonated) add(34, `Nama domain memuat kata “${impersonated.word}” tetapi bukan domain utama ${impersonated.root}.`);
    if (!signals.length) signals.push('Tidak ditemukan indikator struktur URL yang kuat dari pemeriksaan dasar.');
    score = Math.min(100, score);
    return { score, host, protocol: url.protocol.replace(':', '').toUpperCase(), signals };
  }

  function showLinkResult(rawUrl) {
    let analysis;
    try { analysis = analyzeUrl(rawUrl); }
    catch (_) { toast('URL tidak valid', 'Masukkan alamat lengkap yang valid, misalnya https://contoh.com.', 'error'); return; }
    const findings = analysis.signals.map((text, index) => ({ text, safe: analysis.score < 30 && index === 0 }));
    const recommendations = analysis.score >= 60
      ? ['Jangan buka tautan atau masukkan data akun. Hapus pesan dan verifikasi melalui alamat situs resmi yang kamu ketik sendiri.', 'Laporkan tautan mencurigakan kepada platform atau penyedia layanan terkait.']
      : analysis.score >= 30
        ? ['Jangan memasukkan data pribadi atau pembayaran sebelum memeriksa pemilik domain dan tujuan akhirnya.', 'Cari reputasi domain melalui layanan keamanan tepercaya secara terpisah.']
        : ['Tetap pastikan alamat domain benar dan sesuai konteks. Pemeriksaan struktur bukan jaminan situs aman.', 'Buka situs resmi dengan mengetik alamatnya sendiri, bukan dari pesan yang tidak diminta.'];
    const result = $('#link-result');
    const body = $('#link-result-body');
    body.replaceChildren(makeElement('div', 'url-detail-line', `Domain: ${analysis.host} · Protokol: ${analysis.protocol}`));
    const risk = renderScoreCard(body, analysis.score, 'Skor dibuat dari karakteristik URL yang tampak, bukan reputasi domain real-time.', findings, recommendations, 'Pemeriksaan lokal tidak mengunjungi situs, tidak mengikuti redirect, dan tidak mengecek database phishing atau reputasi domain eksternal.');
    $('#link-result-time').textContent = formatDate(new Date());
    result.hidden = false;
    saveHistory('link', rawUrl, analysis.score, risk.title);
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function bytesToHex(buffer) {
    return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async function sha256(file) {
    if (!window.crypto || !window.crypto.subtle || !file.arrayBuffer) return null;
    const data = await file.arrayBuffer();
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return bytesToHex(digest);
  }

  function readMagic(bytes) {
    if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'PDF';
    if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) return 'ZIP / Office';
    if (bytes.length >= 2 && bytes[0] === 0x4d && bytes[1] === 0x5a) return 'Windows executable';
    return 'Tidak dikenali oleh pemeriksaan signature sederhana';
  }

  async function showFileResult(file) {
    const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
    const allowed = ['pdf', 'docx', 'xlsx', 'zip', 'apk', 'exe'];
    if (!allowed.includes(extension)) {
      toast('Format tidak didukung', 'Pilih file PDF, DOCX, XLSX, ZIP, APK, atau EXE.', 'error');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast('Ukuran file terlalu besar', 'Ukuran maksimum demo adalah 20 MB.', 'error');
      return;
    }
    const firstBytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const magic = readMagic(firstBytes);
    const findings = [];
    let score = 8;
    if (extension === 'exe' || extension === 'apk') {
      score += 55;
      findings.push({ text: `Ekstensi .${extension} merupakan file yang dapat menjalankan atau memasang program. Pastikan sumbernya resmi.` });
    }
    if (extension === 'zip') {
      score += 25;
      findings.push({ text: 'Arsip ZIP dapat berisi file lain. Isi arsip belum diperiksa satu per satu.' });
    }
    if (/invoice|tagihan|resi|undangan|foto|dokumen|apk/i.test(file.name)) {
      score += 12;
      findings.push({ text: 'Nama file menggunakan kata yang sering dijumpai pada lampiran pesan; nama file sendiri tidak membuktikan keaslian.' });
    }
    const expectedMagic = ({ pdf: 'PDF', docx: 'ZIP / Office', xlsx: 'ZIP / Office', zip: 'ZIP / Office', exe: 'Windows executable', apk: 'ZIP / Office' })[extension];
    if (magic !== expectedMagic) {
      score += 24;
      findings.push({ text: `Signature file (${magic}) tidak cocok atau tidak dapat dikenali untuk ekstensi .${extension}.` });
    } else {
      findings.push({ text: `Signature dasar cocok dengan jenis file yang diharapkan (${magic}). Ini bukan bukti file bersih.`, safe: true });
    }
    score = Math.min(100, score);
    if (!findings.length) findings.push({ text: 'Tidak ada indikator dasar tambahan yang ditemukan.', safe: true });
    let hash = null;
    try { hash = await sha256(file); } catch (_) { hash = null; }
    const recommendations = extension === 'exe' || extension === 'apk'
      ? ['Jangan jalankan atau pasang file dari pengirim yang tidak dikenal. Unduh aplikasi hanya dari toko atau situs resmi.', 'Pindai file menggunakan antivirus terkini atau layanan pemindai bereputasi sebelum digunakan.']
      : ['Pastikan file berasal dari sumber yang kamu kenal. Jangan aktifkan macro atau konten aktif pada dokumen yang tidak diminta.', 'Gunakan antivirus tepercaya untuk pemindaian menyeluruh sebelum membuka file.'];
    const body = $('#file-result-body');
    body.replaceChildren();
    const metadata = makeElement('div', 'file-metadata');
    metadata.append(makeElement('div', '', `Nama file: ${file.name}`), makeElement('div', '', `Ukuran: ${formatBytes(file.size)} · Ekstensi: .${extension} · Signature: ${magic}`));
    const risk = renderScoreCard(body, score, `Pemeriksaan metadata lokal untuk ${file.name}.`, findings, recommendations, 'Tidak ada konten file yang diunggah. Pemeriksaan ini tidak mendeteksi malware, macro berbahaya, exploit, atau isi arsip. VirusTotal belum terhubung.');
    body.prepend(metadata);
    const hashBlock = makeElement('div', 'analysis-block');
    hashBlock.append(makeElement('h4', '', 'Hash SHA-256'));
    const hashValue = makeElement('div', 'hash-value', hash || 'Tidak tersedia pada browser ini. Gunakan HTTPS atau browser yang mendukung Web Crypto.');
    hashBlock.append(hashValue);
    if (hash) {
      const copy = makeElement('button', 'button button-outline copy-hash', 'Salin hash');
      copy.type = 'button';
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(hash); toast('Hash disalin', 'SHA-256 berhasil disalin ke clipboard.'); }
        catch (_) { toast('Clipboard tidak tersedia', 'Salin hash secara manual dari tampilan.', 'error'); }
      });
      hashBlock.append(copy);
    }
    body.append(hashBlock);
    $('#file-result-time').textContent = formatDate(new Date());
    $('#file-result').hidden = false;
    saveHistory('file', file.name, score, risk.title);
    $('#file-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function normalizeDigits(value) { return String(value).replace(/\D/g, ''); }

  function showNumberResult(value, type) {
    const digits = normalizeDigits(value);
    const reports = readStore(REPORTS_KEY);
    const matches = reports.filter(report => report.target && normalizeDigits(report.target) === digits && ((type === 'telepon' && /nomor telepon/i.test(report.category)) || (type === 'rekening' && /rekening/i.test(report.category))));
    const body = $('#number-result-body');
    body.replaceChildren();
    const score = matches.length ? 72 : 0;
    const findings = matches.length
      ? matches.map(report => ({ text: `Ditemukan laporan kategori “${report.category}” pada ${formatDate(report.createdAt)}. Status laporan: belum diverifikasi.` }))
      : [{ text: 'Tidak ditemukan laporan yang cocok pada penyimpanan komunitas lokal browser ini.', safe: true }];
    const recommendations = matches.length
      ? ['Tunda transaksi dan verifikasi identitas melalui kanal resmi. Catatan komunitas belum diverifikasi dan bukan bukti hukum.', 'Jangan menyebarkan nomor atau rekening tersebut ke publik. Laporkan dugaan penipuan melalui kanal resmi yang berwenang.']
      : ['Tidak adanya laporan bukan jaminan nomor atau rekening aman. Berhati-hatilah, terutama saat diminta mentransfer uang.', 'Verifikasi nama penerima dan tujuan transaksi melalui bank atau platform resmi.'];
    const risk = renderScoreCard(body, score, `${matches.length} kecocokan ditemukan pada data komunitas lokal.`, findings, recommendations, 'Pencarian hanya menggunakan laporan yang tersimpan pada browser ini. Tidak ada koneksi ke database nasional atau daftar rekening resmi.');
    $('#number-result-time').textContent = formatDate(new Date());
    $('#number-result').hidden = false;
    saveHistory('number', `${type === 'telepon' ? 'Telepon' : 'Rekening'}: ${digits.slice(0, 4)}•••`, score, matches.length ? 'Ada kecocokan laporan lokal' : 'Tidak ada kecocokan lokal');
    $('#number-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function submitReport() {
    const category = $('#report-category').value;
    const target = $('#report-target').value.trim();
    const description = $('#report-description').value.trim();
    const evidence = $('#report-evidence').files[0];
    if (!category || description.length < 12 || !$('#report-consent').checked) {
      toast('Periksa kembali laporan', 'Pilih kategori, tulis kronologi minimal 12 karakter, dan centang pernyataan.', 'error');
      return;
    }
    const reports = readStore(REPORTS_KEY);
    const report = {
      id: `AB-${Date.now().toString().slice(-8)}`,
      category, target: target.slice(0, 160), description: description.slice(0, 1200),
      createdAt: new Date().toISOString(), status: 'Belum diverifikasi'
    };
    reports.unshift(report);
    if (writeStore(REPORTS_KEY, reports.slice(0, 100))) {
      $('#report-form').reset();
      renderReports();
      updateDashboard();
      toast('Laporan tersimpan di perangkat', evidence ? 'Keterangan tersimpan, tetapi file bukti tidak diunggah atau disimpan.' : 'Laporan hanya tersimpan pada browser ini dan belum dikirim untuk moderasi.');
    }
  }

  function openArticle(key) {
    const article = ARTICLE_DATA[key];
    if (!article) return;
    const content = makeElement('div', 'article-modal-content');
    content.append(makeElement('p', '', article.intro), makeElement('h3', '', 'Hal yang perlu dilakukan'));
    const list = makeElement('ul');
    article.points.forEach(point => list.append(makeElement('li', '', point)));
    content.append(list, makeElement('p', '', 'Ingat: apabila mengalami kerugian atau menemukan dugaan tindak pidana, simpan bukti dan hubungi kanal resmi yang berwenang.'));
    showModal({ title: article.title, category: article.category, content, symbol: '✦', confirmText: 'Selesai membaca' });
  }

  function initFileInput() {
    const input = $('#file-input');
    const dropZone = $('#drop-zone');
    const selected = $('#selected-file');
    const scanButton = $('#file-scan-button');
    const update = () => {
      const file = input.files && input.files[0];
      selected.replaceChildren();
      if (!file) {
        selected.hidden = true;
        scanButton.disabled = true;
        $('#file-label').textContent = 'Klik untuk memilih file';
        return;
      }
      $('#file-label').textContent = file.name;
      selected.hidden = false;
      const icon = makeElement('span', 'file-mini-icon', '▧');
      const copy = makeElement('div', 'selected-file-copy');
      copy.append(makeElement('strong', '', file.name), makeElement('small', '', formatBytes(file.size)));
      const remove = makeElement('button', 'remove-file', '×');
      remove.type = 'button';
      remove.setAttribute('aria-label', 'Batalkan pilihan file');
      remove.addEventListener('click', () => { input.value = ''; update(); });
      selected.append(icon, copy, remove);
      scanButton.disabled = false;
    };
    input.addEventListener('change', update);
    ['dragenter', 'dragover'].forEach(name => dropZone.addEventListener(name, event => { event.preventDefault(); dropZone.classList.add('drag-over'); }));
    ['dragleave', 'drop'].forEach(name => dropZone.addEventListener(name, event => { event.preventDefault(); dropZone.classList.remove('drag-over'); }));
    dropZone.addEventListener('drop', event => {
      const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      if (!file) return;
      try {
        const transfer = new DataTransfer();
        transfer.items.add(file);
        input.files = transfer.files;
        update();
      } catch (_) { toast('Gunakan tombol pilih file', 'Browser ini tidak mengizinkan pemilihan file melalui drag and drop.', 'error'); }
    });
  }

  function init() {
    $('#today-label').textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    $('#footer-year').textContent = String(new Date().getFullYear());
    updateDashboard();

    document.addEventListener('click', event => {
      const pageButton = event.target.closest('[data-page]');
      const pageLink = event.target.closest('[data-page-link]');
      if (pageButton) setPage(pageButton.dataset.page);
      else if (pageLink) { event.preventDefault(); setPage(pageLink.dataset.pageLink); }
      const articleButton = event.target.closest('[data-article]');
      if (articleButton) openArticle(articleButton.dataset.article);
    });

    $('#menu-toggle').addEventListener('click', () => $('#sidebar').classList.contains('open') ? closeSidebar() : openSidebar());
    $('#sidebar-backdrop').addEventListener('click', closeSidebar);
    $('#notification-button').addEventListener('click', () => showModal({ title: 'Kamu berada dalam mode demo', category: 'NOTIFIKASI', content: 'Notifikasi keamanan real-time belum tersedia. Aktifitas pemeriksaan dan laporan yang dibuat di sesi browser ini dapat kamu lihat pada menu Riwayat Pemeriksaan dan Laporan Komunitas.', symbol: '♧' }));
    $('#modal-close').addEventListener('click', closeModal);
    $('#modal-backdrop').addEventListener('click', event => { if (event.target.id === 'modal-backdrop') closeModal(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') { closeModal(); closeSidebar(); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        $('#global-search').classList.add('expanded');
        $('#global-search input').focus();
      }
    });

    $('#message-input').addEventListener('input', event => { $('#message-count').textContent = `${event.target.value.length} / 5000`; });
    $('#message-form').addEventListener('submit', event => {
      event.preventDefault();
      const message = $('#message-input').value.trim();
      if (message.length < 8) { toast('Pesan terlalu singkat', 'Masukkan setidaknya 8 karakter agar dapat diperiksa.', 'error'); return; }
      runScan(event.currentTarget.querySelector('button[type="submit"]'), 'Menganalisis pola...', () => showMessageResult(message, $('#message-channel').value));
    });

    $('#link-form').addEventListener('submit', event => {
      event.preventDefault();
      const value = $('#link-input').value.trim();
      try { const url = new URL(value); if (!['http:', 'https:'].includes(url.protocol)) throw new Error('scheme'); }
      catch (_) { toast('Format tautan tidak valid', 'Masukkan URL lengkap yang diawali http:// atau https://.', 'error'); return; }
      runScan(event.currentTarget.querySelector('button[type="submit"]'), 'Memeriksa struktur URL...', () => showLinkResult(value));
    });

    initFileInput();
    $('#file-form').addEventListener('submit', event => {
      event.preventDefault();
      const file = $('#file-input').files && $('#file-input').files[0];
      if (!file) { toast('Pilih file terlebih dahulu', 'Pilih satu file dengan format yang didukung.', 'error'); return; }
      const button = $('#file-scan-button');
      button.disabled = true;
      button.classList.add('is-scanning');
      button.replaceChildren(makeElement('span', 'button-spinner'), document.createTextNode('Menghitung hash...'));
      showFileResult(file).catch(() => toast('File tidak dapat diperiksa', 'Browser gagal membaca file. Coba pilih file lain.', 'error')).finally(() => {
        button.disabled = false;
        button.classList.remove('is-scanning');
        button.textContent = '⌕ Periksa file →';
      });
    });

    $('#number-form').addEventListener('submit', event => {
      event.preventDefault();
      const value = $('#number-input').value.trim();
      const digits = normalizeDigits(value);
      if (digits.length < 5 || digits.length > 30) { toast('Nomor tidak valid', 'Masukkan 5 hingga 30 digit angka.', 'error'); return; }
      runScan(event.currentTarget.querySelector('button[type="submit"]'), 'Mencari laporan lokal...', () => showNumberResult(value, $('#number-type').value));
    });

    $('#report-form').addEventListener('submit', event => { event.preventDefault(); submitReport(); });
    $('#report-filter-category').addEventListener('change', renderReports);
    $('#report-search').addEventListener('input', renderReports);

    $('#history-type').addEventListener('change', renderHistory);
    $('#history-risk').addEventListener('change', renderHistory);
    $('#history-search').addEventListener('input', renderHistory);
    $('#history-table-body').addEventListener('click', event => {
      const button = event.target.closest('[data-delete-history]');
      if (!button) return;
      const id = button.dataset.deleteHistory;
      writeStore(HISTORY_KEY, readStore(HISTORY_KEY).filter(item => item.id !== id));
      renderHistory();
      updateDashboard();
      toast('Riwayat dihapus', 'Satu catatan pemeriksaan telah dihapus dari browser ini.');
    });
    $('#clear-history-button').addEventListener('click', () => {
      if (!readStore(HISTORY_KEY).length) { toast('Riwayat masih kosong', 'Belum ada catatan yang perlu dihapus.'); return; }
      showModal({
        title: 'Hapus semua riwayat?', category: 'KONFIRMASI', symbol: '!',
        content: 'Semua catatan pemeriksaan yang tersimpan pada browser ini akan dihapus. Tindakan ini tidak dapat dibatalkan.',
        confirmText: 'Ya, hapus riwayat', cancelText: 'Batalkan',
        onConfirm: () => { writeStore(HISTORY_KEY, []); renderHistory(); updateDashboard(); toast('Riwayat dibersihkan', 'Semua catatan pemeriksaan lokal telah dihapus.'); }
      });
    });

    $('#global-search').addEventListener('click', () => $('#global-search').classList.add('expanded'));
    $('#global-search input').addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        const query = event.currentTarget.value.trim();
        setPage('history');
        $('#history-search').value = query;
        renderHistory();
        $('#global-search').classList.remove('expanded');
      }
      if (event.key === 'Escape') $('#global-search').classList.remove('expanded');
    });
    $('#global-search input').addEventListener('blur', () => { if (!$('#global-search input').value) $('#global-search').classList.remove('expanded'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
