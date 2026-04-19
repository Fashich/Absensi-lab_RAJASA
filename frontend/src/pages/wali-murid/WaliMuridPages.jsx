import React, { useState, useEffect } from "react";
import { waliMuridApi } from "../../services/waliMuridApi";
import {
  WmLoading,
  WmError,
  WmEmpty,
  PageHeader,
  Card,
  Badge,
  StatCard,
  WmTable,
} from "./WmPage";

// ── Helper ──────────────────────────────────────────────────────
const rupiah = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

const nilaiColor = (n) => {
  if (n >= 90) return "#22c55e";
  if (n >= 80) return "#3b82f6";
  if (n >= 70) return "#eab308";
  if (n >= 60) return "#f97316";
  return "#ef4444";
};

// ── Nilai Akademik ──────────────────────────────────────────────
export const NilaiAkademik = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [semester, setSemester] = useState("Ganjil");
  const [tahun, setTahun] = useState("2025/2026");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await waliMuridApi.getNilai({
        semester,
        tahun_ajaran: tahun,
      });
      setData(res.data?.data ?? res.data);
    } catch {
      setError("Gagal memuat data nilai.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [semester, tahun]);

  const rows = data?.data || [];
  const stats = data?.stats || {};

  return (
    <div>
      <PageHeader
        title="Nilai Akademik"
        subtitle="Rekap nilai per mata pelajaran"
      />
      <Card>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            style={{
              background: "#0f172a",
              color: "#e2e8f0",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
            }}
          >
            <option>Ganjil</option>
            <option>Genap</option>
          </select>
          <select
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            style={{
              background: "#0f172a",
              color: "#e2e8f0",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
            }}
          >
            {["2025/2026", "2024/2025", "2023/2024"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <WmLoading />
        ) : error ? (
          <WmError message={error} onRetry={load} />
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <StatCard
                icon="📝"
                label="Avg Harian"
                value={stats.avg_harian || "-"}
                color="#3b82f6"
              />
              <StatCard
                icon="📋"
                label="Avg UTS"
                value={stats.avg_uts || "-"}
                color="#8b5cf6"
              />
              <StatCard
                icon="📄"
                label="Avg UAS"
                value={stats.avg_uas || "-"}
                color="#f97316"
              />
              <StatCard
                icon="🏆"
                label="Avg Akhir"
                value={stats.avg_akhir || "-"}
                color={nilaiColor(stats.avg_akhir)}
              />
            </div>
            <WmTable
              headers={[
                "Mata Pelajaran",
                "Kelompok",
                "Harian",
                "UTS",
                "UAS",
                "Praktek",
                "Nilai Akhir",
              ]}
              rows={rows.map((r) => [
                r.nama_mapel,
                <Badge
                  text={r.km?.replace("Kelompok ", "") || "-"}
                  color="#334155"
                />,
                <span style={{ color: nilaiColor(r.nilai_harian) }}>
                  {r.nilai_harian || "-"}
                </span>,
                <span style={{ color: nilaiColor(r.nilai_uts) }}>
                  {r.nilai_uts || "-"}
                </span>,
                <span style={{ color: nilaiColor(r.nilai_uas) }}>
                  {r.nilai_uas || "-"}
                </span>,
                <span style={{ color: nilaiColor(r.nilai_praktek) }}>
                  {r.nilai_praktek || "-"}
                </span>,
                <strong style={{ color: nilaiColor(r.nilai_akhir) }}>
                  {r.nilai_akhir || "-"}
                </strong>,
              ])}
              emptyText="Belum ada data nilai"
            />
          </>
        )}
      </Card>
    </div>
  );
};

// ── Presensi Siswa ──────────────────────────────────────────────
export const PresensiSiswa = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await waliMuridApi.getPresensi({ bulan, tahun });
      setData(res.data?.data ?? res.data);
    } catch {
      setError("Gagal memuat data presensi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [bulan, tahun]);

  const rows = data?.data || [];
  const stats = data?.statistik || {};
  const persen = data?.persentase_hadir || 0;
  const statusColor = {
    Hadir: "#22c55e",
    Sakit: "#f97316",
    Izin: "#eab308",
    Alpha: "#ef4444",
    Terlambat: "#8b5cf6",
  };

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return (
    <div>
      <PageHeader title="Presensi Siswa" subtitle="Rekap kehadiran harian" />
      <Card>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <select
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            style={{
              background: "#0f172a",
              color: "#e2e8f0",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
            }}
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            style={{
              background: "#0f172a",
              color: "#e2e8f0",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
            }}
          >
            {[2026, 2025, 2024].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <WmLoading />
        ) : error ? (
          <WmError message={error} onRetry={load} />
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <StatCard
                icon="✅"
                label="Hadir"
                value={stats.hadir || 0}
                color="#22c55e"
                subtext={`${persen}% kehadiran`}
              />
              <StatCard
                icon="🤒"
                label="Sakit"
                value={stats.sakit || 0}
                color="#f97316"
              />
              <StatCard
                icon="📋"
                label="Izin"
                value={stats.izin || 0}
                color="#eab308"
              />
              <StatCard
                icon="❌"
                label="Alpha"
                value={stats.alpha || 0}
                color="#ef4444"
              />
              <StatCard
                icon="⏰"
                label="Terlambat"
                value={stats.terlambat || 0}
                color="#8b5cf6"
              />
            </div>
            <WmTable
              headers={[
                "Tanggal",
                "Status",
                "Jam Masuk",
                "Jam Pulang",
                "Keterangan",
              ]}
              rows={rows.map((r) => [
                r.tanggal,
                <Badge
                  text={r.status_kehadiran}
                  color={statusColor[r.status_kehadiran] || "#64748b"}
                />,
                r.jam_masuk || "-",
                r.jam_pulang || "-",
                r.keterangan || "-",
              ])}
              emptyText="Tidak ada data presensi bulan ini"
            />
          </>
        )}
      </Card>
    </div>
  );
};

// ── Pembayaran SPP ──────────────────────────────────────────────
export const PembayaranSPP = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await waliMuridApi.getPembayaran();
      setData(res.data?.data ?? res.data);
    } catch {
      setError("Gagal memuat data SPP.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rows = data?.data || [];
  const stats = data?.statistik || {};

  return (
    <div>
      <PageHeader
        title="Pembayaran SPP"
        subtitle="Riwayat dan status pembayaran SPP"
      />
      {loading ? (
        <WmLoading />
      ) : error ? (
        <WmError message={error} onRetry={load} />
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: 16,
              marginBottom: 20,
            }}
          >
            <StatCard
              icon="💳"
              label="Total Tagihan"
              value={rupiah(stats.total_tagihan)}
              color="#3b82f6"
            />
            <StatCard
              icon="✅"
              label="Total Terbayar"
              value={rupiah(stats.total_terbayar)}
              color="#22c55e"
            />
            <StatCard
              icon="⏳"
              label="Belum Bayar"
              value={`${stats.belum_bayar || 0} bulan`}
              color="#ef4444"
            />
            <StatCard
              icon="📅"
              label="Total Bulan"
              value={stats.total_bulan || 0}
              color="#8b5cf6"
            />
          </div>
          <Card>
            <WmTable
              headers={["Bulan", "Tahun", "Jumlah", "Status", "Tanggal Bayar"]}
              rows={rows.map((r) => [
                r.bulan,
                r.tahun,
                rupiah(r.jumlah),
                <Badge
                  text={r.status_pembayaran}
                  color={
                    r.status_pembayaran === "Lunas" ? "#22c55e" : "#ef4444"
                  }
                />,
                r.tanggal_bayar || "-",
              ])}
              emptyText="Belum ada data pembayaran SPP"
            />
          </Card>
        </>
      )}
    </div>
  );
};

// ── Pengumuman Sekolah ──────────────────────────────────────────
export const PengumumanSekolah = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await waliMuridApi.getPengumuman({ limit: 20 });
      setData(res.data?.data?.data || res.data?.data || []);
    } catch {
      setError("Gagal memuat pengumuman.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const priorityColor = {
    Darurat: "#ef4444",
    Tinggi: "#f97316",
    Sedang: "#eab308",
    Rendah: "#22c55e",
  };
  const kategoriColor = {
    Akademik: "#3b82f6",
    Keuangan: "#f97316",
    Ekstrakurikuler: "#22c55e",
    Umum: "#8b5cf6",
  };

  return (
    <div>
      <PageHeader
        title="Pengumuman Sekolah"
        subtitle="Informasi dan pengumuman terbaru dari sekolah"
      />
      {loading ? (
        <WmLoading />
      ) : error ? (
        <WmError message={error} onRetry={load} />
      ) : data.length === 0 ? (
        <WmEmpty text="Belum ada pengumuman" />
      ) : (
        data.map((p) => (
          <Card key={p.id} style={{ cursor: "pointer" }}>
            <div onClick={() => setExpanded(expanded === p.id ? null : p.id)}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "#f1f5f9",
                    fontSize: 15,
                    fontWeight: 600,
                    flex: 1,
                  }}
                >
                  {p.judul}
                </h3>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <Badge
                    text={p.prioritas}
                    color={priorityColor[p.prioritas] || "#3b82f6"}
                  />
                  <Badge
                    text={p.kategori}
                    color={kategoriColor[p.kategori] || "#64748b"}
                  />
                </div>
              </div>
              <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 12 }}>
                📅 {p.tanggal_terbit}
              </p>
            </div>
            {expanded === p.id && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid #334155",
                  color: "#cbd5e1",
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                {p.isi_pengumuman}
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
};

// ── Kalender Akademik ───────────────────────────────────────────
export const KalenderAkademik = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await waliMuridApi.getKalender(bulan, tahun);
      setData(res.data?.data || []);
    } catch {
      setError("Gagal memuat kalender.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [bulan, tahun]);

  const jenisColor = {
    "Libur Nasional": "#ef4444",
    "Hari Belajar": "#22c55e",
    Ujian: "#f97316",
    "Semester Baru": "#3b82f6",
    "Kenaikan Kelas": "#8b5cf6",
    Wisuda: "#eab308",
    Lainnya: "#64748b",
  };
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  return (
    <div>
      <PageHeader
        title="Kalender Akademik"
        subtitle="Agenda dan kegiatan akademik sekolah"
      />
      <Card>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <select
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            style={{
              background: "#0f172a",
              color: "#e2e8f0",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
            }}
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            style={{
              background: "#0f172a",
              color: "#e2e8f0",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
            }}
          >
            {[2026, 2025, 2024].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </div>
        {loading ? (
          <WmLoading />
        ) : error ? (
          <WmError message={error} onRetry={load} />
        ) : data.length === 0 ? (
          <WmEmpty text="Tidak ada agenda bulan ini" />
        ) : (
          <WmTable
            headers={["Tanggal", "Kegiatan", "Jenis", "Keterangan"]}
            rows={data.map((k) => [
              k.tanggal,
              k.nama_kegiatan,
              <Badge
                text={k.jenis_kegiatan}
                color={jenisColor[k.jenis_kegiatan] || "#64748b"}
              />,
              k.keterangan || "-",
            ])}
          />
        )}
      </Card>
    </div>
  );
};

// ── Beasiswa ────────────────────────────────────────────────────
export const Beasiswa = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await waliMuridApi.getBeasiswa();
      setData(res.data?.data || []);
    } catch {
      setError("Gagal memuat data beasiswa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Beasiswa"
        subtitle="Informasi beasiswa yang tersedia"
      />
      {loading ? (
        <WmLoading />
      ) : error ? (
        <WmError message={error} onRetry={load} />
      ) : data.length === 0 ? (
        <WmEmpty text="Tidak ada beasiswa aktif saat ini" />
      ) : (
        data.map((b) => (
          <Card key={b.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: "0 0 6px",
                    color: "#f1f5f9",
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {b.nama_beasiswa}
                </h3>
                <p style={{ margin: 0, color: "#94a3b8", fontSize: 13 }}>
                  Penyedia: {b.penyedia}
                </p>
                {b.jumlah_dana && (
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "#22c55e",
                      fontSize: 15,
                      fontWeight: 600,
                    }}
                  >
                    {rupiah(b.jumlah_dana)}
                  </p>
                )}
              </div>
              <Badge
                text={b.status}
                color={b.status === "aktif" ? "#22c55e" : "#64748b"}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                marginTop: 14,
                paddingTop: 12,
                borderTop: "1px solid #334155",
              }}
            >
              <div style={{ color: "#64748b", fontSize: 12 }}>
                📅 Buka: {b.tanggal_pembukaan}
              </div>
              <div style={{ color: "#64748b", fontSize: 12 }}>
                ⏰ Tutup: {b.tanggal_penutupan}
              </div>
              <div style={{ color: "#64748b", fontSize: 12 }}>
                👥 Kuota: {b.kuota} orang
              </div>
            </div>
            {b.persyaratan && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid #334155",
                }}
              >
                <p
                  style={{
                    color: "#64748b",
                    fontSize: 12,
                    margin: "0 0 4px",
                    fontWeight: 600,
                  }}
                >
                  Persyaratan:
                </p>
                <p
                  style={{
                    color: "#cbd5e1",
                    fontSize: 13,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {b.persyaratan}
                </p>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
};

// ── Jurusan ─────────────────────────────────────────────────────
export const JurusanPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await waliMuridApi.getJurusan();
      setData(res.data?.data || []);
    } catch {
      setError("Gagal memuat data jurusan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const colors = ["#3b82f6", "#8b5cf6", "#22c55e", "#f97316"];

  return (
    <div>
      <PageHeader
        title="Jurusan"
        subtitle="Daftar program keahlian SMK Rajasa Surabaya"
      />
      {loading ? (
        <WmLoading />
      ) : error ? (
        <WmError message={error} onRetry={load} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: 16,
          }}
        >
          {data.map((j, i) => (
            <Card
              key={j.id}
              style={{ borderLeft: `3px solid ${colors[i % colors.length]}` }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: 12,
                      color: colors[i % colors.length],
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {j.kode_jurusan}
                  </span>
                  <h3
                    style={{
                      margin: "4px 0 8px",
                      color: "#f1f5f9",
                      fontSize: 16,
                      fontWeight: 700,
                    }}
                  >
                    {j.nama_jurusan}
                  </h3>
                </div>
                <StatCard
                  icon="👤"
                  label="Siswa Aktif"
                  value={j.total_siswa || 0}
                  color={colors[i % colors.length]}
                  style={{ padding: 8, minWidth: 0 }}
                />
              </div>
              {j.deskripsi && (
                <p
                  style={{
                    margin: 0,
                    color: "#94a3b8",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  {j.deskripsi}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Kelas ───────────────────────────────────────────────────────
export const KelasPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await waliMuridApi.getKelas();
      setData(res.data?.data || []);
    } catch {
      setError("Gagal memuat data kelas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const tingkatColor = { 10: "#22c55e", 11: "#3b82f6", 12: "#8b5cf6" };

  return (
    <div>
      <PageHeader
        title="Kelas"
        subtitle="Daftar kelas aktif tahun ajaran 2025/2026"
      />
      {loading ? (
        <WmLoading />
      ) : error ? (
        <WmError message={error} onRetry={load} />
      ) : (
        <Card>
          <WmTable
            headers={[
              "Nama Kelas",
              "Tingkat",
              "Jurusan",
              "Tahun Ajaran",
              "Wali Kelas",
              "Jml Siswa",
            ]}
            rows={data.map((k) => [
              k.nama_kelas,
              <Badge
                text={`Kelas ${k.tingkat}`}
                color={tingkatColor[k.tingkat] || "#64748b"}
              />,
              k.nama_jurusan || "-",
              k.tahun_ajaran,
              k.wali_kelas || "-",
              k.total_siswa || 0,
            ])}
            emptyText="Tidak ada data kelas"
          />
        </Card>
      )}
    </div>
  );
};

// ── Kegiatan Akademik (Beranda) ─────────────────────────────────
export const KegiatanAkademik = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await waliMuridApi.getKegiatan({ limit: 20 });
      setData(res.data?.data || []);
    } catch {
      setError("Gagal memuat kegiatan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Kegiatan Akademik"
        subtitle="Agenda dan kegiatan sekolah"
      />
      {loading ? (
        <WmLoading />
      ) : error ? (
        <WmError message={error} onRetry={load} />
      ) : data.length === 0 ? (
        <WmEmpty />
      ) : (
        <Card>
          <WmTable
            headers={[
              "Kegiatan",
              "Tanggal Mulai",
              "Tanggal Selesai",
              "Lokasi",
              "Peserta",
            ]}
            rows={data.map((k) => [
              k.nama_kegiatan,
              k.tanggal_mulai || "-",
              k.tanggal_selesai || "-",
              k.lokasi || "-",
              k.peserta || "-",
            ])}
          />
        </Card>
      )}
    </div>
  );
};

// ── Rapor Siswa ─────────────────────────────────────────────────
export const RaporSiswa = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await waliMuridApi.getRapor();
      setData(res.data?.data || []);
    } catch {
      setError("Gagal memuat data rapor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Rapor Siswa"
        subtitle="Rekap nilai rapor per semester"
      />
      {loading ? (
        <WmLoading />
      ) : error ? (
        <WmError message={error} onRetry={load} />
      ) : data.length === 0 ? (
        <WmEmpty text="Belum ada data rapor" />
      ) : (
        <Card>
          <WmTable
            headers={[
              "Semester",
              "Tahun Ajaran",
              "Nilai Rata-Rata",
              "Peringkat",
              "Tanggal Terbit",
              "Catatan Wali",
            ]}
            rows={data.map((r) => [
              r.semester,
              r.tahun_ajaran,
              <strong style={{ color: nilaiColor(r.nilai_rata_rata) }}>
                {r.nilai_rata_rata || "-"}
              </strong>,
              r.peringkat ? `#${r.peringkat}` : "-",
              r.tanggal_terbit || "-",
              r.catatan_wali || "-",
            ])}
          />
        </Card>
      )}
    </div>
  );
};

// ── Generic "Coming Soon" page ──────────────────────────────────
export const ComingSoonPage = ({ title, icon = "🚧", description }) => (
  <div>
    <PageHeader title={title} />
    <Card>
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
        <h3 style={{ color: "#f1f5f9", margin: "0 0 8px", fontSize: 18 }}>
          {title}
        </h3>
        <p
          style={{
            color: "#64748b",
            margin: 0,
            maxWidth: 400,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {description ||
            "Halaman ini sedang dalam pengembangan dan akan segera tersedia."}
        </p>
      </div>
    </Card>
  </div>
);
