# 1. Usamos una imagen oficial de PHP con Apache
FROM php:8.1-apache

# 2. Instalamos las extensiones necesarias para que PHP se conecte a MySQL
RUN docker-php-ext-install mysqli pdo pdo_mysql

# 3. Habilitamos el modo de reescritura de Apache (útil para URLs bonitas)
RUN a2enmod rewrite

# 4. Copiamos todos tus archivos del proyecto a la carpeta del servidor
COPY . /var/www/html/

# 5. Damos permisos correctos a las carpetas
RUN chown -R www-data:www-data /var/www/html

# 6. Exponemos el puerto 80 para poder ver la página
EXPOSE 80