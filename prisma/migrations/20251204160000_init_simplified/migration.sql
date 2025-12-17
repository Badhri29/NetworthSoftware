-- Drop existing tables if they exist
DROP TABLE IF EXISTS `Transaction`;
DROP TABLE IF EXISTS `_prisma_migrations`;

-- Create the transactions table with simplified schema
CREATE TABLE `Transaction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `date` datetime(3) NOT NULL,
  `type` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `subcategory` varchar(191),
  `description` varchar(191),
  `amount` decimal(10,2) NOT NULL,
  `paymentMode` varchar(191) NOT NULL,
  `card` varchar(191),
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
