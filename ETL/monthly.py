__author__ = 'tbossert'

#!/usr/bin/python

import MySQLdb as mdb
import sys
from datetime import datetime, timedelta

bcon = mdb.connect(host = 'instance35168.db.xeround.com', port = 3719, user = 'barbell', passwd = '10Reps f0r perf3Ction!', db = 'barbell')

lastMonthDateTime = datetime.today() - timedelta(days = 1)
prevMonth = lastMonthDateTime.strftime('%Y-%m-01')
curMonth = datetime.today().strftime('%Y-%m-%d')

try:
    with bcon:
        bcur = bcon.cursor()

        bcur.execute("INSERT INTO barbell.gymmonthly (gymid,visits,views,reservations,amount,datetime) SELECT gymid,SUM(visits) AS visits,SUM(views) AS views,SUM(reservations) AS reservations,SUM(amount) AS amount,CONVERT_TZ('" + prevMonth + "','UTC','EST') AS datetime FROM barbell.gymhourly WHERE datetime > CONVERT_TZ('" + prevMonth + "','UTC','EST') AND datetime < CONVERT_TZ('" + curMonth + "','UTC','EST') GROUP BY gymid")
        bcur.execute("INSERT INTO barbell.classmonthly (gymid,classid,service,visits,reservations,amount,datetime) SELECT gymid,classid,service,SUM(visits) AS visits,SUM(reservations) AS reservations,SUM(amount) AS amount,CONVERT_TZ('" + prevMonth + "','UTC','EST') AS datetime FROM barbell.classhourly WHERE datetime > CONVERT_TZ('" + prevMonth + "','UTC','EST') AND datetime < CONVERT_TZ('" + curMonth + "','UTC','EST') GROUP by classid")
        bcur.execute("INSERT INTO barbell.monthly (visits,signups,reservations,amount,datetime) SELECT SUM(visits) AS visits,SUM(signups) AS signups,SUM(reservations) AS reservations,SUM(amount) AS amount,CONVERT_TZ('" + prevMonth + "','UTC','EST') AS datetime FROM barbell.hourly WHERE datetime > CONVERT_TZ('" + prevMonth + "','UTC','EST') AND datetime < CONVERT_TZ('" + curMonth + "','UTC','EST')")

    bcon.commit()
    bcur.close()

except mdb.Error, e:
    bcon.rollback()
    print "Error %d: %s" % (e.args[0],e.args[1])
    sys.exit(1)
