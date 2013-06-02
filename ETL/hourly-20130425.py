__author__ = 'tbossert'

#!/usr/bin/python

import MySQLdb as mdb
import sys
from datetime import datetime, timedelta

zcon = mdb.connect(host = 'localhost', port = 3306, user = 'barbell', passwd = '10Reps f0r perf3Ction!', db = 'zunefit')

getEndHour = datetime.utcnow()
getStartHour = datetime.utcnow() - timedelta(hours = 1)
endHour = getEndHour.strftime('%Y-%m-%d %H')
startHour = getStartHour.strftime('%Y-%m-%d %H')

#Classes not needed to replicate
## classes
## gyms
## 

# Things I still need
## schedule
## scheduledClass

try:
    with zcon:
        zcur = zcon.cursor()
        # Create Temp Tables and populate with data
        zcur.execute("CREATE TABLE `tmpusers` SELECT id,city,state,zipcode,sex FROM users WHERE created >= " + startHour + " AND created < " + endHour)
        zcur.execute("CREATE TABLE `tmpgym` SELECT id,city,state,zipcode FROM gyms")
        zcur.execute("CREATE TABLE `tmpstats` SELECT * FROM stats WHERE datetime >= " + startHour + " AND datetime < " + endHour)
        zcur.execute("CREATE TABLE `tmpsch` SELECT s.id,s.userid,s.gymid,s.classid,c.service,c.duration,s.price,s.datetime,c.spots,c.featured FROM schedule s INNER JOIN classes c ON s.classid = c.id WHERE datetime >= " + startHour + " AND datetime < " + endHour)
        zcur.execute("CREATE TABLE `tmpchkin` SELECT * FROM checkin WHERE datetime >= " + startHour + " AND datetime < " + endHour)
        zcur.execute("CREATE TABLE `tmpusers` SELECT male,female,city,state,zipcode FROM users WHERE created >= " + startHour + " AND created < " + endHour)
        print startHour

        # Per Gym queries
        zcur.execute("SELECT id FROM tmpgym")

        rows = zcur.fetchall()
        for row in rows:
            zcur.execute("INSERT INTO barbell.classhourly (gymid,classid,visits,reservations,duration,amount,datetime) SELECT ts.gymid,ts.classid,(SELECT count(id) FROM tmpchkin WHERE classid = ts.classid) AS visits,count(ts.classid) AS reservations,ts.duration AS duration,SUM(ts.price) AS amount,'" + startHour + "' AS datetime FROM tmpsch ts WHERE ts.gymid = " + str(row[0]) + " GROUP BY classid")
            if (cursor.rowcount < 1):
                zcur.execute("INSERT INTO barbell.classhourly (gymid,classid,visits,reservations,duration,amount,datetime) SELECT " + str(row[0]) + ",ts.classid,(SELECT count(id) FROM tmpchkin WHERE classid = ts.classid) AS visits,count(ts.classid) AS reservations,ts.duration AS duration,SUM(ts.price) AS amount,'" + startHour + "' AS datetime FROM tmpsch ts WHERE ts.gymid = " + str(row[0]) + " GROUP BY classid")  
            
            zcur.execute("INSERT INTO barbell.gymhourly (gymid,classid,service,visits,reservations,duration,price,amount,datetime) SELECT ts.gymid,ts.classid,ts.service,(SELECT count(id) FROM tmpchkin WHERE classid = ts.classid) AS visits,count(ts.classid) AS reservations,ts.duration AS duration,ts.price,SUM(ts.price) AS amount,'" + startHour + "' AS datetime FROM tmpsch ts WHERE ts.gymid = " + str(row[0]))

        zcur.execute("INSERT INTO barbell.repeats (userid,gymid,classid,visits) SELECT userid,gymid,classid,@visits := COUNT(userid) FROM tmpchkin GROUP BY userid,classid ON DUPLICATE KEY UPDATE visits=visits+@visits")
        zcur.execute("INSERT INTO barbell.hourly (visits,signups,reservations,amount,datetime) SELECT SUM(tc.visits) AS visits,SUM(tu.signups) AS signups,SUM(ts.reservations) AS reservations,SUM(ts.amount) AS amount,'" + startHour + "' AS datetime FROM tmpchkin tc INNER JOIN tmpsch ts ON tc.userid = ts.userid INNER JOIN tmpusers tu ON ts.userid = tu.id") 
        zcur.execute("INSERT INTO barbell.demographic (male,female,city,state,zipcode,total,datetime) SELECT SUM(IF(sex = 'm', 1, 0)) AS male, SUM(IF(sex = 'f', 1, 0)) AS female,city,state,zipcode,COUNT(zipcode) AS total,'" + startHour + "' AS datetime FROM tmpusers GROUP BY zipcode"))
        
        # Drop Temp Tables
        zcur.execute("DROP TABLE tmpusers")
        zcur.execute("DROP TABLE tmpgym")
        zcur.execute("DROP TABLE tmpstats")
        zcur.execute("DROP TABLE tmpsch")
        zcur.execute("DROP TABLE tmpchkin")
        zcur.execute("DROP TABLE tmpusers")

    zcon.commit()
    zcur.close()

except mdb.Error, e:
    # Drop Temp Tables
    zcur.execute("DROP TABLE tmpusers")
    zcur.execute("DROP TABLE tmpgym")
    zcur.execute("DROP TABLE tmpstats")
    zcur.execute("DROP TABLE tmpsch")
    zcur.execute("DROP TABLE tmpchkin")
    zcur.execute("DROP TABLE tmpusers")

    zcon.rollback()
    print "Error %d: %s" % (e.args[0],e.args[1])
    sys.exit(1)
