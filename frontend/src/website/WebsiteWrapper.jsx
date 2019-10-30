import React from 'react';
import PropTypes from 'prop-types';

import MainMenuContainer from './base/MainMenuContainer';
import Footer from './base/Footer';

App.propTypes = {
  children: PropTypes.node.isRequired
};

export default function App({ children }) {
  return (
    <div className="website">

      <MainMenuContainer />

      {children}

      <Footer />

    </div>
  );
}
