import React from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Link } from 'react-router';
import {
  Row, Col, Button, Alert, FormGroup, ControlLabel, FormControl
} from 'react-bootstrap';

import { getEmailValidationState } from './utils/formValidators';
import BasicContainer from '../website/base/BasicContainer';

class PasswordReset extends React.Component {
  static propTypes = {
    resetPasswordRequest: PropTypes.func.isRequired
  }

  state = {
    csrftoken: Cookies.get('csrftoken'),
    email: '',
    err: null,
    success: false,
    btnDisabled: false
  }

  handleChangeEmail = e => this.setState({ email: e.target.value })

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ btnDisabled: true });
    const i = this;
    this.props.resetPasswordRequest({
      variables: {
        email: i.state.email,
        csrftoken: i.state.csrftoken
      }
    })
      .then(({ data }) => {
        i.setState({
          success: data.resetPasswordRequest.ok,
          btnDisabled: false
        });
      }).catch((error) => {
        i.setState({
          btnDisabled: false,
          err: String(error).replace('Error: GraphQL error:', '')
        });
      });
  }

  handleAlertDismiss = () => {
    this.setState({ err: null });
  }

  render() {
    return (
      <BasicContainer>
        <Row className="newrow">
          <Col md={4} mdOffset={4}>

            <h1 className="top-50">Password Reset</h1>

            {this.state.err &&
              <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}>
                {this.state.err}
              </Alert>
            }

            {this.state.success &&
              <Alert bsStyle="success" onDismiss={this.handleAlertDismiss}>
                We just sent you an email to help you with your password.
              </Alert>
            }

            <form onSubmit={this.handleSubmit}>
              <FormGroup
                controlId="emailInput"
                validationState={getEmailValidationState(this.state.email)}
                style={{ marginBottom: 25 }}
              >
                <ControlLabel>Your Email Address*</ControlLabel>
                <FormControl
                  type="email"
                  placeholder="me@example.com"
                  value={this.state.email}
                  onChange={this.handleChangeEmail}
                  minLength={5}
                  maxLength={75}
                  required
                  autoFocus
                  autoComplete="on"
                />
              </FormGroup>

              <Button
                bsStyle="success"
                type="submit"
                style={{ marginRight: 10 }}
                disabled={this.state.btnDisabled}
              >
                Reset Password
              </Button>

              <Link to="/login">Nevermind, I remember it!</Link>

            </form>

          </Col>
        </Row>
      </BasicContainer>
    );
  }
}

const RESET_PASSWORD_REQUEST = gql`
  mutation ResetPasswordRequest($email: String!) {
    resetPasswordRequest(email: $email) {
      ok
    }
  }`;

export default graphql(RESET_PASSWORD_REQUEST, { name: 'resetPasswordRequest' })(PasswordReset);
