-- SQL skripta za kreiranje svih baza podataka za projekat
-- Pokreni: mysql -u root -p < create_databases.sql

-- Kreiranje baze za Auth+User mikroservis
CREATE DATABASE IF NOT EXISTS `auth_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kreiranje baze za Production mikroservis
CREATE DATABASE IF NOT EXISTS `production_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kreiranje baze za Processing mikroservis
CREATE DATABASE IF NOT EXISTS `processing_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kreiranje baze za Audit mikroservis (evidencija dogadjaja)
CREATE DATABASE IF NOT EXISTS `audit_logovi` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kreiranje baze za Packaging mikroservis (pakovanje)
CREATE DATABASE IF NOT EXISTS `packaging_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kreiranje baze za Storage mikroservis (skladistenje)
CREATE DATABASE IF NOT EXISTS `storage_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kreiranje baze za Sales mikroservis (prodaja)
CREATE DATABASE IF NOT EXISTS `sales_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kreiranje baze za Analytics mikroservis (analiza podataka)
CREATE DATABASE IF NOT EXISTS `izvestaji_analize` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Kreiranje baze za Performance mikroservis (analiza performansi)
CREATE DATABASE IF NOT EXISTS `izvestaji_performanse` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Prikaz kreiranih baza
SHOW DATABASES;
