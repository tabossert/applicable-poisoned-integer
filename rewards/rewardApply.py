#!/usr/bin/python
# -*- coding: utf-8 -*-

import MySQLdb as mdb
import sys

rewardValue =2

try:
    con = mdb.connect('localhost', 'reward', 
        'R3ward mE!', 'zunefit');

    with con: 

        cur = con.cursor()
        cur.execute("SELECT userid FROM rewards WHERE applied = 0")

        rows = cur.fetchall()

        for row in rows:
            cur.execute("UPDATE users SET balance = balance + " + str(rewardValue) + " WHERE id = " + str(row[0]))
            cur.execute("UPDATE rewards SET applied = true WHERE userid = " + str(row[0]))
           
    con.commit()
   
    cur.close()
    con.close()

except mdb.Error, e:

    con.rollback()
    print "Error %d: %s" % (e.args[0],e.args[1])
    sys.exit(1) 

 
