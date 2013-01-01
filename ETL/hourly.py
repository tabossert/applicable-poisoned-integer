__author__ = 'tbossert'

#!/usr/bin/python

import MySQLdb as mdb
import sys
from datetime import datetime, timedelta

zcon = mdb.connect(host = 'instance35168.db.xeround.com', port = 3719, user = 'barbell', passwd = 'm255m255', db = 'zunefit')

lastHourDateTime = datetime.today() - timedelta(hours = 1)
prevHour = lastHourDateTime.strftime('%Y-%m-%d %H')
curHour = datetime.today().strftime('%Y-%m-%d %H')

try:
    with zcon:
        zcur = zcon.cursor()
        # Create Temp Tables and populate with data
        zcur.execute("CREATE TABLE `tmpgym` SELECT id,city,state,zipcode FROM gyms")
        zcur.execute("CREATE TABLE `tmpstats` SELECT * FROM stats")
        zcur.execute("CREATE TABLE `tmpsch` SELECT s.id,s.userid,s.gymid,s.classid,c.service,s.price,s.datetime,c.spots,c.featured FROM schedule s INNER JOIN classes c ON s.classid = c.id")
        zcur.execute("CREATE TABLE `tmpchkin` SELECT * FROM checkin")


        # Per Gym queries
        zcur.execute("SELECT id FROM tmpgym")

        rows = zcur.fetchall()
        for row in rows:
            zcur.execute("INSERT INTO barbell.classhourly (gymid,classid,visits,reservations,amount,datetime) SELECT ts.gymid,ts.classid,(SELECT count(id) FROM tmpchkin WHERE classid = ts.classid) AS visits,count(ts.classid) AS reservations,SUM(ts.price) AS amount,'" + prevHour + "' AS datetime FROM tmpsch ts WHERE ts.gymid = " + str(row[0]) + " GROUP BY classid")
            zcur.execute("INSERT INTO barbell.gymhourly (gymid,visits,views,reservations,amount,datetime) SELECT " + str(row[0]) + ",(SELECT count(id) FROM tmpchkin WHERE gymid = ts.gymid) AS visits,(SELECT count(id) FROM tmpstats WHERE type = 0 AND gymid = ts.gymid) AS views,count(ts.id) AS reservations,SUM(price) AS amount,'" + prevHour + "' AS datetime FROM tmpsch ts WHERE ts.gymid = " + str(row[0]))

        zcur.execute("INSERT INTO barbell.hourly (visits,signups,reservations,amount,datetime) SELECT (SELECT count(id) FROM tmpstats) AS visits,(SELECT count(id) FROM users) AS signups,count(id) AS reservations,SUM(price) AS amount,'" + prevHour + "' AS datetime FROM tmpsch")

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
