CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(48) NOT NULL,
	`discountType` enum('percent','fixed') NOT NULL DEFAULT 'percent',
	`value` decimal(10,2) NOT NULL,
	`startsAt` timestamp,
	`endsAt` timestamp,
	`maxUses` int,
	`useCount` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `game_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`level` varchar(80) NOT NULL,
	`highlights` text NOT NULL,
	`accountStatus` enum('available','sold') NOT NULL DEFAULT 'available',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `game_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `game_accounts_product_unique` UNIQUE(`productId`)
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(140) NOT NULL,
	`accent` varchar(32) NOT NULL DEFAULT 'cyan',
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `games_id` PRIMARY KEY(`id`),
	CONSTRAINT `games_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(48) NOT NULL,
	`title` varchar(180) NOT NULL,
	`message` text NOT NULL,
	`orderId` int,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(220) NOT NULL,
	`gameSlug` varchar(80) NOT NULL,
	`productType` enum('topup','digital','account') NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`deliverySnapshot` text,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` varchar(255),
	`enabled` boolean NOT NULL DEFAULT true,
	`isTest` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_methods_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(140) NOT NULL,
	`name` varchar(220) NOT NULL,
	`gameSlug` varchar(80) NOT NULL,
	`type` enum('topup','digital','account') NOT NULL,
	`description` text NOT NULL,
	`details` text NOT NULL,
	`useInstructions` text NOT NULL,
	`deliveryEta` varchar(120) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`compareAtPrice` decimal(10,2),
	`discountPercent` int NOT NULL DEFAULT 0,
	`stock` int NOT NULL DEFAULT 0,
	`status` enum('active','draft','sold_out') NOT NULL DEFAULT 'draft',
	`imageUrl` text,
	`imageKey` text,
	`sensitiveDelivery` text,
	`featured` boolean NOT NULL DEFAULT false,
	`popular` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `store_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(48) NOT NULL,
	`userId` int,
	`customerName` varchar(160) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`customerPhone` varchar(48) NOT NULL,
	`accountData` text,
	`paymentMethod` varchar(80) NOT NULL,
	`paymentStatus` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`fulfillmentStatus` enum('pending','processing','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`subtotal` decimal(10,2) NOT NULL,
	`discount` decimal(10,2) NOT NULL DEFAULT '0',
	`total` decimal(10,2) NOT NULL,
	`couponCode` varchar(48),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `store_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `store_orders_reference_unique` UNIQUE(`reference`)
);
