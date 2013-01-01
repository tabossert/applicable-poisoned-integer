# ************************************************************
# Sequel Pro SQL dump
# Version 3408
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: instance35168.db.xeround.com (MySQL 5.1.42)
# Database: barbell
# Generation Time: 2013-01-01 00:37:07 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table classdaily
# ------------------------------------------------------------

DROP TABLE IF EXISTS `classdaily`;

CREATE TABLE `classdaily` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `classid` int(10) NOT NULL,
  `visits` int(10) DEFAULT NULL,
  `reservations` int(10) NOT NULL,
  `amount` decimal(10,2) DEFAULT '0.00',
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`),
  KEY `id_classid` (`classid`)
) ENGINE=Xeround DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table classhourly
# ------------------------------------------------------------

DROP TABLE IF EXISTS `classhourly`;

CREATE TABLE `classhourly` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `classid` int(10) NOT NULL,
  `visits` int(10) DEFAULT NULL,
  `reservations` int(10) NOT NULL,
  `amount` decimal(10,2) DEFAULT '0.00',
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_classid_datetime` (`classid`,`datetime`),
  KEY `id_classid` (`classid`),
  KEY `id_gymid` (`gymid`)
) ENGINE=Xeround DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table classmonthly
# ------------------------------------------------------------

DROP TABLE IF EXISTS `classmonthly`;

CREATE TABLE `classmonthly` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `classid` int(10) NOT NULL,
  `visits` int(10) DEFAULT NULL,
  `reservations` int(10) NOT NULL,
  `amount` decimal(10,2) DEFAULT '0.00',
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`),
  KEY `id_classid` (`classid`)
) ENGINE=Xeround DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table daily
# ------------------------------------------------------------

DROP TABLE IF EXISTS `daily`;

CREATE TABLE `daily` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `visits` int(10) NOT NULL,
  `signups` int(10) NOT NULL,
  `reservations` int(10) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=Xeround DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table gymdaily
# ------------------------------------------------------------

DROP TABLE IF EXISTS `gymdaily`;

CREATE TABLE `gymdaily` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `visits` int(10) NOT NULL,
  `views` int(10) NOT NULL,
  `reservations` int(10) NOT NULL,
  `amount` decimal(10,2) DEFAULT '0.00',
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`)
) ENGINE=Xeround DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table gymhourly
# ------------------------------------------------------------

DROP TABLE IF EXISTS `gymhourly`;

CREATE TABLE `gymhourly` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `visits` int(10) NOT NULL,
  `views` int(10) NOT NULL,
  `reservations` int(10) NOT NULL,
  `amount` decimal(10,2) DEFAULT '0.00',
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_gymid_datetime` (`gymid`,`datetime`),
  KEY `id_gymid` (`gymid`)
) ENGINE=Xeround DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table gymmonthly
# ------------------------------------------------------------

DROP TABLE IF EXISTS `gymmonthly`;

CREATE TABLE `gymmonthly` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `visits` int(10) NOT NULL,
  `views` int(10) NOT NULL,
  `reservations` int(10) NOT NULL,
  `amount` decimal(10,2) DEFAULT '0.00',
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`)
) ENGINE=Xeround DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table hourly
# ------------------------------------------------------------

DROP TABLE IF EXISTS `hourly`;

CREATE TABLE `hourly` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `visits` int(10) NOT NULL,
  `signups` int(10) NOT NULL,
  `reservations` int(10) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_datetime` (`datetime`)
) ENGINE=Xeround DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table monthly
# ------------------------------------------------------------

DROP TABLE IF EXISTS `monthly`;

CREATE TABLE `monthly` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `visits` int(10) NOT NULL,
  `signups` int(10) NOT NULL,
  `reservations` int(10) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=Xeround DEFAULT CHARSET=utf8 COLLATE=utf8_bin;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
