ALTER TABLE `products` MODIFY COLUMN `status` enum('active','inactive','draft','sold_out') NOT NULL DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `products` ADD `shortDescription` varchar(420);--> statement-breakpoint
ALTER TABLE `products` ADD `costPrice` decimal(10,2);--> statement-breakpoint
ALTER TABLE `products` ADD `sku` varchar(120);--> statement-breakpoint
ALTER TABLE `products` ADD `seoTitle` varchar(220);--> statement-breakpoint
ALTER TABLE `store_assets` ADD `category` varchar(40) DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_sku_unique` UNIQUE(`sku`);