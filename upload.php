<?php
// GÜVENLİK AYARLARI
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// MUTLAK YOL KULLANIMI
$base_dir = __DIR__; 
$target_folder = "uploads/";
$target_dir = $base_dir . "/" . $target_folder;

// Klasör yoksa oluştur
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0755, true);
}

// AYARLAR (15 MB Limit)
$maxFileSize = 15 * 1024 * 1024; 
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// LOG FONKSİYONU (Debug için)
function logMessage($message) {
    error_log("[UPLOAD] " . $message);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    
    // --- ESKİ DOSYAYI SİLME MANTIĞI (BASITLEŞTIRME + GÜÇLENDİRME) ---
    if (isset($_POST['oldImageUrl']) && !empty($_POST['oldImageUrl'])) {
        $oldUrl = trim($_POST['oldImageUrl']);
        
        logMessage("Gelen eski URL: " . $oldUrl);
        
        // Sadece dosya adını al (basename kullan)
        $oldFileName = basename(parse_url($oldUrl, PHP_URL_PATH));
        
        logMessage("Basename sonucu: " . $oldFileName);
        
        // Eğer dosya adında %20 gibi encoding varsa temizle
        $oldFileName = urldecode($oldFileName);
        
        logMessage("URL decode sonrası: " . $oldFileName);
        
        // Tam dosya yolu
        $oldFilePath = $target_dir . $oldFileName;
        
        logMessage("Silinecek tam yol: " . $oldFilePath);
        logMessage("Dosya var mı? " . (file_exists($oldFilePath) ? "EVET" : "HAYIR"));
        
        // GÜVENLİK KONTROLÜ: Sadece profile_ ile başlayan dosyaları sil
        if (file_exists($oldFilePath) && is_file($oldFilePath)) {
            
            // Dosya adı profile_ ile başlıyor mu?
            if (strpos($oldFileName, 'profile_') === 0) {
                
                // Dosyayı sil
                if (@unlink($oldFilePath)) {
                    logMessage("✓ BAŞARILI: Eski dosya silindi -> " . $oldFileName);
                } else {
                    logMessage("✗ BAŞARISIZ: unlink() çalışmadı");
                    // Detaylı hata nedeni
                    if (!is_writable($oldFilePath)) {
                        logMessage("Sebep: Dosya yazılabilir değil (chmod sorunu)");
                    }
                }
                
            } else {
                logMessage("⚠ Güvenlik: Dosya profile_ ile başlamıyor");
            }
            
        } else {
            logMessage("✗ Dosya bulunamadı veya dizin");
            
            // Debug: Dizindeki tüm dosyaları listele
            $files = scandir($target_dir);
            logMessage("Dizindeki dosyalar: " . implode(", ", $files));
        }
    } else {
        logMessage("oldImageUrl POST parametresi gelmedi veya boş");
    }
    // -------------------------------------------------------

    $file = $_FILES['file'];
    
    logMessage("Yeni dosya yükleniyor: " . $file['name']);
    
    // Dosya boyutu kontrolü
    if ($file['size'] > $maxFileSize) {
        logMessage("✗ Dosya çok büyük");
        echo json_encode(["success" => false, "message" => "Dosya boyutu çok büyük (Max 15MB)."]);
        exit();
    }

    // Gerçek resim mi kontrol et
    $check = getimagesize($file['tmp_name']);
    if ($check === false) {
        logMessage("✗ Geçersiz dosya");
        echo json_encode(["success" => false, "message" => "Dosya geçersiz."]);
        exit();
    }

    // MIME tipi kontrolü
    if (!in_array($check['mime'], $allowedTypes)) {
        logMessage("✗ Geçersiz MIME tipi: " . $check['mime']);
        echo json_encode(["success" => false, "message" => "Geçersiz format."]);
        exit();
    }

    // Uzantı belirle
    $fileExt = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (empty($fileExt)) $fileExt = 'jpg';

    // Yükleme işlemi
    if ($file['error'] === 0) {
        
        // Benzersiz dosya adı oluştur
        $newFileName = uniqid('profile_', true) . "." . $fileExt;
        $fileDestination = $target_dir . $newFileName;
        
        logMessage("Yeni dosya adı: " . $newFileName);
        
        if (move_uploaded_file($file['tmp_name'], $fileDestination)) {
            
            logMessage("✓ Yeni dosya başarıyla kaydedildi");
            
            // Protokol ve domain tespit et
            $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https" : "http";
            $domain = $_SERVER['HTTP_HOST'];
            
            $newUrl = "$protocol://$domain/$target_folder$newFileName";
            
            logMessage("Döndürülen URL: " . $newUrl);
            
            // Web URL'sini döndür
            echo json_encode([
                "success" => true,
                "url" => $newUrl
            ]);
            
        } else {
            logMessage("✗ move_uploaded_file() başarısız");
            echo json_encode(["success" => false, "message" => "Sunucu hatası: Dosya kaydedilemedi."]);
        }
        
    } else {
        logMessage("✗ Yükleme hatası kodu: " . $file['error']);
        echo json_encode(["success" => false, "message" => "Yükleme sırasında hata oluştu."]);
    }
    
} else {
    logMessage("✗ POST isteği yok veya dosya seçilmedi");
    echo json_encode(["success" => false, "message" => "Dosya seçilmedi."]);
}
?>