import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Row, Col } from 'react-bootstrap';

import { logout } from './auth';

import BasicContainer from '../website/base/BasicContainer';

class Logout extends React.Component {
  static propTypes = {
    mutate: PropTypes.func.isRequired
  }

  componentWillMount() {
    this.props.mutate();
    logout();
  }

  render() {
    return (
      <BasicContainer>
        <Row>
          <Col md={12} className="center">

            <h4 style={{ marginTop: 60 }}>
              You've logged out. Have a great day!
            </h4>

            <a href="/login">
              Sign back in
            </a>

          </Col>
        </Row>
      </BasicContainer>
    );
  }
}

const LOGOUT = gql`
  mutation {
    logout {
      success
    }
  }`;

export default graphql(LOGOUT)(Logout);
