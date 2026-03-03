/*
 * =====================================================
 * ESP32-CAM RFID SCANNER
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * 
 * Hardware yang dibutuhkan:
 * - ESP32-CAM (dengan modul kamera OV2640)
 * - RFID Reader RC522
 * - Relay Module 5V (untuk solenoid)
 * - LED Hijau & Merah
 * - Buzzer (opsional)
 * - Solenoid Door Lock 12V
 * - Power Supply 12V 2A
 * 
 * Pin Connections:
 * RFID RC522:
 *   - SDA  -> GPIO 12
 *   - SCK  -> GPIO 14
 *   - MOSI -> GPIO 13
 *   - MISO -> GPIO 15
 *   - RST  -> GPIO 2
 * 
 * Relay:
 *   - IN   -> GPIO 4
 * 
 * LED:
 *   - LED Hijau -> GPIO 16
 *   - LED Merah -> GPIO 0
 * 
 * Buzzer:
 *   - + -> GPIO 3
 * =====================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include "esp_camera.h"
#include "soc/soc.h"
#include "soc/rtc_cntl_reg.h"

// =====================================================
// KONFIGURASI WIFI
// =====================================================
const char* ssid = "NAMA_WIFI_SEKOLAH";        // Ganti dengan nama WiFi
const char* password = "PASSWORD_WIFI";        // Ganti dengan password WiFi

// =====================================================
// KONFIGURASI SERVER
// =====================================================
const char* serverUrl = "http://192.168.1.100/sistem-absensi-lab/backend/api/presensi/scan_masuk.php";
const char* apiKey = "rajasa2024secure";
const int ruanganId = 1;  // ID ruangan ini (sesuaikan dengan database)

// =====================================================
// KONFIGURASI PIN RFID RC522
// =====================================================
#define RFID_SDA  12
#define RFID_RST  2
MFRC522 rfid(RFID_SDA, RFID_RST);

// =====================================================
// KONFIGURASI PIN OUTPUT
// =====================================================
#define RELAY_PIN     4   // Solenoid door lock
#define LED_GREEN     16  // LED hijau (akses diterima)
#define LED_RED       0   // LED merah (akses ditolak)
#define BUZZER_PIN    3   // Buzzer

// =====================================================
// KONFIGURASI KAMERA OV2640
// =====================================================
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// =====================================================
// KONFIGURASI WAKTU
// =====================================================
#define DOOR_OPEN_DURATION  5000    // Durasi pintu terbuka (ms)
#define DELAY_BEFORE_CAPTURE 2000   // Jeda sebelum ambil foto (2 detik)
#define DELAY_BETWEEN_PHOTOS 500    // Jeda antar foto (ms)

// =====================================================
// VARIABEL GLOBAL
// =====================================================
bool isProcessing = false;
unsigned long doorOpenTime = 0;
bool doorIsOpen = false;

// =====================================================
// SETUP
// =====================================================
void setup() {
  // Disable brownout detector
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  
  Serial.begin(115200);
  Serial.println("\n========================================");
  Serial.println("  ESP32-CAM RFID SCANNER");
  Serial.println("  SMK Rajasa Surabaya");
  Serial.println("========================================\n");
  
  // Inisialisasi pin output
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Set initial state
  digitalWrite(RELAY_PIN, LOW);      // Solenoid terkunci
  digitalWrite(LED_GREEN, LOW);      // LED hijau mati
  digitalWrite(LED_RED, LOW);        // LED merah mati
  digitalWrite(BUZZER_PIN, LOW);     // Buzzer mati
  
  // Inisialisasi SPI untuk RFID
  SPI.begin();
  rfid.PCD_Init();
  Serial.println("RFID Reader initialized");
  
  // Inisialisasi kamera
  if (!initCamera()) {
    Serial.println("Camera init failed! Restarting...");
    delay(3000);
    ESP.restart();
  }
  
  // Koneksi WiFi
  connectWiFi();
  
  // Indikator siap
  blinkLED(LED_GREEN, 3, 200);
  Serial.println("\n=== SISTEM SIAP ===");
  Serial.println("Tempelkan kartu RFID...\n");
}

// =====================================================
// LOOP UTAMA
// =====================================================
void loop() {
  // Cek status pintu (auto-close)
  if (doorIsOpen && (millis() - doorOpenTime >= DOOR_OPEN_DURATION)) {
    closeDoor();
  }
  
  // Jika sedang memproses, skip
  if (isProcessing) {
    return;
  }
  
  // Cek kartu RFID
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return;
  }
  
  // Proses scan
  isProcessing = true;
  processScan();
  isProcessing = false;
  
  // Hentikan komunikasi dengan kartu
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

// =====================================================
// PROSES SCAN RFID
// =====================================================
void processScan() {
  // Baca UID kartu RFID
  String rfidUid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) {
      rfidUid += "0";
    }
    rfidUid += String(rfid.uid.uidByte[i], HEX);
  }
  rfidUid.toUpperCase();
  
  Serial.println("\n========================================");
  Serial.println("RFID TERDETEKSI: " + rfidUid);
  Serial.println("========================================");
  
  // Aktifkan kamera
  Serial.println("Mengaktifkan kamera...");
  
  // JEDA 2 DETIK - Beri waktu siswa memposisikan diri
  Serial.println("Posisikan wajah di depan kamera...");
  for (int i = 2; i > 0; i--) {
    Serial.println(String(i) + "...");
    tone(BUZZER_PIN, 1000, 100);  // Beep pendek
    delay(1000);
  }
  Serial.println("Mengambil foto...");
  
  // Ambil 3 foto berturut-turut
  String foto1 = capturePhotoBase64();
  if (foto1 == "") {
    Serial.println("Gagal mengambil foto 1");
    indicateError();
    return;
  }
  Serial.println("Foto 1 berhasil diambil");
  tone(BUZZER_PIN, 1500, 50);
  
  delay(DELAY_BETWEEN_PHOTOS);  // Jeda antar foto
  
  String foto2 = capturePhotoBase64();
  if (foto2 == "") {
    Serial.println("Gagal mengambil foto 2");
    indicateError();
    return;
  }
  Serial.println("Foto 2 berhasil diambil");
  tone(BUZZER_PIN, 1500, 50);
  
  delay(DELAY_BETWEEN_PHOTOS);  // Jeda antar foto
  
  String foto3 = capturePhotoBase64();
  if (foto3 == "") {
    Serial.println("Gagal mengambil foto 3");
    indicateError();
    return;
  }
  Serial.println("Foto 3 berhasil diambil");
  tone(BUZZER_PIN, 1500, 50);
  
  Serial.println("\nMengirim data ke server...");
  
  // Kirim data ke server
  sendDataToServer(rfidUid, foto1, foto2, foto3);
}

// =====================================================
// KIRIM DATA KE SERVER
// =====================================================
void sendDataToServer(String rfidUid, String foto1, String foto2, String foto3) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi tidak terhubung!");
    indicateError();
    connectWiFi();
    return;
  }
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(30000);  // Timeout 30 detik
  
  // Buat JSON payload
  String payload = "{";
  payload += "\"api_key\":\"" + String(apiKey) + "\",";
  payload += "\"rfid_uid\":\"" + rfidUid + "\",";
  payload += "\"ruangan_id\":" + String(ruanganId) + ",";
  payload += "\"foto_1\":\"" + foto1 + "\",";
  payload += "\"foto_2\":\"" + foto2 + "\",";
  payload += "\"foto_3\":\"" + foto3 + "\"";
  payload += "}";
  
  Serial.println("Payload size: " + String(payload.length()) + " bytes");
  
  // Kirim POST request
  int httpResponseCode = http.POST(payload);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("\nResponse dari server:");
    Serial.println(response);
    
    // Parse response
    parseServerResponse(response);
  } else {
    Serial.println("Error: " + String(httpResponseCode));
    indicateError();
  }
  
  http.end();
}

// =====================================================
// PARSE RESPONSE DARI SERVER
// =====================================================
void parseServerResponse(String response) {
  // Cek apakah akses diterima
  if (response.indexOf("\"door_open\":true") > 0 || 
      response.indexOf("\"success\":true") > 0) {
    
    // AKSES DITERIMA - LED HIJAU + BUKA PINTU
    Serial.println("\n>>> AKSES DITERIMA <<<");
    indicateSuccess();
    openDoor();
    
  } else {
    
    // AKSES DITOLAK - LED MERAH
    Serial.println("\n>>> AKSES DITOLAK <<<");
    indicateRejected();
  }
}

// =====================================================
// INISIALISASI KAMERA
// =====================================================
bool initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  
  // Kompresi tinggi untuk menghemat bandwidth
  config.frame_size = FRAMESIZE_VGA;  // 640x480
  config.jpeg_quality = 15;            // 0-63, semakin kecil semakin bagus
  config.fb_count = 1;
  
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return false;
  }
  
  Serial.println("Camera initialized");
  return true;
}

// =====================================================
// AMBIL FOTO & KONVERSI KE BASE64
// =====================================================
String capturePhotoBase64() {
  camera_fb_t *fb = esp_camera_fb_get();
  if (!fb) {
    Serial.println("Camera capture failed");
    return "";
  }
  
  // Encode ke base64
  String base64Image = base64::encode(fb->buf, fb->len);
  
  esp_camera_fb_return(fb);
  
  return base64Image;
}

// =====================================================
// KONEKSI WIFI
// =====================================================
void connectWiFi() {
  Serial.println("\nMenghubungkan ke WiFi...");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.println("IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nWiFi Connection Failed!");
  }
}

// =====================================================
// KONTROL PINTU (SOLENOID)
// =====================================================
void openDoor() {
  Serial.println("Membuka pintu...");
  digitalWrite(RELAY_PIN, HIGH);   // Aktifkan relay (buka solenoid)
  doorIsOpen = true;
  doorOpenTime = millis();
}

void closeDoor() {
  Serial.println("Menutup pintu...");
  digitalWrite(RELAY_PIN, LOW);    // Matikan relay (kunci solenoid)
  doorIsOpen = false;
}

// =====================================================
// INDIKATOR STATUS
// =====================================================
void indicateSuccess() {
  // LED hijau menyala terus
  digitalWrite(LED_GREEN, HIGH);
  digitalWrite(LED_RED, LOW);
  
  // Bunyi buzzer sukses
  tone(BUZZER_PIN, 2000, 500);
  delay(200);
  tone(BUZZER_PIN, 2500, 500);
  
  delay(3000);  // Tahan LED hijau selama 3 detik
  digitalWrite(LED_GREEN, LOW);
}

void indicateRejected() {
  // LED merah berkedip
  digitalWrite(LED_GREEN, LOW);
  
  for (int i = 0; i < 5; i++) {
    digitalWrite(LED_RED, HIGH);
    tone(BUZZER_PIN, 500, 200);
    delay(300);
    digitalWrite(LED_RED, LOW);
    delay(300);
  }
}

void indicateError() {
  // LED merah menyala terus
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, HIGH);
  
  // Bunyi buzzer error
  for (int i = 0; i < 3; i++) {
    tone(BUZZER_PIN, 300, 500);
    delay(600);
  }
  
  digitalWrite(LED_RED, LOW);
}

void blinkLED(int pin, int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH);
    delay(delayMs);
    digitalWrite(pin, LOW);
    delay(delayMs);
  }
}

// =====================================================
// FUNGSI TONE UNTUK BUZZER
// =====================================================
void tone(int pin, int frequency, int duration) {
  ledcSetup(0, frequency, 8);
  ledcAttachPin(pin, 0);
  ledcWrite(0, 128);
  delay(duration);
  ledcWrite(0, 0);
  ledcDetachPin(pin);
}
