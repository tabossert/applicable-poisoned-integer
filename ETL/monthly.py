__author__ = 'tbossert'

#!/usr/bin/python

import MySQLdb as mdb
import sys
from datetime import datetime, timedelta
from pytz import timezone
import pytz

bcon = mdb.connect(host = 'localhost', port = 3306, user = 'barbell', passwd = '10Reps f0r perf3Ction!', db = 'barbell')

EST = timezone("US/Eastern")
lastMonthDateTime = datetime.today() - timedelta(days = 1)
UTCprevMonth = lastMonthDateTime.strftime('%Y-%m-01')
UTCcurMonth = datetime.today().strftime('%Y-%m-%d')
tz = timezone('UTC')
locPrevMonth = tz.localize(UTCprevMonth)
locCurMonth = tz.localize(UTCcurMonth)
prevMonth = locPrevMonth.astimezone(EST)
curMonth = locPrevMonth.astimezone(EST)

try:
    with bcon:
        bcur = bcon.cursor()

        bcur.execute("INSERT INTO barbell.gymmonthly (gymid,visits,views,reservations,amount,datetime) SELECT gymid,SUM(visits) AS visits,SUM(views) AS views,SUM(reservations) AS reservations,SUM(amount) AS amount,'" + prevMonth + "' AS datetime FROM barbell.gymhourly WHERE datetime > '" + prevMonth + "' AND datetime < '" + curMonth + "' GROUP BY gymid")
        bcur.execute("INSERT INTO barbell.classmonthly (gymid,classid,service,visits,reservations,amount,datetime) SELECT gymid,classid,service,SUM(visits) AS visits,SUM(reservations) AS reservations,SUM(amount) AS amount,'" + prevMonth + "' AS datetime FROM barbell.classhourly WHERE datetime > '" + prevMonth + "' AND datetime < '" + curMonth + "' GROUP by classid")
        bcur.execute("INSERT INTO barbell.monthly (visits,signups,reservations,amount,datetime) SELECT SUM(visits) AS visits,SUM(signups) AS signups,SUM(reservations) AS reservations,SUM(amount) AS amount,'" + prevMonth + "' AS datetime FROM barbell.hourly WHERE datetime > '" + prevMonth + "' AND datetime < '" + curMonth + "'")

    bcon.commit()
    bcur.close()

except mdb.Error, e:
    bcon.rollback()
    print "Error %d: %s" % (e.args[0],e.args[1])
    sys.exit(1)
