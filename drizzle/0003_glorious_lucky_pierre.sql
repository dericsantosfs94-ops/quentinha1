CREATE TABLE `menu_product_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`priceDelta` decimal(10,2) NOT NULL DEFAULT '0.00',
	`available` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `menu_product_options_id` PRIMARY KEY(`id`)
);
