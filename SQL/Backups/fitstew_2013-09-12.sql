# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 127.0.0.1 (MySQL 5.5.25)
# Database: fitstew
# Generation Time: 2013-09-12 23:45:07 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;



--
-- Dumping routines (PROCEDURE) for database 'fitstew'
--
DELIMITER ;;

# Dump of PROCEDURE addEvent
# ------------------------------------------------------------

/*!50003 DROP PROCEDURE IF EXISTS `addEvent` */;;
/*!50003 SET SESSION SQL_MODE=""*/;;
/*!50003 CREATE*/ /*!50020 DEFINER=`root`@`localhost`*/ /*!50003 PROCEDURE `addEvent`(IN uID int(11), IN price DECIMAL(10,2), IN scID int(11), IN gymid int(10), IN dateTime datetime)
BEGIN
 
 
DECLARE transMess varchar(100);
DECLARE sID int(11);
DECLARE EXIT HANDLER FOR SQLEXCEPTION,NOT FOUND,SQLWARNING
BEGIN
  ROLLBACK;
  SELECT transMess;
  
END;
 

START TRANSACTION;
SET transMess= "unable to add class";
INSERT INTO uBillingAudit (uid,action,amount,timestamp) VALUES(uID,0,price,NOW());
IF ROW_COUNT() > 0 THEN
	INSERT INTO schedule (userid,gymid,sclassid,price,datetime) VALUES(uID,gymid,scID,price,dateTime);
    IF ROW_COUNT() < 1 THEN
        SET transMess = "class already scheduled";
        ROLLBACK;
    ELSE
		SET sID = LAST_INSERT_ID();
		UPDATE users u INNER JOIN schedule s ON u.id = s.userid SET u.balance = u.balance - s.price WHERE u.id = uID AND s.id = sID AND u.balance - s.price >= 0;
		IF ROW_COUNT() < 1 THEN
			SET transMess = "insufficient balance";
			ROLLBACK;
		ELSE
			UPDATE gymBilling gb INNER JOIN schedule s ON gb.gid = s.gymid INNER JOIN gyms g ON g.id = gb.gid SET zcom = gb.zcom + round(s.price * g.commission/100,2), gb.balance = gb.balance + round(s.price - s.price * g.commission/100,2) WHERE gb.gid = gymid AND s.id = sID;
			IF ROW_COUNT() < 1 THEN
				SET transMess = "unable to update gymBilling table";
				ROLLBACK;
			ELSE
				SET transMess = sID; 
			END IF;
		END IF;
	END IF;
ELSE
    SET transMess = "unable to update uBillingAudit table";
    ROLLBACK;
END IF;

SELECT transMess;
COMMIT;


END */;;

/*!50003 SET SESSION SQL_MODE=@OLD_SQL_MODE */;;
# Dump of PROCEDURE deleteEvent
# ------------------------------------------------------------

/*!50003 DROP PROCEDURE IF EXISTS `deleteEvent` */;;
/*!50003 SET SESSION SQL_MODE=""*/;;
/*!50003 CREATE*/ /*!50020 DEFINER=`root`@`localhost`*/ /*!50003 PROCEDURE `deleteEvent`(IN uID int(11), IN sID int(11), OUT transMess VARCHAR(100))
BEGIN


DECLARE EXIT HANDLER FOR SQLEXCEPTION,NOT FOUND,SQLWARNING
BEGIN
  ROLLBACK;
  SELECT transMess;
  
END;

SET transMess = "unable to delete event";
START TRANSACTION;
UPDATE users u INNER JOIN schedule s ON u.id = s.userid SET u.balance = u.balance + s.price WHERE s.id = sID AND s.userid = uID;
IF ROW_COUNT() > 0 THEN
	INSERT INTO eventAudit (gid,com,paid,type,sid) SELECT s.gymid AS gymid,round(s.price * g.commission/100,2) AS com,s.price - round(s.price * g.commission/100,2) AS paid,2 AS type,sID AS sid FROM gyms g INNER JOIN schedule s ON g.id = s.gymid WHERE s.id = sID;
	IF ROW_COUNT() < 1 THEN
		SET transMess = "unable to update audit table";
		ROLLBACK;
	ELSE		
		UPDATE gymBilling gb INNER JOIN schedule s ON gb.gid = s.gymid INNER JOIN gyms g ON g.id = gb.gid SET zcom = gb.zcom - round(s.price * g.commission/100,2), gb.balance = gb.balance - s.price - round(s.price * g.commission/100,2) WHERE gb.gid = s.gymid AND s.id = sID;
		IF ROW_COUNT() < 1 THEN
			SET transMess = "unable to update gymBilling table";
			ROLLBACK;
		ELSE
			DELETE s FROM schedule s INNER JOIN users u ON s.userid = u.id WHERE s.id = sID;
			IF ROW_COUNT() > 0 THEN
				SET transMess = sID;
			ELSE
				SET transMess = "unable to delete from schedule table";
				ROLLBACK;
			END IF;
		END IF;
	END IF;
ELSE
	SET transMess = "unable to update users table";
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
			SET transMess = "unable to update gymBilling table";
		END IF;
	ELSE
		SET transMess = "Unable to update gBillingAudit table";
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
/*!50003 CREATE*/ /*!50020 DEFINER=`root`@`localhost`*/ /*!50003 PROCEDURE `refillBalance`(IN uID INT(11), IN cToken VARCHAR(50))
BEGIN
 
 

DECLARE transMess VARCHAR(100);
DECLARE EXIT HANDLER FOR SQLEXCEPTION,NOT FOUND,SQLWARNING
BEGIN
  ROLLBACK;
  SELECT transMess;  
END;

START TRANSACTION;
SET transMess = "unable to refill balance";
UPDATE users u INNER JOIN balance b ON u.id = b.userid SET u.balance = u.balance + b.refillamount WHERE automatic = 1 AND u.balance < b.minamount AND u.id = uID;
IF ROW_COUNT() > 0 THEN
	INSERT INTO uBillingAudit (uid,action,amount,timestamp,cToken) SELECT u.id,2,b.refillamount,NOW(),cToken FROM users u INNER JOIN balance b ON u.id = b.userid WHERE u.id = uID;
	IF ROW_COUNT() < 1 THEN
		SET transMess = "unable to update uBillingAudit table";
		ROLLBACK;
	ELSE
		SET transMess = uID;
	END IF;
ELSE
	SET transMess = "unable to update users table";
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
