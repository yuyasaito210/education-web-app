"""Fabric Config for Django Projects."""

from fabric.api import cd, env, get, lcd, local, put, run

SITE_DIR = '/home/ubuntu/djnci/'
PYTHON_PATH = '/home/ubuntu/.virtualenvs/djnci/bin/'


# Environments ---------------------------------------------------------------

def production():
    """HOST: Use the production server."""
    env.fqdn = 'discovernci.org'
    env.hosts = ['ubuntu@discovernci.org']
    env.site_dir = SITE_DIR
    env.python_path = PYTHON_PATH


# Database -------------------------------------------------------------------

def getdb():
    """Grab a copy of a hosts database for local use."""
    get('%(site_dir)sdb.sqlite3' % env, 'db.sqlite3')


# Media ----------------------------------------------------------------------

def getmedia():
    """Rsync production media directory to local."""
    local('rsync -vraz %(user)s@%(host)s:%(site_dir)smedia .' % env)


# Git Tasks ------------------------------------------------------------------

def gitpull():
    """Issue a 'git pull origin master' on server"""
    with cd('%(site_dir)s/' % env):
        run('git pull origin master')


# Deployment -----------------------------------------------------------------

def migrations():
    """Run Django migrations on server."""
    with cd('%(site_dir)s' % env):
        run('%(python_path)spython ./manage.py migrate' % env)


def build_frontend():
    """Build the frontend locally."""
    with lcd('./frontend'):
        local('yarn build')
        local('tar jcvf build.tar.bz2 build')


def send_frontend_build():
    """Send frontend build payload to server."""
    put('./frontend/build.tar.bz2', '%(site_dir)sfrontend/' % env)


def unpack_frontend_build():
    """Unpack frontend on server."""
    with cd('%(site_dir)sfrontend' % env):
        run('rm -rf build')
        run('tar jxvf build.tar.bz2')


def collect_static():
    """Run Django staticfiles collection."""
    with cd('%(site_dir)s' % env):
        run('%(python_path)spython ./manage.py collectstatic --noinput' % env)


def take_frontend_live():
    """Sync (rsync) frontend build to `live/` (minimizes downtime)."""
    with cd('%(site_dir)sfrontend' % env):
        run('rsync -vr --delete-after build/ live')


def restart_gunicorn():
    """Restart the Gunicorn process."""
    run('sudo systemctl stop gunicorn.service && sudo systemctl start gunicorn.service')


def system_check():
    """Quick heads up to see if all is well."""
    run('tail /tmp/gunicorn_error.log')
    run('curl -sSL -D - https://discovernci.org -o /dev/null')


def deploy_backend():
    """Backend-only deployment tasks."""
    gitpull()
    migrations()
    collect_static()
    restart_gunicorn()

def deploy_frontend():
    """Frontend-only deployment tasks."""
    build_frontend()
    send_frontend_build()
    unpack_frontend_build()
    take_frontend_live()

def deploy():
    """Build and deploy the project onto a server."""
    deploy_backend()
    deploy_frontend()
    collect_static()  # Run again, now that frontend payload is in place
    system_check()
