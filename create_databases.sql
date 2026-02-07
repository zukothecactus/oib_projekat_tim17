-- SQL skripta za kreiranje svih baza podataka za projekat
-- Pokreni: mysql -u root -p < create_databases.sql

-- Kreiranje baze za Auth+User mikroservis
CREATE DATABASE IF NOT EXISTS `auth_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kreiranje baze za Production mikroservis
CREATE DATABASE IF NOT EXISTS `production_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kreiranje baze za Processing mikroservis
CREATE DATABASE IF NOT EXISTS `processing_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Prikaz kreiranih baza
SHOW DATABASES LIKE '%_db';
