-- Database
CREATE DATABASE IF NOT EXISTS `seekpartner` CHARACTER SET utf8 COLLATE utf8_unicode_ci;

USE `seekpartner`;

-- User table
CREATE TABLE IF NOT EXISTS `user` (
	`user_id` INT NOT NULL AUTO_INCREMENT,
	`sex` CHAR(1) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
	`pseudo` VARCHAR(15) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
	`profile_image` VARCHAR(255) DEFAULT 'https://i.imgur.com/1VHlKCX.jpg', -- Profile image path
	`user_description` TINYTEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci,
	`date_of_birth` DATE NOT NULL,
    `password` CHAR(60) NOT NULL, -- Password hash
	`registration_date` DATETIME NOT NULL,
	PRIMARY KEY (`user_id`)
);

-- Game table
CREATE TABLE IF NOT EXISTS `game` (
	`game_id` INT NOT NULL AUTO_INCREMENT,
    `game_title` TINYTEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
	`game_description` TINYTEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci,
	PRIMARY KEY (`game_id`)
);

-- User's favorite games table
CREATE TABLE IF NOT EXISTS `user_favorite_game` (
	`user_id` INT NOT NULL,
	`game_id` INT NOT NULL,
	PRIMARY KEY (`user_id`,`game_id`),
	FOREIGN KEY (`user_id`) REFERENCES user(user_id),
	FOREIGN KEY (`game_id`) REFERENCES game(game_id)
);

-- User's likes table
CREATE TABLE IF NOT EXISTS `user_like` (
	`user_liking` INT NOT NULL,
	`user_liked` INT NOT NULL,
	PRIMARY KEY (`user_liking`,`user_liked`),
	FOREIGN KEY (`user_liking`) REFERENCES user(user_id),
	FOREIGN KEY (`user_liked`) REFERENCES user(user_id)
);
