/**
 * @author: jdrydn <james@jdrydn.com> (https://jdrydn.com)
 * @license: MIT License
 * @link: https://github.com/testbankhq/testbank
 */
CREATE TABLE IF NOT EXISTS `Account` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenantId` INT(11) UNSIGNED NOT NULL,
  `name` VARCHAR(250) NOT NULL,
  `externalId` VARCHAR(250) NULL,
  -- `loanId` INT(11) UNSIGNED NULL,
  `email` VARCHAR(250) NULL,
  `phone` VARCHAR(250) NULL,
  `currencyCode` CHAR(3) NOT NULL DEFAULT 'USD',
  `balanceTotal` DECIMAL(13, 2) NOT NULL DEFAULT 0.00,
  -- `balanceFractional` DECIMAL(21, 20) NULL,
  `visibility` ENUM('PRIVATE', 'UNLISTED', 'PUBLIC') NOT NULL DEFAULT 'PRIVATE',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY `tenantId` (`tenantId`) REFERENCES `Tenant` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY `tenantId-externalId` (`tenantId`, `externalId`),
  KEY `createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci AUTO_INCREMENT=100;
