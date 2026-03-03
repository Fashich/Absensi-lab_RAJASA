#!/usr/bin/env python3
"""
=====================================================
BARCODE SCANNER TRAINING MODEL
Sistem Absensi Lab SMK Rajasa Surabaya
=====================================================

Model machine learning khusus untuk scanning ID Card siswa
dengan fokus pada deteksi barcode dan ekstraksi data siswa.

Fitur:
1. Deteksi barcode dari ID Card siswa
2. Ekstraksi data siswa dari barcode
3. Validasi data dengan database
4. Pelatihan untuk akurasi deteksi tinggi

Requirements:
pip install opencv-python pytesseract pyzbar numpy pandas mysql-connector-python scikit-learn

Usage:
python barcode_scanner_training.py
=====================================================
"""

import cv2
import numpy as np
import pytesseract
from pyzbar import pyzbar
import re
import json
import mysql.connector
from datetime import datetime
from pathlib import Path
import logging
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import pickle

# Konfigurasi logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Konfigurasi Database
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'sistem_absensi_lab'
}

class BarcodeScannerTrainer:
    """Kelas untuk pelatihan dan scanning barcode ID Card siswa"""
    
    def __init__(self, db_config=None):
        """Inisialisasi scanner dengan konfigurasi database"""
        self.db_config = db_config or DB_CONFIG
        self.db_connection = None
        self.model = None
        self.connect_db()
    
    def connect_db(self):
        """Membuat koneksi ke database"""
        try:
            self.db_connection = mysql.connector.connect(**self.db_config)
            logger.info("Berhasil terhubung ke database")
        except Exception as e:
            logger.error(f"Gagal terhubung ke database: {e}")
            self.db_connection = None
    
    def preprocess_image(self, image_path):
        """
        Preprocessing gambar untuk meningkatkan deteksi barcode
        
        Steps:
        1. Resize ke ukuran standar
        2. Konversi ke grayscale
        3. Noise reduction
        4. Enhance contrast
        """
        # Baca gambar
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Tidak dapat membaca gambar: {image_path}")
        
        # Resize ke ukuran standar
        img = cv2.resize(img, (1200, 800))
        
        # Konversi ke grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Enhance contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        enhanced = clahe.apply(gray)
        
        # Noise reduction dengan Gaussian Blur
        blur = cv2.GaussianBlur(enhanced, (5, 5), 0)
        
        return img, gray, blur
    
    def detect_barcode(self, image):
        """
        Deteksi barcode dalam gambar
        """
        # Decode barcode
        barcodes = pyzbar.decode(image)
        
        if barcodes:
            # Ambil data dari barcode pertama
            barcode = barcodes[0]
            (x, y, w, h) = barcode.rect
            
            # Gambar kotak di sekitar barcode
            cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 0), 2)
            
            # Decode data
            barcode_data = barcode.data.decode("utf-8")
            barcode_type = barcode.type
            
            return {
                'data': barcode_data,
                'type': barcode_type,
                'rect': (x, y, w, h)
            }
        
        return None
    
    def extract_student_data_from_barcode(self, barcode_data):
        """
        Ekstrak data siswa dari barcode
        Format yang umum: NISN|NAMA|KELAS|JURUSAN|ROMBEL
        """
        data = {}
        
        # Coba berbagai format
        # Format 1: NISN|NAMA|KELAS|JURUSAN|ROMBEL
        parts = barcode_data.split('|')
        if len(parts) >= 5:
            data = {
                'nisn': parts[0],
                'nama_lengkap': parts[1],
                'kelas': parts[2],
                'jurusan': parts[3],
                'rombel': parts[4]
            }
        else:
            # Format 2: NISN,NAMA,KELAS,JURUSAN,ROMBEL
            parts = barcode_data.split(',')
            if len(parts) >= 5:
                data = {
                    'nisn': parts[0],
                    'nama_lengkap': parts[1],
                    'kelas': parts[2],
                    'jurusan': parts[3],
                    'rombel': parts[4]
                }
            else:
                # Format 3: Coba ekstrak dengan regex
                nisn_match = re.search(r'\b\d{10}\b', barcode_data)
                if nisn_match:
                    data['nisn'] = nisn_match.group(0)
                
                # Coba cari nama (huruf besar)
                name_match = re.search(r'[A-Z][A-Z\s]+', barcode_data.replace(data.get('nisn', ''), ''))
                if name_match:
                    data['nama_lengkap'] = name_match.group(0).strip()
        
        return data
    
    def validate_with_database(self, nisn):
        """
        Validasi NISN dengan database
        """
        if not self.db_connection:
            logger.error("Tidak ada koneksi database")
            return None
        
        try:
            cursor = self.db_connection.cursor(dictionary=True)
            query = """
                SELECT s.*, j.nama_jurusan, j.kode_jurusan, r.nama_ruangan
                FROM siswa s
                LEFT JOIN jurusan j ON s.jurusan_id = j.id
                LEFT JOIN ruangan r ON s.jurusan_id = r.jurusan_id
                WHERE s.nisn = %s AND s.status = 'aktif'
                LIMIT 1
            """
            cursor.execute(query, (nisn,))
            result = cursor.fetchone()
            cursor.close()
            
            return result
            
        except Exception as e:
            logger.error(f"Error validasi database: {e}")
            return None
    
    def scan_id_card_barcode(self, image_path):
        """
        Fungsi utama untuk scanning ID Card dengan barcode
        
        Returns:
            dict: Data hasil scanning dan validasi
        """
        logger.info(f"Memulai scanning barcode ID Card: {image_path}")
        
        try:
            # Preprocessing gambar
            original, gray, processed = self.preprocess_image(image_path)
            
            # Deteksi barcode
            barcode_result = self.detect_barcode(processed)
            
            if not barcode_result:
                logger.warning("Barcode tidak ditemukan dalam gambar")
                return {
                    'success': False,
                    'error': 'Barcode tidak ditemukan dalam gambar',
                    'timestamp': datetime.now().isoformat()
                }
            
            # Ekstrak data siswa dari barcode
            student_data = self.extract_student_data_from_barcode(barcode_result['data'])
            
            # Validasi dengan database jika NISN ditemukan
            if 'nisn' in student_data and student_data['nisn']:
                db_data = self.validate_with_database(student_data['nisn'])
                if db_data:
                    student_data['database_match'] = True
                    student_data['siswa_data'] = db_data
                    logger.info(f"Siswa ditemukan: {db_data['nama_lengkap']}")
                else:
                    student_data['database_match'] = False
                    logger.warning(f"NISN {student_data['nisn']} tidak ditemukan di database")
            
            return {
                'success': True,
                'data': student_data,
                'barcode_raw_data': barcode_result['data'],
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error scanning barcode ID Card: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def generate_training_data(self):
        """
        Generate data latih berdasarkan data siswa yang ada di database
        """
        try:
            cursor = self.db_connection.cursor(dictionary=True)
            
            # Ambil data siswa
            query = """
                SELECT nisn, nama_lengkap, kelas, jurusan_id, rombel
                FROM siswa
                WHERE status = 'aktif'
            """
            cursor.execute(query)
            students = cursor.fetchall()
            cursor.close()
            
            # Generate data simulasi barcode
            training_data = []
            labels = []
            
            for student in students:
                # Format data menjadi barcode (simulasi)
                barcode_sim = f"{student['nisn']}|{student['nama_lengkap']}|{student['kelas']}|{student['jurusan_id']}|{student['rombel']}"
                
                # Ekstrak informasi
                extracted = self.extract_student_data_from_barcode(barcode_sim)
                
                # Buat fitur untuk training
                feature = [
                    len(student['nisn']) if student['nisn'] else 0,
                    len(student['nama_lengkap']) if student['nama_lengkap'] else 0,
                    1 if student['kelas'] else 0,
                    student['jurusan_id'] if student['jurusan_id'] else 0,
                    len(student['rombel']) if student['rombel'] else 0
                ]
                
                training_data.append(feature)
                labels.append(1 if extracted.get('nisn') == student['nisn'] else 0)
            
            return np.array(training_data), np.array(labels)
            
        except Exception as e:
            logger.error(f"Error generating training data: {e}")
            return np.array([]), np.array([])
    
    def train_model(self):
        """
        Train model untuk meningkatkan akurasi ekstraksi data
        """
        logger.info("Mulai pelatihan model...")
        
        # Generate data latih
        X, y = self.generate_training_data()
        
        if len(X) == 0:
            logger.error("Tidak ada data latih yang tersedia")
            return None
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train model
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        self.model.fit(X_train, y_train)
        
        # Evaluasi
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        logger.info(f"Akurasi model: {accuracy:.2f}")
        logger.info(f"Classification Report:\n{classification_report(y_test, y_pred)}")
        
        # Simpan model
        with open('barcode_scanner_model.pkl', 'wb') as f:
            pickle.dump(self.model, f)
        
        logger.info("Model disimpan sebagai 'barcode_scanner_model.pkl'")
        
        return self.model
    
    def load_model(self, model_path='barcode_scanner_model.pkl'):
        """
        Load model yang sudah dilatih
        """
        try:
            with open(model_path, 'rb') as f:
                self.model = pickle.load(f)
            logger.info(f"Model berhasil dimuat dari {model_path}")
            return True
        except Exception as e:
            logger.error(f"Gagal memuat model: {e}")
            return False
    
    def predict_accuracy(self, nisn, nama_lengkap, kelas, jurusan_id, rombel):
        """
        Prediksi akurasi ekstraksi data
        """
        if not self.model:
            logger.warning("Model belum dilatih")
            return 0.8  # Return default value
        
        feature = [
            len(nisn) if nisn else 0,
            len(nama_lengkap) if nama_lengkap else 0,
            1 if kelas else 0,
            jurusan_id if jurusan_id else 0,
            len(rombel) if rombel else 0
        ]
        
        prediction = self.model.predict_proba([feature])
        return prediction[0][1] if len(prediction[0]) > 1 else 0.5
    
    def close(self):
        """Tutup koneksi database"""
        if self.db_connection:
            self.db_connection.close()
            logger.info("Koneksi database ditutup")


def main():
    """Fungsi utama untuk testing dan pelatihan"""
    trainer = BarcodeScannerTrainer()
    
    print("=" * 60)
    print("BARCODE SCANNER TRAINING - SMK Rajasa Surabaya")
    print("=" * 60)
    
    # Latih model
    print("\nMelatih model...")
    model = trainer.train_model()
    
    if model:
        print("\nModel berhasil dilatih!")
    
    # Contoh penggunaan
    image_path = "test_id_card_barcode.jpg"  # Ganti dengan path gambar ID Card
    
    if Path(image_path).exists():
        print(f"\nMencoba scan pada: {image_path}")
        result = trainer.scan_id_card_barcode(image_path)
        
        print("\nHASIL SCANNING BARCODE:")
        print("-" * 60)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f"\nFile {image_path} tidak ditemukan. Silakan ganti dengan file ID Card yang benar.")
    
    trainer.close()


if __name__ == "__main__":
    main()