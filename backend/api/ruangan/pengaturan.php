<?php
/**
 * =====================================================
 * API PENGGATURAN RUANGAN (IoT DEVICES)
 * Sistem Absensi Lab SMK Rajasa Surabaya
 * =====================================================
 * Methods: GET, POST
 * Body (POST): { 
 *   ruangan_id, 
 *   solenoid_door_lock, 
 *   led_indicators, 
 *   relay_modules, 
 *   power_supply_status, 
 *   microsd_status 
 * }
 * Response: { success, message, data }
 * =====================================================
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../includes/functions.php';

// Middleware autentikasi
$user = Auth::middleware();

// Validasi role akses
if (!in_array($user['role'], ['admin_operator'])) {
    jsonResponse(false, 'Akses ditolak - Hanya admin operator yang dapat mengakses', null, 403);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Ambil pengaturan ruangan
    $ruanganId = $_GET['ruangan_id'] ?? null;
    
    try {
        $db = new Database();
        $conn = $db->getConnection();
        
        if ($ruanganId) {
            $query = "SELECT * FROM pengaturan_ruangan WHERE ruangan_id = :ruangan_id";
            $stmt = $conn->prepare($query);
            $stmt->bindParam(':ruangan_id', $ruanganId);
            $stmt->execute();
            $pengaturan = $stmt->fetch();
        } else {
            $query = "SELECT * FROM pengaturan_ruangan";
            $stmt = $conn->query($query);
            $pengaturan = $stmt->fetchAll();
        }
        
        if ($pengaturan) {
            jsonResponse(true, 'Pengaturan ruangan berhasil diambil', $pengaturan);
        } else {
            jsonResponse(false, 'Pengaturan ruangan tidak ditemukan', null, 404);
        }
    } catch(PDOException $e) {
        error_log("Get Pengaturan Ruangan Error: " . $e->getMessage());
        jsonResponse(false, 'Terjadi kesalahan saat mengambil pengaturan ruangan', null, 500);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Update pengaturan ruangan
    $input = getJsonInput();
    
    // Validasi input
    $requiredFields = ['ruangan_id'];
    $missing = validateRequired($input, $requiredFields);
    
    if (!empty($missing)) {
        jsonResponse(false, 'Field wajib tidak lengkap: ' . implode(', ', $missing), null, 400);
    }
    
    $ruanganId = (int)$input['ruangan_id'];
    $solenoidDoorLock = isset($input['solenoid_door_lock']) ? (bool)$input['solenoid_door_lock'] : null;
    $ledIndicators = isset($input['led_indicators']) ? json_encode($input['led_indicators']) : null;
    $relayModules = isset($input['relay_modules']) ? json_encode($input['relay_modules']) : null;
    $powerSupplyStatus = $input['power_supply_status'] ?? null;
    $microsdStatus = $input['microsd_status'] ?? null;
    
    try {
        $db = new Database();
        $conn = $db->getConnection();
        
        // Cek apakah ruangan ada
        $checkQuery = "SELECT id FROM ruangan WHERE id = :ruangan_id";
        $checkStmt = $conn->prepare($checkQuery);
        $checkStmt->bindParam(':ruangan_id', $ruanganId);
        $checkStmt->execute();
        
        if (!$checkStmt->fetch()) {
            jsonResponse(false, 'Ruangan tidak ditemukan', null, 404);
        }
        
        // Cek apakah sudah ada pengaturan untuk ruangan ini
        $checkPengaturanQuery = "SELECT id FROM pengaturan_ruangan WHERE ruangan_id = :ruangan_id";
        $checkPengaturanStmt = $conn->prepare($checkPengaturanQuery);
        $checkPengaturanStmt->bindParam(':ruangan_id', $ruanganId);
        $checkPengaturanStmt->execute();
        
        if ($checkPengaturanStmt->fetch()) {
            // Update pengaturan
            $query = "UPDATE pengaturan_ruangan SET ";
            $params = [];
            $setParts = [];
            
            if ($solenoidDoorLock !== null) {
                $setParts[] = "solenoid_door_lock = :solenoid_door_lock";
                $params[':solenoid_door_lock'] = $solenoidDoorLock;
            }
            
            if ($ledIndicators !== null) {
                $setParts[] = "led_indicators = :led_indicators";
                $params[':led_indicators'] = $ledIndicators;
            }
            
            if ($relayModules !== null) {
                $setParts[] = "relay_modules = :relay_modules";
                $params[':relay_modules'] = $relayModules;
            }
            
            if ($powerSupplyStatus !== null) {
                $setParts[] = "power_supply_status = :power_supply_status";
                $params[':power_supply_status'] = $powerSupplyStatus;
            }
            
            if ($microsdStatus !== null) {
                $setParts[] = "microsd_status = :microsd_status";
                $params[':microsd_status'] = $microsdStatus;
            }
            
            $setParts[] = "updated_at = NOW()";
            
            $query .= implode(", ", $setParts);
            $query .= " WHERE ruangan_id = :ruangan_id";
            $params[':ruangan_id'] = $ruanganId;
            
            $stmt = $conn->prepare($query);
            $result = $stmt->execute($params);
        } else {
            // Insert pengaturan baru
            $query = "INSERT INTO pengaturan_ruangan (
                        ruangan_id, 
                        solenoid_door_lock, 
                        led_indicators, 
                        relay_modules, 
                        power_supply_status, 
                        microsd_status
                      ) VALUES (
                        :ruangan_id,
                        :solenoid_door_lock,
                        :led_indicators,
                        :relay_modules,
                        :power_supply_status,
                        :microsd_status
                      )";
            
            $stmt = $conn->prepare($query);
            $result = $stmt->execute([
                ':ruangan_id' => $ruanganId,
                ':solenoid_door_lock' => $solenoidDoorLock,
                ':led_indicators' => $ledIndicators,
                ':relay_modules' => $relayModules,
                ':power_supply_status' => $powerSupplyStatus,
                ':microsd_status' => $microsdStatus
            ]);
        }
        
        if ($result) {
            jsonResponse(true, 'Pengaturan ruangan berhasil diperbarui', [
                'ruangan_id' => $ruanganId,
                'solenoid_door_lock' => $solenoidDoorLock,
                'led_indicators' => $ledIndicators ? json_decode($ledIndicators, true) : null,
                'relay_modules' => $relayModules ? json_decode($relayModules, true) : null,
                'power_supply_status' => $powerSupplyStatus,
                'microsd_status' => $microsdStatus
            ]);
        } else {
            jsonResponse(false, 'Gagal memperbarui pengaturan ruangan', null, 500);
        }
    } catch(PDOException $e) {
        error_log("Update Pengaturan Ruangan Error: " . $e->getMessage());
        jsonResponse(false, 'Terjadi kesalahan saat memperbarui pengaturan ruangan', null, 500);
    }
    
} else {
    jsonResponse(false, 'Method tidak diizinkan', null, 405);
}
?>