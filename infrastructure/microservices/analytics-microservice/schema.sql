-- Schema for analytics microservice (database: izvestaji_analize)

CREATE TABLE IF NOT EXISTS `recorded_sales` (
  `id` varchar(36) NOT NULL,
  `invoice_id` varchar(255) NOT NULL,
  `sale_type` varchar(50) NOT NULL,
  `payment_method` varchar(50) NOT NULL,
  `items` text NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `sale_date` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `analytics_reports` (
  `id` varchar(36) NOT NULL,
  `report_type` enum('MONTHLY','WEEKLY','YEARLY','TOTAL','TREND','TOP10') NOT NULL,
  `data` longtext NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
