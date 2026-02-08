-- Schema for sales microservice

CREATE TABLE IF NOT EXISTS `invoices` (
  `id` varchar(36) NOT NULL,
  `sale_type` enum('MALOPRODAJA','VELEPRODAJA') NOT NULL,
  `payment_method` enum('GOTOVINA','UPLATA_NA_RACUN','KARTICNO') NOT NULL,
  `items` text NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
