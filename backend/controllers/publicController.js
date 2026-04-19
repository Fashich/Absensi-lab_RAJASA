const db = require('../config/db');

// Mendapatkan informasi umum sekolah
const getSchoolInfo = async (req, res) => {
  try {
    // Query untuk mendapatkan informasi umum sekolah
    const schoolQuery = `
      SELECT 
        'SMK Rajasa Surabaya' as schoolName,
        'Jl. Rajawali Timur No. 16-18, Wonokusumo, Semampir, Surabaya' as address,
        'Sistem Presensi Laboratorium' as name,
        'SMK Rajasa Surabaya' as subtitle
    `;
    
    // Query untuk mendapatkan fitur-fitur
    const featuresQuery = `
      SELECT 
        JSON_ARRAY(
          JSON_OBJECT('icon', 'fa-wifi', 'label', 'IoT Based'),
          JSON_OBJECT('icon', 'fa-shield-alt', 'label', 'Secure'),
          JSON_OBJECT('icon', 'fa-clock', 'label', 'Real-time')
        ) as features
    `;
    
    // Query untuk mendapatkan informasi pengumuman
    const announcementsQuery = `
      SELECT id, judul as title, tanggal_terbit as date, kategori as category
      FROM pengumuman 
      WHERE tanggal_terbit >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY tanggal_terbit DESC
      LIMIT 5
    `;
    
    // Query untuk mendapatkan statistik umum
    const statsQuery = `
      SELECT 
        JSON_ARRAY(
          JSON_OBJECT('bulan', 'Jul', 'jumlah', 480),
          JSON_OBJECT('bulan', 'Agu', 'jumlah', 490),
          JSON_OBJECT('bulan', 'Sep', 'jumlah', 475),
          JSON_OBJECT('bulan', 'Okt', 'jumlah', 485),
          JSON_OBJECT('bulan', 'Nov', 'jumlah', 470),
          JSON_OBJECT('bulan', 'Des', 'jumlah', 495)
        ) as attendance,
        JSON_ARRAY(
          JSON_OBJECT('mapel', 'Matematika', 'kelas', 78, 'sekolah', 75),
          JSON_OBJECT('mapel', 'B.Indonesia', 'kelas', 82, 'sekolah', 78),
          JSON_OBJECT('mapel', 'B.Inggris', 'kelas', 80, 'sekolah', 76),
          JSON_OBJECT('mapel', 'IPA', 'kelas', 75, 'sekolah', 72),
          JSON_OBJECT('mapel', 'IPS', 'kelas', 85, 'sekolah', 80)
        ) as nilai
    `;
    
    // Eksekusi semua query
    const [schoolResult] = await db.execute(schoolQuery);
    const [featuresResult] = await db.execute(featuresQuery);
    const [announcementsResult] = await db.execute(announcementsQuery);
    const [statsResult] = await db.execute(statsQuery);
    
    // Gabungkan hasil
    const result = {
      ...schoolResult[0],
      features: JSON.parse(featuresResult[0].features),
      pengumuman: announcementsResult,
      stats: {
        attendance: JSON.parse(statsResult[0].attendance),
        nilai: JSON.parse(statsResult[0].nilai)
      }
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting school info:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getSchoolInfo
};