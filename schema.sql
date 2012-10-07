SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Table structure for table `gyms`
--

CREATE TABLE IF NOT EXISTS `gyms` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) COLLATE utf8_bin NOT NULL,
  `address` varchar(50) COLLATE utf8_bin NULL,
  `city` varchar(25) COLLATE utf8_general_ci NULL,
  `state` varchar(2) COLLATE utf8_general_ci NULL,
  `zipcode` varchar(5) NULL,
  `phone` varchar(15) NULL,
  `contact` varchar(30) COLLATE utf8_bin NULL,
  `featured` boolean DEFAULT FALSE NOT NULL,
  `complete` boolean DEFAULT FALSE NOT NULL,
  `token` varchar(30) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE idx_username (username),
  INDEX id_featured (featured),
  UNIQUE idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Table structure for table `gymUsers`
--
CREATE TABLE IF NOT EXISTS `gymUsers` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `gymid` int(40) NOT NULL,
  `token` varchar(50) COLLATE utf8_bin NOT NULL,
  `username` varchar(30) COLLATE utf8_bin NOT NULL,
  `password` varbinary(30) NOT NULL,
  `first_name` varchar(25) COLLATE utf8_general_ci NOT NULL,
  `last_name` varchar(25) COLLATE utf8_general_ci NOT NULL,
  `groupid` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX id_gymid (gymid),
  UNIQUE idx_username (username),
  INDEX id_group (groupid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


--
-- Table structure for table `hours`
--

CREATE TABLE IF NOT EXISTS `hours` (
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
  UNIQUE idx_gymid (gymid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


--
-- Table structure for table `classes`
--
CREATE TABLE IF NOT EXISTS `classes` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `gymid` int(40) NOT NULL,
  `service` varchar(50) COLLATE utf8_general_ci NOT NULL,
  `price` int(10) NOT NULL,
  `datetime` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE idx_gymid (gymid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



--
-- Table structure for table `users`
--
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `email` varbinary(40) NOT NULL,
  `first_name` varchar(20) COLLATE utf8_bin NULL,
  `last_name` varchar(20) COLLATE utf8_bin NULL,
  `address` varbinary(50) NULL,
  `city` varchar(25) COLLATE utf8_bin NULL,
  `state` varchar(2) COLLATE utf8_bin NULL,
  `zipcode` varchar(5) COLLATE utf8_bin NULL,
  `paymentid` int(20) NULL,
  PRIMARY KEY (`id`),
  UNIQUE idx_email (email),
  UNIQUE idx_paymentid (paymentid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


--
-- Table structure for table `balance`
--
CREATE TABLE IF NOT EXISTS `balance` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `userid` int(40) NOT NULL,
  `amount` varbinary(20) NOT NULL DEFAULT 0,
  `automatic` boolean DEFAULT FALSE NOT NULL,
  `refillamount` varchar(20) COLLATE utf8_bin NOT NULL,
  `schedule` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE idx_userid (userid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


--
-- Table structure for table `schedule`
--
CREATE TABLE IF NOT EXISTS `schedule` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `userid` int(40) NOT NULL,
  `gymid` int(40) NOT NULL,
  `classid` int(40) NOT NULL,
  `price` int(10) NOT NULL,
  `redeemed` boolean DEFAULT FALSE NOT NULL,
  `paidout` boolean DEFAULT FALSE NOT NULL,
  PRIMARY KEY (`id`),
  INDEX id_userid (userid),
  INDEX id_classid (classid),
  INDEX id_gymid (gymid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


--
-- Table structure for table `disbursement`
--
CREATE TABLE IF NOT EXISTS `disbursement` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `gymid` int(40) NOT NULL,
  `type` int(10) NOT NULL,
  `limit` int(10) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE idx_gymid (gymid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


--
-- Table structure for table `paymentmethod`
--
CREATE TABLE IF NOT EXISTS `paymentmethod` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
  INDEX id_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


--
-- Table structure for table `stats`
--
CREATE TABLE IF NOT EXISTS `stats` (
  `id` int(40) NOT NULL AUTO_INCREMENT,
  `gymid` int(40) NOT NULL,
  `userid` int(40) NOT NULL,
  `type` int(40) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX id_gymid (gymid),
  INDEX id_userid (userid),
  INDEX id_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;



