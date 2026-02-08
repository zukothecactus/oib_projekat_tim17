-- Seed data for analytics microservice (database: izvestaji_analize)

-- Recorded sales (mirrors of invoices from sales-microservice)
INSERT INTO `recorded_sales` (`id`, `invoice_id`, `sale_type`, `payment_method`, `items`, `total_amount`, `sale_date`, `created_at`) VALUES
(UUID(), 'inv-00000001-0000-0000-0000-000000000001', 'MALOPRODAJA', 'KARTICNO',
 '[{"perfumeId":"p-001","perfumeName":"Rosa Mistika","quantity":2,"unitPrice":13200},{"perfumeId":"p-002","perfumeName":"Lavander Noir","quantity":1,"unitPrice":8900}]',
 35300.00, '2026-01-15 10:30:00', NOW()),
(UUID(), 'inv-00000002-0000-0000-0000-000000000002', 'VELEPRODAJA', 'UPLATA_NA_RACUN',
 '[{"perfumeId":"p-003","perfumeName":"Bergamot Esenc","quantity":10,"unitPrice":13200},{"perfumeId":"p-004","perfumeName":"Jasmin De Nuj","quantity":8,"unitPrice":9500}]',
 208000.00, '2026-01-20 14:00:00', NOW()),
(UUID(), 'inv-00000003-0000-0000-0000-000000000003', 'MALOPRODAJA', 'GOTOVINA',
 '[{"perfumeId":"p-002","perfumeName":"Lavander Noir","quantity":3,"unitPrice":8900}]',
 26700.00, '2026-01-25 09:15:00', NOW()),
(UUID(), 'inv-00000004-0000-0000-0000-000000000004', 'VELEPRODAJA', 'KARTICNO',
 '[{"perfumeId":"p-001","perfumeName":"Rosa Mistika","quantity":5,"unitPrice":13200},{"perfumeId":"p-003","perfumeName":"Bergamot Esenc","quantity":5,"unitPrice":13200}]',
 132000.00, '2026-02-03 11:00:00', NOW()),
(UUID(), 'inv-00000005-0000-0000-0000-000000000005', 'MALOPRODAJA', 'UPLATA_NA_RACUN',
 '[{"perfumeId":"p-004","perfumeName":"Jasmin De Nuj","quantity":2,"unitPrice":9500},{"perfumeId":"p-002","perfumeName":"Lavander Noir","quantity":1,"unitPrice":8900}]',
 27900.00, '2026-02-05 16:45:00', NOW());

-- Seed analytics reports (3 reports)
INSERT INTO `analytics_reports` (`id`, `report_type`, `data`, `created_at`) VALUES
(UUID(), 'MONTHLY',
 '{"title":"Mesecni izvestaj prodaje","generatedAt":"2026-02-01T08:00:00.000Z","sections":[{"heading":"Prodaja po mesecima","table":{"headers":["Period","Broj faktura","Ukupno prodato","Prihod (RSD)"],"rows":[["2026-01","3","24","270.000"],["2026-02","2","13","159.900"]]},"chart":{"type":"bar","labels":["2026-01","2026-02"],"data":[270000,159900]}}]}',
 NOW()),
(UUID(), 'TREND',
 '{"title":"Trend prodaje","generatedAt":"2026-02-01T08:00:00.000Z","sections":[{"heading":"Mesecni trend prihoda","table":{"headers":["Mesec","Prihod (RSD)","Promena (%)"],"rows":[["2026-01","270.000","—"],["2026-02","159.900","-40.78%"]]},"chart":{"type":"line","labels":["2026-01","2026-02"],"data":[270000,159900]}}]}',
 NOW()),
(UUID(), 'TOP10',
 '{"title":"Top 10 parfema","generatedAt":"2026-02-01T08:00:00.000Z","sections":[{"heading":"Top 10 po kolicini","table":{"headers":["Parfem","Prodato komada"],"rows":[["Bergamot Esenc","15"],["Rosa Mistika","7"],["Lavander Noir","5"],["Jasmin De Nuj","10"]]},"chart":{"type":"bar","labels":["Bergamot Esenc","Rosa Mistika","Lavander Noir","Jasmin De Nuj"],"data":[15,7,5,10]}},{"heading":"Top 10 po prihodu","table":{"headers":["Parfem","Prihod (RSD)"],"rows":[["Bergamot Esenc","198.000"],["Rosa Mistika","92.400"],["Jasmin De Nuj","95.000"],["Lavander Noir","44.500"]]},"chart":{"type":"bar","labels":["Bergamot Esenc","Rosa Mistika","Jasmin De Nuj","Lavander Noir"],"data":[198000,92400,95000,44500]}}]}',
 NOW());
