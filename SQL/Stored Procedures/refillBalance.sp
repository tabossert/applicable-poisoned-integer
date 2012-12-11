-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- --------------------------------------------------------------------------------
DELIMITER $$
 
CREATE DEFINER=`root`@`localhost` PROCEDURE `refillBalance`(IN ltype VARCHAR(15), IN token VARCHAR(100))
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

END