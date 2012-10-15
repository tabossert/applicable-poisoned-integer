# ************************************************************
# Sequel Pro SQL dump
# Version 3408
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 127.0.0.1 (MySQL 5.1.61)
# Database: zunefit
# Generation Time: 2012-10-14 14:52:03 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table balance
# ------------------------------------------------------------

DROP TABLE IF EXISTS `balance`;

CREATE TABLE `balance` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `userid` int(40) NOT NULL,
  `amount` int(20) NOT NULL,
  `automatic` tinyint(1) NOT NULL DEFAULT '0',
  `refillamount` varchar(20) COLLATE utf8_bin NOT NULL,
  `schedule` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_userid` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table checkin
# ------------------------------------------------------------

DROP TABLE IF EXISTS `checkin`;

CREATE TABLE `checkin` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `userid` int(10) NOT NULL,
  `gymid` int(10) NOT NULL,
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_userid` (`userid`),
  KEY `id_gymid` (`gymid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table classes
# ------------------------------------------------------------

DROP TABLE IF EXISTS `classes`;

CREATE TABLE `classes` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `gymid` int(40) NOT NULL,
  `service` varchar(50) CHARACTER SET utf8 NOT NULL,
  `price` int(10) NOT NULL,
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table disbursement
# ------------------------------------------------------------

DROP TABLE IF EXISTS `disbursement`;

CREATE TABLE `disbursement` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `gymid` int(40) NOT NULL,
  `type` int(10) NOT NULL,
  `paylimit` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table gyms
# ------------------------------------------------------------

DROP TABLE IF EXISTS `gyms`;

CREATE TABLE `gyms` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) COLLATE utf8_bin NOT NULL,
  `address` varchar(50) CHARACTER SET utf8 DEFAULT '',
  `city` varchar(25) CHARACTER SET utf8 DEFAULT '',
  `state` varchar(2) CHARACTER SET utf8 DEFAULT '',
  `zipcode` varchar(5) COLLATE utf8_bin DEFAULT '',
  `phone` varchar(15) COLLATE utf8_bin DEFAULT '',
  `featured` tinyint(1) DEFAULT '0',
  `contact` varchar(30) COLLATE utf8_bin DEFAULT NULL,
  `complete` tinyint(1) DEFAULT '0',
  `email` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `rate` int(5) DEFAULT '0',
  `balance` int(10) DEFAULT '0',
  `enabled` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id_zipcode` (`zipcode`),
  KEY `id_city` (`city`),
  KEY `id_state` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table gymUsers
# ------------------------------------------------------------

DROP TABLE IF EXISTS `gymUsers`;

CREATE TABLE `gymUsers` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `gymid` int(40) NOT NULL,
  `token` varchar(100) COLLATE utf8_bin NOT NULL DEFAULT '',
  `username` varchar(15) COLLATE utf8_bin NOT NULL,
  `password` varbinary(50) NOT NULL,
  `first_name` varchar(25) CHARACTER SET utf8 NOT NULL,
  `last_name` varchar(25) CHARACTER SET utf8 NOT NULL,
  `groupid` int(5) NOT NULL,
  `lastLogin` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`),
  KEY `id_gymid` (`gymid`),
  KEY `id_group` (`groupid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table hours
# ------------------------------------------------------------

DROP TABLE IF EXISTS `hours`;

CREATE TABLE `hours` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `gymid` int(40) NOT NULL,
  `monday` varchar(25) COLLATE utf8_bin NOT NULL,
  `tuesday` varchar(25) COLLATE utf8_bin NOT NULL,
  `wednesday` varchar(25) COLLATE utf8_bin NOT NULL,
  `thursday` varchar(25) COLLATE utf8_bin NOT NULL,
  `friday` varchar(25) COLLATE utf8_bin NOT NULL,
  `saturday` varchar(25) COLLATE utf8_bin NOT NULL,
  `sunday` varchar(25) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table paymentmethod
# ------------------------------------------------------------

DROP TABLE IF EXISTS `paymentmethod`;

CREATE TABLE `paymentmethod` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `type` varchar(20) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table rewards
# ------------------------------------------------------------

DROP TABLE IF EXISTS `rewards`;

CREATE TABLE `rewards` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `userid` int(40) NOT NULL,
  `network` varchar(50) COLLATE utf8_bin NOT NULL DEFAULT '',
  `applied` tinyint(1) NOT NULL DEFAULT '0',
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_rewards` (`userid`,`network`),
  KEY `id_userid` (`userid`),
  KEY `id_applied` (`applied`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table schedule
# ------------------------------------------------------------

DROP TABLE IF EXISTS `schedule`;

CREATE TABLE `schedule` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `userid` int(40) NOT NULL,
  `gymid` int(40) NOT NULL,
  `classid` int(40) NOT NULL,
  `price` int(10) DEFAULT NULL,
  `redeemed` tinyint(1) NOT NULL DEFAULT '0',
  `paidout` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id_userid` (`userid`),
  KEY `id_gymid` (`gymid`),
  KEY `id_classid` (`classid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table stats
# ------------------------------------------------------------

DROP TABLE IF EXISTS `stats`;

CREATE TABLE `stats` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `gymid` int(40) NOT NULL,
  `userid` int(40) NOT NULL,
  `type` int(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`),
  KEY `id_userid` (`userid`),
  KEY `id_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table transactions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `transactions`;

CREATE TABLE `transactions` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `userid` int(40) NOT NULL,
  `refid` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_userid` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `email` varbinary(40) NOT NULL,
  `first_name` varchar(20) COLLATE utf8_bin DEFAULT NULL,
  `last_name` varchar(20) COLLATE utf8_bin DEFAULT NULL,
  `address` varbinary(50) DEFAULT NULL,
  `city` varchar(25) COLLATE utf8_bin DEFAULT NULL,
  `state` varchar(2) COLLATE utf8_bin DEFAULT NULL,
  `zipcode` varchar(5) COLLATE utf8_bin DEFAULT NULL,
  `paymentid` int(20) DEFAULT NULL,
  `balance` int(10) NOT NULL DEFAULT '0',
  `web_token` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `lastlogin` datetime DEFAULT NULL,
  `pincode` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `phone` varbinary(50) DEFAULT NULL,
  `mobile_token` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_webToken` (`web_token`),
  KEY `id_mobileToken` (`mobile_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
