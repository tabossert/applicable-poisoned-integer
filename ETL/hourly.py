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



try:
    with zcon:
        zcur = zcon.cursor()
        # Create Temp Tables and populate with data
        zcur.execute("CREATE TABLE `tmpusers` SELECT id,city,state,zipcode,sex FROM users WHERE created >= '" + startHour + "' AND created < '" + endHour + "'")
        zcur.execute("CREATE TABLE `tmpgym` SELECT id,city,state,zipcode FROM gyms")
        zcur.execute("CREATE TABLE `tmpstats` SELECT * FROM stats WHERE datetime >= '" + startHour + "' AND datetime < '" + endHour + "'")
        zcur.execute("CREATE TABLE `tmpsch` SELECT s.id,s.userid,s.gymid,s.sclassid,c.service,c.duration,s.price,s.datetime,c.spots,c.featured FROM schedule s INNER JOIN scheduledClass sc ON s.sclassid = sc.id INNER JOIN classes c ON sc.classid = c.id WHERE s.datetime >= '" + startHour + "' AND s.datetime < '" + endHour + "'")
        zcur.execute("CREATE TABLE `tmpchkin` SELECT * FROM checkin WHERE datetime >= '" + startHour + "' AND datetime < '" + endHour + "'")
        print startHour

        # Per Gym queries
        zcur.execute("SELECT id FROM tmpgym")

        rows = zcur.fetchall()
        for row in rows:
            gymid = str(row[0])
            zcur.execute("SELECT id FROM classes WHERE gymid = " + str(row[0]))

            crows = zcur.fetchall()
            for crow in crows:
                zcur.execute("INSERT INTO barbell.classhourly (gymid,classid,service,visits,reservations,duration,amount,datetime) SELECT ts.gymid,c.id AS cid,c.service,(SELECT COUNT(c.id) FROM tmpchkin tc INNER JOIN scheduledClass sc ON tc.sclassid = sc.id INNER JOIN classes c ON sc.classid = c.id WHERE c.id = cid) AS visits,count(ts.id) AS reservations,c.duration,SUM(ts.price),'" + startHour + "' FROM tmpsch ts INNER JOIN scheduledClass sc ON ts.sclassid = sc.id INNER JOIN classes c ON sc.classid = c.id WHERE c.id = " + str(crow[0]))
                zcon.commit()
                if(zcur.rowcount < 1):
                    zcur.execute("INSERT INTO barbell.classhourly (gymid,classid,service,visits,reservations,duration,amount,datetime) SELECT " + gymid + "," + str(crow[0]) + ",'',0,0,0,0,'" + startHour + "'")
            
            zcur.execute("INSERT INTO barbell.gymhourly (gymid,visits,views,reservations,amount,datetime) SELECT " + gymid + ",(SELECT count(id) FROM tmpchkin WHERE gymid = " + gymid + ") AS visits,0,count(id) AS reservations,SUM(ts.price) AS amount,'" + startHour + "' AS datetime FROM tmpsch ts WHERE ts.gymid = " + gymid)
            print gymid
            zcon.commit()
            if(zcur.rowcount < 1):
                zcur.execute("INSERT INTO barbell.gymhourly (gymid,visits,views,reservations,amount,datetime) SELECT " + gymid + ",0,0,0,0,'" + startHour + "'")               

        zcur.execute("INSERT INTO barbell.repeats (userid,gymid,classid,visits) SELECT tc.userid,tc.gymid,c.id,@visits := COUNT(tc.userid) FROM tmpchkin tc INNER JOIN scheduledClass sc ON tc.sclassid = sc.id INNER JOIN classes c ON sc.classid = c.id GROUP BY userid,classid ON DUPLICATE KEY UPDATE visits=visits+@visits")           
        zcon.commit()

        zcur.execute("INSERT INTO barbell.hourly (visits,signups,reservations,amount,datetime) SELECT SUM(tc.id) AS visits,SUM(tu.id) AS signups,SUM(ts.id) AS reservations,SUM(ts.price) AS amount,'" + startHour + "' AS datetime FROM tmpchkin tc INNER JOIN tmpsch ts ON tc.userid = ts.userid INNER JOIN tmpusers tu ON ts.userid = tu.id") 
        zcon.commit()
        if(zcur.rowcount < 1):
            zcur.execute("INSERT INTO barbell.hourly (visits,signups,reservations,amount,datetime) SELECT 0,0,0,0,'" + startHour + "'")    
        
        zcur.execute("INSERT INTO barbell.demographic (male,female,city,state,zipcode,total,datetime) SELECT SUM(IF(sex = 'm', 1, 0)) AS male, SUM(IF(sex = 'f', 1, 0)) AS female,city,state,zipcode,COUNT(zipcode) AS total,'" + startHour + "' AS datetime FROM tmpusers GROUP BY zipcode")
        zcon.commit()
        if(zcur.rowcount < 1):
            zcur.execute("INSERT INTO barbell.demographic (male,female,city,state,zipcode,total,datetime) SELECT 0,0,'','','',0,'" + startHour + "'")            
        
        # Drop Temp Tables
        zcur.execute("DROP TABLE tmpgym")
        zcur.execute("DROP TABLE tmpstats")
        zcur.execute("DROP TABLE tmpsch")
        zcur.execute("DROP TABLE tmpchkin")
        zcur.execute("DROP TABLE tmpusers")

    zcon.commit()
    zcur.close()

except mdb.Error, e:
    # Drop Temp Tables
    zcur.execute("DROP TABLE tmpgym")
    zcur.execute("DROP TABLE tmpstats")
    zcur.execute("DROP TABLE tmpsch")
    zcur.execute("DROP TABLE tmpchkin")
    zcur.execute("DROP TABLE tmpusers")

    zcon.rollback()
    print "Error %d: %s" % (e.args[0],e.args[1])
    sys.exit(1)

