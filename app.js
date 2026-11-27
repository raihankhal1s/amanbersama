"use strict";

const $ = (id) => document.getElementById(id);
const KEY = "amanbersama_history_v1";
const REPORT_KEY = "amanbersama_reports_v1";

function readStore(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

let historyData = readStore(KEY);
let reports = readStore(REPORT_KEY);

function store(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    toast("Penyimpanan browser tidak tersedia.", "error");
  }
}

function toast(message, type = "") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  $("toastContainer").append(el);
  setTimeout(() => el.remove(), 3500);
}

function go(page) {
  const section = $(page);
  if (!section) return;

  document.querySelectorAll(".page").forEach((el) => {
    el.classList.toggle("active", el === section);
  });

  document.querySelectorAll("[data-page]").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === page);
  });

  $("pageName").textContent =
    document.querySelector(`[data-page="${page}"]`)?.textContent.trim() ||
    "Dashboard";

  $("sidebar").classList.remove("open");
  history.replaceState(null, "", `#${page}`);
}

document.querySelectorAll("[data-page]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    go(link.dataset.page);
  });
});

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", () => go(button.dataset.go));
});

$("menuToggle").addEventListener("click", () => {
  $("sidebar").classList.toggle("open");
});

$("today").textContent = new Date().toLocaleDateString("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function record(type, target, level, reason) {
  historyData.unshift({
    id: crypto.randomUUID(),
    type,
    target: String(target).slice(0, 160),
    level,
    reason: String(reason).slice(0, 300),
    date: new Date().toISOString(),
  });

  historyData = historyData.slice(0, 100);
  store(KEY, historyData);
  renderDashboard();
  renderHistory();
}

function getLevel(score) {
  return score >= 60 ? "high" : score >= 30 ? "medium" : "low";
}

function makeResult(title, score, findings, recommendation, description) {
  const level = getLevel(score);
  const card = document.createElement("div");
  card.className = "result-card";

  const head = document.createElement("div");
  head.className = "result-top";

  const symbol = document.createElement("div");
  symbol.className = "result-symbol";
  symbol.textContent = level === "high" ? "⚠" : level === "medium" ? "!" : "✓";

  const heading = document.createElement("h3");
  heading.textContent = title;

  const scoreEl = document.createElement("strong");
  scoreEl.className = `score ${level}`;
  scoreEl.textContent = `${score}/100`;

  head.append(symbol, heading, scoreEl);
  card.append(head);

  const desc = document.createElement("p");
  desc.textContent = description;
  card.append(desc);

  const tags = document.createElement("div");
  tags.className = "findings";

  if (!findings.length) {
    const tag = document.createElement("span");
    tag.className = "safe";
    tag.textContent = "Tidak ditemukan pola umum";
    tags.append(tag);
  }

  findings.forEach((item) => {
    const tag = document.createElement("span");
    tag.textContent = item;
    tags.append(tag);
  });

  card.append(tags);

  const advice = document.createElement("div");
  advice.className = "recommendation";
  advice.textContent = `Rekomendasi: ${recommendation}`;
  card.append(advice);

  return { card, level };
}

function showResult(id, result) {
  $(id).replaceChildren(result.card);
}

/* DETEKSI PESAN */

$("messageInput").addEventListener("input", () => {
  $("charCount").textContent = `${$("messageInput").value.length}/10000`;
});

const patterns = [
  {
    regex: /otp|kode verifikasi|kode akses/i,
    text: "Permintaan OTP",
    points: 35,
  },
  {
    regex: /password|kata sandi|pin\b/i,
    text: "Permintaan PIN/password",
    points: 35,
  },
  {
    regex: /menang|hadiah|undian|giveaway/i,
    text: "Iming-iming hadiah",
    points: 22,
  },
  {
    regex: /transfer|kirim uang|biaya admin/i,
    text: "Permintaan transfer uang",
    points: 22,
  },
  {
    regex: /segera|sekarang juga|dibatasi|terakhir/i,
    text: "Tekanan waktu",
    points: 15,
  },
  {
    regex: /klik link|klik tautan|bit\.ly|tinyurl/i,
    text: "Ajakan membuka tautan",
    points: 18,
  },
  {
    regex: /akun.*blokir|akun.*dibekukan/i,
    text: "Ancaman pemblokiran akun",
    points: 20,
  },
  {
    regex: /profit dijamin|keuntungan pasti|tanpa risiko/i,
    text: "Janji keuntungan tidak wajar",
    points: 25,
  },
];

$("analyzeMessage").addEventListener("click", () => {
  const message = $("messageInput").value.trim();

  if (message.length < 5) {
    toast("Masukkan pesan terlebih dahulu.", "error");
    return;
  }

  let score = 0;
  const findings = [];

  patterns.forEach((pattern) => {
    if (pattern.regex.test(message)) {
      score += pattern.points;
      findings.push(pattern.text);
    }
  });

  score = Math.min(score, 100);

  const result = makeResult(
    "Hasil Analisis Pesan",
    score,
    findings,
    "Jangan membagikan OTP, PIN, password, atau mengirim uang. Verifikasi pengirim melalui kanal resmi.",
    `Sumber: ${$("messageSource").value}. Pemeriksaan pola lokal, bukan hasil AI terverifikasi.`,
  );

  showResult("messageResult", result);
  record("Pesan", message.slice(0, 90), result.level, findings.join(", "));
  toast("Analisis selesai.", "success");
});

/* PEMINDAI LINK */

function inspectURL(value) {
  let url;

  try {
    url = new URL(value);
  } catch {
    return { score: 65, findings: ["Format URL tidak valid"] };
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return { score: 90, findings: ["Protokol URL tidak dikenal"] };
  }

  const host = url.hostname.toLowerCase();
  let score = 0;
  const findings = [];

  if (url.protocol !== "https:") {
    score += 15;
    findings.push("Tidak menggunakan HTTPS");
  }

  if (url.username || url.password) {
    score += 35;
    findings.push("URL mengandung informasi login");
  }

  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    score += 30;
    findings.push("Menggunakan alamat IP langsung");
  }

  if (host.startsWith("xn--") || host.includes(".xn--")) {
    score += 30;
    findings.push("Domain Punycode");
  }

  if (host.split(".").length > 4) {
    score += 15;
    findings.push("Subdomain berlapis");
  }

  if (/bit\.ly|tinyurl|cutt\.ly|rb\.gy/.test(host)) {
    score += 20;
    findings.push("Menggunakan pemendek URL");
  }

  if (/secure|verify|account|login| hadiah/.test(host)) {
    score += 10;
    findings.push("Nama domain perlu diperiksa");
  }

  if (url.href.length > 150) {
    score += 10;
    findings.push("URL sangat panjang");
  }

  return { score: Math.min(score, 100), findings, host };
}

$("scanUrl").addEventListener("click", () => {
  const value = $("urlInput").value.trim();

  if (!value) {
    toast("Masukkan URL terlebih dahulu.", "error");
    return;
  }

  const result = inspectURL(value);

  const output = makeResult(
    "Hasil Pemindaian Link",
    result.score,
    result.findings,
    "Jangan masukkan data login pada situs mencurigakan. Periksa domain melalui kanal resmi.",
    result.host
      ? `Domain: ${result.host}. Pemeriksaan struktur URL lokal, bukan pemeriksaan reputasi real-time.`
      : "URL tidak dapat diperiksa dengan benar.",
  );

  showResult("urlResult", output);
  record("Link", value, output.level, result.findings.join(", "));
  toast("Pemeriksaan link selesai.", "success");
});

/* PEMINDAI FILE */

let selectedFile = null;

$("fileInput").addEventListener("change", () => {
  selectedFile = $("fileInput").files[0] || null;
  $("fileInfo").textContent = selectedFile
    ? `${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`
    : "Belum ada file dipilih";

  $("scanFile").disabled = !selectedFile;
});

$("scanFile").addEventListener("click", async () => {
  if (!selectedFile) return;

  const extensions = [
    "pdf",
    "docx",
    "xlsx",
    "zip",
    "apk",
    "exe",
    "jpg",
    "jpeg",
    "png",
  ];
  const ext = selectedFile.name.split(".").pop().toLowerCase();

  if (!extensions.includes(ext)) {
    toast("Format file tidak didukung.", "error");
    return;
  }

  if (selectedFile.size > 25 * 1024 * 1024) {
    toast("Ukuran file maksimal 25 MB.", "error");
    return;
  }

  let hash = "Tidak tersedia";

  try {
    if (crypto.subtle) {
      const digest = await crypto.subtle.digest(
        "SHA-256",
        await selectedFile.arrayBuffer(),
      );

      hash = Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {
    toast("Hash tidak dapat dihitung pada lingkungan ini.", "error");
    return;
  }

  const result = makeResult(
    "Informasi File",
    0,
    [],
    "Hash bukan deteksi malware. Gunakan antivirus tepercaya dan jangan jalankan file dari sumber tidak dikenal.",
    `Nama: ${selectedFile.name} | SHA-256: ${hash}. Malware belum dipindai.`,
  );

  showResult("fileResult", result);
  record(
    "File",
    selectedFile.name,
    "low",
    "Hash dihitung; malware belum diperiksa.",
  );
  toast("Hash file berhasil dihitung.", "success");
});

/* CEK NOMOR */

$("checkNumber").addEventListener("click", () => {
  const number = $("numberInput").value.trim();

  if (!/^[0-9+\- ]{4,40}$/.test(number)) {
    toast("Masukkan nomor dengan format yang benar.", "error");
    return;
  }

  const matches = reports.filter(
    (item) => item.target.toLowerCase() === number.toLowerCase(),
  );

  const card = document.createElement("div");
  card.className = "result-card";

  const heading = document.createElement("h3");
  heading.textContent = matches.length
    ? `${matches.length} laporan ditemukan`
    : "Belum ditemukan laporan";

  const desc = document.createElement("p");
  desc.textContent = matches.length
    ? "Identitas ini pernah dilaporkan pada data lokal. Laporan belum tentu terverifikasi."
    : "Tidak ada kecocokan dalam database demo. Ini bukan bukti bahwa nomor aman.";

  card.append(heading, desc);

  matches.forEach((item) => {
    const p = document.createElement("p");
    p.textContent = `${item.category}: ${item.description}`;
    card.append(p);
  });

  $("numberResult").replaceChildren(card);
});

$("reportFromNumber").addEventListener("click", () => {
  $("reportTarget").value = $("numberInput").value.trim();
  openModal();
});

/* LAPORAN KOMUNITAS */

const exampleReports = [
  {
    target: "Contoh akun hadiah palsu",
    category: "Penipuan Hadiah",
    description:
      "Pesan mengklaim pengguna memenangkan hadiah dan meminta biaya administrasi.",
    date: new Date().toISOString(),
    status: "Contoh edukasi",
  },
  {
    target: "Contoh tautan login palsu",
    category: "Phishing",
    description: "Tautan login tiruan dikirim melalui pesan pribadi.",
    date: new Date().toISOString(),
    status: "Contoh edukasi",
  },
];

function renderReports() {
  const query = $("reportSearch").value.toLowerCase();
  const category = $("reportFilter").value;

  const list = [...exampleReports, ...reports].filter(
    (item) =>
      (category === "Semua" || item.category === category) &&
      `${item.target} ${item.description}`.toLowerCase().includes(query),
  );

  const container = $("communityList");
  container.replaceChildren();

  if (!list.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "Tidak ada laporan ditemukan.";
    container.append(p);
    return;
  }

  list.forEach((item) => {
    const card = document.createElement("article");
    card.className = "community-card";

    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = item.category;

    const title = document.createElement("h3");
    title.textContent = item.target;

    const description = document.createElement("p");
    description.textContent = item.description;

    const meta = document.createElement("div");
    meta.className = "community-meta";
    meta.textContent = `${item.status} · ${new Date(item.date).toLocaleDateString("id-ID")}`;

    card.append(tag, title, description, meta);
    container.append(card);
  });
}

$("reportSearch").addEventListener("input", renderReports);
$("reportFilter").addEventListener("change", renderReports);

/* MODAL LAPORAN */

function openModal() {
  $("modal").classList.add("open");
  $("reportTarget").focus();
}

function closeModal() {
  $("modal").classList.remove("open");
}

$("newReport").addEventListener("click", openModal);
$("closeModal").addEventListener("click", closeModal);

$("modal").addEventListener("click", (event) => {
  if (event.target === $("modal")) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

$("reportForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const target = $("reportTarget").value.trim();
  const description = $("reportDescription").value.trim();

  if (target.length < 4 || description.length < 10) {
    toast("Lengkapi data laporan.", "error");
    return;
  }

  reports.unshift({
    target,
    category: $("reportCategory").value,
    description,
    date: new Date().toISOString(),
    status: "Menunggu moderasi",
  });

  store(REPORT_KEY, reports);
  renderReports();
  $("reportForm").reset();
  closeModal();

  toast("Laporan demo berhasil disimpan.", "success");
});

/* EDUKASI */

const articles = [
  [
    "🎣",
    "Phishing",
    "Kenali alamat website palsu dan jangan masukkan password pada tautan yang tidak dikenal.",
  ],
  [
    "☏",
    "Penipuan WhatsApp",
    "Waspadai permintaan OTP, file APK asing, dan akun yang menyamar.",
  ],
  [
    "🛍",
    "Penipuan Marketplace",
    "Gunakan pembayaran resmi dan hindari transaksi di luar platform.",
  ],
  [
    "◈",
    "Investasi Palsu",
    "Curigai janji keuntungan pasti dan imbal hasil yang tidak masuk akal.",
  ],
  [
    "▣",
    "Lowongan Kerja Palsu",
    "Verifikasi perusahaan dan jangan membayar biaya rekrutmen.",
  ],
  ["🔐", "Keamanan Akun", "Gunakan password unik dan autentikasi multifaktor."],
  [
    "⚑",
    "Melaporkan Penipuan",
    "Simpan bukti transaksi dan laporkan kepada bank atau platform terkait.",
  ],
];

function renderEducation() {
  const host = $("educationList");
  host.replaceChildren();

  articles.forEach(([icon, title, description]) => {
    const card = document.createElement("article");
    card.className = "education-card";

    const art = document.createElement("div");
    art.className = "education-art";
    art.textContent = icon;

    const body = document.createElement("div");
    body.className = "education-body";

    const h = document.createElement("h3");
    h.textContent = title;

    const p = document.createElement("p");
    p.textContent = description;

    const button = document.createElement("button");
    button.textContent = "Baca tips →";
    button.addEventListener("click", () => toast(description));

    body.append(h, p, button);
    card.append(art, body);
    host.append(card);
  });
}

/* DASHBOARD */

function renderDashboard() {
  $("totalScans").textContent = historyData.length;
  $("totalThreats").textContent = historyData.filter(
    (item) => item.level !== "low",
  ).length;
  $("totalSafe").textContent = historyData.filter(
    (item) => item.level === "low",
  ).length;

  const host = $("recentActivity");
  host.replaceChildren();

  if (!historyData.length) {
    const p = document.createElement("p");
    p.className = "empty";
    p.textContent = "Belum ada aktivitas pemeriksaan.";
    host.append(p);
    return;
  }

  historyData.slice(0, 5).forEach((item) => {
    const row = document.createElement("div");
    row.className = "activity-item";

    const title = document.createElement("strong");
    title.textContent = `${item.type}: ${item.target}`;

    const date = document.createElement("small");
    date.textContent = new Date(item.date).toLocaleString("id-ID");

    const status = document.createElement("span");
    status.className = `risk ${item.level}`;
    status.textContent =
      item.level === "low"
        ? "Risiko rendah"
        : item.level === "medium"
          ? "Perlu perhatian"
          : "Risiko tinggi";

    const info = document.createElement("div");
    info.append(title, date);

    row.append(info, status);
    host.append(row);
  });
}

/* RIWAYAT */

function renderHistory() {
  const query = $("historySearch").value.toLowerCase();
  const filter = $("historyFilter").value;

  const items = historyData.filter(
    (item) =>
      (filter === "Semua" || item.type === filter) &&
      `${item.target} ${item.reason}`.toLowerCase().includes(query),
  );

  const body = $("historyTable");
  body.replaceChildren();

  if (!items.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "Belum ada riwayat pemeriksaan.";
    row.append(cell);
    body.append(row);
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("tr");

    const values = [
      item.target,
      item.type,
      item.level === "low"
        ? "Risiko rendah"
        : item.level === "medium"
          ? "Risiko sedang"
          : "Risiko tinggi",
      new Date(item.date).toLocaleString("id-ID"),
    ];

    values.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });

    const action = document.createElement("td");
    const button = document.createElement("button");
    button.className = "delete-btn";
    button.textContent = "Hapus";
    button.addEventListener("click", () => {
      historyData = historyData.filter((x) => x.id !== item.id);
      store(KEY, historyData);
      renderHistory();
      renderDashboard();
      toast("Riwayat dihapus.", "success");
    });

    action.append(button);
    row.append(action);
    body.append(row);
  });
}

$("historySearch").addEventListener("input", renderHistory);
$("historyFilter").addEventListener("change", renderHistory);

$("clearHistory").addEventListener("click", () => {
  if (!historyData.length) {
    toast("Riwayat masih kosong.");
    return;
  }

  historyData = [];
  store(KEY, historyData);
  renderHistory();
  renderDashboard();
  toast("Riwayat berhasil dihapus.", "success");
});

/* INISIALISASI */

renderDashboard();
renderHistory();
renderReports();
renderEducation();

const initialPage = location.hash.slice(1);
go($(initialPage) ? initialPage : "dashboard");
