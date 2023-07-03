/**
 * @author: jdrydn <james@jdrydn.com> (https://jdrydn.com)
 * @license: MIT License
 * @link: https://github.com/testbankhq/testbank
 */
CREATE TABLE IF NOT EXISTS `TenantToken` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tenantId` INT(11) UNSIGNED NOT NULL,
  `token` CHAR(32) NOT NULL,
  `description` VARCHAR(250) NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSeenAt` TIMESTAMP NULL,
  `expiresAt` TIMESTAMP NULL,
  `deletedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY `tenantId` (`tenantId`) REFERENCES `Tenant` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT,
  UNIQUE KEY `token` (`token`),
  KEY `createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
