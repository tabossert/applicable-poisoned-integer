# ************************************************************
# Sequel Pro SQL dump
# Version 3408
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 127.0.0.1 (MySQL 5.1.61)
# Database: zunefit
# Generation Time: 2012-12-19 02:33:50 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table adminUsers
# ------------------------------------------------------------

DROP TABLE IF EXISTS `adminUsers`;

CREATE TABLE `adminUsers` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `userid` int(10) NOT NULL,
  `password` varbinary(50) NOT NULL DEFAULT '',
  `token` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_userid` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table balance
# ------------------------------------------------------------

DROP TABLE IF EXISTS `balance`;

CREATE TABLE `balance` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `userid` int(10) NOT NULL,
  `automatic` tinyint(1) NOT NULL DEFAULT '0',
  `refillamount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `schedule` int(2) DEFAULT NULL,
  `minamount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cToken` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_userid` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table checkin
# ------------------------------------------------------------

DROP TABLE IF EXISTS `checkin`;

CREATE TABLE `checkin` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userid` int(10) NOT NULL,
  `gymid` int(10) NOT NULL,
  `datetime` datetime NOT NULL,
  `scheduleid` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_scheduleid_userid` (`scheduleid`,`userid`),
  KEY `id_userid` (`userid`),
  KEY `id_gymid` (`gymid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table classes
# ------------------------------------------------------------

DROP TABLE IF EXISTS `classes`;

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
  `spots` int(3) NOT NULL DEFAULT '100',
  `featured` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table disbursement
# ------------------------------------------------------------

DROP TABLE IF EXISTS `disbursement`;

CREATE TABLE `disbursement` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `type` int(10) NOT NULL,
  `paylimit` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table gBillingAudit
# ------------------------------------------------------------

DROP TABLE IF EXISTS `gBillingAudit`;

CREATE TABLE `gBillingAudit` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `gid` int(10) NOT NULL,
  `action` int(2) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gid` (`gid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table gymBilling
# ------------------------------------------------------------

DROP TABLE IF EXISTS `gymBilling`;

CREATE TABLE `gymBilling` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gid` int(10) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `zcom` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gid` (`gid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table gyms
# ------------------------------------------------------------

DROP TABLE IF EXISTS `gyms`;

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
  `rate` decimal(10,2) DEFAULT '0.00',
  `enabled` tinyint(1) NOT NULL DEFAULT '0',
  `commission` decimal(10,2) NOT NULL DEFAULT '2.25',
  `image` varchar(150) COLLATE utf8_bin DEFAULT NULL,
  `facebook` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `twitter` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `googleplus` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `url` varchar(200) COLLATE utf8_bin DEFAULT NULL,
  `balance` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_zipcode` (`zipcode`),
  KEY `id_city` (`city`),
  KEY `id_state` (`state`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table gymTags
# ------------------------------------------------------------

DROP TABLE IF EXISTS `gymTags`;

CREATE TABLE `gymTags` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `tag` varchar(25) COLLATE utf8_bin NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `udx_gymid_tag` (`gymid`,`tag`),
  KEY `id_gymid` (`gymid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table gymUsers
# ------------------------------------------------------------

DROP TABLE IF EXISTS `gymUsers`;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table hours
# ------------------------------------------------------------

DROP TABLE IF EXISTS `hours`;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table messages
# ------------------------------------------------------------

DROP TABLE IF EXISTS `messages`;

CREATE TABLE `messages` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `message` varchar(50) COLLATE utf8_bin NOT NULL DEFAULT '',
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table paymentmethod
# ------------------------------------------------------------

DROP TABLE IF EXISTS `paymentmethod`;

CREATE TABLE `paymentmethod` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `type` varchar(20) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table rewards
# ------------------------------------------------------------

DROP TABLE IF EXISTS `rewards`;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table schedule
# ------------------------------------------------------------

DROP TABLE IF EXISTS `schedule`;

CREATE TABLE `schedule` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userid` int(10) NOT NULL,
  `gymid` int(10) NOT NULL,
  `classid` int(10) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_userid_classid_datetime` (`userid`,`classid`,`datetime`),
  KEY `id_userid` (`userid`),
  KEY `id_gymid` (`gymid`),
  KEY `id_classid` (`classid`),
  KEY `id_classid_datetime` (`classid`,`datetime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table stats
# ------------------------------------------------------------

DROP TABLE IF EXISTS `stats`;

CREATE TABLE `stats` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `gymid` int(10) NOT NULL,
  `userid` int(10) NOT NULL,
  `type` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_gymid` (`gymid`),
  KEY `id_userid` (`userid`),
  KEY `id_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table transactions
# ------------------------------------------------------------

DROP TABLE IF EXISTS `transactions`;

CREATE TABLE `transactions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userid` int(10) NOT NULL,
  `refid` varchar(50) COLLATE utf8_bin NOT NULL DEFAULT '',
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_refid` (`refid`),
  KEY `id_userid` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table uBillingAudit
# ------------------------------------------------------------

DROP TABLE IF EXISTS `uBillingAudit`;

CREATE TABLE `uBillingAudit` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `uid` int(10) NOT NULL,
  `action` int(2) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `email` varbinary(50) NOT NULL DEFAULT '',
  `first_name` varchar(15) COLLATE utf8_bin DEFAULT NULL,
  `last_name` varchar(15) COLLATE utf8_bin DEFAULT NULL,
  `address` varbinary(100) DEFAULT NULL,
  `city` varchar(25) COLLATE utf8_bin DEFAULT NULL,
  `state` varchar(2) COLLATE utf8_bin DEFAULT NULL,
  `zipcode` varchar(5) COLLATE utf8_bin DEFAULT NULL,
  `paymentid` int(10) DEFAULT NULL,
  `balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `web_token` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `lastlogin` datetime DEFAULT NULL,
  `pincode` varchar(50) COLLATE utf8_bin DEFAULT NULL,
  `phone` varbinary(100) DEFAULT NULL,
  `mobile_token` varchar(100) COLLATE utf8_bin DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `address2` varbinary(100) DEFAULT NULL,
  `last_message` int(5) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id_webToken` (`web_token`),
  KEY `id_mobileToken` (`mobile_token`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_bin;




--
-- Dumping routines (PROCEDURE) for database 'zunefit'
--
DELIMITER ;;

# Dump of PROCEDURE addEvent
# ------------------------------------------------------------

/*!50003 DROP PROCEDURE IF EXISTS `addEvent` */;;
/*!50003 SET SESSION SQL_MODE=""*/;;
/*!50003 CREATE*/ /*!50020 DEFINER=`root`@`localhost`*/ /*!50003 PROCEDURE `addEvent`(IN ltype VARCHAR(15), IN token VARCHAR(100), IN price DECIMAL(10,2), IN classid int(11), IN gymid int(10), IN dateTime datetime)
BEGIN
 
 
DECLARE sID int(11);
DECLARE transMess varchar(100);
DECLARE EXIT HANDLER FOR SQLEXCEPTION,NOT FOUND,SQLWARNING
BEGIN
  ROLLBACK;
  SELECT transMess;
  -- ERROR
END;
 
SET transMess = CONCAT('"status": "failed", "message": "unable to add event1"');
START TRANSACTION;
SET @price = price;
SET @aQuery = CONCAT('INSERT INTO uBillingAudit (uid,action,amount,timestamp) SELECT id,0,?,NOW() FROM users WHERE ',ltype,'_token = "', token,'"');
PREPARE pQuery FROM @aQuery;
EXECUTE pQuery USING @price; 
IF ROW_COUNT() > 0 THEN
    SET @gymid = gymid;
    SET @classid = classid;
    SET @price = price;
    SET @dateTime = dateTime;
    SET @aQuery = CONCAT('INSERT INTO schedule (userid,gymid,classid,price,datetime) SELECT id,?,?,?,? FROM users WHERE ',ltype,'_token = "',token,'"');
    PREPARE pQuery FROM @aQuery;
    EXECUTE pQuery USING @gymid,@classid,@price,@dateTime;
    IF ROW_COUNT() < 1 THEN
        SET transMess = CONCAT('"status": "failed", "message": "unable to add event2"');
        ROLLBACK;
    ELSE
		SET sID = LAST_INSERT_ID();
		SET @sID = sID;
		SET @aQuery = CONCAT('UPDATE users u INNER JOIN schedule s ON u.id = s.userid SET u.balance = u.balance - s.price WHERE ',ltype,'_token = "',token,'" AND s.id = ? AND u.balance - s.price >= 0');
		PREPARE pQuery FROM @aQuery;
		EXECUTE pQuery USING @sID;
		IF ROW_COUNT() < 1 THEN
			SET transMess = CONCAT('"status": "failed", "message": "insufficient balance"');
			ROLLBACK;
		ELSE
			SET @sID = sID;
			SET @gymid = gymid;
			SET @aQuery = CONCAT('UPDATE gymBilling gb INNER JOIN schedule s ON gb.gid = s.gymid INNER JOIN gyms g ON g.id = gb.gid SET zcom = gb.zcom + round(s.price * g.commission/100,2), gb.balance = gb.balance + round(s.price - s.price * g.commission/100,2) WHERE gb.gid = ? AND s.id = ?');
			PREPARE pQuery FROM @aQuery;
			EXECUTE pQuery USING @gymid,@sID;
			IF ROW_COUNT() < 1 THEN
				SET transMess = CONCAT('"status": "failed", "message": "unable to add event3"');
				ROLLBACK;
			ELSE
				CALL refillBalance(ltype, token);
				SET transMess = CONCAT('"status": "success", "sid": ', sID); 
			END IF;
		END IF;
	END IF;
ELSE
    SET transMess = CONCAT('"status": "failed", "message": "invalid token"');
    ROLLBACK;
END IF;
 
SELECT transMess;
COMMIT;

END */;;

/*!50003 SET SESSION SQL_MODE=@OLD_SQL_MODE */;;
# Dump of PROCEDURE checkin
# ------------------------------------------------------------

/*!50003 DROP PROCEDURE IF EXISTS `checkin` */;;
/*!50003 SET SESSION SQL_MODE=""*/;;
/*!50003 CREATE*/ /*!50020 DEFINER=`root`@`localhost`*/ /*!50003 PROCEDURE `checkin`(IN phoneNum VARCHAR(10), IN pin VARCHAR(50), IN gymid int(10), IN dateTime datetime)
BEGIN

DECLARE transMess VARCHAR(100);
DECLARE uid INT;
DECLARE sid INT;
DECLARE EXIT HANDLER FOR SQLEXCEPTION,SQLWARNING
BEGIN
  ROLLBACK;
  SELECT transMess;
  -- ERROR
END;


START TRANSACTION;

SET transMess = "invalid phone/pincode";
SELECT u.id INTO uid FROM users u WHERE phone = AES_ENCRYPT(phoneNum,'oniud9duhfd&bhsdbds&&%bdudbds5;odnonoiusdbuyd$') AND u.pincode = pin;
IF FOUND_ROWS() > 0 THEN
	SET transMess = "no scheduled activity";
	SELECT s.id INTO sid FROM users u INNER JOIN schedule s ON u.id = s.userid WHERE u.id = uid AND s.datetime >= NOW() AND s.datetime <= NOW() + INTERVAL 30 MINUTE ORDER BY s.datetime LIMIT 1;
	IF FOUND_ROWS() < 1 THEN
		SELECT s.id INTO sid FROM users u INNER JOIN schedule s ON u.id = s.userid WHERE u.id = uid AND DATE(s.datetime) = DATE(dateTime) AND c.daypass = 1 ORDER BY s.datetime LIMIT 1;
		IF FOUND_ROWS() < 1 THEN
			ROLLBACK;
		END IF;
	END IF;
	set transMess = "already checked in";
	INSERT INTO checkin (userid,gymid,datetime,scheduleid) VALUES (uid,gymid,NOW(),sid);
	IF ROW_COUNT() < 1 THEN
		set transMess = "checkin failed";
		ROLLBACK;
	END IF;
ELSE
	set transMess = "invalid phone/pincode";
	ROLLBACK;
END IF;

COMMIT;
SET transMess = "success";
SELECT transMess;
END */;;

/*!50003 SET SESSION SQL_MODE=@OLD_SQL_MODE */;;
# Dump of PROCEDURE deleteEvent
# ------------------------------------------------------------

/*!50003 DROP PROCEDURE IF EXISTS `deleteEvent` */;;
/*!50003 SET SESSION SQL_MODE=""*/;;
/*!50003 CREATE*/ /*!50020 DEFINER=`root`@`localhost`*/ /*!50003 PROCEDURE `deleteEvent`(IN ltype VARCHAR(15), IN token VARCHAR(100), IN sid int(11))
BEGIN



DECLARE transMess VARCHAR(100);
DECLARE EXIT HANDLER FOR SQLEXCEPTION,NOT FOUND,SQLWARNING
BEGIN
  ROLLBACK;
  SELECT transMess;
  -- ERROR
END;

SET transMess = "unable to delete event";
START TRANSACTION;

SET @sid = sid;
SET @aQuery = CONCAT('UPDATE users u INNER JOIN schedule s ON u.id = s.userid SET u.balance = u.balance + s.price WHERE s.id = ? AND ',ltype,'_token = "',token,'"');
PREPARE pQuery FROM @aQuery;
EXECUTE pQuery USING @sid; 
IF ROW_COUNT() > 0 THEN
	SET @sID = sID;
	SET @aQuery = CONCAT('UPDATE gymBilling gb INNER JOIN schedule s ON gb.gid = s.gymid INNER JOIN gyms g ON g.id = gb.gid SET zcom = gb.balance + round(s.price * g.commission/100,2), gb.balance = gb.balance + round(s.price + s.price * g.commission/100,2) WHERE gb.gid = s.gymid AND s.id = ?');
	PREPARE pQuery FROM @aQuery;
	EXECUTE pQuery USING @sID;
	IF ROW_COUNT() < 1 THEN
		SET transMess = "unable to delete event";
		ROLLBACK;
	ELSE
		SET @sID = sID;
		SET @aQuery = CONCAT('DELETE s FROM schedule s INNER JOIN users u ON s.userid = u.id WHERE s.id = ? AND u.',ltype,'_token = "',token,'"');
		PREPARE pQuery FROM @aQuery;
		EXECUTE pQuery USING @sID;
		IF ROW_COUNT() > 0 THEN
			SET transMess = "success";
			ROLLBACK;
		END IF;
	END IF;
ELSE
	SET transMess = "invalid token or activity does not exist";
	ROLLBACK;
END IF;


COMMIT;

SELECT transMess;
END */;;

/*!50003 SET SESSION SQL_MODE=@OLD_SQL_MODE */;;
# Dump of PROCEDURE processBilling
# ------------------------------------------------------------

/*!50003 DROP PROCEDURE IF EXISTS `processBilling` */;;
/*!50003 SET SESSION SQL_MODE=""*/;;
/*!50003 CREATE*/ /*!50020 DEFINER=`root`@`localhost`*/ /*!50003 PROCEDURE `processBilling`(IN token VARCHAR(100), IN gymid int(11), IN paction int(11), IN amount DECIMAL(10,2))
BEGIN

DECLARE transMess VARCHAR(100);
DECLARE EXIT HANDLER FOR SQLEXCEPTION,NOT FOUND,SQLWARNING
BEGIN
  ROLLBACK;
  SELECT transMess;
  -- ERROR
END;

START TRANSACTION;


SELECT id FROM adminUsers WHERE token = token;
IF FOUND_ROWS() > 0 THEN
	INSERT INTO gBillingAudit (gid,action,amount,timestamp) VALUES (gymid,paction,amount,NOW());
	IF ROW_COUNT() > 0 THEN
		UPDATE gymBilling set balance = balance - amount WHERE gid = gymid;
		IF ROW_COUNT() > 0 THEN
			SET transMess = "success";
		ELSE
			SET transMess = "update failed1";
		END IF;
	ELSE
		SET transMess = "update failed2";
		ROLLBACK;
	END IF;

ELSE
	SET transMess = "invalid token";
	ROLLBACK;
END IF;

COMMIT;
SELECT transMess;

END */;;

/*!50003 SET SESSION SQL_MODE=@OLD_SQL_MODE */;;
# Dump of PROCEDURE refillBalance
# ------------------------------------------------------------

/*!50003 DROP PROCEDURE IF EXISTS `refillBalance` */;;
/*!50003 SET SESSION SQL_MODE=""*/;;
/*!50003 CREATE*/ /*!50020 DEFINER=`root`@`localhost`*/ /*!50003 PROCEDURE `refillBalance`(IN ltype VARCHAR(15), IN token VARCHAR(100))
BEGIN
 
 


DECLARE EXIT HANDLER FOR SQLEXCEPTION,NOT FOUND,SQLWARNING
BEGIN
  ROLLBACK;
  -- ERROR
END;

START TRANSACTION;

SET @aQuery = CONCAT('UPDATE users u INNER JOIN balance b ON u.id = b.userid SET u.balance = u.balance + b.refillamount WHERE automatic = 1 AND u.balance < b.minamount AND ',ltype,'_token = "',token,'"');
PREPARE pQuery FROM @aQuery;
EXECUTE pQuery;
IF ROW_COUNT() > 0 THEN
	SET @aQuery = CONCAT('INSERT INTO uBillingAudit (uid,action,amount,timestamp) SELECT u.id,2,b.refillamount,NOW() FROM users u INNER JOIN balance b ON u.id = b.userid WHERE ',ltype,'_token = "', token,'"');
	PREPARE pQuery FROM @aQuery;
	EXECUTE pQuery;
	IF ROW_COUNT() < 1 THEN
		ROLLBACK;
	END IF;
ELSE
	ROLLBACK;
END IF;

COMMIT;

END */;;

/*!50003 SET SESSION SQL_MODE=@OLD_SQL_MODE */;;
DELIMITER ;

/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
