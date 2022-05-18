If you get 'could not find driver' error, install the following package from `gtfb_web` container
```
apt update
apt install --fix-missing php7.4-pgsql
/etc/init.d/php7.4-fpm restart
```
