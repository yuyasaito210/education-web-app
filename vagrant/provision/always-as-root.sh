#!/usr/bin/env bash

#== Bash helpers ==

function info {
  echo " "
  echo "--> $1"
  echo " "
}

#== Provision script ==

info "Provision-script user: `whoami`"

info "Restart web-stack"
systemctl daemon-reload
systemctl restart gunicorn
service nginx restart
info "Done!"

info "Set EXPORT variables"
export DJNCI_DEBUG=true
export DJNCI_GRAPHIQL=true
export SMTP_HOST=smtp.postmarkapp.com
export SMTP_USER=37f68003-3c75-4054-a811-5d6d00319593
export SMTP_PASSWORD=37f68003-3c75-4054-a811-5d6d00319593
export SECRET_KEY="m97y&6tvt83#%%x7^eudo&^7!g!lpe4#_9q)9*1j@cd=f7x$m@"
export SENTRY_DSN_URL="https://1111:7e4713788b0248bdb2b8632395392b22@sentry.io/1264473"
info "Done!"
