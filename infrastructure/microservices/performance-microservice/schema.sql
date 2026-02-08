-- Schema for performance microservice (database: izvestaji_performanse)

CREATE TABLE IF NOT EXISTS `performance_reports` (
  `id` varchar(36) NOT NULL,
  `algorithm_name` varchar(255) NOT NULL,
  `simulation_params` text NOT NULL,
  `results` longtext NOT NULL,
  `conclusion` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
