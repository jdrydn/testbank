INSERT INTO `Tenant` (`id`, `name`, `email`, `createdAt`, `updatedAt`) VALUES
  (1, 'ROOT', 'root@testbank.dev', '2023-06-24 09:00:00', '2023-06-24 09:00:00'),
  (5, 'LENDER', 'lender@testbank.dev', '2023-06-24 09:00:00', '2023-06-24 09:00:00'),
  (10, 'jdrydn', 'james@jdrydn.com', '2023-06-24 10:00:00', '2023-06-24 10:00:00'),
  (11, 'Starship Enterprises', 'kirk@starshipenterprise.io', '2023-07-26 10:00:00', '2023-07-26 10:00:00');

INSERT INTO `TenantToken` (`id`, `tenantId`, `token`, `createdAt`, `updatedAt`) VALUES
  (1, 10, '90a01a8334215f2e6cce541a33631c75', '2023-06-24 10:00:00', '2023-06-24 10:00:00');

INSERT INTO `Account` (`id`, `tenantId`, `externalId`, `name`, `currencyCode`, `balanceTotal`, `createdAt`, `updatedAt`) VALUES
  (1, 10, 'first-ever-testbank-account', 'jdrydn test account', 'USD', 100.00, '2023-06-24 10:01:00', '2023-06-24 10:59:00'),
  (2, 10, NULL, 'another test account', 'USD', 999.99, '2023-06-24 10:02:00', '2023-06-24 10:58:00'),
  (3, 11, NULL, 'Starship Enterprises Account', 'USD', 0.00, '2023-06-24 10:03:00', '2023-06-24 10:57:00');
