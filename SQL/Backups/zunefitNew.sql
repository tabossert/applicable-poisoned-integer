-- MySQL dump 10.13  Distrib 5.1.61, for redhat-linux-gnu (x86_64)
--
-- Host: localhost    Database: zunefitNew
-- ------------------------------------------------------
-- Server version	5.1.61

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adminUsers`
--

DROP TABLE IF EXISTS `adminUsers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `adminUsers` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `userid` int(10) NOT NULL,
  `password` varbinary(50) NOT NULL DEFAULT '',
  `token` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_userid` (`userid`)
) ENGINE=MyISAM AUTO_INCREMENT=96 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adminUsers`
--

LOCK TABLES `adminUsers` WRITE;
/*!40000 ALTER TABLE `adminUsers` DISABLE KEYS */;
INSERT INTO `adminUsers` VALUES (28,24,'1da8d60805bcc9e2b9f1f77221073763bf63f858',NULL),(27,17,'1da8d60805bcc9e2b9f1f77221073763bf63f858','svqK7TLD0V3r8SojDdhhoK0f25BDY0HaXQqxO6HefWQWf2UVNKJQn7PyClctWFUO'),(26,16,'1da8d60805bcc9e2b9f1f77221073763bf63f858','Ii3ZGGupVLtD7HLC0ENmsnm9mkKso-59kRiLzwQU6TqcrSpNUJGArC-Kk4eufaRU'),(25,15,'1da8d60805bcc9e2b9f1f77221073763bf63f858','DJHPCQdDP9UTZV2d0CwBbKTzqd4JE7cNK1r910CZ8GreDDyFZdGLepPDKoGaLN-S');
/*!40000 ALTER TABLE `adminUsers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `balance`
--

DROP TABLE IF EXISTS `balance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `balance` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `userid` int(10) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `automatic` tinyint(1) NOT NULL DEFAULT '0',
  `refillamount` varchar(20) COLLATE utf8_bin NOT NULL,
  `schedule` int(2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_userid` (`userid`)
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `balance`
--

LOCK TABLES `balance` WRITE;
/*!40000 ALTER TABLE `balance` DISABLE KEYS */;
INSERT INTO `balance` VALUES (9,15,'0.00',0,'0',15),(17,23,'0.00',0,'0',15),(5,11,'0.00',0,'0',15),(16,22,'0.00',0,'0',15),(4,10,'0.00',0,'0',15),(11,17,'0.00',0,'0',15),(7,13,'0.00',0,'0',15),(6,12,'0.00',0,'0',15),(18,24,'100.00',0,'0',15),(13,19,'0.00',0,'0',15),(12,18,'0.00',0,'0',15),(8,14,'0.00',0,'0',15),(15,21,'0.00',0,'0',15),(2,9,'100.00',1,'50',15),(14,20,'0.00',0,'0',15),(10,16,'0.00',0,'0',15);
/*!40000 ALTER TABLE `balance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checkin`
--

DROP TABLE IF EXISTS `checkin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `checkin` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `userid` int(10) NOT NULL,
  `gymid` int(10) NOT NULL,
  `datetime` datetime NOT NULL,
  `scheduleid` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_userid` (`userid`),
  KEY `id_gymid` (`gymid`),
  KEY `idx_scheduleid` (`scheduleid`)
) ENGINE=MyISAM AUTO_INCREMENT=265 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checkin`
--

LOCK TABLES `checkin` WRITE;
/*!40000 ALTER TABLE `checkin` DISABLE KEYS */;
INSERT INTO `checkin` VALUES (232,10,22,'2012-10-26 14:47:30',0),(58,15,22,'2012-05-19 06:57:56',0),(10,15,22,'2012-05-18 22:54:20',0),(118,15,22,'2012-05-22 19:56:00',0),(94,15,22,'2012-05-20 00:19:13',0),(22,15,22,'2012-05-18 23:14:10',0),(106,15,22,'2012-05-20 22:22:24',0),(70,15,22,'2012-05-19 19:30:16',0),(82,15,22,'2012-05-19 20:23:50',0),(136,15,22,'2012-05-24 19:51:25',0),(244,10,22,'2012-10-30 13:21:21',0),(34,15,22,'2012-05-19 02:24:17',0),(46,15,22,'2012-05-19 03:01:42',0),(30,15,22,'2012-05-18 23:35:00',0),(114,15,22,'2012-05-21 17:04:06',0),(102,15,22,'2012-05-20 04:10:40',0),(42,15,22,'2012-05-19 02:48:30',0),(54,15,22,'2012-05-19 03:38:46',0),(18,15,22,'2012-05-18 23:07:56',0),(128,15,22,'2012-05-23 23:05:26',0),(188,15,22,'2012-06-03 04:57:48',0),(236,10,22,'2012-10-26 20:23:54',0),(6,15,22,'2012-05-18 22:46:56',0),(78,15,22,'2012-05-19 20:20:14',0),(126,15,22,'2012-05-23 22:57:15',0),(66,15,22,'2012-05-19 07:36:33',0),(90,15,22,'2012-05-19 23:48:41',0),(41,15,22,'2012-05-19 02:46:41',0),(237,10,22,'2012-10-27 01:15:16',0),(65,15,22,'2012-05-19 07:33:01',0),(113,15,22,'2012-05-21 05:38:38',0),(17,15,22,'2012-05-18 23:06:19',0),(77,15,22,'2012-05-19 20:17:46',0),(53,15,22,'2012-05-19 03:37:01',0),(125,15,22,'2012-05-23 22:50:49',0),(29,15,22,'2012-05-18 23:27:47',0),(225,15,19,'2012-06-05 22:58:43',0),(5,15,22,'2012-05-18 22:44:58',0),(129,15,22,'2012-05-23 23:52:19',0),(89,15,22,'2012-05-19 23:37:33',0),(101,15,22,'2012-05-20 04:09:48',0),(84,15,22,'2012-05-19 20:25:45',0),(158,15,22,'2012-05-30 03:26:20',0),(108,15,22,'2012-05-20 23:43:06',0),(72,15,22,'2012-05-19 19:49:51',0),(242,10,22,'2012-10-29 22:00:15',0),(12,15,22,'2012-05-18 22:57:24',0),(36,15,22,'2012-05-19 02:41:03',0),(48,15,22,'2012-05-19 03:22:10',0),(134,15,22,'2012-05-24 04:42:47',0),(24,15,22,'2012-05-18 23:15:23',0),(120,15,22,'2012-05-23 20:12:59',0),(96,15,22,'2012-05-20 02:15:01',0),(60,15,22,'2012-05-19 07:00:01',0),(230,10,22,'2012-10-26 13:44:28',0),(8,15,22,'2012-05-18 22:48:37',0),(44,15,22,'2012-05-19 02:50:37',0),(56,15,22,'2012-05-19 06:37:17',0),(92,15,22,'2012-05-19 23:54:36',0),(68,15,22,'2012-05-19 18:49:05',0),(116,15,22,'2012-05-21 17:27:53',0),(80,15,22,'2012-05-19 20:21:44',0),(104,15,22,'2012-05-20 18:30:26',0),(234,10,22,'2012-10-26 18:37:01',0),(32,15,22,'2012-05-18 23:36:39',0),(20,15,22,'2012-05-18 23:10:50',0),(246,10,22,'2012-10-30 13:23:04',0),(240,10,22,'2012-10-29 17:21:24',0),(98,15,22,'2012-05-20 03:52:56',0),(62,15,22,'2012-05-19 07:27:11',0),(50,15,22,'2012-05-19 03:22:54',0),(122,15,22,'2012-05-23 22:42:59',0),(110,15,22,'2012-05-21 02:06:38',0),(228,10,22,'2012-10-26 11:54:35',0),(86,15,22,'2012-05-19 20:37:02',0),(74,15,22,'2012-05-19 20:13:03',0),(132,15,22,'2012-05-24 04:29:28',0),(14,15,22,'2012-05-18 22:59:55',0),(38,15,22,'2012-05-19 02:42:54',0),(26,15,22,'2012-05-18 23:21:04',0),(2,15,0,'2012-05-18 22:40:12',0),(103,15,22,'2012-05-20 05:37:18',0),(31,15,22,'2012-05-18 23:35:52',0),(43,15,22,'2012-05-19 02:48:58',0),(55,15,22,'2012-05-19 06:35:26',0),(247,10,22,'2012-10-30 15:30:20',0),(115,15,22,'2012-05-21 17:26:49',0),(235,10,22,'2012-10-26 20:23:40',0),(19,15,22,'2012-05-18 23:10:02',0),(7,15,22,'2012-05-18 22:47:43',0),(91,15,22,'2012-05-19 23:51:23',0),(67,15,22,'2012-05-19 07:36:51',0),(79,15,22,'2012-05-19 20:20:50',0),(133,15,22,'2012-05-24 04:41:16',0),(109,15,22,'2012-05-21 02:05:46',0),(229,10,22,'2012-10-26 11:59:31',0),(121,15,22,'2012-05-23 22:37:34',0),(13,15,22,'2012-05-18 22:58:18',0),(49,15,22,'2012-05-19 03:22:28',0),(37,15,22,'2012-05-19 02:41:32',0),(85,15,22,'2012-05-19 20:29:29',0),(157,15,22,'2012-05-29 23:59:58',0),(25,15,22,'2012-05-18 23:16:01',0),(241,10,22,'2012-10-29 19:28:39',0),(73,15,22,'2012-05-19 20:03:59',0),(61,15,22,'2012-05-19 07:24:19',0),(97,15,22,'2012-05-20 03:52:20',0),(1,2,4,'2012-05-18 22:14:37',0),(40,15,22,'2012-05-19 02:44:25',0),(124,15,22,'2012-05-23 22:48:08',0),(76,15,22,'2012-05-19 20:14:59',0),(88,15,22,'2012-05-19 23:36:36',0),(16,15,22,'2012-05-18 23:05:08',0),(226,15,19,'2012-06-06 00:09:15',0),(154,15,22,'2012-05-28 23:55:53',0),(130,15,22,'2012-05-24 03:59:15',0),(112,15,22,'2012-05-21 05:38:29',0),(4,15,0,'2012-05-18 22:43:19',0),(28,15,22,'2012-05-18 23:27:32',0),(52,15,22,'2012-05-19 03:35:51',0),(100,15,22,'2012-05-20 03:54:09',0),(238,10,22,'2012-10-27 18:30:33',0),(64,15,22,'2012-05-19 07:32:41',0),(9,15,22,'2012-05-18 22:51:20',0),(69,15,22,'2012-05-19 18:49:48',0),(57,15,22,'2012-05-19 06:56:54',0),(45,15,22,'2012-05-19 02:56:36',0),(233,10,22,'2012-10-26 16:31:29',0),(245,10,22,'2012-10-30 13:22:14',0),(137,15,22,'2012-05-24 20:04:46',0),(105,15,22,'2012-05-20 19:51:30',0),(81,15,22,'2012-05-19 20:22:52',0),(93,15,22,'2012-05-20 00:09:15',0),(33,15,22,'2012-05-19 02:23:25',0),(117,15,22,'2012-05-22 19:49:38',0),(21,15,22,'2012-05-18 23:13:01',0),(3,15,0,'2012-05-18 22:42:25',0),(123,15,22,'2012-05-23 22:47:43',0),(99,15,22,'2012-05-20 03:53:47',0),(27,15,22,'2012-05-18 23:23:07',0),(51,15,22,'2012-05-19 03:23:13',0),(63,15,22,'2012-05-19 07:27:56',0),(131,15,22,'2012-05-24 03:59:42',0),(111,15,22,'2012-05-21 02:08:23',0),(227,15,19,'2012-06-06 00:09:15',0),(191,15,22,'2012-06-04 17:31:51',0),(75,15,22,'2012-05-19 20:14:33',0),(239,10,22,'2012-10-29 01:11:42',0),(127,15,22,'2012-05-23 22:58:55',0),(87,15,22,'2012-05-19 23:33:58',0),(39,15,22,'2012-05-19 02:43:06',0),(15,15,22,'2012-05-18 23:02:31',0),(59,15,22,'2012-05-19 06:58:58',0),(23,15,22,'2012-05-18 23:14:56',0),(95,15,22,'2012-05-20 02:14:47',0),(135,15,22,'2012-05-24 17:17:56',0),(107,15,22,'2012-05-20 22:24:59',0),(243,10,22,'2012-10-29 22:02:11',0),(159,15,22,'2012-05-31 00:06:43',0),(83,15,22,'2012-05-19 20:24:31',0),(119,15,22,'2012-05-23 19:44:51',0),(71,15,22,'2012-05-19 19:45:56',0),(11,15,22,'2012-05-18 22:55:27',0),(231,10,22,'2012-10-26 13:44:46',0),(47,15,22,'2012-05-19 03:02:20',0),(35,15,22,'2012-05-19 02:37:21',0),(248,10,22,'2012-10-31 19:28:34',0),(249,10,22,'2012-11-01 18:17:15',0),(250,10,22,'2012-11-13 03:14:26',0),(251,10,22,'2012-11-13 03:15:52',0),(252,10,22,'2012-11-13 03:17:19',0),(253,10,22,'2012-11-13 03:17:48',0),(254,10,22,'2012-11-13 03:18:19',0),(255,10,22,'2012-11-13 04:51:32',0),(256,10,22,'2012-11-13 04:53:08',0),(257,10,22,'2012-11-13 04:53:45',0),(258,10,22,'2012-11-13 04:55:26',0),(259,15,22,'2012-11-13 05:03:11',0),(260,10,22,'2012-11-13 05:03:11',0),(261,15,22,'2012-11-13 05:03:13',0),(262,10,22,'2012-11-13 05:03:13',0),(263,15,22,'2012-11-13 05:11:32',0),(264,15,22,'2012-11-23 16:11:32',17);
/*!40000 ALTER TABLE `checkin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classes` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `service` varchar(50) CHARACTER SET utf8 NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `daypass` tinyint(1) NOT NULL DEFAULT '0',
  `monday` time DEFAULT NULL,
  `tuesday` time DEFAULT NULL,
  `wednesday` time DEFAULT NULL,
  `thursday` time DEFAULT NULL,
  `friday` time DEFAULT NULL,
  `saturday` time DEFAULT NULL,
  `sunday` time DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (7,22,'Yoga','10.00',1,0,'00:00:00','00:00:00','00:00:00','00:00:00','00:00:00','00:00:00','00:00:00'),(1,22,'Karate','8.00',1,0,'00:00:00','00:00:00','00:00:00','00:00:00','00:00:00','00:00:00','00:00:00'),(2,22,'Karate','5.00',1,0,'00:00:00','00:00:00','00:00:00','00:00:00','00:00:00','00:00:00','00:00:00'),(8,22,'Day Pass','5.00',1,1,'00:00:00','00:00:00','00:00:00','00:00:00','00:00:00','00:00:00','00:00:00'),(12,22,'kickboxing','10.00',1,0,'00:00:00','00:00:00','14:00:00','00:00:00','00:00:00','00:00:00','00:00:00');
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disbursement`
--

DROP TABLE IF EXISTS `disbursement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `disbursement` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `type` int(10) NOT NULL,
  `paylimit` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disbursement`
--

LOCK TABLES `disbursement` WRITE;
/*!40000 ALTER TABLE `disbursement` DISABLE KEYS */;
INSERT INTO `disbursement` VALUES (2,19,1,300),(3,22,1,300),(1,17,1,300);
/*!40000 ALTER TABLE `disbursement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gBillingAudit`
--

DROP TABLE IF EXISTS `gBillingAudit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gBillingAudit` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gid` int(10) NOT NULL,
  `action` int(2) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gid` (`gid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gBillingAudit`
--

LOCK TABLES `gBillingAudit` WRITE;
/*!40000 ALTER TABLE `gBillingAudit` DISABLE KEYS */;
INSERT INTO `gBillingAudit` VALUES (1,22,0,'50.00','2012-11-10 21:10:17');
/*!40000 ALTER TABLE `gBillingAudit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gymBilling`
--

DROP TABLE IF EXISTS `gymBilling`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gymBilling` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gid` int(10) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `zcom` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gid` (`gid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gymBilling`
--

LOCK TABLES `gymBilling` WRITE;
/*!40000 ALTER TABLE `gymBilling` DISABLE KEYS */;
INSERT INTO `gymBilling` VALUES (1,22,'701.33','687.01');
/*!40000 ALTER TABLE `gymBilling` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gymTags`
--

DROP TABLE IF EXISTS `gymTags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gymTags` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `tag` varchar(10) COLLATE utf8_bin NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `udx_gymid_tag` (`gymid`,`tag`),
  KEY `id_gymid` (`gymid`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gymTags`
--

LOCK TABLES `gymTags` WRITE;
/*!40000 ALTER TABLE `gymTags` DISABLE KEYS */;
/*!40000 ALTER TABLE `gymTags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gymUsers`
--

DROP TABLE IF EXISTS `gymUsers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gymUsers` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
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
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gymUsers`
--

LOCK TABLES `gymUsers` WRITE;
/*!40000 ALTER TABLE `gymUsers` DISABLE KEYS */;
INSERT INTO `gymUsers` VALUES (2,22,'b6VpapU5I3wmpp96-KTIM7vlt10bkmfigitXXxsNVuhHeS7IT__vbC9HoSzJAFNF','alanboss','1da8d60805bcc9e2b9f1f77221073763bf63f858','Trevor','Bossert',0,'2012-11-01 18:15:35'),(4,22,'RRGVAZjTs9rSj49t_GTde2RbuimsP24dVDaSkM-oLuXblpz92pNnTXh_pe3ta6zg','tester','dc724af18fbdd4e59189f5fe768a5f8311527050','test','tester',0,'2012-10-17 12:05:49'),(6,22,'x78W-zXKTkcGNJgVKGxxFxsmcEaVnLVrNxPOam2fPgMEhUKhVawppL-a5WwWdijh','justinGym','1de40e8ba6f90dd3db0a26f7596b74234e30a775','Justin','Bossert',0,'2012-10-17 19:10:35'),(5,26,'xAzfqQ8q5nrAyEyKPdADDu3aBvol4jm3TBopReBcsGKqr5o0OArJ49rn6DUEAA-S','undefined','5fa8d60805bcc9e2b9f1f77221073763bf63f858','Bob','Barker',0,NULL),(1,22,'f55644c9ea2568b07c40696a2bf7ad9d42f139f8','slap','1da8d60805bcc9e2b9f1f77221073763bf63f858','Trevor','Bossert',0,NULL),(7,29,'1lzIBeWdFsX0RIlipBnMKs9_3iKInlaulGb8eQA2vgdhhfT_5WPJQ6L-BMth5YVb','Jimmy','dc724af18fbdd4e59189f5fe768a5f8311527050','Jimmy','Buffet',0,NULL),(3,24,'XO5_BXDlzRFjgiGFOKbolun8hZcEzuFFetSzTD35l6_sa-IbeKgCDO0TysYXgI9N','test1','1da8d60805bcc9e2b9f1f77221073763bf63f858','undefined','undefined',0,NULL);
/*!40000 ALTER TABLE `gymUsers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gyms`
--

DROP TABLE IF EXISTS `gyms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gyms` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `address` varchar(50) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT '',
  `city` varchar(25) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT '',
  `state` varchar(2) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT '',
  `zipcode` varchar(5) COLLATE utf8_bin DEFAULT '',
  `phone` varchar(15) COLLATE utf8_bin DEFAULT '',
  `featured` tinyint(1) DEFAULT '0',
  `contact` varchar(30) COLLATE utf8_bin DEFAULT NULL,
  `complete` tinyint(1) DEFAULT '0',
  `email` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `rate` int(5) DEFAULT '0',
  `balance` int(10) DEFAULT '0',
  `enabled` tinyint(1) NOT NULL DEFAULT '0',
  `commission` decimal(10,2) NOT NULL DEFAULT '2.25',
  `image` varchar(150) COLLATE utf8_bin DEFAULT NULL,
  `facebook` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `twitter` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `googleplus` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_zipcode` (`zipcode`),
  KEY `id_city` (`city`),
  KEY `id_state` (`state`)
) ENGINE=MyISAM AUTO_INCREMENT=30 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gyms`
--

LOCK TABLES `gyms` WRITE;
/*!40000 ALTER TABLE `gyms` DISABLE KEYS */;
INSERT INTO `gyms` VALUES (1,'golds','1461 Creekside Dr','Walnut Creek','CA','94596','8054287760',0,'someone',0,'tbossert@zunefit.com',15,NULL,0,'2.25',NULL,NULL,NULL,NULL),(25,'testgym1','','','','','',0,NULL,0,NULL,0,500,0,'2.25',NULL,NULL,NULL,NULL),(20,'undefined','','','','','',0,'someone',0,'tbossert@zunefit.com',15,NULL,0,'2.25',NULL,NULL,NULL,NULL),(21,'KennedyFitness','','','','','',0,'someone',0,'tbossert@zunefit.com',15,NULL,0,'2.25',NULL,NULL,NULL,NULL),(27,'19 Hour Fitness','','','','','',0,NULL,0,NULL,0,0,0,'2.25',NULL,NULL,NULL,NULL),(22,'KennedyFitness','3450 Broad St.','San Luis Obispo','CA','93401','8053329385',0,'someone',1,'tbossert@zunefit.com',15,500,0,'2.25','https://133ebe4227c90a13f1dc-8c7ec5384ed7d5bfa2498',NULL,NULL,NULL),(17,'Kennedy Fitness','1461 Creekside Dr','Walnut Creek','SA','94596','8053329235',1,'someone',0,'tbossert@zunefit.com',15,NULL,0,'2.25',NULL,NULL,NULL,NULL),(29,'19 Hour Fitness','305 Downey St.','New York','NY','90045','3456789186',0,'Trevor',1,'apple@apple.com',5,100,0,'2.25',NULL,NULL,NULL,NULL),(24,'test1','','','','','',0,NULL,0,NULL,0,0,0,'2.25',NULL,NULL,NULL,NULL),(28,'19 Hour Fitness','','','','','',0,NULL,0,NULL,0,0,0,'2.25',NULL,NULL,NULL,NULL),(19,'Sanfords','3450 Broad St.','San Luis Obispo','CA','93401','8053329385',0,'someone',0,'tbossert@zunefit.com',15,NULL,0,'2.25',NULL,NULL,NULL,NULL),(2,'24 hour','3451 broad st.','San Luis Obispo','CA','93401','8054287760',0,'someone',0,'tbossert@zunefit.com',15,NULL,0,'2.25',NULL,NULL,NULL,NULL),(26,'','105 Seacliff Dr.','Shell Beach','CA','93449','3456789186',0,'Trevor',0,'apple@apple.com',0,0,0,'2.25',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `gyms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hours`
--

DROP TABLE IF EXISTS `hours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hours` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `monday` varchar(25) COLLATE utf8_bin NOT NULL,
  `tuesday` varchar(25) COLLATE utf8_bin NOT NULL,
  `wednesday` varchar(25) COLLATE utf8_bin NOT NULL,
  `thursday` varchar(25) COLLATE utf8_bin NOT NULL,
  `friday` varchar(25) COLLATE utf8_bin NOT NULL,
  `saturday` varchar(25) COLLATE utf8_bin NOT NULL,
  `sunday` varchar(25) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hours`
--

LOCK TABLES `hours` WRITE;
/*!40000 ALTER TABLE `hours` DISABLE KEYS */;
INSERT INTO `hours` VALUES (5,17,'8am-6pm','8am-6pm','8am-6pm','8am-6pm','8am-6pm','8am-6pm','8am-6pm'),(7,19,'8am-5pm','8am-5pm','8am-5pm','8am-5pm','8am-5pm','8am-5pm','8am-5pm'),(6,18,'undefined','undefined','undefined','undefined','undefined','undefined','undefined');
/*!40000 ALTER TABLE `hours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paymentmethod`
--

DROP TABLE IF EXISTS `paymentmethod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paymentmethod` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `type` varchar(20) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paymentmethod`
--

LOCK TABLES `paymentmethod` WRITE;
/*!40000 ALTER TABLE `paymentmethod` DISABLE KEYS */;
INSERT INTO `paymentmethod` VALUES (1,'check');
/*!40000 ALTER TABLE `paymentmethod` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rewards`
--

DROP TABLE IF EXISTS `rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rewards` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `userid` int(10) NOT NULL,
  `network` varchar(50) COLLATE utf8_bin NOT NULL DEFAULT '',
  `applied` tinyint(1) NOT NULL DEFAULT '0',
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_rewards` (`userid`,`network`),
  KEY `id_userid` (`userid`),
  KEY `id_applied` (`applied`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rewards`
--

LOCK TABLES `rewards` WRITE;
/*!40000 ALTER TABLE `rewards` DISABLE KEYS */;
INSERT INTO `rewards` VALUES (5,18,'facebook',1,'2012-10-10 21:58:54'),(11,18,'twitter',1,'2012-10-10 23:18:05');
/*!40000 ALTER TABLE `rewards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedule`
--

DROP TABLE IF EXISTS `schedule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schedule` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `userid` int(10) NOT NULL,
  `gymid` int(10) NOT NULL,
  `classid` int(10) NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `redeemed` tinyint(1) NOT NULL DEFAULT '0',
  `paidout` tinyint(1) NOT NULL DEFAULT '0',
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_userid` (`userid`),
  KEY `id_gymid` (`gymid`),
  KEY `id_classid` (`classid`),
  KEY `id_userid_classid_datetime` (`userid`,`classid`,`datetime`)
) ENGINE=MyISAM AUTO_INCREMENT=103 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule`
--

LOCK TABLES `schedule` WRITE;
/*!40000 ALTER TABLE `schedule` DISABLE KEYS */;
INSERT INTO `schedule` VALUES (6,15,22,1,'5.00',0,0,'0000-00-00 00:00:00'),(16,24,99,99,'6.00',0,0,'0000-00-00 00:00:00'),(15,24,99,99,'6.00',0,0,'0000-00-00 00:00:00'),(10,15,22,2,'5.00',1,0,'0000-00-00 00:00:00'),(11,15,22,7,'5.00',0,0,'0000-00-00 00:00:00'),(17,15,22,8,'10.00',0,0,'2012-11-23 20:45:00'),(18,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(19,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(20,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(21,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(22,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(23,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(24,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(25,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(26,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(27,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(28,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(29,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(30,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(31,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(32,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(33,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(34,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(35,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(36,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(37,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(38,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(39,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(40,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(41,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(42,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(43,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(44,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(45,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(46,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(47,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(48,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(49,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(50,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(51,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(52,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(53,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(54,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(55,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(56,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(57,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(58,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(59,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(60,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(61,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(62,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(63,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(64,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(65,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(66,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(67,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(68,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(69,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(70,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(71,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(72,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(73,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(74,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(75,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(76,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(77,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(78,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(79,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(80,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(81,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(82,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(83,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(84,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(85,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(86,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(87,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(88,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(89,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(90,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(91,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(92,15,22,2,'5.00',0,0,'2012-12-01 12:00:00'),(93,10,22,2,'5.00',0,0,'2012-12-05 22:00:00'),(94,10,22,2,'5.00',0,0,'2012-12-05 22:00:00'),(95,10,22,11,'15.00',0,0,'2012-12-05 22:00:00'),(96,10,22,11,'15.00',0,0,'2012-12-05 22:00:00'),(97,15,22,2,'10.00',0,0,'2012-12-03 12:00:00'),(98,10,22,11,'15.00',0,0,'2012-12-05 22:00:00'),(99,15,22,11,'15.00',0,0,'2012-12-05 22:00:00'),(100,15,22,11,'15.00',0,0,'2012-12-05 22:00:00'),(101,15,22,11,'15.00',0,0,'2012-12-05 22:00:00'),(102,15,22,11,'15.00',0,0,'2012-12-05 22:00:00');
/*!40000 ALTER TABLE `schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stats`
--

DROP TABLE IF EXISTS `stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stats` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `userid` int(10) NOT NULL,
  `type` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`),
  KEY `id_userid` (`userid`),
  KEY `id_type` (`type`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stats`
--

LOCK TABLES `stats` WRITE;
/*!40000 ALTER TABLE `stats` DISABLE KEYS */;
INSERT INTO `stats` VALUES (3,22,9,1),(1,22,9,1),(5,22,9,1),(2,22,9,0),(4,22,10,0);
/*!40000 ALTER TABLE `stats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactions` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `userid` int(10) NOT NULL,
  `refid` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_userid` (`userid`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (4,24,'5','2012-10-17 18:37:03'),(2,18,'sdsdsdfd43434346','0000-00-00 00:00:00'),(1,18,'sdsdsdfd43434346','0000-00-00 00:00:00'),(3,18,'sdsdsdfd43434346','2012-10-06 03:50:37');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uBillingAudit`
--

DROP TABLE IF EXISTS `uBillingAudit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `uBillingAudit` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `uid` int(10) NOT NULL,
  `action` int(2) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=92 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uBillingAudit`
--

LOCK TABLES `uBillingAudit` WRITE;
/*!40000 ALTER TABLE `uBillingAudit` DISABLE KEYS */;
INSERT INTO `uBillingAudit` VALUES (49,15,0,'10.00','2012-12-05 06:10:27'),(50,15,0,'10.00','2012-12-05 06:11:01'),(51,15,0,'10.00','2012-12-05 06:11:34'),(52,15,0,'10.00','2012-12-05 06:21:14'),(53,15,0,'10.00','2012-12-05 06:21:42'),(54,15,0,'10.00','2012-12-05 06:22:16'),(55,15,0,'10.00','2012-12-05 06:47:12'),(56,15,0,'10.00','2012-12-05 06:47:35'),(57,15,0,'10.00','2012-12-05 06:48:12'),(58,15,0,'10.00','2012-12-05 06:48:27'),(59,15,0,'10.00','2012-12-05 06:48:38'),(60,15,0,'5.00','2012-12-05 06:49:02'),(61,15,0,'5.00','2012-12-05 06:49:18'),(62,15,0,'5.00','2012-12-05 06:49:23'),(63,15,0,'5.00','2012-12-05 06:49:50'),(66,15,0,'10.00','2012-12-05 06:53:31'),(67,15,0,'5.00','2012-12-05 06:56:21'),(68,15,0,'5.00','2012-12-05 06:56:41'),(69,15,0,'5.00','2012-12-05 06:56:59'),(70,15,0,'5.00','2012-12-05 06:57:20'),(71,15,0,'5.00','2012-12-05 06:57:50'),(72,15,0,'5.00','2012-12-05 06:58:21'),(73,15,0,'5.00','2012-12-05 06:59:47'),(74,15,0,'5.00','2012-12-05 07:00:06'),(75,15,0,'5.00','2012-12-05 07:01:10'),(76,15,0,'5.00','2012-12-05 07:01:26'),(77,15,0,'5.00','2012-12-05 07:02:07'),(82,10,0,'5.00','2012-12-05 22:08:40'),(83,10,0,'5.00','2012-12-05 22:09:22'),(84,10,0,'15.00','2012-12-05 22:09:33'),(85,10,0,'15.00','2012-12-05 22:10:23'),(87,10,0,'15.00','2012-12-05 22:11:24');
/*!40000 ALTER TABLE `uBillingAudit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `email` varbinary(50) NOT NULL DEFAULT '',
  `first_name` varchar(20) COLLATE utf8_bin DEFAULT NULL,
  `last_name` varchar(20) COLLATE utf8_bin DEFAULT NULL,
  `address` varbinary(50) DEFAULT NULL,
  `city` varchar(25) COLLATE utf8_bin DEFAULT NULL,
  `state` varchar(2) COLLATE utf8_bin DEFAULT NULL,
  `zipcode` varchar(5) COLLATE utf8_bin DEFAULT NULL,
  `paymentid` int(20) DEFAULT NULL,
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `web_token` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `lastlogin` datetime DEFAULT NULL,
  `pincode` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `phone` varbinary(50) DEFAULT NULL,
  `mobile_token` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_webToken` (`web_token`),
  KEY `id_mobileToken` (`mobile_token`)
) ENGINE=MyISAM AUTO_INCREMENT=25 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (17,'ZMÖöHjVŒ[∑Ë√[úïïS8÷!ãD¯Ûä–é‡®','Daniel','Jensen',NULL,NULL,NULL,NULL,NULL,'0.00','gQd3PVWWBFh6Sk9XRSCXbYkWfExMuYXuJEJA9bdBJfcC-sBCCQCOoawKiXNliXWN','2012-06-07 02:14:17','2012-10-10 17:49:16',NULL,NULL,'W1E9EZD0YacxyEyCkSWFd0tdOp1f4AN8OWvTasYopb0au5UfdUwnnXkmKdm5EDXu'),(24,'jbossert@zunefit.com','Justin','Bossert','3701 County Road 633','Grawn','MI','49637',NULL,'0.00','bbzfqQ8q5nrAyEyKPdADDu3aBvol4jm3TBopReBcsGKqr5o0OArJ49rn6DUEAA-S','2012-10-14 19:38:05','2012-10-14 19:38:05','1234','û6T◊enä∏˛Ù#§™∏',NULL),(12,'ZM‚Ä¶≈°HjV√é[¬∑√®√É[≈ì‚Ä¢‚Ä¢S8√ñ!‚ÄπD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'100.00','PCfXegug7OMZDgfoH37eQM8gXdMqk0VeGEHGK1KhK0f4Cy53ghnSg74OAnSYz12y',NULL,'2012-04-30 05:27:21',NULL,NULL,NULL),(19,'√˚w«9ßu1Ù…TÆR˝ÙàƒEñ>˘¢	K≥P≈Û†','Ravi','Makhija',NULL,NULL,NULL,NULL,NULL,'0.00','0SLOjxu3Sb4L-VS5wAnFKxnGoQYTiuA937cnOCm1ddluKiMCfMpdTK6gpjfiAgOc','2012-08-04 08:45:27','2012-08-04 08:45:27',NULL,NULL,NULL),(15,'∏≠âÔﬁE¬Òº,NåïïS8÷!ãD¯Ûä–é‡®','Trevor','Bossert','~Ÿv√\'|ÉO≠f√’#<L~~xøﬂb’Á∂◊Ù','Shell Beach','CA','93449',NULL,'0.00','EKD7ULbqzB8M1sfssnBFmDE7sSG9Gb95MlSsDM_bX9QkRtjnM5GzVd2G-yib42Sp','2012-04-29 21:33:47','2012-10-07 04:39:01','7110eda4d09e062aa5e4a390b0a572ac0d2c0220','âπ\nhﬂÁ+ïïÿt¥&Ω‘','xdFiw37Gb2N9XjugZzPqovHHwC1FNaF5uSgVH7to4MDAfeZlIMdOOu1bINq219iZ'),(14,'*√ÜOh√û¬ù‚Ä¶|¬ºw√Ω√°√¥√ë;‚Ä¢‚Ä¢S8√ñ!‚Ä','Trevor','Bossert',NULL,NULL,NULL,NULL,NULL,'150.00','splzUY59tUMPdqSTC5yNxqZniADuBwNg2TX2jQvLaajlb3Ti8PjWe-mRQV7zhUMM','2012-04-29 21:31:43','2012-04-29 21:31:43',NULL,NULL,NULL),(21,'\\ÅÖMÃÂ¸v˝z·ïa√ÙàƒEñ>˘¢	K≥P≈Û†','Santa','Banta',NULL,NULL,NULL,NULL,NULL,'0.00','6nrWM6_hCQf0fTcUrpXvjIHz4cswg8DnooueokjQ5SGIzqwmOiYEORNDU_fIueIS','2012-08-15 18:47:36','2012-08-28 18:31:25',NULL,NULL,NULL),(20,'m›@Ï`≤ôÃµè¿a~T˘∫}“<NÆ&Aæ‡Ÿ','Parth','Bhatt',NULL,NULL,NULL,NULL,NULL,'0.00','KZtoKfBNLxyXcwdNl6mEJTQezl4L6Ek76oitRqup1ICrbDLvXqIlzDT3v7INA7ff','2012-08-07 18:34:06','2012-08-30 17:31:05',NULL,NULL,NULL),(16,'Ô◊øªåÕ˜≥ÜoÛâxÌ⁄ŸÒ„◊ﬂÒ&äÅ»©','Daniel','Jensen',NULL,NULL,NULL,NULL,NULL,'0.00','Go69ecDIJ8rVM6ifYMnzQqyJNTqQd5NlgCaNW88WpMvofXLrZvDEknXmYpoD3z34','2012-05-14 20:18:30','2012-05-14 20:18:30','','0000000000',NULL),(23,'ÈÓ#99Ï}ü\nQ˛™JB¥@Q∆XÙUÚ}`Ω-∆ˆ','Monzoor','Tamal',NULL,NULL,NULL,NULL,NULL,'0.00','UfZ5hNKozVAAWkrxronaz6gS7tmXPHNto4Baa__1Sy7GjDIR5VOnHCTJ8gRlwgXI','2012-08-31 17:19:37','2012-08-31 17:19:37',NULL,NULL,NULL),(22,'CYˇ˙áïZ≥H+áH5@ﬁFœìΩÃç„cQ@)Ñ','Mangu','Hingala',NULL,NULL,NULL,NULL,NULL,'0.00','VikZAi0wWcKd1T8MFAV2zWIY4zkpmQpY_ALoEe6Rl3vY5v1E52dy4PiZRnUtS-Ao','2012-08-30 17:28:06','2012-09-10 19:09:41',NULL,NULL,NULL),(10,'π¶O—0™\nçÀRK(Â5à‘\Z7n«Ãç\"õˆH	®ÕA','trixie','plastic','ÏB;—\nj6»‹-!ÑU','Plymouth','MA','48756',NULL,'935.00','2seu7EgykFK5AgIob8DsKM1AQizcm6xQ9CSXGsIluWkcyWoFL4MLVXnzWob3I1sO',NULL,'2012-04-29 21:16:20','7110eda4d09e062aa5e4a390b0a572ac0d2c0220','âπ\nhﬂÁ+ïïÿt¥&Ω‘',NULL),(18,'¨UÕ{Iœ?ÍpÖa™áâŸ\"iº‘ëbûòU. ¬yÆï\'','Trevor','Bossert',NULL,NULL,NULL,NULL,NULL,'174.00','HWOkivIgwnA8YgFcjWE3G2WwU9wXYWZWPYCvlHfUm3_JE-ac45e24qVw9A_2NbRh','2012-06-19 01:05:02','2012-06-27 17:23:58',NULL,'9254571987',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2012-12-05 22:45:17
