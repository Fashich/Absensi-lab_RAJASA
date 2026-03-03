<?php
echo "<h3>Menguji API Login</h3>";
echo "<p>Coba login dengan akun demo:</p>";
echo "<ul>";
echo "<li>Username: admin, Password: admin123</li>";
echo "<li>Username: admintkj, Password: admin123</li>";
echo "</ul>";

echo "<p>Buka URL berikut di browser untuk menguji:</p>";
echo "<ul>";
echo "<li><a href='/project_magang/backend/api/auth/login.php' target='_blank'>http://localhost/project_magang/backend/api/auth/login.php</a> (gunakan metode POST)</li>";
echo "</ul>";

echo "<p>Atau gunakan curl di command line:</p>";
echo "<pre>curl -X POST http://localhost/project_magang/backend/api/auth/login.php \\" .
     "\n  -H \"Content-Type: application/json\" \\" .
     "\n  -d '{\"username\":\"admin\", \"password\":\"admin123\"}'</pre>";

echo "<p>Jika login berhasil, Anda akan mendapatkan respons seperti:</p>";
echo "<pre>{
  \"success\": true,
  \"message\": \"Login berhasil\",
  \"data\": {
    \"user\": { ... },
    \"token\": \"...\" 
  }
}</pre>";
?>