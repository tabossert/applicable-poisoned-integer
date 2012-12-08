-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- --------------------------------------------------------------------------------
DELIMITER $$

CREATE DEFINER=`root`@`localhost` PROCEDURE `processBilling`(IN token VARCHAR(100), IN gymid int(11), IN paction int(11), IN amount DECIMAL(10,2))
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

END