-- Seed data for storage microservice
-- 3 warehouses + 7 stored packages

-- Warehouses
INSERT INTO `warehouses` (`id`, `name`, `location`, `max_capacity`, `created_at`) VALUES
('wh-00000001-0000-0000-0000-000000000001', 'Centralno skladište', 'Pariz', 50, NOW()),
('wh-00000002-0000-0000-0000-000000000002', 'Skladište Sever', 'Lion', 30, NOW()),
('wh-00000003-0000-0000-0000-000000000003', 'Skladište Jug', 'Marsej', 40, NOW());

-- Stored packages (7 packages distributed across warehouses)
INSERT INTO `stored_packages` (`id`, `package_id`, `warehouse_id`, `package_data`, `is_dispatched`, `received_at`) VALUES
('sp-00000001-0000-0000-0000-000000000001', 'PKG-001', 'wh-00000001-0000-0000-0000-000000000001', '{"name":"Rosa Mistika","volume":250,"count":12}', 0, NOW()),
('sp-00000002-0000-0000-0000-000000000002', 'PKG-002', 'wh-00000001-0000-0000-0000-000000000001', '{"name":"Lavander Noir","volume":150,"count":18}', 0, NOW()),
('sp-00000003-0000-0000-0000-000000000003', 'PKG-003', 'wh-00000001-0000-0000-0000-000000000001', '{"name":"Bergamot Esenc","volume":250,"count":10}', 1, NOW()),
('sp-00000004-0000-0000-0000-000000000004', 'PKG-004', 'wh-00000002-0000-0000-0000-000000000002', '{"name":"Jasmin De Nuj","volume":150,"count":16}', 0, NOW()),
('sp-00000005-0000-0000-0000-000000000005', 'PKG-005', 'wh-00000002-0000-0000-0000-000000000002', '{"name":"Rosa Mistika","volume":250,"count":8}', 0, NOW()),
('sp-00000006-0000-0000-0000-000000000006', 'PKG-006', 'wh-00000003-0000-0000-0000-000000000003', '{"name":"Lavander Noir","volume":150,"count":20}', 1, NOW()),
('sp-00000007-0000-0000-0000-000000000007', 'PKG-007', 'wh-00000003-0000-0000-0000-000000000003', '{"name":"Bergamot Esenc","volume":250,"count":14}', 0, NOW());
