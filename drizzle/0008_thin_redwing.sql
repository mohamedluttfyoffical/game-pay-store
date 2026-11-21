CREATE TABLE `customer_wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`balance` decimal(10,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_wallets_customer_unique` UNIQUE(`customerId`)
);
--> statement-breakpoint
CREATE TABLE `wallet_topup_methods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` varchar(255),
	`instructions` text NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallet_topup_methods_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallet_topup_methods_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `wallet_topup_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`methodId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`reference` varchar(160),
	`customerNote` text,
	`status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
	`adminNote` text,
	`reviewedBy` int,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallet_topup_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallet_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`customerId` int NOT NULL,
	`topupRequestId` int,
	`orderId` int,
	`type` enum('topup','purchase','refund','adjustment') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`balanceAfter` decimal(10,2) NOT NULL,
	`description` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallet_transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallet_transactions_topup_request_unique` UNIQUE(`topupRequestId`),
	CONSTRAINT `wallet_transactions_order_unique` UNIQUE(`orderId`)
);
