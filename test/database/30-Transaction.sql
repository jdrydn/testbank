/**
 * @author: jdrydn <james@jdrydn.com> (https://jdrydn.com)
 * @license: MIT License
 * @link: https://github.com/testbankhq/testbank
 */
CREATE TABLE IF NOT EXISTS `Transaction` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,

  `fromTenantId` INT(11) UNSIGNED NOT NULL,
  `fromAccountId` INT(11) UNSIGNED NOT NULL,
  `fromCurrency` CHAR(3) NOT NULL,
  `fromAmount` DECIMAL(13, 2) UNSIGNED NOT NULL,
  `fromCryptoFractional` DECIMAL(21, 20) UNSIGNED NULL,

  `toTenantId` INT(11) UNSIGNED NOT NULL,
  `toAccountId` INT(11) UNSIGNED NOT NULL,
  `toCurrency` CHAR(3) NOT NULL,
  `toAmount` DECIMAL(13, 2) UNSIGNED NOT NULL,
  `toCryptoFractional` DECIMAL(21, 20) UNSIGNED NULL,

  `code` VARCHAR(50) NULL,
  `reference` VARCHAR(100) NULL,
  `exchangeRate` DECIMAL(15, 10) NULL,

  `createdAt` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY `fromTenantId` (`fromTenantId`) REFERENCES `Tenant` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY `fromAccountId` (`fromAccountId`) REFERENCES `Account` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY `toTenantId` (`toTenantId`) REFERENCES `Tenant` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY `toAccountId` (`toAccountId`) REFERENCES `Account` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  KEY `code` (`code`),
  KEY `createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
