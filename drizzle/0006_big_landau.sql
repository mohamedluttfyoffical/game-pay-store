CREATE TABLE `homepage_configs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`configKey` varchar(80) NOT NULL,
	`payload` text NOT NULL,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `homepage_configs_id` PRIMARY KEY(`id`),
	CONSTRAINT `homepage_configs_key_unique` UNIQUE(`configKey`)
);
