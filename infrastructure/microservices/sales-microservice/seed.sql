-- Seed data for sales microservice
-- 5 invoices with various sale types and payment methods

INSERT INTO `invoices` (`id`, `sale_type`, `payment_method`, `items`, `total_amount`, `created_at`) VALUES
('inv-00000001-0000-0000-0000-000000000001', 'MALOPRODAJA', 'KARTICNO',
 '[{"perfumeId":"p-001","perfumeName":"Rosa Mistika","quantity":2,"unitPrice":13200},{"perfumeId":"p-002","perfumeName":"Lavander Noir","quantity":1,"unitPrice":8900}]',
 35300.00, NOW()),
('inv-00000002-0000-0000-0000-000000000002', 'VELEPRODAJA', 'UPLATA_NA_RACUN',
 '[{"perfumeId":"p-003","perfumeName":"Bergamot Esenc","quantity":10,"unitPrice":13200},{"perfumeId":"p-004","perfumeName":"Jasmin De Nuj","quantity":8,"unitPrice":9500}]',
 208000.00, NOW()),
('inv-00000003-0000-0000-0000-000000000003', 'MALOPRODAJA', 'GOTOVINA',
 '[{"perfumeId":"p-002","perfumeName":"Lavander Noir","quantity":3,"unitPrice":8900}]',
 26700.00, NOW()),
('inv-00000004-0000-0000-0000-000000000004', 'VELEPRODAJA', 'KARTICNO',
 '[{"perfumeId":"p-001","perfumeName":"Rosa Mistika","quantity":5,"unitPrice":13200},{"perfumeId":"p-003","perfumeName":"Bergamot Esenc","quantity":5,"unitPrice":13200}]',
 132000.00, NOW()),
('inv-00000005-0000-0000-0000-000000000005', 'MALOPRODAJA', 'UPLATA_NA_RACUN',
 '[{"perfumeId":"p-004","perfumeName":"Jasmin De Nuj","quantity":2,"unitPrice":9500},{"perfumeId":"p-002","perfumeName":"Lavander Noir","quantity":1,"unitPrice":8900}]',
 27900.00, NOW());
