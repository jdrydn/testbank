/**
 * @author: jdrydn <james@jdrydn.com> (https://jdrydn.com)
 * @license: MIT License
 * @link: https://github.com/testbankhq/testbank
 */
CREATE TABLE IF NOT EXISTS `Tenants` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(250) NOT NULL,
  `email` VARCHAR(250) NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
