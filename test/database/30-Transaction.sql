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
  `toTenantId` INT(11) UNSIGNED NOT NULL,
  `toAccountId` INT(11) UNSIGNED NOT NULL,
  `toCurrency` CHAR(3) NOT NULL,
  `toAmount` DECIMAL(13, 2) UNSIGNED NOT NULL,
  `code` VARCHAR(50) NULL,
  `reference` VARCHAR(100) NULL,
  `timestamp` TIMESTAMP NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY `fromTenantId` (`fromTenantId`) REFERENCES `Tenant` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY `fromAccountId` (`fromAccountId`) REFERENCES `Account` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY `toTenantId` (`toTenantId`) REFERENCES `Tenant` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY `toAccountId` (`toAccountId`) REFERENCES `Account` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  KEY `code` (`code`),
  KEY `timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
