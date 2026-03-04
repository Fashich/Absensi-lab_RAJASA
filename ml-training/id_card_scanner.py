#!/usr/bin/env python3
"""
=====================================================
ID CARD SCANNER - OCR SYSTEM
Sistem Absensi Lab SMK Rajasa Surabaya
=====================================================

Sistem OCR untuk membaca dan mengekstrak data dari ID Card siswa
menggunakan OpenCV dan Tesseract OCR.

Fitur:
- Deteksi ID Card otomatis
- Ekstraksi NISN, Nama, Kelas, dll
- Validasi data dengan database
- Integrasi dengan sistem absensi

Requirements:
- Python 3.7+
- OpenCV (cv2)
- pytesseract
- numpy
- Pillow
- mysql-connector-python

Install dependencies:
pip install opencv-python pytesseract numpy Pillow mysql-connector-python

Install Tesseract OCR:
- Windows: https://github.com/UB-Mannheim/tesseract/wiki
- Linux: sudo apt-get install tesseract-ocr
- Mac: brew install tesseract
=====================================================
"""

import cv2
import numpy as np
import pytesseract
import re
import json
import mysql.connector
from datetime import datetime
from pathlib import Path
import logging

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

# Path Tesseract (sesuaikan dengan sistem)
# Windows:
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
# Linux/Mac: sudah otomatis jika terinstall


class IDCardScanner:
    """Kelas utama untuk scanning dan OCR ID Card"""
    
    def __init__(self, db_config=None):
        """Inisialisasi scanner dengan konfigurasi database"""
        self.db_config = db_config or DB_CONFIG
        self.db_connection = None
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
        Preprocessing gambar untuk meningkatkan akurasi OCR
        
        Steps:
        1. Resize ke ukuran standar
        2. Konversi ke grayscale
        3. Noise reduction
        4. Thresholding
        5. Deskewing (jika perlu)
        """
        # Baca gambar
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Tidak dapat membaca gambar: {image_path}")
        
        # Resize ke ukuran standar (lebih besar = lebih akurat OCR)
        img = cv2.resize(img, (1200, 800))
        
        # Konversi ke grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Noise reduction dengan Gaussian Blur
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Adaptive thresholding untuk meningkatkan kontras
        thresh = cv2.adaptiveThreshold(
            blur, 255, 
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 
            11, 2
        )
        
        # Morphological operations untuk membersihkan noise
        kernel = np.ones((2, 2), np.uint8)
        morph = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        return img, gray, morph
    
    def detect_id_card_region(self, image):
        """
        Deteksi region ID Card dalam gambar
        Menggunakan contour detection untuk menemukan kartu
        """
        # Konversi ke grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Edge detection
        edges = cv2.Canny(gray, 50, 150)
        
        # Temukan contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Cari contour terbesar yang berbentuk persegi panjang (ID Card)
        id_card_contour = None
        max_area = 0
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > max_area and area > 10000:  # Minimum area
                peri = cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, 0.02 * peri, True)
                
                # ID Card biasanya persegi panjang (4 sudut)
                if len(approx) == 4:
                    max_area = area
                    id_card_contour = approx
        
        if id_card_contour is not None:
            # Perspective transform untuk meratakan kartu
            pts = id_card_contour.reshape(4, 2)
            rect = np.zeros((4, 2), dtype="float32")
            
            # Urutkan titik: top-left, top-right, bottom-right, bottom-left
            s = pts.sum(axis=1)
            rect[0] = pts[np.argmin(s)]
            rect[2] = pts[np.argmax(s)]
            
            diff = np.diff(pts, axis=1)
            rect[1] = pts[np.argmin(diff)]
            rect[3] = pts[np.argmax(diff)]
            
            # Hitung dimensi output
            widthA = np.sqrt(((rect[2][0] - rect[3][0]) ** 2) + ((rect[2][1] - rect[3][1]) ** 2))
            widthB = np.sqrt(((rect[1][0] - rect[0][0]) ** 2) + ((rect[1][1] - rect[0][1]) ** 2))
            maxWidth = max(int(widthA), int(widthB))
            
            heightA = np.sqrt(((rect[1][0] - rect[2][0]) ** 2) + ((rect[1][1] - rect[2][1]) ** 2))
            heightB = np.sqrt(((rect[0][0] - rect[3][0]) ** 2) + ((rect[0][1] - rect[3][1]) ** 2))
            maxHeight = max(int(heightA), int(heightB))
            
            # Perspective transform
            dst = np.array([
                [0, 0],
                [maxWidth - 1, 0],
                [maxWidth - 1, maxHeight - 1],
                [0, maxHeight - 1]], dtype="float32")
            
            M = cv2.getPerspectiveTransform(rect, dst)
            warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))
            
            return warped
        
        return image
    
    def extract_text(self, image):
        """
        Ekstrak teks dari gambar menggunakan Tesseract OCR
        """
        # Konfigurasi Tesseract untuk bahasa Indonesia + English
        custom_config = r'--oem 3 --psm 6 -l ind+eng'
        
        # OCR
        text = pytesseract.image_to_string(image, config=custom_config)
        
        return text
    
    def parse_id_card_data(self, text):
        """
        Parse data dari teks OCR menjadi struktur data
        Mencari pola: NISN, Nama, Kelas, dll
        """
        data = {
            'nisn': None,
            'nama': None,
            'tempat_lahir': None,
            'tanggal_lahir': None,
            'jenis_kelamin': None,
            'agama': None,
            'alamat': None,
            'kelas': None,
            'jurusan': None,
            'rombel': None,
            'raw_text': text
        }
        
        # Pattern untuk NISN (10 digit)
        nisn_match = re.search(r'NISN\s*[:\-]?\s*(\d{10})', text, re.IGNORECASE)
        if nisn_match:
            data['nisn'] = nisn_match.group(1)
        
        # Pattern untuk Nama (biasanya setelah NISN atau di baris terpisah)
        lines = text.split('\n')
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Cari nama (biasanya huruf besar semua)
            if line.isupper() and len(line) > 5 and not any(x in line for x in ['NISN', 'KELAS', 'ALAMAT']):
                if data['nama'] is None:
                    data['nama'] = line
            
            # Cari Kelas dan Jurusan
            kelas_match = re.search(r'(X|XI|XII)\s*([A-Z]+)\s*(\d+)?', line)
            if kelas_match:
                data['kelas'] = kelas_match.group(1)
                data['jurusan'] = kelas_match.group(2)
                if kelas_match.group(3):
                    data['rombel'] = f"{kelas_match.group(2)}-{kelas_match.group(3)}"
            
            # Cari Tempat/Tanggal Lahir
            ttl_match = re.search(r'(Tempat|Tgl)\s*[/.]?\s*(\w+)[,\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', text, re.IGNORECASE)
            if ttl_match:
                data['tempat_lahir'] = ttl_match.group(2)
                data['tanggal_lahir'] = ttl_match.group(3)
            
            # Cari Jenis Kelamin
            if 'LAKI-LAKI' in line or 'LAKI' in line:
                data['jenis_kelamin'] = 'L'
            elif 'PEREMPUAN' in line:
                data['jenis_kelamin'] = 'P'
            
            # Cari Alamat
            if 'ALAMAT' in line.upper():
                alamat = line.split(':')[-1].strip()
                if alamat:
                    data['alamat'] = alamat
        
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
    
    def scan_id_card(self, image_path):
        """
        Fungsi utama untuk scanning ID Card
        
        Returns:
            dict: Data hasil scanning dan validasi
        """
        logger.info(f"Memulai scanning ID Card: {image_path}")
        
        try:
            # Preprocessing gambar
            original, gray, processed = self.preprocess_image(image_path)
            
            # Deteksi region ID Card
            id_card_region = self.detect_id_card_region(original)
            
            # Ekstrak teks
            text = self.extract_text(id_card_region)
            logger.info(f"Teks terdeteksi:\n{text}")
            
            # Parse data
            data = self.parse_id_card_data(text)
            logger.info(f"Data terparse: {json.dumps(data, indent=2, ensure_ascii=False)}")
            
            # Validasi dengan database jika NISN ditemukan
            if data['nisn']:
                db_data = self.validate_with_database(data['nisn'])
                if db_data:
                    data['database_match'] = True
                    data['siswa_data'] = db_data
                    logger.info(f"Siswa ditemukan: {db_data['nama_lengkap']}")
                else:
                    data['database_match'] = False
                    logger.warning(f"NISN {data['nisn']} tidak ditemukan di database")
            
            return {
                'success': True,
                'data': data,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error scanning ID Card: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def scan_and_mark_attendance(self, image_path, ruangan_id):
        """
        Scan ID Card dan langsung catat presensi
        """
        result = self.scan_id_card(image_path)
        
        if not result['success']:
            return result
        
        data = result['data']
        
        if not data.get('database_match'):
            return {
                'success': False,
                'error': 'Siswa tidak ditemukan di database',
                'data': data
            }
        
        siswa = data['siswa_data']
        
        # Pastikan koneksi database tersedia
        if not self.db_connection or not self.db_connection.is_connected():
            return {
                'success': False,
                'error': 'Tidak ada koneksi database yang aktif',
                'siswa': siswa
            }
        
        # Catat presensi
        try:
            cursor = self.db_connection.cursor()
            
            # Cek apakah sudah presensi hari ini
            check_query = """
                SELECT id FROM presensi 
                WHERE siswa_id = %s AND ruangan_id = %s AND tanggal = CURDATE()
            """
            cursor.execute(check_query, (siswa['id'], ruangan_id))
            if cursor.fetchone():
                return {
                    'success': False,
                    'error': 'Siswa sudah presensi hari ini',
                    'siswa': siswa
                }
            
            # Insert presensi
            insert_query = """
                INSERT INTO presensi 
                (siswa_id, ruangan_id, jurusan_id, tanggal, waktu_masuk, status, rfid_uid, validasi)
                VALUES (%s, %s, %s, CURDATE(), CURTIME(), 'hadir', %s, 'valid')
            """
            cursor.execute(insert_query, (
                siswa['id'], 
                ruangan_id, 
                siswa['jurusan_id'],
                data.get('nisn', '')
            ))
            
            self.db_connection.commit()
            cursor.close()
            
            logger.info(f"Presensi berhasil dicatat untuk: {siswa['nama_lengkap']}")
            
            return {
                'success': True,
                'message': 'Presensi berhasil dicatat',
                'siswa': siswa,
                'presensi_id': cursor.lastrowid
            }
            
        except Exception as e:
            logger.error(f"Error mencatat presensi: {e}")
            return {
                'success': False,
                'error': str(e),
                'siswa': siswa
            }
    
    def close(self):
        """Tutup koneksi database"""
        if self.db_connection:
            self.db_connection.close()
            logger.info("Koneksi database ditutup")


def main():
    """Fungsi utama untuk testing"""
    scanner = IDCardScanner()
    
    # Contoh penggunaan
    image_path = "test_id_card.jpg"  # Ganti dengan path gambar ID Card
    
    print("=" * 60)
    print("ID CARD SCANNER - SMK Rajasa Surabaya")
    print("=" * 60)
    
    result = scanner.scan_id_card(image_path)
    
    print("\nHASIL SCANNING:")
    print("-" * 60)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    scanner.close()


if __name__ == "__main__":
    main()
