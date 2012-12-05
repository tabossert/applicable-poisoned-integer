-- --------------------------------------------------------------------------------
-- Routine DDL
-- Note: comments before and after the routine body will not be stored by the server
-- --------------------------------------------------------------------------------
DELIMITER $$

CREATE DEFINER=`root`@`localhost` PROCEDURE `addEvent`(IN token  VARCHAR(100), IN price int(5), IN classid int(11), IN gymid int(11), IN dateTime datetime)
BEGIN


DECLARE sID int(11);
DECLARE transMess varchar(100);
DECLARE EXIT HANDLER FOR SQLEXCEPTION,NOT FOUND,SQLWARNING
BEGIN
  ROLLBACK;
  SELECT transMess;
  -- ERROR
END;


START TRANSACTION;

SET transMess = "success";
INSERT INTO uBillingAudit (uid,action,amount,timestamp) SELECT id,0,price,NOW() FROM users WHERE web_token = token;
IF ROW_COUNT() > 0 THEN

	INSERT INTO schedule (userid,gymid,classid,price,datetime) SELECT id,gymid,classid,price,dateTime FROM users WHERE web_token = token;
	IF ROW_COUNT() < 1 THEN
		SET transMess = "unable to add event";
		ROLLBACK;
	END IF;

	SET sID = LAST_INSERT_ID();
	UPDATE users u INNER JOIN schedule s ON u.id = s.userid SET u.balance = u.balance - s.price WHERE web_token = token AND s.id = sID AND u.balance - s.price >= 0;
	IF ROW_COUNT() < 1 THEN
		SET transMess = "insufficient balance";
		ROLLBACK;
	END IF;
    
	UPDATE gymBilling gb INNER JOIN schedule s ON gb.gid = s.gymid INNER JOIN gyms g ON g.id = gb.gid SET zcom = gb.balance + round(s.price * g.commission/100,2), gb.balance = gb.balance + round(s.price - s.price * g.commission/100,2) WHERE gb.gid = gymid AND s.id = sID;
	IF ROW_COUNT() < 1 THEN
		SET transMess = "unable to add event";
		ROLLBACK;
	END IF;
ELSE
	SET transMess = "unable to add event";
	ROLLBACK;
END IF;

COMMIT;

SELECT transMess;
END