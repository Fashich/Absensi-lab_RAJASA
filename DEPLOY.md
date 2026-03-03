{
  "default": true,
  "MD013": { "line_length": 120 },
  "MD029": { "style": "ordered" },
  "MD033": { "allowed_elements": ["img", "video", "source"] },
  "MD040": false
}
# 🚀 DEPLOYMENT GUIDE

## Sistem Absensi Lab SMK Rajasa Surabaya

---

## 📋 Metode Deploy yang Tersedia

1. [Deploy Frontend ke Vercel](#deploy-frontend-ke-vercel)
2. [Deploy Backend ke Shared Hosting](#deploy-backend-ke-shared-hosting-cpanel)
3. [Deploy Backend ke VPS](#deploy-backend-ke-vps-ubuntu--apache)
4. [Deploy Full Stack](#deploy-full-stack-vercel--heroku)

---

## Deploy Frontend ke Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login ke Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# Masuk ke folder frontend
cd sistem-absensi-lab/frontend

# Deploy
vercel

# Ikuti instruksi:
? Set up and deploy "sistem-absensi-lab-smk-rajasa"? [Y/n] Y
? Which scope do you want to deploy to? [Your Account]
? Link to existing project? [y/N] n
? What's your project name? [sistem-absensi-lab-smk-rajasa]
```

### Step 4: Production Deploy

```bash
# Deploy ke production
vercel --prod
```

### Hasil Deploy

Setelah deploy berhasil, Anda akan mendapatkan URL seperti:

- **Development**: `https://sistem-absensi-lab-smk-rajasa-xyz123.vercel.app`
- **Production**: `https://sistem-absensi-lab-smk-rajasa.vercel.app`

---

## Deploy Backend ke Shared Hosting; cPanel

### Step 1: Persiapan File

```bash
# Compress folder backend menjadi zip
cd sistem-absensi-lab
zip -r backend.zip backend/ database/
```

### Step 2: Upload ke cPanel

1. Login ke cPanel hosting Anda
2. Buka **File Manager**
3. Navigate ke `public_html/` atau subdomain
4. Upload file `backend.zip`
5. Extract file zip

### Step 3: Setup Database

1. Buka **phpMyAdmin** di cPanel
2. Buat database baru
3. Import file `database/sistem_absensi_lab_v2.sql`

### Step 4: Konfigurasi Database

Edit `backend/config/database.php`:

```php
<?php
define('DB_HOST', 'localhost');  // atau IP server database
define('DB_NAME', 'nama_database_cpanel');
define('DB_USER', 'username_cpanel');
define('DB_PASS', 'password_cpanel');
// ...
?>
```

### Step 5: Konfigurasi CORS

Edit `backend/config/database.php`, update CORS untuk domain Vercel:

```php
// Ganti dengan domain Vercel Anda
header('Access-Control-Allow-Origin: https://sistem-absensi-lab-smk-rajasa.vercel.app');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
```

---

## Deploy Backend ke VPS (Ubuntu + Apache)

### Step 1: Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Apache, MySQL, PHP
sudo apt install apache2 mysql-server php php-mysql php-curl php-gd php-mbstring php-xml php-zip -y

# Enable Apache modules
sudo a2enmod rewrite headers ssl
sudo systemctl restart apache2
```

### Step 2: Setup Database

```bash
# Login ke MySQL
sudo mysql -u root -p

# Buat database dan user
CREATE DATABASE sistem_absensi_lab;
CREATE USER 'absensi_user'@'localhost' IDENTIFIED BY 'password_kuat';
GRANT ALL PRIVILEGES ON sistem_absensi_lab.* TO 'absensi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import database
mysql -u absensi_user -p sistem_absensi_lab < sistem_absensi_lab_v2.sql
```

### Step 3: Upload Project

```bash
# Upload via SCP atau FTP
scp -r backend/ user@your-server-ip:/var/www/html/sistem-absensi-lab/

# Atau clone dari GitHub
cd /var/www/html
```

cd /var/www/html
git clone <https://github.com/yourusername/sistem-absensi-lab.git>

### Step 4: Konfigurasi Apache

Buat file `/etc/apache2/sites-available/sistem-absensi-lab.conf`:

```apache
<VirtualHost *:80>
    ServerName absensi.smkrajasa.sch.id
    DocumentRoot /var/www/html/sistem-absensi-lab/backend

    <Directory /var/www/html/sistem-absensi-lab/backend>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/absensi-error.log
    CustomLog ${APACHE_LOG_DIR}/absensi-access.log combined
</VirtualHost>
```

Aktifkan site:

```bash
sudo a2ensite sistem-absensi-lab.conf
sudo systemctl reload apache2
```

### Step 5: Setup SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-apache -y

# Generate SSL certificate
sudo certbot --apache -d absensi.smkrajasa.sch.id

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Deploy Full Stack (Vercel + Heroku)

### Deploy Frontend ke Vercel (Vercel + Heroku Stack)

```bash
cd frontend
vercel --prod
```

### Deploy Backend ke Heroku

#### Step 1: Install Heroku CLI

```bash
# Windows: download dari [https://devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
# Mac: brew install heroku/brew/heroku
# Ubuntu: sudo snap install --classic heroku
```

#### Step 2: Setup Heroku

```bash
# Login
heroku login

# Buat project baru
heroku create sistem-absensi-lab-api

# Tambahkan MySQL addon
heroku addons:create jawsdb:kitefin
```

#### Step 3: Konfigurasi Backend untuk Heroku

Buat file `backend/composer.json`:

```json
{
  "require": {
    "php": ">=7.4"
  }
}
```

Buat file `backend/Procfile`:

```text
web: vendor/bin/heroku-php-apache2 .
```

#### Step 4: Deploy ke Heroku

```bash
cd backend
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

#### Step 5: Setup Database Heroku

```bash
# Dapatkan database URL
heroku config:get JAWSDB_URL

# Import database
mysql -u [username] -p[password] -h [host] [database] < database/sistem_absensi_lab_v2.sql
```

---

## 🔧 Konfigurasi Environment Variables

### Frontend (.env)

Buat file `frontend/.env`:

```bash
# Development
REACT_APP_API_URL=http://localhost/sistem-absensi-lab/backend

# Production (Vercel)
REACT_APP_API_URL=https://your-backend-domain.com/backend
```

### Backend (config)

Edit `backend/config/database.php`:

```php
<?php
// Deteksi environment
$is_production = ($_SERVER['HTTP_HOST'] !== 'localhost');

if ($is_production) {
    // Production config
    define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
    define('DB_NAME', getenv('DB_NAME') ?: 'sistem_absensi_lab');
    define('DB_USER', getenv('DB_USER') ?: 'root');
    define('DB_PASS', getenv('DB_PASS') ?: '');

    // CORS untuk production
    header('Access-Control-Allow-Origin: https://sistem-absensi-lab-smk-rajasa.vercel.app');
} else {
    // Development config
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'sistem_absensi_lab');
    define('DB_USER', 'root');
    define('DB_PASS', '');

    // CORS untuk development
    header('Access-Control-Allow-Origin: *');
}
?>
```

---

## 🌐 Domain Custom

### Setup Domain di Vercel

1. Buka dashboard Vercel
2. Pilih project Anda
3. Klik **Settings** → **Domains**
4. Tambahkan domain custom: `absensi.smkrajasa.sch.id`
5. Ikuti instruksi untuk konfigurasi DNS

### Konfigurasi DNS (cPanel/Cloudflare)

Tambahkan CNAME record:

```text
Type: CNAME
Name: absensi
Value: cname.vercel-dns.com
TTL: 3600
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics

```jsx
// Install Vercel Analytics
npm install @vercel/analytics

// Tambahkan ke App.js
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      {/* ... */}
      <Analytics />
    </>
  );
}
```

### Uptime Monitoring

Gunakan layanan gratis:

- **UptimeRobot**: [https://uptimerobot.com](https://uptimerobot.com)
- **Pingdom**: [https://www.pingdom.com](https://www.pingdom.com)

---

## 🔄 Continuous Deployment

### Setup GitHub Actions

Buat file `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'

      - name: Install dependencies
        run: cd frontend && npm install

      - name: Build
        run: cd frontend && npm run build

      - name: Deploy to Vercel
        uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📞 Support

Jika mengalami kesulitan saat deploy:

1. **Vercel Docs**: [https://vercel.com/docs](https://vercel.com/docs)
2. **Heroku Docs**: [https://devcenter.heroku.com](https://devcenter.heroku.com)
3. **Tim Magang TKJ SMK Rajasa Surabaya**

---

## Penutup

 © 2024 SMK Rajasa Surabaya - Tim Magang TKJ
