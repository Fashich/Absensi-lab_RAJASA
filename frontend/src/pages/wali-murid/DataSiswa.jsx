import React, { useState, useEffect } from "react";
import { waliMuridApi } from "../../services/waliMuridApi";
import { WmLoading, WmError, PageHeader, Card, Badge } from "./WmPage";

const DataSiswa = () => {
  const [siswa, setSiswa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await waliMuridApi.getSiswa();
      setSiswa(res.data?.data ?? res.data);
    } catch {
      setError("Gagal memuat data siswa.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <WmLoading />;
  if (error) return <WmError message={error} onRetry={load} />;
  if (!siswa) return <WmError message="Data siswa tidak ditemukan." />;

  const field = (label, value, icon = "📌") => (
    <div
      key={label}
      style={{
        display: "flex",
        alignItems: "flex-start",
        padding: "10px 0",
        borderBottom: "1px solid #1e293b",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span
        style={{ color: "#64748b", fontSize: 13, width: 160, flexShrink: 0 }}
      >
        {label}
      </span>
      <span
        style={{
          color: "#e2e8f0",
          fontSize: 13,
          flex: 1,
          wordBreak: "break-word",
        }}
      >
        {value || "-"}
      </span>
    </div>
  );

  return (
    <div>
      <PageHeader title="Data Siswa" subtitle="Informasi lengkap data siswa" />

      <Card>
        {/* Foto & nama */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
            paddingBottom: 20,
            borderBottom: "1px solid #334155",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 12,
              background: "linear-gradient(135deg,#3b82f6,#06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: "#fff",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {siswa.nama_lengkap?.charAt(0) || "S"}
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                color: "#f1f5f9",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {siswa.nama_lengkap}
            </h2>
            <p style={{ margin: "6px 0 8px", color: "#94a3b8", fontSize: 13 }}>
              {siswa.nama_jurusan || siswa.rombel} · Kelas {siswa.kelas}{" "}
              {siswa.rombel}
            </p>
            <Badge
              text={siswa.status || "Aktif"}
              color={siswa.status === "aktif" ? "#22c55e" : "#ef4444"}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 40px",
          }}
        >
          <div>
            <h4
              style={{
                color: "#3b82f6",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 8px",
              }}
            >
              Data Pribadi
            </h4>
            {field("NISN", siswa.nisn, "🪪")}
            {field("NIS", siswa.nis, "🏫")}
            {field(
              "Jenis Kelamin",
              siswa.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan",
              "👤",
            )}
            {field("Tempat Lahir", siswa.tempat_lahir, "📍")}
            {field("Tanggal Lahir", siswa.tanggal_lahir, "🎂")}
            {field("No. Telepon", siswa.no_telp, "📱")}
            {field("Email", siswa.email, "✉️")}
          </div>
          <div>
            <h4
              style={{
                color: "#3b82f6",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 8px",
              }}
            >
              Data Akademik & Orang Tua
            </h4>
            {field("Kelas", `${siswa.kelas} ${siswa.rombel}`, "🚪")}
            {field("Jurusan", siswa.nama_jurusan || siswa.kode_jurusan, "🎓")}
            {field("Wali Kelas", siswa.wali_kelas, "👩‍🏫")}
            {field("Tahun Ajaran", siswa.tahun_ajaran, "📅")}
            {field("Nama Ortu", siswa.nama_ortu, "👨‍👩‍👦")}
            {field("HP Ortu", siswa.no_telp_ortu, "📞")}
          </div>
        </div>
        {field("Alamat", siswa.alamat, "🏠")}
      </Card>
    </div>
  );
};

export default DataSiswa;
