-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- --------------------------------------------------------------------------------
DELIMITER $$

CREATE DEFINER=`root`@`localhost` PROCEDURE `deleteEvent`(IN ltype VARCHAR(15), IN token VARCHAR(100), IN sid int(11))
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
END