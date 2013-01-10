__author__ = 'tbossert'

#!/usr/bin/python

import MySQLdb as mdb
import sys
from datetime import datetime, timedelta

bcon = mdb.connect(host = 'instance35168.db.xeround.com', port = 3719, user = 'barbell', passwd = '10Reps f0r perf3Ction!', db = 'barbell')

lastDayDateTime = datetime.today() - timedelta(days = 1)
prevDay = lastDayDateTime.strftime('%Y-%m-%d')
curDay = datetime.today().strftime('%Y-%m-%d')

try:
    with bcon:
        bcur = bcon.cursor()

        bcur.execute("INSERT INTO barbell.gymdaily (gymid,visits,views,reservations,amount,datetime) SELECT gymid,SUM(visits) AS visits,SUM(views) AS views,SUM(reservations) AS reservations,SUM(amount) AS amount,CONVERT_TZ('" + prevDay + "','UTC','EST') AS datetime FROM barbell.gymhourly WHERE datetime > CONVERT_TZ('" + prevDay + "','UTC','EST') AND datetime < CONVERT_TZ('" + curDay + "','UTC','EST') GROUP BY gymid")
        bcur.execute("INSERT INTO barbell.classdaily (gymid,classid,service,visits,reservations,duration,amount,datetime) SELECT gymid,classid,service,SUM(visits) AS visits,SUM(reservations) AS reservations,duration,SUM(amount) AS amount,CONVERT_TZ('" + prevDay + "','UTC','EST') AS datetime FROM barbell.classhourly WHERE datetime > CONVERT_TZ('" + prevDay + "','UTC','EST') AND datetime < CONVERT_TZ('" + curDay + "','UTC','EST') GROUP by classid")
        bcur.execute("INSERT INTO barbell.daily (visits,signups,reservations,amount,datetime) SELECT SUM(visits) AS visits,SUM(signups) AS signups,SUM(reservations) AS reservations,SUM(amount) AS amount,CONVERT_TZ('" + prevDay + "','UTC','EST') AS datetime FROM barbell.hourly WHERE datetime > CONVERT_TZ('" + prevDay + "','UTC','EST') AND datetime < CONVERT_TZ('" + curDay + "','UTC','EST')")

        bcur.execute("SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED")
        bcur.execute("INSERT INTO barbell.demographic (male,female,city,state,zipcode,total,datetime) SELECT SUM(IF(sex = 'm', 1, 0)) AS male, SUM(IF(sex = 'f', 1, 0)) AS female,city,state,zipcode,COUNT(zipcode) AS total,CONVERT_TZ('" + prevDay + "','UTC','EST') AS datetime FROM zunefit.users GROUP BY zipcode")
        bcur.execute("SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ")

    bcon.commit()
    bcur.close()

except mdb.Error, e:
    bcon.rollback()
    print "Error %d: %s" % (e.args[0],e.args[1])
    sys.exit(1)
