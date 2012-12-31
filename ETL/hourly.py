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

        zcur.execute("SELECT id FROM tmpgym")

        rows = zcur.fetchall()
        for row in rows:
            zcur.execute("INSERT INTO barbell.classhourly (gymid,classid,visits,reservations,amount,datetime) SELECT ts.gymid,ts.classid,count(tc.id) AS visits,count(ts.classid) AS reservations,SUM(ts.price) AS amount,'" + prevHour + "' FROM tmpsch ts INNER JOIN tmpchkin tc ON ts.classid = tc.classid WHERE ts.gymid = " + str(row[0]) + " GROUP BY classid")

    zcon.commit()
    zcur.close()

except mdb.Error, e:

    zcon.rollback()
    print "Error %d: %s" % (e.args[0],e.args[1])
    sys.exit(1)
