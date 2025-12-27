-- Seed podaci za tabelu plants
-- MoÅ¾ete izvrÅ¡iti ovaj fajl u MySQL-u (mysql -u user -p DB_NAME < seed.sql)

INSERT INTO `plants` (`id`, `common_name`, `aromatic_strength`, `latin_name`, `origin_country`, `status`, `created_at`) VALUES
('7b9f1d2a-1c6e-4f9f-8b2a-111111111111','Lavanda',3.50,'Lavandula angustifolia','France','POSADJENA',NOW()),
('8c0a2d3b-2d7f-5a0f-9c3b-222222222222','Ruza',4.20,'Rosa damascena','Bulgaria','POSADJENA',NOW()),
('9d1b3e4c-3e8a-6b1f-0d4c-333333333333','Jasmin',4.65,'Jasminum sambac','India','POSADJENA',NOW()),
('ae2c4f5d-4f9b-7c2f-1e5d-444444444444','Vetiver',3.10,'Chrysopogon zizanioides','Haiti','POSADJENA',NOW());

