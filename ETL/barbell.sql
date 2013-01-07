##### Create Temp Tables #####
# Create temp table for gyms containing some columns
CREATE TABLE `tmpgym` SELECT id,city,state,zipcode FROM gyms order by id;

# Create temp table for gymstats for an hour period
CREATE TABLE `tmpstats` SELECT * FROM stats

# Create temp table for schedule for an hour period
CREATE TABLE `tmpsch` SELECT s.id,s.userid,s.gymid,s.classid,c.service,s.price,c.duration,s.datetime,c.spots,c.featured FROM schedule s INNER JOIN classes c ON s.classid = c.id

# Create temp table for checkins for an hour period
CREATE TABLE `tmpchkin` SELECT * FROM checkin


##### Hourly Queries #####

# Get Hourly visits per gym
INSERT INTO barbell.gymhourly (gymid,visits,views,reservations,amount,datetime) SELECT gymid,(SELECT count(id) FROM tmpchkin WHERE gymid = ts.gymid) AS visits,(SELECT count(id) FROM tmpstats WHERE type = 0 AND gymid = ts.gymid) AS views,count(ts.id) AS reservations,SUM(price) AS amount,'2012-12-31 3' AS datetime FROM tmpsch ts WHERE ts.gymid = 21

# Get hourly total for each class, run this query once per gym from gym table
INSERT INTO barbell.classhourly (gymid,classid,service,visits,reservations,duration,price,amount,datetime) SELECT ts.gymid,ts.classid,ts.service,(SELECT count(id) FROM tmpchkin WHERE classid = ts.classid) AS visits,count(ts.classid) AS reservations,ts.duration,ts.price,SUM(ts.price) AS amount,'2012-12-31 3' AS datetime FROM tmpsch ts WHERE ts.gymid = 22 GROUP BY classid

# Get hourly total for everything
INSERT INTO barbell.hourly (visits,signups,reservations,amount,datetime) SELECT (SELECT count(id) FROM tmpstats) AS visits,(SELECT count(id) FROM users) AS signups,count(id) AS reservations,SUM(price) AS amount,'2012-12-31 3' AS datetime FROM tmpsch



##### Daily Queries #####
# Get daily total for each gym
INSERT INTO barbell.gymdaily (gymid,visits,views,reservations,amount,datetime) SELECT gymid,SUM(visits) AS visits,SUM(views) AS views,SUM(reservations) AS reservations,SUM(amount) AS amount,'2012-12-31' AS datetime FROM barbell.gymhourly WHERE datetime > '2012-12-31' AND datetime < '2013-01-01' GROUP BY gymid

# Get daily total for each class
INSERT INTO barbell.classdaily (gymid,classid,service,visits,reservations,duration,amount,datetime) SELECT gymid,classid,service,SUM(visits) AS visits,SUM(reservations) AS reservations,duration,SUM(amount) AS amount,'2012-12-31' AS datetime FROM barbell.classhourly WHERE datetime > '2012-12-31' AND datetime < '2013-01-01' GROUP by classid

# Get daily total for everything
INSERT INTO barbell.daily (visits,signups,reservations,amount,datetime) SELECT SUM(visits) AS visits,SUM(signups) AS signups,SUM(reservations) AS reservations,SUM(amount) AS amount,'2012-12-31' AS datetime FROM barbell.hourly WHERE datetime > '2012-12-31' AND datetime < '2013-01-01'

##### Monthly Queries #####
# Get monthly total for each gym
INSERT INTO barbell.gymdaily (gymid,visits,views,reservations,amount,datetime) SELECT gymid,SUM(visits) AS visits,SUM(views) AS views,SUM(reservations) AS reservations,SUM(amount) AS amount,'2012-12-31' AS datetime FROM barbell.gymhourly WHERE datetime > '2012-12-01' AND datetime < '2013-01-1' GROUP BY gymid

# Get monthly total for each class
INSERT INTO barbell.classmonthly (gymid,classid,service,visits,reservations,amount,datetime) SELECT gymid,classid,service,SUM(visits) AS visits,SUM(reservations) AS reservations,SUM(amount) AS amount,'2012-12-31' AS datetime FROM barbell.classhourly WHERE datetime > '2012-12-01' AND datetime < '2013-01-01' GROUP by classid

# Get monthly total for everything
INSERT INTO barbell.monthly (visits,signups,reservations,amount,datetime) SELECT SUM(visits) AS visits,SUM(signups) AS signups,SUM(reservations) AS reservations,SUM(amount) AS amount,'2012-12-31' AS datetime FROM barbell.daily WHERE datetime > '2012-12-01' AND datetime < '2013-01'



##### Drop Temp Tables #####
drop table tmpgym
drop table tmpstats
drop table tmpsch
drop table tmpchkin



##### Demographic Queries #####
INSERT INTO barbell.demographic (male,female,city,state,zipcode,total,datetime) SELECT SUM(IF(sex = 'm', 1, 0)) AS male, SUM(IF(sex = 'f', 1, 0)) AS female,city,state,zipcode,COUNT(zipcode) AS total,'2013-01-01' AS datetime FROM zunefit.users GROUP BY zipcode
COUNT(sex,zipcode,state,city
SELECT male,female,city,state,zipcode,total,datetime FROM barbell.demographic WHERE zipcode = 94596


##### Analytics Queries #####
# Get avg's for classes
SELECT service,duration,ROUND(AVG(price),2) AS price,datetime FROM classhourly WHERE datetime >= '2012-12-31 03:00:00' AND datetime < '2013-01-01 05:00:00' GROUP BY service,duration

# Get AVG reservations per hour - All classes
SELECT ROUND(AVG(reservations),0) AS avgres,datetime FROM classhourly WHERE datetime >= '2012-12-31 03:00:00' AND datetime < '2012-12-31 05:00:00' GROUP BY datetime 

# Get MAX to show which hour is the most popular for a class
SELECT t1.classid,t1.reservations,t1.datetime FROM classhourly t1 INNER JOIN (SELECT classid,MAX(reservations) AS res,datetime AS max_date FROM classhourly WHERE gymid = 22 AND datetime >= '2012-12-31 03:00:00' AND datetime < '2012-12-31 05:00:00' GROUP BY classid) t2 ON t1.reservations = t2.res AND t1.classid = t2.classid GROUP BY classid

# Get Max to show which day is the most popular for a day
SELECT t1.classid,t1.reservations,DAYNAME(t1.datetime) FROM classdaily t1
  INNER JOIN (SELECT classid,MAX(reservations) AS res
        FROM classdaily WHERE gymid = 22 AND datetime >= '2012-12-31' AND datetime < '2013-01-02'
        GROUP BY classid
        ) t2
    ON t1.reservations = t2.res AND t1.classid = t2.classid GROUP BY classid

# Repeat user counts
INSERT INTO barbell.repeats (userid,gymid,classid,visits) SELECT userid,gymid,classid,@visits := COUNT(userid) FROM tmpchkin GROUP BY userid,classid ON DUPLICATE KEY UPDATE visits=visits+@visits


SELECT userid,gymid,classid,visits FROM barbell.repeats WHERE gymid = 22 GROUP BY userid,classid




# Query to get Max by hour classes by gym by datetime
SELECT t1.classid,t1.reservations,t1.datetime FROM classhourly t1
  INNER JOIN (SELECT classid,MAX(reservations) AS res,datetime AS max_date
        FROM classhourly WHERE gymid = 22 AND datetime >= '2012-12-31 03:00:00' AND datetime < '2012-12-31 05:00:00'
        GROUP BY classid
        ) t2
    ON t1.reservations = t2.res AND t1.classid = t2.classid GROUP BY classid
# Query to get Max by day classes by gym by datetime
SELECT t1.classid,t1.reservations,DAYNAME(t1.datetime) FROM classdaily t1
  INNER JOIN (SELECT classid,MAX(reservations) AS res
        FROM classdaily WHERE gymid = 22 AND datetime >= '2012-12-31' AND datetime < '2013-01-02'
        GROUP BY classid
        ) t2
    ON t1.reservations = t2.res AND t1.classid = t2.classid GROUP BY classid

 
 
 SELECT t1.classid,t1.reservations,t1.datetime FROM barbell.classhourly t1 INNER JOIN (SELECT classid,MAX(reservations) AS res,datetime AS max_date FROM barbell.classhourly WHERE gymid = 22 AND datetime >= "2012-12-31 03:00:00" AND datetime < "2012-12-31 05:00:00" GROUP BY classid) t2 ON t1.reservations = t2.res AND t1.classid = t2.classid GROUP BY classid
 
 
 SELECT t1.classid,t1.reservations,DAYNAME(t1.datetime) FROM classdaily t1 INNER JOIN (SELECT classid,MAX(reservations) AS res FROM classdaily WHERE gymid = 22 AND datetime >= '2012-12-31' AND datetime < '2013-01-02' GROUP BY classid) t2 ON t1.reservations = t2.res AND t1.classid = t2.classid GROUP BY classid
 
# Queries to get class info for hourly/daily/monthly
SELECT gymid,classid,service,visits,reservations,duration,price,amount,datetime FROM classhourly WHERE gymid = 22 AND datetime >= '2012-12-31' AND datetime < DATE_ADD('2012-12-31',INTERVAL 1 DAY)
SELECT gymid,classid,service,visits,reservations,duration,amount,datetime FROM classdaily WHERE gymid = 22 AND datetime >= '2012-12-31' AND datetime < DATE_ADD('2012-12-31',INTERVAL 1 WEEK);
SELECT gymid,classid,service,visits,reservations,amount,datetime FROM classmonthly WHERE gymid = 22 AND datetime >= '2012-12-01' AND datetime < DATE_ADD('2006-05-01',INTERVAL 1 MONTH);

# Queries to get hourly/weekly/monthly income
SELECT gymid,SUM(amount) FROM classhourly WHERE gymid = 22 AND datetime >= '2012-12-31' AND datetime < DATE_ADD('2012-12-31',INTERVAL 1 DAY)
SELECT gymid,SUM(amount) FROM classdaily WHERE gymid = 22 AND datetime >= DATE('2012-12-31') AND datetime < DATE_ADD('2012-12-31',INTERVAL 1 WEEK)
SELECT gymid,SUM(amount) FROM classmonthly WHERE gymid = 22 AND datetime >= DATE('2012-12-31') AND datetime < DATE_ADD('2012-12-31',INTERVAL 1 MONTH)




SELECT gymid,classid,service,visits,reservations,amount,datetime FROM classdaily WHERE gymid = 22 AND datetime >= DATE("2012-12-01") AND datetime < DATE_ADD(DATE("2012-12-01"),INTERVAL 1 MONTH)
