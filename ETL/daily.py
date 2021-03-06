__author__ = 'tbossert'

#!/usr/bin/python

import MySQLdb as mdb
import sys
from datetime import datetime, timedelta

bcon = mdb.connect(host = 'localhost', port = 3306, user = 'barbell', passwd = '10Reps f0r perf3Ction!', db = 'barbell')

#getEndDay = datetime.utcnow()
getStartDay = datetime.utcnow() - timedelta(days = 1)
#endDay = getEndDay.strftime('%Y-%m-%d')
startDay = getStartDay.strftime('%Y-%m-%d')


try:
    with bcon:
        bcur = bcon.cursor()

        #bcur.execute("INSERT INTO barbell.gymdaily (gymid,visits,views,reservations,amount,datetime) SELECT gymid,SUM(visits) AS visits,SUM(views) AS views,SUM(reservations) AS reservations,SUM(amount) AS amount,'" + prevDay + "' AS datetime FROM barbell.gymhourly WHERE datetime > '" + prevDay + "' AND datetime < '" + curDay + "' GROUP BY gymid")
        #bcur.execute("INSERT INTO barbell.classdaily (gymid,classid,service,visits,reservations,duration,amount,datetime) SELECT gymid,classid,service,SUM(visits) AS visits,SUM(reservations) AS reservations,duration,SUM(amount) AS amount,'" + prevDay + "' AS datetime FROM barbell.classhourly WHERE datetime > '" + prevDay + "' AND datetime < '" + curDay + "' GROUP by classid")
        #bcur.execute("INSERT INTO barbell.daily (visits,signups,reservations,amount,datetime) SELECT SUM(visits) AS visits,SUM(signups) AS signups,SUM(reservations) AS reservations,SUM(amount) AS amount,'" + prevDay + "' AS datetime FROM barbell.hourly WHERE datetime > '" + prevDay + "' AND datetime < '" + curDay + "'")

        bcur.execute("SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED")
        bcur.execute("INSERT INTO barbell.demographic (male,female,city,state,zipcode,total,datetime) SELECT SUM(IF(sex = 'm', 1, 0)) AS male, SUM(IF(sex = 'f', 1, 0)) AS female,city,state,zipcode,COUNT(zipcode) AS total,'" + startDay + "' AS datetime FROM zunefit.users GROUP BY zipcode")
        bcur.execute("SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ")

    bcon.commit()
    bcur.close()

except mdb.Error, e:
    bcon.rollback()
    print "Error %d: %s" % (e.args[0],e.args[1])
    sys.exit(1)
