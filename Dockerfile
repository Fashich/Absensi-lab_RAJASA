FROM php:8.1-apache

# Aktifkan modul mod_rewrite
RUN a2enmod rewrite

# Install extension PHP yang dibutuhkan
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Copy semua file backend ke dalam container
COPY ./backend/ /var/www/html/

# Set permission untuk folder uploads
RUN mkdir -p /var/www/html/uploads
RUN chmod -R 755 /var/www/html/uploads

# Set permission untuk file konfigurasi
RUN chmod 644 /var/www/html/config/database.php

EXPOSE 80

CMD ["apache2-foreground"]