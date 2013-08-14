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
- yum install MariaDB-server MariaDB-client
- /etc/init.d/mysql start
- mysql 
- CREATE DATABASE fitstew;
- CREATE DATABASE barbell;
- GRANT ALL ON fitstew.* TO 'fitstewAPI'@'localhost' IDENTIFIED BY '<password>';
- GRANT ALL ON fitstew.* TO 'barbell'@'localhost' IDENTIFIED BY '<password>';
- FLUSH PRIVILEGES;
- exit
- mysql -u root fitstew < fitstew_2013-07-26.sql      (File is in sql/backups/ in the code base)
- mysql -u root barbell < barbell_2013-07-26.sql      (File is in sql/backups/ in the code base)

## Node Setup ##
- yum groupinstall 'Development Tools'
- mkdir ~/sources
- cd ~/sources
- wget http://nodejs.org/dist/node-latest.tar.gz
- tar zxvf node-latest.tar.gz
- cd node-v<TAB>
- ./configure
- make
- make install
- mv /root/sources/node-v0.10.1/out/Release /opt/node-v0.10.1
- ln -s /opt/node-v0.10.1/node /usr/bin/node

## API setup ##
- mkdir /var/node/
- cd /var/node
- git clone https://github.com/tbossert/applicable-poisoned-integer .
- npm install
- npm install -g forever
- forever start app.js
