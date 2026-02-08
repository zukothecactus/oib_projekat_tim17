-- Schema for storage microservice

CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `max_capacity` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `stored_packages` (
  `id` varchar(36) NOT NULL,
  `package_id` varchar(255) NOT NULL,
  `warehouse_id` varchar(36) NOT NULL,
  `package_data` text NOT NULL,
  `is_dispatched` tinyint(1) NOT NULL DEFAULT 0,
  `received_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
