-- MySQL dump 10.13  Distrib 5.1.61, for redhat-linux-gnu (x86_64)
--
-- Host: localhost    Database: zunefit
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
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `userid` int(40) NOT NULL,
  `password` varbinary(50) NOT NULL DEFAULT '',
  `token` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_userid` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adminUsers`
--

LOCK TABLES `adminUsers` WRITE;
/*!40000 ALTER TABLE `adminUsers` DISABLE KEYS */;
INSERT INTO `adminUsers` VALUES (25,15,'1da8d60805bcc9e2b9f1f77221073763bf63f858','3V8VoryZcF32shY_XurOXgKsFY9u5kT3ZIeDJW7x8YDEtCVVxD'),(26,16,'1da8d60805bcc9e2b9f1f77221073763bf63f858',NULL),(27,17,'1da8d60805bcc9e2b9f1f77221073763bf63f858',NULL);
/*!40000 ALTER TABLE `adminUsers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `balance`
--

DROP TABLE IF EXISTS `balance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `balance` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `userid` int(40) NOT NULL,
  `amount` int(20) NOT NULL,
  `automatic` tinyint(1) NOT NULL DEFAULT '0',
  `refillamount` varchar(20) COLLATE utf8_bin NOT NULL,
  `schedule` int(2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_userid` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `balance`
--

LOCK TABLES `balance` WRITE;
/*!40000 ALTER TABLE `balance` DISABLE KEYS */;
INSERT INTO `balance` VALUES (2,9,100,1,'50',15),(4,10,0,0,'0',15),(5,11,0,0,'0',15),(6,12,0,0,'0',15),(7,13,0,0,'0',15),(8,14,0,0,'0',15),(9,15,0,1,'100',15),(10,16,0,0,'0',15),(11,17,0,0,'0',15),(12,18,0,0,'0',15),(13,19,0,0,'0',15),(14,20,0,0,'0',15),(15,21,0,0,'0',15),(16,22,0,0,'0',15),(17,23,0,0,'0',15),(18,24,100,0,'0',15),(19,25,0,0,'0',15),(20,26,0,0,'0',15),(21,27,0,0,'0',15),(22,28,0,0,'0',15);
/*!40000 ALTER TABLE `balance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billingAudit`
--

DROP TABLE IF EXISTS `billingAudit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `billingAudit` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `gid` int(40) NOT NULL,
  `action` int(2) NOT NULL,
  `amount` int(10) NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billingAudit`
--

LOCK TABLES `billingAudit` WRITE;
/*!40000 ALTER TABLE `billingAudit` DISABLE KEYS */;
/*!40000 ALTER TABLE `billingAudit` ENABLE KEYS */;
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
  PRIMARY KEY (`id`),
  KEY `id_userid` (`userid`),
  KEY `id_gymid` (`gymid`)
) ENGINE=InnoDB AUTO_INCREMENT=237 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checkin`
--

LOCK TABLES `checkin` WRITE;
/*!40000 ALTER TABLE `checkin` DISABLE KEYS */;
INSERT INTO `checkin` VALUES (1,2,4,'2012-05-18 22:14:37'),(2,15,0,'2012-05-18 22:40:12'),(3,15,0,'2012-05-18 22:42:25'),(4,15,0,'2012-05-18 22:43:19'),(5,15,22,'2012-05-18 22:44:58'),(6,15,22,'2012-05-18 22:46:56'),(7,15,22,'2012-05-18 22:47:43'),(8,15,22,'2012-05-18 22:48:37'),(9,15,22,'2012-05-18 22:51:20'),(10,15,22,'2012-05-18 22:54:20'),(11,15,22,'2012-05-18 22:55:27'),(12,15,22,'2012-05-18 22:57:24'),(13,15,22,'2012-05-18 22:58:18'),(14,15,22,'2012-05-18 22:59:55'),(15,15,22,'2012-05-18 23:02:31'),(16,15,22,'2012-05-18 23:05:08'),(17,15,22,'2012-05-18 23:06:19'),(18,15,22,'2012-05-18 23:07:56'),(19,15,22,'2012-05-18 23:10:02'),(20,15,22,'2012-05-18 23:10:50'),(21,15,22,'2012-05-18 23:13:01'),(22,15,22,'2012-05-18 23:14:10'),(23,15,22,'2012-05-18 23:14:56'),(24,15,22,'2012-05-18 23:15:23'),(25,15,22,'2012-05-18 23:16:01'),(26,15,22,'2012-05-18 23:21:04'),(27,15,22,'2012-05-18 23:23:07'),(28,15,22,'2012-05-18 23:27:32'),(29,15,22,'2012-05-18 23:27:47'),(30,15,22,'2012-05-18 23:35:00'),(31,15,22,'2012-05-18 23:35:52'),(32,15,22,'2012-05-18 23:36:39'),(33,15,22,'2012-05-19 02:23:25'),(34,15,22,'2012-05-19 02:24:17'),(35,15,22,'2012-05-19 02:37:21'),(36,15,22,'2012-05-19 02:41:03'),(37,15,22,'2012-05-19 02:41:32'),(38,15,22,'2012-05-19 02:42:54'),(39,15,22,'2012-05-19 02:43:06'),(40,15,22,'2012-05-19 02:44:25'),(41,15,22,'2012-05-19 02:46:41'),(42,15,22,'2012-05-19 02:48:30'),(43,15,22,'2012-05-19 02:48:58'),(44,15,22,'2012-05-19 02:50:37'),(45,15,22,'2012-05-19 02:56:36'),(46,15,22,'2012-05-19 03:01:42'),(47,15,22,'2012-05-19 03:02:20'),(48,15,22,'2012-05-19 03:22:10'),(49,15,22,'2012-05-19 03:22:28'),(50,15,22,'2012-05-19 03:22:54'),(51,15,22,'2012-05-19 03:23:13'),(52,15,22,'2012-05-19 03:35:51'),(53,15,22,'2012-05-19 03:37:01'),(54,15,22,'2012-05-19 03:38:46'),(55,15,22,'2012-05-19 06:35:26'),(56,15,22,'2012-05-19 06:37:17'),(57,15,22,'2012-05-19 06:56:54'),(58,15,22,'2012-05-19 06:57:56'),(59,15,22,'2012-05-19 06:58:58'),(60,15,22,'2012-05-19 07:00:01'),(61,15,22,'2012-05-19 07:24:19'),(62,15,22,'2012-05-19 07:27:11'),(63,15,22,'2012-05-19 07:27:56'),(64,15,22,'2012-05-19 07:32:41'),(65,15,22,'2012-05-19 07:33:01'),(66,15,22,'2012-05-19 07:36:33'),(67,15,22,'2012-05-19 07:36:51'),(68,15,22,'2012-05-19 18:49:05'),(69,15,22,'2012-05-19 18:49:48'),(70,15,22,'2012-05-19 19:30:16'),(71,15,22,'2012-05-19 19:45:56'),(72,15,22,'2012-05-19 19:49:51'),(73,15,22,'2012-05-19 20:03:59'),(74,15,22,'2012-05-19 20:13:03'),(75,15,22,'2012-05-19 20:14:33'),(76,15,22,'2012-05-19 20:14:59'),(77,15,22,'2012-05-19 20:17:46'),(78,15,22,'2012-05-19 20:20:14'),(79,15,22,'2012-05-19 20:20:50'),(80,15,22,'2012-05-19 20:21:44'),(81,15,22,'2012-05-19 20:22:52'),(82,15,22,'2012-05-19 20:23:50'),(83,15,22,'2012-05-19 20:24:31'),(84,15,22,'2012-05-19 20:25:45'),(85,15,22,'2012-05-19 20:29:29'),(86,15,22,'2012-05-19 20:37:02'),(87,15,22,'2012-05-19 23:33:58'),(88,15,22,'2012-05-19 23:36:36'),(89,15,22,'2012-05-19 23:37:33'),(90,15,22,'2012-05-19 23:48:41'),(91,15,22,'2012-05-19 23:51:23'),(92,15,22,'2012-05-19 23:54:36'),(93,15,22,'2012-05-20 00:09:15'),(94,15,22,'2012-05-20 00:19:13'),(95,15,22,'2012-05-20 02:14:47'),(96,15,22,'2012-05-20 02:15:01'),(97,15,22,'2012-05-20 03:52:20'),(98,15,22,'2012-05-20 03:52:56'),(99,15,22,'2012-05-20 03:53:47'),(100,15,22,'2012-05-20 03:54:09'),(101,15,22,'2012-05-20 04:09:48'),(102,15,22,'2012-05-20 04:10:40'),(103,15,22,'2012-05-20 05:37:18'),(104,15,22,'2012-05-20 18:30:26'),(105,15,22,'2012-05-20 19:51:30'),(106,15,22,'2012-05-20 22:22:24'),(107,15,22,'2012-05-20 22:24:59'),(108,15,22,'2012-05-20 23:43:06'),(109,15,22,'2012-05-21 02:05:46'),(110,15,22,'2012-05-21 02:06:38'),(111,15,22,'2012-05-21 02:08:23'),(112,15,22,'2012-05-21 05:38:29'),(113,15,22,'2012-05-21 05:38:38'),(114,15,22,'2012-05-21 17:04:06'),(115,15,22,'2012-05-21 17:26:49'),(116,15,22,'2012-05-21 17:27:53'),(117,15,22,'2012-05-22 19:49:38'),(118,15,22,'2012-05-22 19:56:00'),(119,15,22,'2012-05-23 19:44:51'),(120,15,22,'2012-05-23 20:12:59'),(121,15,22,'2012-05-23 22:37:34'),(122,15,22,'2012-05-23 22:42:59'),(123,15,22,'2012-05-23 22:47:43'),(124,15,22,'2012-05-23 22:48:08'),(125,15,22,'2012-05-23 22:50:49'),(126,15,22,'2012-05-23 22:57:15'),(127,15,22,'2012-05-23 22:58:55'),(128,15,22,'2012-05-23 23:05:26'),(129,15,22,'2012-05-23 23:52:19'),(130,15,22,'2012-05-24 03:59:15'),(131,15,22,'2012-05-24 03:59:42'),(132,15,22,'2012-05-24 04:29:28'),(133,15,22,'2012-05-24 04:41:16'),(134,15,22,'2012-05-24 04:42:47'),(135,15,22,'2012-05-24 17:17:56'),(136,15,22,'2012-05-24 19:51:25'),(137,15,22,'2012-05-24 20:04:46'),(154,15,22,'2012-05-28 23:55:53'),(157,15,22,'2012-05-29 23:59:58'),(158,15,22,'2012-05-30 03:26:20'),(159,15,22,'2012-05-31 00:06:43'),(188,15,22,'2012-06-03 04:57:48'),(191,15,22,'2012-06-04 17:31:51'),(225,15,19,'2012-06-05 22:58:43'),(226,15,19,'2012-06-06 00:09:15'),(227,15,19,'2012-06-06 00:09:15'),(228,15,22,'2012-10-22 20:06:01'),(229,15,22,'2012-10-24 01:36:17'),(230,15,22,'2012-10-24 01:36:39'),(231,15,22,'2012-10-24 03:13:21'),(232,15,22,'2012-10-24 03:13:40'),(233,15,22,'2012-10-24 03:19:28'),(234,15,22,'2012-10-24 03:22:12'),(235,15,22,'2012-10-24 03:25:23'),(236,15,22,'2012-10-24 03:34:59');
/*!40000 ALTER TABLE `checkin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classes`
--

DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `classes` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `gymid` int(40) NOT NULL,
  `service` varchar(50) CHARACTER SET utf8 NOT NULL,
  `price` int(10) NOT NULL,
  `datetime` datetime NOT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classes`
--

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES (1,22,'Karate',8,'2012-10-09 12:00:00',0),(2,22,'Karate',5,'2012-10-07 22:00:00',1),(7,22,'Yoga',10,'2012-10-15 14:00:00',1);
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disbursement`
--

DROP TABLE IF EXISTS `disbursement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `disbursement` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `gymid` int(40) NOT NULL,
  `type` int(10) NOT NULL,
  `paylimit` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disbursement`
--

LOCK TABLES `disbursement` WRITE;
/*!40000 ALTER TABLE `disbursement` DISABLE KEYS */;
INSERT INTO `disbursement` VALUES (1,17,1,300),(2,19,1,300),(3,22,1,300);
/*!40000 ALTER TABLE `disbursement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gymUsers`
--

DROP TABLE IF EXISTS `gymUsers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gymUsers`
--

LOCK TABLES `gymUsers` WRITE;
/*!40000 ALTER TABLE `gymUsers` DISABLE KEYS */;
INSERT INTO `gymUsers` VALUES (1,22,'f55644c9ea2568b07c40696a2bf7ad9d42f139f8','slap','1da8d60805bcc9e2b9f1f77221073763bf63f858','Trevor','Bossert',0,NULL),(2,22,'TqBie0RNewQnoXdf_jtZxG6BKinnbOtA2U4wNDexj-etLsVLjvO_gj822WDiPCyA','alanboss','1da8d60805bcc9e2b9f1f77221073763bf63f858','Trevor','Bossert',0,'2012-11-07 18:11:54'),(3,24,'XO5_BXDlzRFjgiGFOKbolun8hZcEzuFFetSzTD35l6_sa-IbeKgCDO0TysYXgI9N','test1','1da8d60805bcc9e2b9f1f77221073763bf63f858','undefined','undefined',0,NULL),(4,22,'Dy25ckjUxAx4ecvfJ1cx2K52e_3kdmAhWJMJlN0-MF-PoEq-Xo7GAlgdxDE4BALQ','tester','dc724af18fbdd4e59189f5fe768a5f8311527050','test','tester',0,'2012-11-08 04:27:59'),(5,26,'xAzfqQ8q5nrAyEyKPdADDu3aBvol4jm3TBopReBcsGKqr5o0OArJ49rn6DUEAA-S','undefined','5fa8d60805bcc9e2b9f1f77221073763bf63f858','Bob','Barker',0,NULL),(6,22,'x78W-zXKTkcGNJgVKGxxFxsmcEaVnLVrNxPOam2fPgMEhUKhVawppL-a5WwWdijh','justinGym','1de40e8ba6f90dd3db0a26f7596b74234e30a775','Justin','Bossert',0,'2012-10-17 19:10:35'),(7,29,'1lzIBeWdFsX0RIlipBnMKs9_3iKInlaulGb8eQA2vgdhhfT_5WPJQ6L-BMth5YVb','Jimmy','dc724af18fbdd4e59189f5fe768a5f8311527050','Jimmy','Buffet',0,NULL);
/*!40000 ALTER TABLE `gymUsers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gyms`
--

DROP TABLE IF EXISTS `gyms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gyms`
--

LOCK TABLES `gyms` WRITE;
/*!40000 ALTER TABLE `gyms` DISABLE KEYS */;
INSERT INTO `gyms` VALUES (1,'golds','1461 Creekside Dr','Walnut Creek','CA','94596','8054287760',0,'someone',0,'tbossert@zunefit.com',15,NULL,0),(2,'24 hour','3451 broad st.','San Luis Obispo','CA','93401','8054287760',0,'someone',0,'tbossert@zunefit.com',15,NULL,0),(17,'Kennedy Fitness','1461 Creekside Dr','Walnut Creek','SA','94596','8053329235',1,'someone',0,'tbossert@zunefit.com',15,NULL,0),(19,'Sanfords','3450 Broad St.','San Luis Obispo','CA','93401','8053329385',0,'someone',0,'tbossert@zunefit.com',15,NULL,0),(20,'undefined','','','','','',0,'someone',0,'tbossert@zunefit.com',15,NULL,0),(21,'KennedyFitness','','','','','',0,'someone',0,'tbossert@zunefit.com',15,NULL,0),(22,'KennedyFitness','3450 Broad St.','San Luis Obispo','CA','93401','8053329385',0,'someone',1,'tbossert@zunefit.com',15,500,0),(24,'test1','','','','','',0,NULL,0,NULL,0,0,0),(25,'testgym1','','','','','',0,NULL,0,NULL,0,500,0),(26,'','105 Seacliff Dr.','Shell Beach','CA','93449','3456789186',0,'Trevor',0,'apple@apple.com',0,0,0),(27,'19 Hour Fitness','','','','','',0,NULL,0,NULL,0,0,0),(28,'19 Hour Fitness','','','','','',0,NULL,0,NULL,0,0,0),(29,'19 Hour Fitness','305 Downey St.','New York','NY','90045','3456789186',0,'Trevor',1,'apple@apple.com',5,100,0);
/*!40000 ALTER TABLE `gyms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hours`
--

DROP TABLE IF EXISTS `hours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hours`
--

LOCK TABLES `hours` WRITE;
/*!40000 ALTER TABLE `hours` DISABLE KEYS */;
INSERT INTO `hours` VALUES (5,17,'8am-6pm','8am-6pm','8am-6pm','8am-6pm','8am-6pm','8am-6pm','8am-6pm'),(6,18,'undefined','undefined','undefined','undefined','undefined','undefined','undefined'),(7,19,'8am-5pm','8am-5pm','8am-5pm','8am-5pm','8am-5pm','8am-5pm','8am-5pm');
/*!40000 ALTER TABLE `hours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paymentmethod`
--

DROP TABLE IF EXISTS `paymentmethod`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paymentmethod` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `type` varchar(20) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paymentmethod`
--

LOCK TABLES `paymentmethod` WRITE;
/*!40000 ALTER TABLE `paymentmethod` DISABLE KEYS */;
/*!40000 ALTER TABLE `paymentmethod` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rewards`
--

DROP TABLE IF EXISTS `rewards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
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
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedule`
--

LOCK TABLES `schedule` WRITE;
/*!40000 ALTER TABLE `schedule` DISABLE KEYS */;
INSERT INTO `schedule` VALUES (6,15,22,1,5,0,0),(10,15,22,2,5,1,0),(11,15,22,7,5,0,0),(15,24,99,99,6,0,0),(16,24,99,99,6,0,0),(17,26,22,1,5,0,0),(18,26,22,2,5,0,0),(19,26,22,7,5,0,0),(20,26,22,99,5,0,0),(21,28,22,99,5,0,0),(22,28,22,7,5,0,0),(23,28,22,2,5,0,0),(24,28,22,1,5,0,0);
/*!40000 ALTER TABLE `schedule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stats`
--

DROP TABLE IF EXISTS `stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `stats` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `gymid` int(40) NOT NULL,
  `userid` int(40) NOT NULL,
  `type` int(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`),
  KEY `id_userid` (`userid`),
  KEY `id_type` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stats`
--

LOCK TABLES `stats` WRITE;
/*!40000 ALTER TABLE `stats` DISABLE KEYS */;
INSERT INTO `stats` VALUES (1,22,9,1),(2,22,9,0),(3,22,9,1),(4,22,10,0),(5,22,9,1);
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
  `userid` int(40) NOT NULL,
  `refid` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_userid` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,18,'sdsdsdfd43434346','0000-00-00 00:00:00'),(2,18,'sdsdsdfd43434346','0000-00-00 00:00:00'),(3,18,'sdsdsdfd43434346','2012-10-06 03:50:37'),(4,24,'5','2012-10-17 18:37:03');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `phone` varbinary(100) DEFAULT NULL,
  `mobile_token` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_webToken` (`web_token`),
  KEY `id_mobileToken` (`mobile_token`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (10,'π¶O—0™\nçÀRK(Â5à‘\Z7n«Ãç\"õˆH	®ÕA','trixie','plastic','ÏB;—\nj6»‹-!ÑU','Plymouth','MA','48756',NULL,1500,'2seu7EgykFK5AgIob8DsKM1AQizcm6xQ9CSXGsIluWkcyWoFL4MLVXnzWob3I1sO',NULL,'2012-04-29 21:16:20','7110eda4d09e062aa5e4a390b0a572ac0d2c0220','âπ\nhﬂÁ+ïïÿt¥&Ω‘',NULL),(12,'ZM‚Ä¶≈°HjV√é[¬∑√®√É[≈ì‚Ä¢‚Ä¢S8√ñ!‚ÄπD',NULL,NULL,NULL,NULL,NULL,NULL,NULL,100,'PCfXegug7OMZDgfoH37eQM8gXdMqk0VeGEHGK1KhK0f4Cy53ghnSg74OAnSYz12y',NULL,'2012-04-30 05:27:21',NULL,NULL,NULL),(14,'*√ÜOh√û¬ù‚Ä¶|¬ºw√Ω√°√¥√ë;‚Ä¢‚Ä¢S8√ñ!‚Ä','Trevor','Bossert',NULL,NULL,NULL,NULL,NULL,150,'splzUY59tUMPdqSTC5yNxqZniADuBwNg2TX2jQvLaajlb3Ti8PjWe-mRQV7zhUMM','2012-04-29 21:31:43','2012-04-29 21:31:43',NULL,NULL,NULL),(15,'∏≠âÔﬁE¬Òº,NåïïS8÷!ãD¯Ûä–é‡®','Trevor','Bossert','~Ÿv√\'|ÉO≠f√’#<L~~xøﬂb’Á∂◊Ù','Shell Beach','CA','93449',NULL,880,'p03AKqyiXREgfH7H2_0-viP6QS7p8r5sFdniCwOrddzkXsfP4JsKprgZj1exIFXH','2012-04-29 21:33:47','2012-10-20 22:26:25','7110eda4d09e062aa5e4a390b0a572ac0d2c0220','âπ\nhﬂÁ+ïïÿt¥&Ω‘','xdFiw37Gb2N9XjugZzPqovHHwC1FNaF5uSgVH7to4MDAfeZlIMdOOu1bINq219iZ'),(16,'Ô◊øªåÕ˜≥ÜoÛâxÌ⁄ŸÒ„◊ﬂÒ&äÅ»©','Daniel','Jensen',NULL,NULL,NULL,NULL,NULL,0,'Go69ecDIJ8rVM6ifYMnzQqyJNTqQd5NlgCaNW88WpMvofXLrZvDEknXmYpoD3z34','2012-05-14 20:18:30','2012-05-14 20:18:30','','0000000000',NULL),(17,'ZMÖöHjVŒ[∑Ë√[úïïS8÷!ãD¯Ûä–é‡®','Daniel','Jensen',NULL,NULL,NULL,NULL,NULL,0,'T66r-ujA77W6o2o0vi01V9pMOwh1S9hOIRVG5XhDLY7fGFdWtlObXSxPolw67Cp3','2012-06-07 02:14:17','2012-11-07 16:18:30',NULL,NULL,'W1E9EZD0YacxyEyCkSWFd0tdOp1f4AN8OWvTasYopb0au5UfdUwnnXkmKdm5EDXu'),(18,'¨UÕ{Iœ?ÍpÖa™áâŸ\"iº‘ëbûòU. ¬yÆï\'','Trevor','Bossert',NULL,NULL,NULL,NULL,NULL,174,'1aPCzFU8Ox5oPOLus6uCpweZ3qzGF0rkaQrGuHV3bXh15cBOenVes2JN1TOn71Dk','2012-06-19 01:05:02','2012-11-07 18:11:14',NULL,'9254571987',NULL),(19,'√˚w«9ßu1Ù…TÆR˝ÙàƒEñ>˘¢	K≥P≈Û†','Ravi','Makhija',NULL,NULL,NULL,NULL,NULL,0,'0SLOjxu3Sb4L-VS5wAnFKxnGoQYTiuA937cnOCm1ddluKiMCfMpdTK6gpjfiAgOc','2012-08-04 08:45:27','2012-08-04 08:45:27',NULL,NULL,NULL),(20,'m›@Ï`≤ôÃµè¿a~T˘∫}“<NÆ&Aæ‡Ÿ','Parth','Bhatt',NULL,NULL,NULL,NULL,NULL,0,'KZtoKfBNLxyXcwdNl6mEJTQezl4L6Ek76oitRqup1ICrbDLvXqIlzDT3v7INA7ff','2012-08-07 18:34:06','2012-08-30 17:31:05',NULL,NULL,NULL),(21,'\\ÅÖMÃÂ¸v˝z·ïa√ÙàƒEñ>˘¢	K≥P≈Û†','Santa','Banta',NULL,NULL,NULL,NULL,NULL,0,'6nrWM6_hCQf0fTcUrpXvjIHz4cswg8DnooueokjQ5SGIzqwmOiYEORNDU_fIueIS','2012-08-15 18:47:36','2012-08-28 18:31:25',NULL,NULL,NULL),(22,'CYˇ˙áïZ≥H+áH5@ﬁFœìΩÃç„cQ@)Ñ','Mangu','Hingala',NULL,NULL,NULL,NULL,NULL,0,'VikZAi0wWcKd1T8MFAV2zWIY4zkpmQpY_ALoEe6Rl3vY5v1E52dy4PiZRnUtS-Ao','2012-08-30 17:28:06','2012-09-10 19:09:41',NULL,NULL,NULL),(23,'ÈÓ#99Ï}ü\nQ˛™JB¥@Q∆XÙUÚ}`Ω-∆ˆ','Monzoor','Tamal',NULL,NULL,NULL,NULL,NULL,0,'UfZ5hNKozVAAWkrxronaz6gS7tmXPHNto4Baa__1Sy7GjDIR5VOnHCTJ8gRlwgXI','2012-08-31 17:19:37','2012-08-31 17:19:37',NULL,NULL,NULL),(24,'jbossert@zunefit.com','Justin','Bossert','3701 County Road 633','Grawn','MI','49637',NULL,0,'bbzfqQ8q5nrAyEyKPdADDu3aBvol4jm3TBopReBcsGKqr5o0OArJ49rn6DUEAA-S','2012-10-14 19:38:05','2012-10-14 19:38:05','1234','û6T◊enä∏˛Ù#§™∏',NULL),(25,'5ÂßxBU[O‰á°{DM,YæAŸ∏j∫?ü4','undefined','undefined',NULL,NULL,NULL,NULL,NULL,0,'gj5hL0IXLfpKCs_jRdviITat2lwPnOjIUPtrVICpWy2OrnD9DEFAMBda-DY1Hx04','2012-10-19 15:00:56','2012-10-19 15:00:56',NULL,NULL,NULL),(26,'Q65Êëı∑bMõÆGÖ∂ïïS8÷!ãD¯Ûä–é‡®','Lasitha','Gunawardena',NULL,NULL,NULL,NULL,NULL,0,'ledMtHIP-nLMbkiebxaM468h6Q60nm4tvCaZLV9CyrbZBlIWdgfaKdATAAXsaVWo','2012-10-22 17:14:16','2012-11-06 18:09:32',NULL,NULL,NULL),(27,'4f~£i‹=øˇ˛[∏¨ïïS8÷!ãD¯Ûä–é‡®','gota','same',NULL,NULL,NULL,NULL,NULL,0,'WPN6w2U0BhU083s9z5jid0xoZp5p8KT0v7B8KOl2ccjzrL83Z2My_c6UGJHz-kOz','2012-10-23 03:12:02','2012-10-28 01:56:31',NULL,NULL,NULL),(28,'Õµj¸†Öÿ/ÓqŒ¨ˇoY\"iº‘ëbûòU. ¬yÆï\'','Tanushka','Balasooriya',NULL,NULL,NULL,NULL,NULL,0,'yypBeABOS0yZ9FTbUolQREaZwFu4rqXApAyTDEFPnupC9sunxLzy9M0dWrFExhZZ','2012-10-23 03:12:15','2012-11-09 04:50:54',NULL,NULL,NULL);
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

-- Dump completed on 2012-11-09 20:47:09
