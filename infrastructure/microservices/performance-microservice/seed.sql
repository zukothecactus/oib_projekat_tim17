-- Seed data for performance microservice (database: izvestaji_performanse)
-- 3 previous simulations (each produces 2 reports: DistributionCenter + WarehouseCenter)

-- Simulation 1: 30 packages
INSERT INTO `performance_reports` (`id`, `algorithm_name`, `simulation_params`, `results`, `conclusion`, `created_at`) VALUES
(UUID(), 'DistributionCenter', '{"packageCount":30}',
 '{"algorithmName":"DistributionCenter","packageCount":30,"packagesPerTurn":3,"delayPerTurn":0.5,"totalTurns":10,"totalTime":5,"throughput":6}',
 'DistributionCenter je 93.33% brži za 30 ambalaža. Preporuka: koristiti DistributionCenter za veće količine.',
 '2026-01-20 10:00:00'),
(UUID(), 'WarehouseCenter', '{"packageCount":30}',
 '{"algorithmName":"WarehouseCenter","packageCount":30,"packagesPerTurn":1,"delayPerTurn":2.5,"totalTurns":30,"totalTime":75,"throughput":0.4}',
 'DistributionCenter je 93.33% brži za 30 ambalaža. Preporuka: koristiti DistributionCenter za veće količine.',
 '2026-01-20 10:00:00');

-- Simulation 2: 100 packages
INSERT INTO `performance_reports` (`id`, `algorithm_name`, `simulation_params`, `results`, `conclusion`, `created_at`) VALUES
(UUID(), 'DistributionCenter', '{"packageCount":100}',
 '{"algorithmName":"DistributionCenter","packageCount":100,"packagesPerTurn":3,"delayPerTurn":0.5,"totalTurns":34,"totalTime":17,"throughput":5.88}',
 'DistributionCenter je 93.2% brži za 100 ambalaža. Preporuka: koristiti DistributionCenter za veće količine.',
 '2026-01-25 14:30:00'),
(UUID(), 'WarehouseCenter', '{"packageCount":100}',
 '{"algorithmName":"WarehouseCenter","packageCount":100,"packagesPerTurn":1,"delayPerTurn":2.5,"totalTurns":100,"totalTime":250,"throughput":0.4}',
 'DistributionCenter je 93.2% brži za 100 ambalaža. Preporuka: koristiti DistributionCenter za veće količine.',
 '2026-01-25 14:30:00');

-- Simulation 3: 10 packages
INSERT INTO `performance_reports` (`id`, `algorithm_name`, `simulation_params`, `results`, `conclusion`, `created_at`) VALUES
(UUID(), 'DistributionCenter', '{"packageCount":10}',
 '{"algorithmName":"DistributionCenter","packageCount":10,"packagesPerTurn":3,"delayPerTurn":0.5,"totalTurns":4,"totalTime":2,"throughput":5}',
 'DistributionCenter je 92% brži za 10 ambalaža. Preporuka: koristiti DistributionCenter za veće količine.',
 '2026-02-01 09:15:00'),
(UUID(), 'WarehouseCenter', '{"packageCount":10}',
 '{"algorithmName":"WarehouseCenter","packageCount":10,"packagesPerTurn":1,"delayPerTurn":2.5,"totalTurns":10,"totalTime":25,"throughput":0.4}',
 'DistributionCenter je 92% brži za 10 ambalaža. Preporuka: koristiti DistributionCenter za veće količine.',
 '2026-02-01 09:15:00');
