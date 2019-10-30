import Cookies from 'js-cookie';

const login = (data, cb) => {
  if (localStorage.token) {
    if (cb) cb(true);
  }
};

const logout = () => {
  Cookies.remove('csrftoken');
  delete localStorage.token;
};

const loggedIn = () => {
  if (localStorage.token) {
    return true;
  }
  return false;
};

const requireAuth = (nextState, replace) => {
  if (!loggedIn()) {
    replace({
      pathname: '/login',
      state: {
        nextPathname: nextState.location.pathname
          ? nextState.location.pathname
          : '/dashboard'
      }
    });
  }
};

export {
  login, logout, loggedIn, requireAuth
};
