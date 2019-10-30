#!/usr/bin/env bash

#== Import script args ==

timezone=$(echo "$1")

#== Bash helpers ==

function info {
  echo " "
  echo "--> $1"
  echo " "
}

#== Provision script ==

info "Provision-script user: `whoami`"

export DEBIAN_FRONTEND=noninteractive

info "Configure timezone"
timedatectl set-timezone ${timezone} --no-ask-password
echo "Done!"


info "Install MySQL"
apt-get install -y mysql-server
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';"
echo "Done!"

info "Install Additional Software"
apt-get install -y build-essential zlib1g-dev libssl-dev sqlite3 libsqlite3-dev nginx libmysqlclient-dev
echo "Done!"

info "Install PHP-FPM"
apt-get install -y php-fpm php-mysql php-curl
echo "Done!"

info "Install Python 3.6.6"
wget https://www.python.org/ftp/python/3.6.6/Python-3.6.6.tgz
tar xf Python-3.6.6.tgz
cd Python-3.6.6
./configure
make
make install
echo "Done!"

info "Install PIP extensions"
pip3.6 install -r /app/requirements.txt
echo "Done!"

info "Install Gunicorn"
pip3.6 install gunicorn
echo "Done!"

info "Remove default site config in nginx"
rm /etc/nginx/sites-enabled/default
info "Done!"

info "Enable site configuration in nginx"
ln -s /app/vagrant/nginx/app.conf /etc/nginx/sites-enabled/app.conf
echo "Done!"


rm -r /var/www/html/
ln -s /var/www/djnci/frontend/build/ html

info "Setup gunicorn folder for /run"
mkdir -p /run/gunicorn
info "Done!"

info "Setting up gunicorn socket file"
ln -s /app/vagrant/systemd/gunicorn.socket /etc/systemd/system/gunicorn.socket
ln -s /app/vagrant/systemd/gunicorn.service /etc/systemd/system/gunicorn.service
info "Done!"

info "Reloading systemctl"
systemctl daemon-reload
info "Done!"

info "Enabling service to start"
systemctl enable nginx
systemctl enable gunicorn
systemctl enable mysql
info "Done!"

info "Starting services and socket"
systemctl start nginx
systemctl start mysql
systemctl start gunicorn.socket
systemctl start gunicorn.service
info "Done!"
