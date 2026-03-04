#!/usr/bin/env python3
"""
=====================================================
TRAINING MODEL - DATA CLUSTERING & KLASIFIKASI
Sistem Absensi Lab SMK Rajasa Surabaya
=====================================================

Model machine learning untuk:
1. Clustering pola kehadiran siswa
2. Klasifikasi status kehadiran (Hadir, Terlambat, Sakit, Izin, Alpha)
3. Prediksi risiko ketidakhadiran
4. Analisis pola akses tidak valid

Requirements:
pip install scikit-learn pandas numpy matplotlib seaborn mysql-connector-python

Usage:
python training_model.py
=====================================================
"""

import numpy as np
import pandas as pd
import mysql.connector
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import json
import warnings
warnings.filterwarnings('ignore')

# Konfigurasi Database
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'sistem_absensi_lab'
}


class AbsensiAnalytics:
    """Kelas untuk analisis dan training model absensi"""
    
    def __init__(self, db_config=None):
        self.db_config = db_config or DB_CONFIG
        self.db_connection = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.kmeans_model = None
        self.classifier_model = None
        self.connect_db()
    
    def connect_db(self):
        """Koneksi ke database"""
        try:
            self.db_connection = mysql.connector.connect(**self.db_config)
            print("✓ Terhubung ke database")
        except Exception as e:
            print(f"✗ Gagal terhubung ke database: {e}")
    
    def fetch_presensi_data(self, days=30):
        """Ambil data presensi untuk training"""
        query = """
            SELECT 
                p.id,
                p.siswa_id,
                s.nisn,
                s.nama_lengkap,
                s.jurusan_id,
                j.nama_jurusan,
                p.ruangan_id,
                r.kode_ruangan,
                p.tanggal,
                p.waktu_masuk,
                p.waktu_keluar,
                p.status,
                DAYOFWEEK(p.tanggal) as hari,
                HOUR(p.waktu_masuk) as jam_masuk
            FROM presensi p
            JOIN siswa s ON p.siswa_id = s.id
            JOIN jurusan j ON p.jurusan_id = j.id
            JOIN ruangan r ON p.ruangan_id = r.id
            WHERE p.tanggal >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
            ORDER BY p.tanggal DESC
        """
        
        if self.db_connection is None or not self.db_connection.is_connected():
            raise ValueError("Database connection is not established")
        
        df = pd.read_sql(query, self.db_connection, params=(days,))
        return df
    
    def fetch_log_akses_data(self, days=30):
        """Ambil data log akses tidak valid"""
        query = """
            SELECT 
                la.*,
                r.kode_ruangan,
                j.nama_jurusan,
                DAYOFWEEK(la.tanggal) as hari,
                HOUR(la.waktu) as jam
            FROM log_akses la
            JOIN ruangan r ON la.ruangan_id = r.id
            JOIN jurusan j ON r.jurusan_id = j.id
            WHERE la.tanggal >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
            ORDER BY la.tanggal DESC
        """
        
        if self.db_connection is None or not self.db_connection.is_connected():
            raise ValueError("Database connection is not established")
        
        df = pd.read_sql(query, self.db_connection, params=(days,))
        return df
    
    def prepare_features(self, df):
        """Siapkan fitur untuk training"""
        # Konversi tanggal ke datetime
        df['tanggal'] = pd.to_datetime(df['tanggal'])
        
        # Ekstrak fitur dari tanggal
        df['day_of_week'] = df['tanggal'].dt.dayofweek
        df['day_of_month'] = df['tanggal'].dt.day
        df['month'] = df['tanggal'].dt.month
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        
        # Fitur dari waktu masuk
        if 'waktu_masuk' in df.columns:
            df['jam_masuk'] = pd.to_datetime(df['waktu_masuk'], format='%H:%M:%S').dt.hour
            df['menit_masuk'] = pd.to_datetime(df['waktu_masuk'], format='%H:%M:%S').dt.minute
        
        # Encode status
        if 'status' in df.columns:
            df['status_encoded'] = self.label_encoder.fit_transform(df['status'])
        
        return df
    
    # =====================================================
    # CLUSTERING - POLA KEHADIRAN SISWA
    # =====================================================
    def cluster_siswa_by_attendance(self, n_clusters=4):
        """
        Clustering siswa berdasarkan pola kehadiran
        
        Cluster:
        0: Siswa Rajin (selalu hadir tepat waktu)
        1: Siswa Terlambat (sering terlambat)
        2: Siswa Sakit/Izin (sering tidak hadir dengan alasan)
        3: Siswa Bermasalah (sering alpha)
        """
        print("\n" + "="*60)
        print("CLUSTERING SISWA BERDASARKAN POLA KEHADIRAN")
        print("="*60)
        
        # Ambil data
        query = """
            SELECT 
                s.id as siswa_id,
                s.nisn,
                s.nama_lengkap,
                s.jurusan_id,
                j.nama_jurusan,
                COUNT(*) as total_presensi,
                SUM(CASE WHEN p.status = 'hadir' THEN 1 ELSE 0 END) as total_hadir,
                SUM(CASE WHEN p.status = 'terlambat' THEN 1 ELSE 0 END) as total_terlambat,
                SUM(CASE WHEN p.status = 'sakit' THEN 1 ELSE 0 END) as total_sakit,
                SUM(CASE WHEN p.status = 'izin' THEN 1 ELSE 0 END) as total_izin,
                SUM(CASE WHEN p.status = 'alpha' THEN 1 ELSE 0 END) as total_alpha,
                AVG(HOUR(p.waktu_masuk)) as rata_rata_jam_masuk
            FROM presensi p
            JOIN siswa s ON p.siswa_id = s.id
            JOIN jurusan j ON s.jurusan_id = j.id
            WHERE p.tanggal >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY s.id
            HAVING total_presensi >= 5
        """
        
        if self.db_connection is None:
            raise ValueError("Database connection is not established")
        
        df = pd.read_sql(query, self.db_connection)
        
        if len(df) == 0:
            print("Data tidak cukup untuk clustering")
            return None
            
        # Check if database connection is still active
        if self.db_connection is None:
            raise ValueError("Database connection is not established")
        
        # Siapkan fitur
        features = ['total_hadir', 'total_terlambat', 'total_sakit', 'total_izin', 
                    'total_alpha', 'rata_rata_jam_masuk']
        X = df[features].fillna(0)
        
        # Normalisasi
        X_scaled = self.scaler.fit_transform(X)
        
        # K-Means Clustering
        self.kmeans_model = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        df['cluster'] = self.kmeans_model.fit_predict(X_scaled)
        
        # Interpretasi cluster
        cluster_names = {
            0: 'Siswa Rajin',
            1: 'Siswa Terlambat',
            2: 'Siswa Sakit/Izin',
            3: 'Siswa Bermasalah'
        }
        
        df['kategori'] = df['cluster'].map(cluster_names)
        
        # Tampilkan hasil
        print(f"\nTotal siswa dianalisis: {len(df)}")
        print("\nDistribusi Cluster:")
        print(df['kategori'].value_counts())
        
        print("\nDetail per Cluster:")
        for cluster_id in range(n_clusters):
            cluster_data = df[df['cluster'] == cluster_id]
            print(f"\n--- {cluster_names[cluster_id]} (n={len(cluster_data)}) ---")
            print(f"  Rata-rata Hadir: {cluster_data['total_hadir'].mean():.1f}")
            print(f"  Rata-rata Terlambat: {cluster_data['total_terlambat'].mean():.1f}")
            print(f"  Rata-rata Alpha: {cluster_data['total_alpha'].mean():.1f}")
        
        # Simpan hasil
        df.to_csv('clustering_siswa.csv', index=False)
        print("\n✓ Hasil clustering disimpan ke: clustering_siswa.csv")
        
        return df
    
    # =====================================================
    # KLASIFIKASI - PREDIKSI STATUS KEHADIRAN
    # =====================================================
    def train_status_classifier(self):
        """
        Training model klasifikasi untuk prediksi status kehadiran
        """
        print("\n" + "="*60)
        print("TRAINING MODEL KLASIFIKASI STATUS KEHADIRAN")
        print("="*60)
        
        # Ambil data
        df = self.fetch_presensi_data(days=60)
        
        if len(df) == 0:
            print("Data tidak cukup untuk training")
            return None
        
        # Siapkan fitur
        df = self.prepare_features(df)
        
        # Fitur untuk training
        feature_cols = ['jurusan_id', 'ruangan_id', 'day_of_week', 'day_of_month', 
                        'month', 'is_weekend', 'jam_masuk']
        
        X = df[feature_cols].fillna(0)
        y = df['status']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        print(f"\nTotal data: {len(df)}")
        print(f"Training set: {len(X_train)}")
        print(f"Test set: {len(X_test)}")
        
        # Training Random Forest
        self.classifier_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        self.classifier_model.fit(X_train, y_train)
        
        # Evaluasi
        y_pred = self.classifier_model.predict(X_test)
        
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))
        
        # Feature importance
        importance_df = pd.DataFrame({
            'feature': feature_cols,
            'importance': self.classifier_model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\nFeature Importance:")
        print(importance_df)
        
        # Simpan model
        import joblib
        joblib.dump(self.classifier_model, 'status_classifier_model.pkl')
        print("\n✓ Model disimpan ke: status_classifier_model.pkl")
        
        return self.classifier_model
    
    # =====================================================
    # ANALISIS LOG AKSES TIDAK VALID
    # =====================================================
    def analyze_invalid_access(self):
        """
        Analisis pola akses tidak valid
        """
        print("\n" + "="*60)
        print("ANALISIS LOG AKSES TIDAK VALID")
        print("="*60)
        
        df = self.fetch_log_akses_data(days=30)
        
        if len(df) == 0:
            print("Tidak ada data log akses")
            return None
        
        print(f"\nTotal log akses tidak valid: {len(df)}")
        
        # Analisis per status
        print("\nDistribusi Status:")
        print(df['status'].value_counts())
        
        # Analisis per ruangan
        print("\nTop 5 Ruangan dengan Akses Tidak Valid:")
        print(df['kode_ruangan'].value_counts().head())
        
        # Analisis waktu
        df['jam'] = df['jam'].fillna(0)
        print("\nJam dengan Akses Tidak Valid Terbanyak:")
        print(df['jam'].value_counts().head())
        
        # Visualisasi
        plt.figure(figsize=(12, 5))
        
        plt.subplot(1, 2, 1)
        df['status'].value_counts().plot(kind='bar')
        plt.title('Distribusi Status Akses Tidak Valid')
        plt.xlabel('Status')
        plt.ylabel('Jumlah')
        plt.xticks(rotation=45)
        
        plt.subplot(1, 2, 2)
        df['kode_ruangan'].value_counts().head(5).plot(kind='bar')
        plt.title('Top 5 Ruangan - Akses Tidak Valid')
        plt.xlabel('Ruangan')
        plt.ylabel('Jumlah')
        plt.xticks(rotation=45)
        
        plt.tight_layout()
        plt.savefig('analisis_log_akses.png')
        print("\n✓ Visualisasi disimpan ke: analisis_log_akses.png")
        
        return df
    
    # =====================================================
    # GENERATE LAPORAN ANALISIS
    # =====================================================
    def generate_analytics_report(self):
        """
        Generate laporan analisis lengkap
        """
        print("\n" + "="*60)
        print("GENERATE LAPORAN ANALISIS")
        print("="*60)
        
        if self.db_connection is None or not self.db_connection.is_connected():
            print("Database connection is not established")
            return None
        
        # 1. Statistik Kehadiran
        query_stats = """
            SELECT 
                j.nama_jurusan,
                r.kode_ruangan,
                COUNT(*) as total,
                SUM(CASE WHEN p.status = 'hadir' THEN 1 ELSE 0 END) as hadir,
                SUM(CASE WHEN p.status = 'terlambat' THEN 1 ELSE 0 END) as terlambat,
                SUM(CASE WHEN p.status = 'sakit' THEN 1 ELSE 0 END) as sakit,
                SUM(CASE WHEN p.status = 'izin' THEN 1 ELSE 0 END) as izin,
                SUM(CASE WHEN p.status = 'alpha' THEN 1 ELSE 0 END) as alpha
            FROM presensi p
            JOIN jurusan j ON p.jurusan_id = j.id
            JOIN ruangan r ON p.ruangan_id = r.id
            WHERE p.tanggal >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY p.jurusan_id, p.ruangan_id
        """
        
        df_stats = pd.read_sql(query_stats, self.db_connection)
        
        report = {
            'generated_at': datetime.now().isoformat(),
            'period': '30 hari terakhir',
            'total_presensi': int(df_stats['total'].sum()),
            'by_jurusan': df_stats.groupby('nama_jurusan').sum().to_dict(),
            'by_ruangan': df_stats.groupby('kode_ruangan').sum().to_dict()
        }
        
        # Simpan laporan
        with open('laporan_analisis.json', 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        print("\n✓ Laporan disimpan ke: laporan_analisis.json")
        
        return report
    
    def close(self):
        """Tutup koneksi database"""
        if self.db_connection:
            self.db_connection.close()
            print("\n✓ Koneksi database ditutup")


def main():
    """Fungsi utama"""
    print("="*60)
    print("TRAINING MODEL - SISTEM ABSENSI LAB")
    print("SMK Rajasa Surabaya")
    print("="*60)
    
    analytics = AbsensiAnalytics()
    
    # 1. Clustering siswa
    analytics.cluster_siswa_by_attendance(n_clusters=4)
    
    # 2. Training klasifikasi
    analytics.train_status_classifier()
    
    # 3. Analisis log akses
    analytics.analyze_invalid_access()
    
    # 4. Generate laporan
    analytics.generate_analytics_report()
    
    analytics.close()
    
    print("\n" + "="*60)
    print("TRAINING SELESAI")
    print("="*60)


if __name__ == "__main__":
    main()
