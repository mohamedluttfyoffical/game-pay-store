CREATE TABLE `store_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slot` varchar(80) NOT NULL,
	`title` varchar(160) NOT NULL,
	`imageUrl` text NOT NULL,
	`imageKey` text NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `store_assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `store_assets_slot_unique` UNIQUE(`slot`)
);
