__author__ = 'tbossert'

#!/usr/bin/python

import MySQLdb as mdb
import sys
from datetime import datetime, timedelta

bcon = mdb.connect(host = 'instance35168.db.xeround.com', port = 3719, user = 'barbell', passwd = 'm255m255', db = 'barbell')

lastDayDateTime = datetime.today() - timedelta(days = 1)
prevDay = lastDayDateTime.strftime('%Y-%m-%d')
curDay = datetime.today().strftime('%Y-%m-%d')

try:
    with bcon:
        bcur = bcon.cursor()

        bcur.execute("INSERT INTO barbell.gymdaily (gymid,visits,views,reservations,amount,datetime) SELECT gymid,SUM(visits) AS visits,SUM(views) AS views,SUM(reservations) AS reservations,SUM(amount) AS amount,'" + prevDay + "' AS datetime FROM barbell.gymhourly WHERE datetime > '" + prevDay + "' AND datetime < '" + curDay + "' GROUP BY gymid")
        bcur.execute("INSERT INTO barbell.classdaily (gymid,classid,visits,reservations,amount,datetime) SELECT gymid,classid,SUM(visits) AS visits,SUM(reservations) AS reservations,SUM(amount) AS amount,'" + prevDay + "' AS datetime FROM barbell.classhourly WHERE datetime > '" + prevDay + "' AND datetime < '" + curDay + "' GROUP by classid")
        bcur.execute("INSERT INTO barbell.daily (visits,signups,reservations,amount,datetime) SELECT SUM(visits) AS visits,SUM(signups) AS signups,SUM(reservations) AS reservations,SUM(amount) AS amount,'" + prevDay + "' AS datetime FROM barbell.hourly WHERE datetime > '" + prevDay + "' AND datetime < '" + curDay + "'")

    bcon.commit()
    bcur.close()

except mdb.Error, e:
    bcon.rollback()
    print "Error %d: %s" % (e.args[0],e.args[1])
    sys.exit(1)
