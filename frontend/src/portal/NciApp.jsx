import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { browserHistory } from 'react-router';

import { logout } from '../common';

import NextUp from './components/NextUp';
import FieldTripListScroller from './components/FieldTripListScroller';

class NciAppContainer extends React.Component {
  static propTypes = {
    logOut: PropTypes.func.isRequired
  };

  componentWillMount() {
    document.body.style.background = '#fff';
  }

  logoutHandler = () => {
    const { logOut } = this.props;
    // TODO: Name clash!
    logOut(); // Note: the prop
    logout(); // Note: the function
    browserHistory.push('/login');
  }

  render() {
    return (
      <div className="nciapp">

        <Helmet
          // TODO get component rendering w/o apollo erros and then this will
          // get picked up properly.
          meta={[
            { property: 'apple-mobile-web-app-capable', content: 'yes' },
            { property: 'apple-mobile-web-app-title', content: 'Outdoor EE Program in Bruceville, Texas' },
            { property: 'apple-touch-fullscreen', content: 'yes' },
            { property: 'apple-mobile-web-app-status-bar-style', content: 'black' }
          ]}
        />

        <div className="header">
          <img src="/discovernci_media/logo.png" target="_blank" rel="noopener noreferrer" alt="" />
          <p className="company-name">
            Nature&apos;s Classroom Institute
          </p>
          {/* <p className="current-location">Lake Geneva <FontAwesome name="caret-down" /></p> */}
          <p className="current-location">
            EE Staff Portal
          </p>
          {/* <div className="account-menu">
            <FontAwesome name="bars" fixedWidth />
          </div> */}
        </div>

        <div className="body-content">
          <NextUp />
          <FieldTripListScroller />

          <button type="button" onClick={this.logoutHandler}>
            Logout
          </button>

        </div>

      </div>
    );
  }
}

const LOGOUT = gql`
  mutation {
    logout {
      success
    }
  }`;

const NciApp = compose(
  graphql(LOGOUT, { name: 'logOut' })
)(NciAppContainer);

export default NciApp;
