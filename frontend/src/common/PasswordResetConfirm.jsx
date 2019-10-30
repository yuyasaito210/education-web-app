import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import {
  Alert, Button, Row, Col, FormGroup, ControlLabel, FormControl
} from 'react-bootstrap';

import { getPasswordValidationState } from './utils/formValidators';
import BasicContainer from '../website/base/BasicContainer';

class PasswordResetConfirm extends React.Component {
  static propTypes = {
    resetPassword: PropTypes.func.isRequired,
    params: PropTypes.shape({
      uidb64: PropTypes.string,
      token: PropTypes.string
    }).isRequired
  }

  static defaultProps = {}

  state = {
    password: '',
    password2: '',
    success: null
  }

  handleChangePassword = e => this.setState({ password: e.target.value })
  handleChangePassword2 = e => this.setState({ password2: e.target.value })

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ btnDisabled: true })
    const i = this;
    this.props.resetPassword({
      variables: {
        password: this.state.password,
        id: this.props.params.uidb64,
        token: this.props.params.token
      }
    })
      .then(({ data }) => {
        window.location.href = '/login';
      }).catch((error) => {
        i.setState({
          btnDisabled: false,
          err: String(error.message).replace('GraphQL error:', '')
        });
      });
  }


  render() {
    return (
      <BasicContainer>
        <Row>
          <Col md={4} mdOffset={4}>

            <h1 style={{ marginBottom: 20 }}>Reset your password</h1>

            {this.state.err &&
              <Alert bsStyle="danger">{this.state.err}</Alert>
            }

            <form onSubmit={this.handleSubmit}>

              <FormGroup
                controlId="passwordInput"
                validationState={getPasswordValidationState(this.state.password)}
              >
                <ControlLabel>Choose a new Password*</ControlLabel>
                <FormControl
                  type="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.handleChangePassword}
                  minLength={1}
                  maxLength={75}
                  required
                  autoComplete="on"
                />
              </FormGroup>

              <FormGroup
                controlId="password2Input"
                validationState={getPasswordValidationState(this.state.password2)}
                style={{ marginBottom: 35 }}
              >
                <ControlLabel>Type it again*</ControlLabel>
                <FormControl
                  type="password"
                  placeholder="Confirm by typing it again..."
                  value={this.state.password2}
                  onChange={this.handleChangePassword2}
                  minLength={1}
                  maxLength={75}
                  required
                  autoComplete="on"
                />
              </FormGroup>

              <Button type="submit" bsStyle="success" bsSize="lg" block>Update Password</Button>

            </form>

          </Col>
        </Row>
      </BasicContainer>
    );
  }
}

const RESET_PASSWORD = gql`
  mutation ResetPassword(
    $id: String!
    $token: String!
    $password: String!
  ) {
    resetPassword(
      id: $id,
      token: $token
      password: $password
    ) {
      ok
      account {
        id
        modified
      }
    }
  }`;

export default graphql(RESET_PASSWORD, { name: 'resetPassword' })(PasswordResetConfirm);
