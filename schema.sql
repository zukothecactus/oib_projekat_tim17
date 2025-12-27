-- SQL schema for production microservice (plants table)

CREATE TABLE `plants` (
  `id` varchar(36) NOT NULL,
  `common_name` varchar(255) NOT NULL,
  `aromatic_strength` decimal(3,2) NOT NULL,
  `latin_name` varchar(255) NOT NULL,
  `origin_country` varchar(255) NOT NULL,
  `status` enum('POSADJENA','UBRANA','PRERADJENA') NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

