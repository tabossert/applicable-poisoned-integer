applicable-poisoned-integer
===========================

# Node.js API for FitStew #

Installation steps on CentOS 6.x  (use sudo or login as root)

## MySQL (MariaDB) ##
- vim /etc/yum.repos.d/MariaDB.repo  -  add the following to this file and save

[mariadb]   
name = MariaDB   
baseurl = http://yum.mariadb.org/5.5/centos5-x86   
gpgkey=https://yum.mariadb.org/RPM-GPG-KEY-MariaDB   
gpgcheck=1 

- rpm -e --nodeps mysql-libs
- yum -y install MariaDB-server MariaDB-client
- /etc/init.d/mysql start
- chkconfig --levels 235 mysql on
- mysql 
- CREATE DATABASE fitstew;
- CREATE DATABASE barbell;
- GRANT ALL ON fitstew.* TO 'fitstewAPI'@'localhost' IDENTIFIED BY '<password>';   Get password from config/development.js
- GRANT ALL ON fitstew.* TO 'barbell'@'localhost' IDENTIFIED BY '<password>';   Get password from config/development.js
- FLUSH PRIVILEGES;
- exit
- mysql -u root fitstew < fitstew_2013-07-26.sql      (File is in sql/backups/ in the code base)
- mysql -u root barbell < barbell_2013-07-26.sql      (File is in sql/backups/ in the code base)

## Node Setup ##
- yum -y groupinstall 'Development Tools'
- mkdir ~/sources
- cd ~/sources
- wget http://nodejs.org/dist/node-latest.tar.gz
- tar zxvf node-latest.tar.gz
- cd node-v<TAB>
- ./configure
- make
- make install
- mv /root/sources/node-v0.10.15/out/Release /opt/node-v0.10.15
- ln -s /opt/node-v0.10.15/node /usr/bin/node

## Memcached Setup ##
- yum -y install memcached
- /etc/init.d/memcached start
- chkconfig --levels 235 memcached on


## API setup ##
- mkdir /var/node/
- cd /var/node
- git clone https://github.com/tbossert/applicable-poisoned-integer .
- npm install
- npm install -g forever
- forever start app.js
