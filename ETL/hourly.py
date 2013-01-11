__author__ = 'tbossert'

#!/usr/bin/python

import MySQLdb as mdb
import sys
from datetime import datetime, timedelta
from pytz import timezone

zcon = mdb.connect(host = 'instance35168.db.xeround.com', port = 3719, user = 'barbell', passwd = '10Reps f0r perf3Ction!', db = 'zunefit')

EST = pytz.timezone("US/Eastern")
lastHourDateTime = datetime.today() - timedelta(hours = 1)
prevHour = lastHourDateTime.strftime('%Y-%m-%d %H')
curHour = datetime.today().strftime('%Y-%m-%d %H')
timestamp = prevHour.astimezone(EST)

try:
    with zcon:
        zcur = zcon.cursor()
        # Create Temp Tables and populate with data
        zcur.execute("CREATE TABLE `tmpgym` SELECT id,city,state,zipcode FROM gyms")
        zcur.execute("CREATE TABLE `tmpstats` SELECT * FROM stats")
        # WHERE datetime >= CONVERT_TZ('" + prevHour + "','UTC','EST') AND datetime < CONVERT_TZ('" + curHour + "','UTC','EST')"
        zcur.execute("CREATE TABLE `tmpsch` SELECT s.id,s.userid,s.gymid,s.classid,c.service,s.price,s.datetime,c.spots,c.featured FROM schedule s INNER JOIN classes c ON s.classid = c.id")
        # WHERE created >= CONVERT_TZ('" + prevHour + "','UTC','EST') AND created < CONVERT_TZ('" + curHour + "','UTC','EST')"
        zcur.execute("CREATE TABLE `tmpchkin` SELECT * FROM checkin")
        # WHERE datetime >= CONVERT_TZ('" + prevHour + "','UTC','EST') AND datetime < CONVERT_TZ('" + curHour + "','UTC','EST')"


        # Per Gym queries
        zcur.execute("SELECT id FROM tmpgym")

        rows = zcur.fetchall()
        for row in rows:
<<<<<<< HEAD
            zcur.execute("INSERT INTO barbell.classhourly (gymid,classid,visits,reservations,duration,amount,datetime) SELECT ts.gymid,ts.classid,(SELECT count(id) FROM tmpchkin WHERE classid = ts.classid) AS visits,count(ts.classid) AS reservations,ts.duration AS duration,SUM(ts.price) AS amount,'" + timestamp + "' AS datetime FROM tmpsch ts WHERE ts.gymid = " + str(row[0]) + " GROUP BY classid")
            zcur.execute("INSERT INTO barbell.gymhourly (gymid,classid,service,visits,reservations,duration,price,amount,datetime) SELECT ts.gymid,ts.classid,ts.service,(SELECT count(id) FROM tmpchkin WHERE classid = ts.classid) AS visits,count(ts.classid) AS reservations,ts.duration,ts.price,SUM(ts.price) AS amount,'" + timestamp + "' AS datetime FROM tmpsch ts WHERE ts.gymid = " + str(row[0]))

        zcur.execute("INSERT INTO barbell.hourly (visits,signups,reservations,amount,datetime) SELECT (SELECT count(id) FROM tmpstats) AS visits,(SELECT count(id) FROM users) AS signups,count(id) AS reservations,SUM(price) AS amount,'" + timestamp + "' AS datetime FROM tmpsch")
=======
            zcur.execute("INSERT INTO barbell.classhourly (gymid,classid,visits,reservations,duration,amount,datetime) SELECT ts.gymid,ts.classid,(SELECT count(id) FROM tmpchkin WHERE classid = ts.classid) AS visits,count(ts.classid) AS reservations,ts.duration AS duration,SUM(ts.price) AS amount,CONVERT_TZ('" + prevHour + "','UTC','EST') AS datetime FROM tmpsch ts WHERE ts.gymid = " + str(row[0]) + " GROUP BY classid")
            zcur.execute("INSERT INTO barbell.gymhourly (gymid,classid,service,visits,reservations,duration,price,amount,datetime) SELECT ts.gymid,ts.classid,ts.service,(SELECT count(id) FROM tmpchkin WHERE classid = ts.classid) AS visits,count(ts.classid) AS reservations,ts.duration,ts.price,SUM(ts.price) AS amount,CONVERT_TZ('" + prevHour + "','UTC','EST') AS datetime FROM tmpsch ts WHERE ts.gymid = " + str(row[0]))

        zcur.execute("INSERT INTO barbell.hourly (visits,signups,reservations,amount,datetime) SELECT (SELECT count(id) FROM tmpstats) AS visits,(SELECT count(id) FROM users) AS signups,count(id) AS reservations,SUM(price) AS amount,CONVERT_TZ('" + prevHour + "','UTC','EST') AS datetime FROM tmpsch")
>>>>>>> d40d624e22bbc9e3f6ffd7c587bfa0fe7688303b
        zcur.execute("INSERT INTO barbell.repeats (userid,gymid,classid,visits) SELECT userid,gymid,classid,@visits := COUNT(userid) FROM tmpchkin GROUP BY userid,classid ON DUPLICATE KEY UPDATE visits=visits+@visits")

        # Drop Temp Tables
        zcur.execute("DROP TABLE tmpgym")
        zcur.execute("DROP TABLE tmpstats")
        zcur.execute("DROP TABLE tmpsch")
        zcur.execute("DROP TABLE tmpchkin")

    zcon.commit()
    zcur.close()

except mdb.Error, e:
    # Drop Temp Tables
    zcur.execute("DROP TABLE tmpgym")
    zcur.execute("DROP TABLE tmpstats")
    zcur.execute("DROP TABLE tmpsch")
    zcur.execute("DROP TABLE tmpchkin")
    zcon.rollback()
    print "Error %d: %s" % (e.args[0],e.args[1])
    sys.exit(1)
