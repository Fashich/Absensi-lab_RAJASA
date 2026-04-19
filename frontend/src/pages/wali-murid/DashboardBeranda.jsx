import React, { useState, useEffect } from "react";
import { waliMuridApi } from "../../services/waliMuridApi";
import {
  WmLoading,
  WmError,
  StatCard,
  Card,
  PageHeader,
  Badge,
} from "./WmPage";

const DashboardBeranda = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await waliMuridApi.getDashboard();
      setData(res.data?.data ?? res.data);
    } catch {
      setError("Gagal memuat data dashboard. Pastikan server berjalan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <WmLoading />;
  if (error) return <WmError message={error} onRetry={load} />;

  const st = data?.presensi_stats || {};
  const siswa = data?.siswa_info || {};
  const nilai = data?.nilai_stats || {};
  const spp = data?.spp_status;

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
        title="Dashboard Beranda"
        subtitle={`Selamat datang di portal wali murid SMK Rajasa Surabaya — ${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`}
      />

      {/* Info Siswa */}
      {siswa?.nama_lengkap && (
        <Card
          style={{
            background: "linear-gradient(135deg,#1e3a5f,#1e293b)",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: "#3b82f622",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
              }}
            >
              👤
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  color: "#f1f5f9",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {siswa.nama_lengkap}
              </h3>
              <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: 13 }}>
                {siswa.kelas} {siswa.rombel} · {siswa.nama_jurusan} · NISN:{" "}
                {siswa.nisn}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          icon="✅"
          label="Hadir Bulan Ini"
          value={st.hadir || 0}
          color="#22c55e"
        />
        <StatCard
          icon="🤒"
          label="Sakit"
          value={st.sakit || 0}
          color="#f97316"
        />
        <StatCard icon="📋" label="Izin" value={st.izin || 0} color="#eab308" />
        <StatCard
          icon="❌"
          label="Alpha"
          value={st.alpha || 0}
          color="#ef4444"
        />
        <StatCard
          icon="⏰"
          label="Terlambat"
          value={st.terlambat || 0}
          color="#8b5cf6"
        />
        <StatCard
          icon="📊"
          label="Rata Nilai Akhir"
          value={nilai?.avg_akhir ? `${nilai.avg_akhir}` : "-"}
          color="#3b82f6"
          subtext={
            nilai?.avg_akhir >= 75
              ? "✅ Lulus KKM"
              : nilai?.avg_akhir
                ? "⚠ Perlu Peningkatan"
                : ""
          }
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Pengumuman */}
        <Card>
          <h3
            style={{
              margin: "0 0 16px",
              color: "#f1f5f9",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            📢 Pengumuman Terbaru
          </h3>
          {(data?.pengumuman || []).length === 0 ? (
            <p style={{ color: "#64748b", fontSize: 13 }}>
              Tidak ada pengumuman.
            </p>
          ) : (
            data.pengumuman.map((p) => (
              <div
                key={p.id}
                style={{ padding: "10px 0", borderBottom: "1px solid #334155" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      color: "#e2e8f0",
                      fontSize: 13,
                      fontWeight: 500,
                      flex: 1,
                    }}
                  >
                    {p.judul}
                  </span>
                  <Badge
                    text={p.prioritas}
                    color={priorityColor[p.prioritas] || "#3b82f6"}
                  />
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Badge
                    text={p.kategori}
                    color={kategoriColor[p.kategori] || "#64748b"}
                  />
                  <span style={{ color: "#64748b", fontSize: 11 }}>
                    {p.tanggal_terbit}
                  </span>
                </div>
              </div>
            ))
          )}
        </Card>

        {/* Kegiatan Mendatang */}
        <Card>
          <h3
            style={{
              margin: "0 0 16px",
              color: "#f1f5f9",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            📅 Kegiatan Mendatang
          </h3>
          {(data?.kegiatan || []).length === 0 ? (
            <p style={{ color: "#64748b", fontSize: 13 }}>
              Tidak ada kegiatan mendatang.
            </p>
          ) : (
            data.kegiatan.map((k, i) => (
              <div
                key={i}
                style={{ padding: "10px 0", borderBottom: "1px solid #334155" }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#e2e8f0",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {k.nama_kegiatan}
                </p>
                <p
                  style={{ margin: "4px 0 0", color: "#64748b", fontSize: 12 }}
                >
                  📍 {k.lokasi || "-"} · {k.tanggal_mulai}
                  {k.tanggal_selesai &&
                    k.tanggal_selesai !== k.tanggal_mulai &&
                    ` s/d ${k.tanggal_selesai}`}
                </p>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* SPP Status */}
      {spp && (
        <Card style={{ marginTop: 0 }}>
          <h3
            style={{
              margin: "0 0 12px",
              color: "#f1f5f9",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            💳 Status SPP Bulan Ini
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Badge
              text={spp.status_pembayaran}
              color={spp.status_pembayaran === "Lunas" ? "#22c55e" : "#ef4444"}
            />
            <span style={{ color: "#94a3b8", fontSize: 13 }}>
              Rp {Number(spp.jumlah || 0).toLocaleString("id-ID")}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardBeranda;
